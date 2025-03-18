// AuthContext.js
import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Първоначално четем данните от localStorage (ако има)
  const [userData, setUserData] = useState(() => {
    return {
      id: localStorage.getItem("id"),
      token: localStorage.getItem("token"),
      firstName: localStorage.getItem("firstName"),
      lastName: localStorage.getItem("lastName"),
      profilePicture: localStorage.getItem("profilePicture"),
      accountType: localStorage.getItem("accountType"),
    };
  });

  // Функция за логин: записваме данните в localStorage и ъпдейтваме стейта
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

  // Функция за logout: изчистваме localStorage и ъпдейтваме стейта
  const logout = () => {
    localStorage.removeItem("id");  
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("accountType");

    setUserData({});
  };

  // Подаваме userData и методи за login/logout
  return (
    <AuthContext.Provider value={{ userData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
