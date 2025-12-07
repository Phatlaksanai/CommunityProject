const express = require('express')
const router = express.Router()
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");//new--------------------


require('dotenv').config();
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_KEY_SECRET
})

router.get("/", (req, res) => {
    res.render("home.ejs")
})
router.get("/login", (req, res) => {
    res.render("login.ejs")
})
router.get("/register", (req, res) => {
    res.render("register.ejs")
})
router.get("/upload", (req, res) => {
    res.render("upload.ejs")
})

router.post("/login", (req, res) => {
    const { username, password } = req.body
    // if (!username || !password) {
    //     return res.render("login.ejs", {error: "Please enter username or password."});
    // } ไม่ได้ใช้

    db.query('select * from users where username = ?', [username], async (error, result) => {
        if (error) {
            console.log(error)
        }

        if (result.length === 0) {
            return res.render("login.ejs", { error: "Username or Password is incorrect." });
        }
        // ดึง hash จาก database
        const hashedPassword = result[0].password;

        // เทียบ password ที่ผู้ใช้กรอก กับ hash ในระบบ
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) {
            return res.render("login.ejs", { error: "Username or Password is incorrect." })
        }

        return res.render("home.ejs", { profilename: username });
    });
})



router.post("/send-otp", async (req, res) => {
    const { email } = req.body

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 5 * 60 * 1000; // หมดอายุใน 5 นาที

    // บันทึก OTP
    await User.updateOne(
        { email },
        { otp: otp, otp_expire: expiresAt },
        { upsert: true }
    );
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.NODEMAIL_USER,
            pass: process.env.NODEMAIL_PASS,
        },
    });
        await transporter.sendMail({
            from: process.env.NODEMAIL_USER,
            to: email,
            subject: "your OTP code",
            text: `รหัส OTP ของคุณคือ: ${otp}`,   // ใช้ตัวแปร otp
            html: `<h2>รหัส OTP ของคุณคือ</h2><h1>${otp}</h1>`, // ใช้ otp
        });
        console.log("Message sent:", info.messageId);
    
})

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body

    const user = await User.findOne({ email });

    if (!user) return res.json({ error: "ไม่พบผู้ใช้" });
    if (Date.now() > user.otpExpires)
        return res.json({ error: "OTP หมดอายุแล้ว กรุณาขอใหม่" });

    if (otp != user.otp)
        return res.json({ error: "OTP ไม่ถูกต้อง" });

    res.json({ message: "ยืนยันสำเร็จ!" });
})

router.post("/register", (req, res) => {
    const { username, password, password2, email, otp, otp_expire, OTP } = req.body

    if (password != password2) {
        return res.render("register.ejs", { error: "Passwords are not same." })
    }
    db.query('select * from users where email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error)
        }
        if (result.length > 0) {
            return res.render("register.ejs", { error: "This email has been used." })
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        const user_data = {
            username: username,
            password: hashedPassword,
            email: email
        }

        db.query('insert into users set ?', user_data, (error, result) => {
            if (error) {
                console.log(error)
            } else {
                return res.render("login.ejs", { success: "Register success." })
            }
        });
    })
})

module.exports = router