const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Please enter username and password" });
    }

      db.query(
        "select * from users where username = ?",
        [username],
        async (error, result) => {
          if (error) {
            console.log(error);
            return res.status(500).json({ error: "Database error" });
          }
    
          if (result.length === 0) {
            return res
              .status(401)
              .json({ error: "Username or Password incorrect" });
          }
    
          const user = result[0];
          const hashedPassword = user.password;
    
          const isMatch = await bcrypt.compare(password, hashedPassword);
    
          if (!isMatch) {
            return res
              .status(401)
              .json({ error: "Username or Password incorrect" });
          }
          // สร้าง JWT
          const token = jwt.sign(
            { user_id: user.user_id,
            username: user.username },
            process.env.JWT_SECRETKEY,
            { expiresIn: "1d" },
          );
    
          // ส่งกลับเป็น success: true เพื่อให้ Frontend เช็คง่ายๆ
          res.cookie("accessToken", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production"})
            .status(200)
            .json({
              success: true,
              user_id: user.user_id,
              username: user.username,
              name: user.name,
              profilePic: user.profilePic,
              coverPic: user.coverPic,
            });
        },
      );
};

exports.logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "lax", // dev
      // secure: true, // เปิดตอน https (production)
    })
    .status(200)
    .json({ success: true });
};

exports.register = (req, res) => {
  const { username, password, password2, email, otp } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Please enter username or password." });
  }

  if (password != password2) {
    return res.status(400).json({ error: "Passwords not match" });
  }
  db.query(
    "select * from users where email = ?",
    [email],
    async (error, result) => {
      if (error) {
        return res.status(500).json({ error: "Database error" });
      }

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

      if (new Date() > user.otp_expire) {
        return res.status(400).json({ error: "รหัส OTP หมดอายุแล้ว" });
      }

      let hashedPassword = await bcrypt.hash(password, 8);

      const user_data = {
        username: username,
        password: hashedPassword,
      };

      db.query(
        "UPDATE users set ? WHERE email = ?",
        [user_data, email],
        (error, result) => {
          if (error) {
            console.log(error);
          } else {
            return res.json({ success: true, message: "Register success." });
          }
        },
      );
    },
  );
};

exports.sendOtp = (req, res) => {
  const { email } = req.body;

  db.query("SELECT username, otp_expire FROM users WHERE email = ?",[email],async (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
      }
      if (result.length > 0 && result[0].username !== null) { // ถ้ามี user และมี username = สมัครแล้ว
        return res.status(400).json({ error: "อีเมลนี้ถูกใช้แล้ว" });
      }
      
      if (result.length > 0 && result[0].otp_expire) { // ตรวจสอบการส่ง OTP ซ้ำภายใน 8 วินาที
        const lastSentAt = new Date(result[0].otp_expire.getTime() - 5 * 60 * 1000,);
        const now = new Date();
        const diffSeconds = (now - lastSentAt) / 1000;

        if (diffSeconds < 8) {
          return res.status(429).json({
            error: `กรุณารอ ${Math.ceil(8 - diffSeconds)} วินาทีก่อนขอ OTP อีกครั้ง`,
          });
        }
      }

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
        text: `รหัส OTP ของคุณคือ: ${otp}`, // ใช้ตัวแปร otp
        html: `<h2>รหัส OTP ของคุณคือ</h2><h1>${otp}</h1>`, // ใช้ otp
      };
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          return res.json({ success: false, error: "ส่ง OTP ไม่สำเร็จ" });
        }
        // บันทึก OTP ลง DB
        db.query(
          `INSERT INTO users (email, otp, otp_expire) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = VALUES(otp), otp_expire = VALUES(otp_expire)`,
          [email, otp, expiresAt],

          (error) => {
            if (error) {
              console.log(error);
              return res.json({
                success: false,
                error: "บันทึก OTP ไม่สำเร็จ",
              });
            }
            return res.json({ success: true });
          },
        );
      });
    },
  );
};