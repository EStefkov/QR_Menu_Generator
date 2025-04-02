// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from 'axios';

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

// Validate the stored token to make sure it's still valid
const validateToken = async (token) => {
  if (!token) return false;
  
  try {
    console.log("Validating stored token");
    
    // Check if validate-token endpoint exists, otherwise just try to check user info
    let endpoint = `${BASE_URL}/api/users/validate-token`;
    
    // FALLBACK: If validate-token doesn't exist, we'll just trust the token is valid
    // For proper security, implement the validate-token endpoint on your server
    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 3000 // 3 second timeout to avoid hanging
      });
      
      // If we get a successful response, the token is valid
      console.log("Token validation result:", response.data);
      return response.data.valid === true;
    } catch (tokenError) {
      console.warn("Token validation endpoint not available, using fallback validation:", tokenError.message);
      
      // Fallback: Try to get user profile info to validate token
      try {
        const userResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000
        });
        // If we can get the profile, the token is valid
        return !!userResponse.data;
      } catch (profileError) {
        // If there's no validation endpoint and profile fails, we assume the token is invalid
        if (profileError.response && profileError.response.status === 401) {
          return false;
        }
        // For other errors, we'll just trust the token for now
        console.warn("Cannot validate token properly, assuming valid for now:", profileError);
        return true;
      }
    }
  } catch (error) {
    console.error("Token validation failed:", error);
    
    // Clear invalid token
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
      
      // If token changed or id changed, update state
      if ((currentToken && currentToken !== userData.token) || 
          (currentId && currentId !== userData.id)) {
        console.log("Auth data changed in localStorage, updating state");
        setUserData({
          id: currentId,
          token: currentToken,
          firstName: localStorage.getItem("firstName"),
          lastName: localStorage.getItem("lastName"),
          profilePicture: localStorage.getItem("profilePicture"),
          accountType: localStorage.getItem("accountType"),
          mailAddress: localStorage.getItem("mailAddress"),
        });
      }
    };
    
    // Listen for storage event to detect changes from other tabs
    const handleStorageChange = () => {
      checkStoredAuth();
    };
    
    // Listen for custom events
    const handleUserDataUpdated = () => {
      checkStoredAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataUpdated', handleUserDataUpdated);
    
    // Check every 5 seconds as a fallback
    const interval = setInterval(checkStoredAuth, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
      clearInterval(interval);
    };
  }, [userData.token, userData.id]);

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

  return (
    <AuthContext.Provider value={{ 
      userData, 
      login, 
      logout, 
      updateUserData, 
      isInitialized 
    }}>
      {children}
    </AuthContext.Provider>
  );
} 