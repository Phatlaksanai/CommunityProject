import axios from "axios";
import Swal from "sweetalert2";

export const makeRequest = axios.create({
  baseURL: "https://pm-vdyh.onrender.com/api", 
  // baseURL: "http://localhost:8080/api",
  withCredentials: true, //  ส่ง cookie ทุก request
});

// let isUserRedirecting = false;

// makeRequest.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {

//       // 🚀 เช็กก่อนว่ามีตัวไหนกำลังเด้ง confirm อยู่ไหม ถ้ายังไม่มีถึงจะทำ
//       if (!isUserRedirecting) {
//         isUserRedirecting = true; // ล็อคทันที! เส้นที่ 2-3 จะเข้ามาไม่ได้แล้ว

//         // เคลียร์ข้อมูล User ทั่วไป
//         localStorage.removeItem("user");
//         localStorage.removeItem("accessToken");

//         // พอถูกล็อคแล้ว จะมีแค่เส้นแรกเส้นเดียวที่ได้โชว์อันนี้
//         const wantToLogin = window.confirm(
//           "เซสชันของคุณหมดอายุแล้ว คุณต้องการเข้าสู่ระบบใหม่หรือไม่?\n(กดยกเลิก เพื่อใช้งานต่อในโหมด Guest)"
//         );

//         if (wantToLogin) {
//           window.location.href = "/login";
//         } else {
//           window.location.reload();
//         }

//         // ปลดล็อคเผื่อไว้ในกรณีที่รีเฟรชหน้าต่างแล้ว
//         setTimeout(() => {
//           isUserRedirecting = false;
//         }, 1000);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

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
          scrollbarPadding: false ,        // เพิ่มบรรทัดนี้เพื่อแก้ปัญหาหน้าจอขยับ
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
