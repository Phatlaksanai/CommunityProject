import "./style.scss";
import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import Login from './pages/login/Login'

import Navbar from "./components/navbar/navbar";
import LeftBar from "./components/Left/leftbar/leftbar";
import RightBar from "./components/Right/rightbar/rightbar";

import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";
import { DarkModeContext } from "./context/darkModeContext";

function App() {
  const { darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);

  const Layout = () => {
    return (
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <LeftBar />
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
          <RightBar />
        </div>
      </div>
    )
  }
  const LayoutNavbar = () => {
    return (
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
        </div>
      </div>
    )
  }

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/" />
    }
    return children;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login />
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/dashboard",
          element: <Home />
        }
      ],
    },
  ]);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      // เช็คว่ามีข้อมูล และไม่ใช่อักษรว่าง หรือคำว่า "undefined"
      if (savedUser && savedUser !== "undefined") {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      localStorage.removeItem("user"); // ถ้าพังให้ล้างทิ้งเลย
      return null;
    }
  });

  // useEffect ปล่อยว่างไว้ก่อนได้ถ้ายังไม่มี API เช็ค Token
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // อนาคตค่อยใส่ api.get("/me") ตรงนี้
    }

  }, []);
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
