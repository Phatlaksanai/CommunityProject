import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentAdmin, setAdmin] = useState(() => {
  try {
    const storedUser = localStorage.getItem("admin");
    if (!storedUser || storedUser === "undefined") return null;
    return JSON.parse(storedUser);
  } catch (err) {
    console.error("Invalid user data:", err);
    return null;
  }
});

  useEffect(() => {
    if (currentAdmin) {
      localStorage.setItem("admin", JSON.stringify(currentAdmin));
    } else {
      localStorage.removeItem("admin");
    }
  }, [currentAdmin]);

  return (
    <AuthContext.Provider value={{ currentAdmin, setAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};