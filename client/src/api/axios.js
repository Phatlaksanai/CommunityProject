import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "http://localhost:8080/api",
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