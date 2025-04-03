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
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      console.log("Initial auth state check - Token exists:", !!storedToken);
      
      if (storedToken) {
        const id = localStorage.getItem("id");
        console.log("User ID from localStorage:", id);
        
        // Optional: validate token with backend before using
        try {
          const isValid = await validateToken(storedToken);
          
          if (isValid) {
            setUserData({
              id: id,
              token: storedToken,
              firstName: localStorage.getItem("firstName"),
              lastName: localStorage.getItem("lastName"),
              profilePicture: localStorage.getItem("profilePicture"),
              accountType: localStorage.getItem("accountType"),
              mailAddress: localStorage.getItem("mailAddress"),
            });
            console.log("Auth initialized with valid token");
          } else {
            console.log("Stored token is invalid, starting with empty auth state");
            // Clear any remaining data
            logout();
          }
        } catch (error) {
          console.error("Error during token validation:", error);
          // Start with empty state on error
          setUserData({});
        }
      } else {
        console.log("No token found, starting with empty auth state");
        setUserData({});
      }
      
      // Mark initialization as complete
      setIsInitialized(true);
    };
    
    initAuth();
  }, []);

  // Check localStorage periodically for changes (e.g., from another tab)
  useEffect(() => {
    const checkStoredAuth = () => {
      const currentToken = localStorage.getItem("token");
      const currentId = localStorage.getItem("id");
      
      // If token was removed but we still have it in state, log out
      if (!currentToken && userData.token) {
        console.log("Token removed from localStorage, logging out");
        logout();
        return;
      }
      
      // Важно: Проверяваме само дали токенът е премахнат, но не и дали е променен
      // Това позволява обновяване на данни, без да прави логаут при сценарии като обновяване на профила
      
      // Проверяваме само за промени в други данни, но НЕ логваме при промяна на токен/id
      if (currentToken && userData.token) {
        // Обновяваме само допълнителните данни на потребителя, но не пипаме токена
        const firstName = localStorage.getItem("firstName");
        const lastName = localStorage.getItem("lastName");
        const profilePicture = localStorage.getItem("profilePicture");
        const accountType = localStorage.getItem("accountType");
        const mailAddress = localStorage.getItem("mailAddress");
        
        if (firstName !== userData.firstName || 
            lastName !== userData.lastName || 
            profilePicture !== userData.profilePicture || 
            accountType !== userData.accountType ||
            mailAddress !== userData.mailAddress) {
          
          console.log("User profile data changed, updating state without affecting authentication");
          setUserData(prev => ({
            ...prev,
            firstName,
            lastName,
            profilePicture,
            accountType,
            mailAddress
          }));
        }
      }
    };
    
    // Listen for storage event to detect changes from other tabs
    const handleStorageChange = (event) => {
      // Игнорираме промени, които могат да бъдат предизвикани от обновяване на профила
      if (event.key === "firstName" || 
          event.key === "lastName" || 
          event.key === "profilePicture" || 
          event.key === "phone" ||
          event.key === "mailAddress") {
        console.log(`Profile data updated (${event.key}), updating state without auth check`);
        checkStoredAuth();
        return;
      }
      
      // За други промени изпълняваме пълната проверка
      if (event.key === "token" || event.key === "id" || event.key === null) {
        console.log("Critical auth data changed, full auth check needed");
        checkStoredAuth();
      }
    };
    
    // Listen for custom events
    const handleUserDataUpdated = () => {
      console.log("AuthContext: User data updated event received");
      updateUserUpdatingState(true); // Set updating flag to true
      
      // Simple refresh user data from localStorage without token validation
      const id = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      
      if (id && token) {
        console.log("AuthContext: Refreshing user data from localStorage");
        setUserData({
          id,
          token,
          firstName: localStorage.getItem("firstName"),
          lastName: localStorage.getItem("lastName"),
          profilePicture: localStorage.getItem("profilePicture"),
          accountType: localStorage.getItem("accountType"),
          mailAddress: localStorage.getItem("mailAddress"),
        });
      }
      
      // Reset the updating flag after a longer delay to ensure all components have time to update
      setTimeout(() => {
        updateUserUpdatingState(false);
        console.log("AuthContext: Profile update completed");
      }, 30000); // Увеличиваем до 30 секунд
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataUpdated', handleUserDataUpdated);
    
    // Намаляваме честотата на периодичната проверка за да не натоварваме
    const interval = setInterval(checkStoredAuth, 15000); // 15 секунди
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
      clearInterval(interval);
    };
  }, [userData.token, userData.id, userData.firstName, userData.lastName, userData.profilePicture, userData.accountType, userData.mailAddress]);

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

    // Clear state
    setUserData({});
    
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
      setUserUpdating: updateUserUpdatingState
    }}>
      {children}
    </AuthContext.Provider>
  );
} 