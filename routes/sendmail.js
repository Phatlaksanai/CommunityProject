const express = require('express')
const router = express.Router()
const nodemailer = require("nodemailer");
require('dotenv').config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.NODEMAIL_USER,
    pass: process.env.NODEMAIL_PASS,
  },
});

const otp = Math.floor(100000 + Math.random() * 900000);
// const expiresAt = Date.now() + 5 * 60 * 1000; // หมดอายุใน 5 นาที
//----------------------------RandomOTP---------------------------------------
// await User.updateOne(
//   { email: req.body.email },
//   { otp: otp, otp_expire: expiresAt }
// );
// const user = await User.findOne({ email: req.body.email });

// if (!user) return res.json({ error: "ไม่พบผู้ใช้" });
// if (Date.now() > user.otpExpires)
//   return res.json({ error: "OTP หมดอายุแล้ว กรุณาขอใหม่" });

// if (req.body.otp != user.otp)
//   return res.json({ error: "OTP ไม่ถูกต้อง" });

// res.json({ message: "ยืนยันสำเร็จ!" });
//------------------------------------------------------------------

// Wrap in an async IIFE so we can use await.
(async () => {
  const info = await transporter.sendMail({
    from: process.env.NODEMAIL_USER,
    to: process.env.NODEMAIL_USER,
    subject: "your OTP code",
    text: `รหัส OTP ของคุณคือ: ${otp}`,   // ใช้ตัวแปร otp
    html: `<h2>รหัส OTP ของคุณคือ</h2><h1>${otp}</h1>`, // ใช้ otp
  });

  console.log("Message sent:", info.messageId);
})();

module.exports = router