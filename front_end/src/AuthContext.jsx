// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { validateToken } from "./api/account";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      validateToken(token)
        .then((data) => {
          setUserData({
            ...data,
            token
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUserData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUserData({
      ...userData,
      token
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserData(null);
  };

  const register = (userData) => {
    setUserData(userData);
  };

  return (
    <AuthContext.Provider value={{ userData, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
