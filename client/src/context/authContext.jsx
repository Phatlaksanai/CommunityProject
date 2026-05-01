import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // const [currentUser, setUser] = useState(
  //   JSON.parse(localStorage.getItem("user")) || null
  // );
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

  // ถ้าต้องการ login แบบ dummy
  // const login = () => {
  //   const dummyUser = {
  //     id: 1,
  //     name: "Mireze Lena",
  //     profilePic:
  //       "https://images.pexels.com/photos/3228727/pexels-photo-3228727.jpeg?auto=compress&cs=tinysrgb&w=1600",
  //   };
  //   setUser(dummyUser);
  // };

  // เก็บ currentUser ลง localStorage ทุกครั้งที่เปลี่ยน
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
