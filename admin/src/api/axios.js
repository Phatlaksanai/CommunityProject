import axios from "axios";
import Swal from "sweetalert2";

export const makeAdminRequest = axios.create({
  baseURL: "https://pm-vdyh.onrender.com/api", 
  // baseURL: "http://localhost:8080/api",
  withCredentials: true, //  ส่ง cookie ทุก request
});

makeAdminRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {

      // เช็คก่อนว่ามีข้อมูล User อยู่ในระบบหรือไม่
      const storedUser = localStorage.getItem("admin");

      // ถ้ามีข้อมูล user แปลว่าเซสชันหมดอายุจริงๆ ค่อยเด้งแจ้งเตือน
      if (storedUser && storedUser !== "undefined") {
        localStorage.removeItem("admin");
        localStorage.removeItem("accessTokenAdmin");

        Swal.fire({
          title: "Session Expired",
          text: "Please log in again",
          icon: "warning",
          confirmButtonColor: "#6A9043",
          confirmButtonText: "Confirm",
          allowOutsideClick: false,
          scrollbarPadding: false,        // เพิ่มบรรทัดนี้เพื่อแก้ปัญหาหน้าจอขยับ
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/admin";
          }
        });
      }
      // ถ้าไม่มีข้อมูล user (เป็น Guest) จะไม่เกิด Popup และปล่อยผ่าน
    }

    return Promise.reject(error);
  },
);