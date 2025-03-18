// AuthContext.js
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userData, setUserData] = useState({});

  // При първоначално зареждане четем token от localStorage:
  // Ако има token, тогава прочитаме и останалите данни
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

  // Функция за логин: записваме данните в localStorage и ъпдейтваме state
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

  // Функция за logout: изчистваме localStorage и state
  const logout = () => {
    localStorage.removeItem("id");
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("accountType");

    setUserData({});
  };

  return (
    <AuthContext.Provider value={{ userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
