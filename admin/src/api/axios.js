import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, //  ส่ง cookie ทุก request
});

// makeRequest.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {

//       // 1. เคลียร์ข้อมูลแอดมินออกจาก LocalStorage
//       localStorage.removeItem("adminUser");
//       localStorage.removeItem("accessToken");

//       // 2. แจ้งเตือน
//       alert("เซสชันผู้ดูแลระบบหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");

//       // 3. เด้งกลับไปที่หน้า "/" ซึ่งเป็นหน้า Login ของแอดมิน
//       window.location.href = "/";
//     }
//     return Promise.reject(error);
//   }
// );