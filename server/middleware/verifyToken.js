// module.exports = verifyToken;
const jwt = require("jsonwebtoken");

// 1. ตัวเดิม: สำหรับ Route ที่ "ต้อง" Login เท่านั้น (เช่น addPost, addComment)
const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json("Not logged in");
  }

  jwt.verify(token, process.env.JWT_SECRETKEY, (err, userInfo) => {
    if (err) {
      return res.status(401).json("Token is invalid or expired");
    }
    req.user = userInfo;
    next();
  });
};

// 2. ตัวใหม่: สำหรับ Route ที่ "Login ก็ดี ไม่ Login ก็ได้" (เช่น getPosts หน้าฟีด)
const checkUserOptional = (req, res, next) => {
  const token = req.cookies.accessToken;

  // ถ้าไม่มี Token ไม่ต้องด่า 401 แต่ให้ไปต่อเลย (โดยที่ req.user จะเป็น undefined)
  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRETKEY, (err, userInfo) => {
    if (err) {
      // ถ้า Token มีแต่ผิด/หมดอายุ ก็ให้ผ่านไปแบบ guest (req.user จะว่าง)
      return next();
    }
    // ถ้า Token ถูก ก็แปะข้อมูล user เข้าไปเหมือนเดิม
    req.user = userInfo;
    next();
  });
};

// 3. 🌟 ตัวใหม่: สำหรับ Admin เท่านั้น 🌟
const verifyAdminToken = (req, res, next) => {
  // ดึงคุกกี้ accessTokenAdmin แทนที่จะเป็น accessToken
  const token = req.cookies.accessTokenAdmin;

  if (!token) {
    return res.status(401).json("Admin not logged in");
  }

  jwt.verify(token, process.env.JWT_SECRETKEY, (err, adminInfo) => {
    if (err) {
      return res.status(401).json("Admin token is invalid or expired");
    }

    // รีเช็ค Role อีกรอบเพื่อความชัวร์ (ถ้าใน Token มีแนบ role: "admin" มาตอน Login)
    // if (adminInfo.role !== "admin") return res.status(403).json("Not authorized");

    req.admin = adminInfo; // เก็บข้อมูล admin ลง req ไว้ใช้ใน Controller
    next();
  });
};

// ส่งออกทั้งหมด 3 ตัว
module.exports = { verifyToken, checkUserOptional, verifyAdminToken };