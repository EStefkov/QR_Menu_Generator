// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState({});

  // Load token from localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setUserData({
        id: localStorage.getItem("id"),
        token: storedToken,
        firstName: localStorage.getItem("firstName"),
        lastName: localStorage.getItem("lastName"),
        profilePicture: localStorage.getItem("profilePicture"),
        accountType: localStorage.getItem("accountType"),
      });
    }
  }, []);

  // Login function: save data to localStorage and update state
  const login = (token, payload) => {
    localStorage.setItem("id", payload.id);
    localStorage.setItem("token", token);
    localStorage.setItem("firstName", payload.firstName);
    localStorage.setItem("lastName", payload.lastName);
    localStorage.setItem("profilePicture", payload.profilePicture);
    localStorage.setItem("accountType", payload.accountType);

    setUserData({
      id: payload.id,
      token,
      firstName: payload.firstName,
      lastName: payload.lastName,
      profilePicture: payload.profilePicture,
      accountType: payload.accountType,
    });
  };

  // Logout function: clear localStorage and state
  const logout = () => {
    localStorage.removeItem("id");
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("accountType");

    setUserData({});
  };

  // Update user data function
  const updateUserData = (newData) => {
    const updatedData = { ...userData, ...newData };
    
    // Update localStorage
    Object.entries(newData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, value);
      }
    });

    // Update state
    setUserData(updatedData);
  };

  return (
    <AuthContext.Provider value={{ userData, login, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}
