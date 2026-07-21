const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.loginAdmin = async (req, res) => {
    try {
        const { email, password, otp } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please enter email and password" });
        }

        const { data: user, error } = await db
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('isdelete', "active")
            .eq('role', "admin")
            .single(); // .single() จะคืนค่าเป็น object เดียว ไม่ใช่ array

        if (error || !user) {
            return res.status(401).json({ error: "Username or Password incorrect" });
        }

        const { data: otpRecord, error: otpError } = await db
            .from('otps')
            .select('*')
            .eq('user_id', user.user_id)
            .single();

        // --- จุดที่ทำให้เกิด Error "กดรับ OTP ก่อนลงทะเบียน" ---
        if (otpError || !otpRecord) {
            return res.status(400).json({ error: "Please request OTP first" });
        }

        // 3. ตรวจสอบความถูกต้องของ OTP
        if (String(otp) !== String(otpRecord.otp)) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        // 4. ตรวจสอบวันหมดอายุ
        if (new Date() > new Date(otpRecord.otp_expire)) {
            return res.status(400).json({ error: "OTP has expired" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Username or Password incorrect" });
        }

        if (user.role !== "admin"){
            return res.status(403).json({ error: "Access denied"})
        }

        // สร้าง JWT
        const token = jwt.sign(
            { user_id: user.user_id, username: user.username },
            process.env.JWT_SECRETKEY,
            { expiresIn: "30d" }
        );

        res.cookie("accessToken", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 วัน (หน่วยเป็นมิลลิวินาที)
        })
            .status(200)
            .json({
                success: true,
                user_id: user.user_id,
                username: user.username,
                name: user.name,
                profilePic: user.profilePic,
                coverPic: user.coverPic,
                description: user.description,
                city: user.city,
                website: user.website
            });

        await db.from('otps').delete().eq('user_id', user.user_id);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.sendOtpAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) { 
            return res.status(400).json({error: "Please enter your email"});
        }

        // ค้นหาเฉพาะ Admin ที่ใช้งานอยู่
        const { data: user, error: userError } = await db
            .from("users")
            .select("user_id, email, role, isdelete")
            .eq("email", email)
            .eq("role", "admin")
            .eq("isdelete", "active")
            .single();

        if (userError || !user) {
            return res.status(401).json({error: "Admin account not found"});
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const { error: otpError } = await db
            .from('otps')
            .upsert({
                user_id: user.user_id, // ใช้ ID จากตาราง users
                otp: String(otp),
                otp_expire: expiresAt
            }, { onConflict: 'user_id' }); // ป้องกันการสร้าง OTP ซ้ำซ้อนให้ user คนเดิม

        if (otpError) throw otpError;

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: { user: process.env.NODEMAIL_ADMIN, pass: process.env.NODEMAIL_PASS_ADMIN },
        });

        await transporter.sendMail({
            from: process.env.NODEMAIL_ADMIN,
            to: user.email,
            subject: "PM Request OTP",
            html: `<h2>Your OTP Code</h2><h1>${otp}</h1>`,
        });

        return res.json({ success: true });

    } catch (err) {
        console.error("Detailed Error:", err);
        return res.status(500).json({ success: false, error: "Failed to send OTP" });
    }
};