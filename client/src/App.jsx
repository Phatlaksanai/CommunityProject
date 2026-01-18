import { useState, useEffect } from "react";
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login1'
import Register from './pages/register/Register1'
//import Download from './pages/download/Download1';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
// import NotFound from "./404";

//ระบบใหม่++++++++++++++++++++++
import Home from "./pages/home/Home1";
import Profile from "./pages/profile/Profile";
import Navbar from "./components/navbar/navbar";
import LeftBar from "./components/leftbar/leftbar";
import RightBar from "./components/rightbar/rightbar";

//ระบบใหม่++++++++++++++++++++++
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./style.scss";




function App() {
  //ระบบใหม่++++++++++++++++++++++
  const { darkMode } = useContext(DarkModeContext);//newwwwwwwwwwwwwwwwwww
  const currentUser = true; // สถานะผู้ใช้ false วาปหน้าไม่ได้ true วาปหน้าได้

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

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />
    }
    return children;
  }

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Home />
        },
        // ,{
        //   path:"/profile/:id",
        //   element:<Profile/>
        // }
      ],
    },
    {
      path: "/register",
      element: <Register />
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);
  //ระบบใหม่++++++++++++++++++++++

  //----------------------------------------------------------------------------Naw refash ไม่หาย
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
  //----------------------------------------------------------------------------Naw refash ไม่หาย
  // return (
  //   <BrowserRouter>
  //     <Routes>
  //       <Route path="/" element={<Home />} />
  //       {/* { <Route path="/" element={<Home user={user} setUser={setUser} />} /> }
  //       { <Route path="/login" element={<Login setUser={setUser} />} /> */}
  //       <Route path="/register" element={<Register />} />
  //       {/* <Route path="*" element={<NotFound />} /> } */}
  //     </Routes>
  //   </BrowserRouter>
  // );
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}




export default App;
