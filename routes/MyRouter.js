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

// router.post("/verify-otp", async (req, res) => {
//     const { email, otp } = req.body

//     db.query(
//         "SELECT * FROM users WHERE email = ?",
//         [email],
//         (err, rows) => {
//             if (err) return res.json({ error: "Error DB" });

//             const user = rows[0];

//             if (!user) return res.json({ error: "ไม่พบผู้ใช้" });

//             if (Date.now() > user.otp_expire)
//                 return res.json({ error: "OTP หมดอายุแล้ว กรุณาขอใหม่" });

//             if (otp != user.otp)
//                 return res.json({ error: "OTP ไม่ถูกต้อง" });

//             return res.json({ message: "ยืนยัน OTP สำเร็จ!" });
//         }
//     );
// })

router.post("/register", (req, res) => {
    const { username, password, password2, email, otp } = req.body

    if (password != password2) {
        return res.render("register.ejs", { error: "Passwords are not same." })
    }
    db.query('select * from users where email = ?', [email], async (error, result) => {
        if (error) {
            console.log(error)
        }
        // if (result.length > 0) {
        //     return res.render("register.ejs", { error: "This email has been used." })
        // }
        if (result.length === 0) {
            return res.render("register.ejs", { error: "กดรับ OTP ก่อนลงทะเบียน" });
        }
        const user = result[0];

        if (user.username !== null) {
            return res.render("register.ejs", { error: "อีเมลนี้ถูกใช้แล้ว" });
        }

        if (!user.otp) {
            return res.render("register.ejs", { error: "กดรับ OTP ก่อนลงทะเบียน" });
        }

        if (String(otp) !== String(user.otp)) {
            return res.render("register.ejs", { error: "รหัส OTP ไม่ถูกต้อง" });
        }


        // ❌ หมดอายุ
        if (new Date() > user.otp_expire) {
            return res.render("register.ejs", { error: "รหัส OTP หมดอายุแล้ว" });
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
                return res.render("login.ejs", { success: "Register success." })
            }
        });
    })
    console.log("Register email: ", email);
    console.log("Register otp: ", otp);
})

module.exports = router