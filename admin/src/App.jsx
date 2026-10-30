import "./style.scss";

import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import User from "./pages/user/User";
import Content from "./pages/content/Content";
import Transaction from "./pages/transaction/transaction";
import Report from "./pages/report/Report";

import Navbar from "./components/navbar/navbar";
import LeftBar from "./components/Left/leftbar/leftbar";
import RightBar from "./components/Right/rightbar/rightbar";

import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/authContext";

function App() {
  const { currentAdmin } = useContext(AuthContext);

  const LayoutDashboard = () => {
    return (
      <div className={"theme-dark"}>
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
  const Layout = () => {
    return (
      <div className={"theme-dark"}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <LeftBar />
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
        </div>
      </div>
    )
  }

  const ProtectedRoute = ({ children }) => {
    if (!currentAdmin) {
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
          <LayoutDashboard />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/dashboard",
          element: <Home />
        }
      ],
    },
    {
      path: "/users",
      element: (
        // 🚀 เพิ่ม ProtectedRoute ครอบ Layout ตรงนี้
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/users",
          element: <User />
        },
      ]
    },
    {
      path: "/content&assets",
      element: (
        // 🚀 เพิ่ม ProtectedRoute ครอบ Layout ตรงนี้
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/content&assets",
          element: <Content />
        },
      ]
    },
    {
      path: "/transactions",
      element: (
        // 🚀 เพิ่ม ProtectedRoute ครอบ Layout ตรงนี้
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/transactions",
          element: <Transaction />
        },
      ]
    },
    {
      path: "/reports",
      element: (
        // 🚀 เพิ่ม ProtectedRoute ครอบ Layout ตรงนี้
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/reports",
          element: <Report />
        },
      ]
    },
  ],{
    basename: "/admin" 
  });

  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
