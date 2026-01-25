const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer"); //new--------------------
const { CloudinaryStorage } = require("multer-storage-cloudinary"); //new--------------------

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isModel =
      file.originalname.endsWith(".glb") || file.originalname.endsWith(".gltf");

    return {
      folder: isModel ? "Posts/models" : "Posts/Pictures", // ชื่อโฟลเดอร์ใน Cloudinary
      resource_type: isModel ? "raw" : "image",
      public_id: isModel
        ? Date.now() + "-" + file.originalname // เก็บชื่อเต็มพร้อมนามสกุล
        : Date.now() + "-" + file.originalname.replace(/\.[^/.]+$/, ""), // รูป: ตัดนามสกุลออก
      allowed_formats: isModel ? undefined : ["jpg", "png", "jpeg", "gif"],
    };
  },
});
const upload = multer({ storage: storage });

router.post("/upload/post", upload.single("file"), (req, res) => {
  try {
    res.status(200).json(req.file.path); // cloudinaryส่ง URL นี้กลับไปให้ Frontend เพื่อ Save ลง DB
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/posts", (req, res) => {
  // สั่ง JOIN เพื่อเอาชื่อคนโพสต์ (u.username) และรูป (u.profilePic) มาโชว์คู่กับโพสต์
  const q = `SELECT p.*, p.description AS \`desc\`, u.user_id AS userId, u.username, u.profilePic 
             FROM posts AS p 
             JOIN users AS u ON (u.user_id = p.user_id) 
             ORDER BY p.createdAt DESC`;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
});

router.get("/items", (req, res) => {
  // สั่ง JOIN เพื่อเอาชื่อคนโพสต์ (u.username) และรูป (u.profilePic) มาโชว์คู่กับโพสต์
  const q = `SELECT *
             FROM items 
             ORDER BY createAt DESC`;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
});

router.get("/items/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT items.*, users.username, users.profilePic FROM items JOIN users ON items.user_id = users.user_id WHERE item_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0)
      return res.status(404).json({ error: "Item not found" });

    res.json(result[0]);
  });
});

router.post("/", verifyToken, (req, res) => {
  // NEw Verify Token
  res.json("Create post by user " + req.user.user_id);
  console.log("cookies:", req.cookies); //chack log
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

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
        { user_id: user.user_id },
        process.env.JWT_SECRETKEY,
        { expiresIn: "1d" },
      );

      // ส่งกลับเป็น success: true เพื่อให้ Frontend เช็คง่ายๆ
      res
        .cookie("accessToken", token, { httpOnly: true, sameSite: "lax" })
        .status(200)
        .json({
          success: true,
          username: user.username,
          profilePic: user.profilePic || "",
        });
    },
  );
});

// router.post("/", verifyToken, (req, res) => {
//   const q = "INSERT INTO posts (`description`, `img`, `createdAt`, `user_id`) VALUES (?)";

//   const values = [
//     req.body.desc, // รับมาจากหน้าบ้าน (หน้าบ้านส่งมาชื่อ desc ได้ครับ ไม่ต้องแก้หน้าบ้าน)
//     req.body.img,
//     new Date(),    // ส่งเวลาปัจจุบันไป
//     req.user_id    // ไอดีคนโพสต์ (จาก Token)
//   ];

//   db.query(q, [values], (err, data) => {
//     if (err) {
//         console.error(err);
//         return res.status(500).json(err);
//     }
//     return res.status(200).json("Post created!");
//   });
// });
// แก้ไขจาก router.post("/") เดิมทั้งหมด
router.post("/posts", verifyToken, (req, res) => {
  // 1. ตรวจสอบชื่อ Column ใน Database ของคุณ
  // จากโค้ด SELECT คุณใช้ `description` และ `user_id`
  // แต่ใน INSERT เดิมคุณเขียน `desc` และ `userId` ซึ่งอาจจะไม่ตรงกับตารางจริง
  const q =
    "INSERT INTO posts (`description`, `img`, `model`, `createdAt`, `user_id`) VALUES (?)";

  const values = [
    req.body.desc, // รับจากหน้าบ้าน
    req.body.img || null,
    req.body.model || null,
    new Date(), // วันที่ปัจจุบัน
    req.user.user_id, // ดึงมาจาก Token (ที่ verifyToken ใส่มาให้)
  ];

  db.query(q, [values], (err, data) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json(err);
    }

    // ส่งข้อมูลกลับไปให้หน้าบ้านเพื่ออัปเดต UI ทันที
    return res.status(200).json({
      post_id: data.insertId,
      description: req.body.desc,
      img: req.body.img || null,
      createdAt: new Date(),
      username: req.body.username, // ส่งชื่อกลับไปโชว์ด้วยถ้าต้องการ
    });
  });
});

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
  const { email } = req.body;

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
    // console.log("Message sent:", info.messageId);

    // บันทึก OTP ลง DB
    db.query(
      `INSERT INTO users (email, otp, otp_expire) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = VALUES(otp), otp_expire = VALUES(otp_expire)`,
      [email, otp, expiresAt],

      (error) => {
        if (error) {
          console.log(error);
          return res.json({ success: false, error: "บันทึก OTP ไม่สำเร็จ" });
        }
        return res.json({ success: true });
      },
    );
  });
  console.log("Send OTP to email:", email, "OTP =", otp);
});

router.post("/register", (req, res) => {
  const { username, password, password2, email, otp } = req.body;

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
        console.log(error);
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

      if (new Date() > user.otp_expire) {
        return res.status(400).json({ error: "รหัส OTP หมดอายุแล้ว" });
      }

      let hashedPassword = await bcrypt.hash(password, 8);

      const user_data = {
        username: username,
        password: hashedPassword,
        // email: email,
        // otp: otp,
        // otp_expire: otp_expire
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
  console.log("Register email: ", email);
  console.log("Register otp: ", otp);
});

router.post("/additem", verifyToken, (req, res) => {
  const q = `INSERT INTO items (modelName, description, price, img, model, createAt, category, user_id)VALUES (?)`;

  const values = [
    req.body.modelName,
    req.body.description,
    req.body.price,
    req.body.img,
    req.body.model,
    new Date(),
    req.body.category,
    req.user.user_id,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    res.status(200).json({ success: true });
  });
});

const storage_item = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isModel =
      file.originalname.endsWith(".glb") || file.originalname.endsWith(".gltf");

    return {
      folder: isModel ? "Items/models" : "Items/Pictures", // ชื่อโฟลเดอร์ใน Cloudinary
      resource_type: isModel ? "raw" : "image",
      public_id: isModel
        ? Date.now() + "-" + file.originalname // เก็บชื่อเต็มพร้อมนามสกุล
        : Date.now() + "-" + file.originalname.replace(/\.[^/.]+$/, ""), // รูป: ตัดนามสกุลออก
      allowed_formats: isModel ? undefined : ["jpg", "png", "jpeg", "gif"],
    };
  },
});
const upload_item = multer({ storage: storage_item });

router.post("/upload/item", upload_item.single("file"), (req, res) => {
  try {
    res.status(200).json(req.file.path); // cloudinaryส่ง URL นี้กลับไปให้ Frontend เพื่อ Save ลง DB
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
