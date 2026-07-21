import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setUser] = useState(() => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") return null;
    return JSON.parse(storedUser);
  } catch (err) {
    console.error("Invalid user data:", err);
    return null;
  }
});

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("user");
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};