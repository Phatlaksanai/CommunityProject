import { useState, useEffect } from "react"; 
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/home"
import Login from './pages/login'
import Register from './pages/register'
import NotFound from "./404";



function App() {
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}




export default App;
