import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  // ดึงข้อมูลตำแหน่ง URL ปัจจุบันมาใช้เช็ก
  const { pathname } = useLocation();

  useEffect(() => {
    // สั่งให้หน้าต่างบราวเซอร์เลื่อนกลับไปบนสุดทุกครั้งที่หน้าเปลี่ยน (pathname เปลี่ยน)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // คอมโพเนนต์นี้ทำหน้าที่จัดการระบบ ไม่ต้องแสดงผล UI อะไรออกมา
};

export default ScrollToTop;