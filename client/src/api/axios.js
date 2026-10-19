import axios from "axios";

export const makeRequest = axios.create({
  baseURL: "https://pm-vdyh.onrender.com/api",
  withCredentials: true, //  ส่ง cookie ทุก request
});

// http://localhost:8080/