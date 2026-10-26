import axios from "axios";
import Swal from "sweetalert2";

export const makeRequest = axios.create({
  // baseURL: "https://pm-vdyh.onrender.com/api", 
  baseURL: "http://localhost:8080/api",
  withCredentials: true, //  ส่ง cookie ทุก request
});

makeRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {

      // เช็คก่อนว่ามีข้อมูล User อยู่ในระบบหรือไม่
      const storedUser = localStorage.getItem("user");

      // ถ้ามีข้อมูล user แปลว่าเซสชันหมดอายุจริงๆ ค่อยเด้งแจ้งเตือน
      if (storedUser && storedUser !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");

        Swal.fire({
          title: "Session Expired",
          text: "Please log in again (Cancel to explore as guest)",
          icon: "warning",
          confirmButtonColor: "#A0C46E",
          confirmButtonText: "Confirm",
          showCancelButton: true,
          cancelButtonColor: "#9C9C9E",
          cancelButtonText: "Cancel",
          allowOutsideClick: false,
          scrollbarPadding: false,        // เพิ่มบรรทัดนี้เพื่อแก้ปัญหาหน้าจอขยับ
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          } else if (result.isDismissed) {
            window.location.href = "/";
          }
        });
      }
      // ถ้าไม่มีข้อมูล user (เป็น Guest) จะไม่เกิด Popup และปล่อยผ่าน
    }

    return Promise.reject(error);
  },
);
