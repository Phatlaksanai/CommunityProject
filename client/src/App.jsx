import { useState } from "react"; // 1. เพิ่ม useState
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/home"
import Login from './pages/login'
import Register from './pages/register'
import NotFound from "./404";

function App() {

  // 2. สร้างตัวแปรเก็บว่าใคร Login อยู่ (ค่าเริ่มต้นเป็น null คือยังไม่ Login)
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login"element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}




export default App;
