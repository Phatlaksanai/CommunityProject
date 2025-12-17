const express = require('express')
const router = express.Router()
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");//new--------------------
const verifyToken = require("../middleware/verifyToken");//new--------------------


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

router.post("/", verifyToken, (req, res) => { // NEw Verify Token
  res.json("Create post by user " + req.user.user_id);
  console.log("cookies:", req.cookies);//chack log
});

router.post("/login", (req, res) => {
    const { username, password } = req.body

    db.query('select * from users where username = ?', [username], async (error, result) => {
        if (error) {
            console.log(error)
            return res.status(500).json({ error: "Database error" });
        }

        if (result.length === 0) {
            return res.status(401).json({ error: "Username or Password incorrect" });
        }

        const user = result[0];
        const hashedPassword = user.password;

        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) {
            return res.status(401).json({ error: "Username or Password incorrect" })
        }
        // สร้าง JWT
        const token = jwt.sign( { user_id: user.user_id }, process.env.JWT_SECRETKEY, { expiresIn: "1d" }); 

        // ส่งกลับเป็น success: true เพื่อให้ Frontend เช็คง่ายๆ
        res.cookie("accessToken", token, { httpOnly: true,sameSite: "lax",}).status(200).json({success: true,username: user.username,});
    });
})

// LOGOUT 
router.post("/logout", (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax", // dev
      // secure: true, // เปิดตอน https (production)
    })
    .status(200)
    .json({ success: true });
});


router.post("/send-otp", async (req, res) => {
    const { email } = req.body

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // หมดอายุใน 5 นาที

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.NODEMAIL_USER,
            pass: process.env.NODEMAIL_PASS,
        },
    });
    const mailOptions = {
        from: process.env.NODEMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `รหัส OTP ของคุณคือ: ${otp}`,   // ใช้ตัวแปร otp
        html: `<h2>รหัส OTP ของคุณคือ</h2><h1>${otp}</h1>`, // ใช้ otp
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            return res.json({ success: false, error: "ส่ง OTP ไม่สำเร็จ" });
        }
        // console.log("Message sent:", info.messageId);

        // บันทึก OTP ลง DB
        db.query(`INSERT INTO users (email, otp, otp_expire) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = VALUES(otp), otp_expire = VALUES(otp_expire)`,
            [email, otp, expiresAt],

            (error) => {
                if (error) {
                    console.log(error);
                    return res.json({ success: false, error: "บันทึก OTP ไม่สำเร็จ" });
                }
                return res.json({ success: true });
            }
        );
    });
    console.log("Send OTP to email:", email, "OTP =", otp);
})


router.post("/register", (req, res) => {
    const { username, password, password2, email, otp } = req.body

    if (!username || !password) {
        return res.status(400).json({ error: "Please enter username or password." })
    }

    if (password != password2) {
        return res.status(400).json({ error: "Passwords not match" })
    }
    db.query('select * from users where email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error)
        }
        // if (result.length > 0) {
        //     return res.render("register.ejs", { error: "This email has been used." })
        // }
        if (result.length === 0) {
            return res.status(400).json({ error: "กดรับ OTP ก่อนลงทะเบียน" });
        }
        const user = result[0];

        if (user.username !== null) {
            return res.status(400).json({ error: "อีเมลนี้ถูกใช้แล้ว" });
        }

        if (!user.otp) {
            return res.status(400).json({ error: "กดรับ OTP ก่อนลงทะเบียน" });
        }

        if (String(otp) !== String(user.otp)) {
            return res.status(400).json({ error: "รหัส OTP ไม่ถูกต้อง" });
        }


        // ❌ หมดอายุ
        if (new Date() > user.otp_expire) {
            return res.status(400).json({ error: "รหัส OTP หมดอายุแล้ว" });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        const user_data = {
            username: username,
            password: hashedPassword
            // email: email,
            // otp: otp,
            // otp_expire: otp_expire
        }

        db.query('UPDATE users set ? WHERE email = ?', [user_data, email], (error, result) => {
            if (error) {
                console.log(error)
            } else {
                // return res.json({ success: "Register success." })
                return res.json({ success: true, message: "Register success." })
            }
        });
    })
    console.log("Register email: ", email);
    console.log("Register otp: ", otp);
})

module.exports = router