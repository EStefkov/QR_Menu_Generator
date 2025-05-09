// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from 'axios';
import { setUserUpdatingFlag } from "../api/account";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Check if user is currently updating profile
const isUserUpdatingProfile = () => {
  // Check localStorage flags
  if (localStorage.getItem("userIsUpdating") === "true") {
    return true;
  }
  
  // Check timestamp
  const storedTimestamp = localStorage.getItem("userUpdatingTimestamp");
  if (storedTimestamp) {
    const timestamp = parseInt(storedTimestamp, 10);
    const now = Date.now();
    const elapsed = now - timestamp;
    
    // If less than 30 seconds passed, consider still updating
    if (elapsed < 30000) {
      console.log(`Token validation: Profile update in progress (${elapsed/1000}s ago)`);
      return true;
    }
  }
  
  return false;
};

// Validate the stored token to make sure it's still valid
const validateToken = async (token) => {
  if (!token) return false;
  
  try {
    console.log("Validating stored token");
    
    // Check if user is updating profile - skip validation if true
    if (isUserUpdatingProfile()) {
      console.log("Token validation: User is updating profile - skipping validation");
      return true;
    }
    
    // Използваме правилния endpoint от AccountController
    let endpoint = `${BASE_URL}/api/accounts/validate`;
    
    try {
      console.log("Attempting token validation with endpoint:", endpoint);
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 5000 // 5 second timeout to avoid hanging
      });
      
      // Ако получим успешен отговор, токенът е валиден
      console.log("Token validation result:", response.data);
      return true; // Щом имаме валиден отговор, токенът е ОК
    } catch (tokenError) {
      console.warn("Token validation failed, trying fallback:", tokenError.message);
      
      // Skip additional validation if user is updating profile
      if (isUserUpdatingProfile()) {
        console.log("Token validation: User is updating profile during fallback - assuming valid");
        return true;
      }
      
      // Fallback: Опитваме с current endpoint
      try {
        const userResponse = await axios.get(`${BASE_URL}/api/accounts/current`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        // Ако можем да вземем профила, токенът е валиден
        console.log("Fallback validation succeeded, token is valid");
        return !!userResponse.data;
      } catch (profileError) {
        // Check again if user started updating between validation attempts
        if (isUserUpdatingProfile()) {
          console.log("Token validation: User started updating during validation - assuming valid");
          return true;
        }
        
        // Ако не можем да вземем профила, токенът е невалиден
        console.error("Fallback validation failed, token is invalid:", profileError.message);
        if (profileError.response && (profileError.response.status === 401 || profileError.response.status === 403)) {
          return false;
        }
        // За други грешки, предполагаме, че токенът е валиден засега
        console.warn("Cannot validate token properly due to server error, assuming valid for now:", profileError);
        return true;
      }
    }
  } catch (error) {
    console.error("Token validation failed:", error);
    
    // Don't clear token if user is updating profile
    if (isUserUpdatingProfile()) {
      console.log("Token validation error during profile update - preserving token");
      return true;
    }
    
    // Clear invalid token ONLY if we get 401 error
    if (error.response && error.response.status === 401) {
      console.log("Token is invalid, clearing auth data");
      localStorage.removeItem("token");
      localStorage.removeItem("id");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      localStorage.removeItem("profilePicture");
      localStorage.removeItem("accountType");
    }
    
    return false;
  }
};

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [userUpdating, setUserUpdating] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      // Check if we're on profile page
      const isOnProfilePage = window.location.pathname.includes('/profile');
      console.log("AuthContext initializing for page:", window.location.pathname);
      
      // Get stored token
      const storedToken = localStorage.getItem("token");
      console.log("Initial auth state check - Token exists:", !!storedToken, "On profile page:", isOnProfilePage);
      
      // Check if there's a saved redirect URL
      const savedRedirectUrl = localStorage.getItem("redirectUrl");
      if (savedRedirectUrl) {
        setRedirectUrl(savedRedirectUrl);
      }
      
      // Опростена логика - на профил страница или където има токен в localStorage, винаги зареждаме от localStorage
      if (storedToken) {
        // Има токен - зареждаме данните от localStorage
        const id = localStorage.getItem("id") || localStorage.getItem("userId");
        const mailAddress = localStorage.getItem("mailAddress");
        setUserData({
          id: id,
          token: storedToken,
          firstName: localStorage.getItem("firstName"),
          lastName: localStorage.getItem("lastName"),
          profilePicture: localStorage.getItem("profilePicture"),
          accountType: localStorage.getItem("accountType"),
          mailAddress: mailAddress,
          email: mailAddress // Add email field as an alias for mailAddress
        });
        
        // На профил страница никога не правим валидация на токена
        if (!isOnProfilePage) {
          // За други страници, валидираме токена във фонов режим, без да блокираме UI
          // Това не засяга текущото зареждане
          setTimeout(async () => {
            try {
              await validateToken(storedToken);
              console.log("Background token validation successful");
            } catch (error) {
              console.warn("Background token validation failed:", error);
            }
          }, 2000);
        }
      } else {
        // Няма токен - празно състояние
        console.log("No token found, starting with empty auth state");
        setUserData({});
      }
      
      // Маркираме инициализацията като завършена
      setIsInitialized(true);
    };
    
    initAuth();
  }, []);

  // Listen for custom events to update user data
  useEffect(() => {
    // Listen for custom events
    const handleUserDataUpdated = () => {
      console.log("AuthContext: User data updated event received");
      updateUserUpdatingState(true); // Set updating flag to true
      
      // Get current user ID from state and localStorage
      const currentStateId = userData.id;
      const localStorageId = localStorage.getItem("id") || localStorage.getItem("userId");
      
      // Only update if the IDs match and we have a token
      if (currentStateId && localStorageId && currentStateId === localStorageId) {
        const token = localStorage.getItem("token");
        
        if (token) {
          console.log("AuthContext: Refreshing user data from localStorage for current user");
          setUserData({
            id: localStorageId,
            token,
            firstName: localStorage.getItem("firstName"),
            lastName: localStorage.getItem("lastName"),
            profilePicture: localStorage.getItem("profilePicture"),
            accountType: localStorage.getItem("accountType"),
            mailAddress: localStorage.getItem("mailAddress"),
          });
        }
      } else {
        console.log("AuthContext: Ignoring user data update for different user");
      }
      
      // Reset the updating flag after a delay
      setTimeout(() => {
        updateUserUpdatingState(false);
        console.log("AuthContext: Profile update completed");
      }, 5000); // Shorter delay to reduce unnecessary flags
    };
    
    window.addEventListener('userDataUpdated', handleUserDataUpdated);
    
    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
    };
  }, []);

  // Login function: save data to localStorage and update state
  const login = (token, payload) => {
    console.log("Logging in user:", payload.id);
    
    // Save to localStorage
    localStorage.setItem("id", payload.id);
    localStorage.setItem("token", token);
    localStorage.setItem("firstName", payload.firstName);
    localStorage.setItem("lastName", payload.lastName);
    localStorage.setItem("profilePicture", payload.profilePicture);
    localStorage.setItem("accountType", payload.accountType);
    localStorage.setItem("mailAddress", payload.mailAddress);
    localStorage.setItem("userId", payload.id);

    // Update state
    setUserData({
      id: payload.id,
      token,
      firstName: payload.firstName,
      lastName: payload.lastName,
      profilePicture: payload.profilePicture,
      accountType: payload.accountType,
      mailAddress: payload.mailAddress,
    });
    
    console.log("Login complete, user data set");
    
    // Return the saved redirect URL if available
    return redirectUrl;
  };

  // Save URL to redirect after login
  const saveRedirectUrl = (url) => {
    if (!url || url === '/login' || url === '/register') return;
    
    console.log("Saving redirect URL:", url);
    localStorage.setItem("redirectUrl", url);
    setRedirectUrl(url);
  };
  
  // Clear saved redirect URL
  const clearRedirectUrl = () => {
    localStorage.removeItem("redirectUrl");
    setRedirectUrl(null);
  };

  // Logout function: clear localStorage and state
  const logout = () => {
    console.log("Logging out user");
    
    // Clear localStorage
    localStorage.removeItem("id");
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("accountType");
    localStorage.removeItem("mailAddress");
    localStorage.removeItem("userId");
    localStorage.removeItem("redirectUrl");

    // Clear state
    setUserData({});
    setRedirectUrl(null);
    
    console.log("Logout complete, user data cleared");
  };

  // Update user data function
  const updateUserData = (newData) => {
    console.log("Updating user data:", Object.keys(newData));
    
    const updatedData = { ...userData, ...newData };
    
    // Update localStorage
    Object.entries(newData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value);
      }
    });

    // Update state
    setUserData(updatedData);
    
    // Trigger event so other components can update
    window.dispatchEvent(new Event("userDataUpdated"));
    
    console.log("User data update complete");
  };

  // Синхронизируем локальный state с глобальной переменной и localStorage
  const updateUserUpdatingState = (newState) => {
    console.log(`AuthContext: Setting userUpdating to ${newState}`);
    setUserUpdating(newState);
    setUserUpdatingFlag(newState);
    
    if (newState) {
      localStorage.setItem("userIsUpdating", "true");
      // Сохраняем временную метку
      const timestamp = Date.now();
      localStorage.setItem("userUpdatingTimestamp", timestamp.toString());
    } else {
      localStorage.removeItem("userIsUpdating");
      localStorage.removeItem("userUpdatingTimestamp");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      userData, 
      login, 
      logout, 
      updateUserData, 
      isInitialized,
      userUpdating,
      setUserUpdating: updateUserUpdatingState,
      saveRedirectUrl,
      clearRedirectUrl,
      redirectUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
} 