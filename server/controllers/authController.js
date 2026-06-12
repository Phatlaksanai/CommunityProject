const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("../config/cloudinary");
const algoliaClient = require('../config/algolia');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Please enter username and password" });
        }

        // ดึงข้อมูล user จาก Supabase
        const { data: user, error } = await db
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('isdelete', "active")
            .single(); // .single() จะคืนค่าเป็น object เดียว ไม่ใช่ array

        if (error || !user) {
            return res.status(401).json({ error: "Username or Password incorrect" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Username or Password incorrect" });
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

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "lax" })
        .status(200)
        .json({ success: true });
};

exports.register = async (req, res) => {
    try {
        let { username, password, password2, email, otp, isdelete } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ error: "Please enter all required fields" });
        }
        username = username.trim();
        if (!/^(?=.*[a-zA-Z])[a-zA-Z0-9_ ]+$/.test(username)) {
            return res.status(400).json({ error: "Username can only contain letters, numbers, and underscores" });
        }
        if (username.length < 3 || username.length > 35) {
            return res.status(400).json({ error: "Username must be between 3 and 35 characters" });
        }
        if (password.length < 10 || password.length > 20) {
            return res.status(400).json({ error: "Password must be between 10 and 20 characters" });
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/.test(password)) {
            return res.status(400).json({ error: "Password must contain at least one uppercase letter, one lowercase letter, and one special character" });
        }
        if (password !== password2) {
            return res.status(400).json({ error: "Passwords don't match" });
        }

        // 1. หา user_id จาก email ในตาราง users ก่อน
        const { data: user, error: userError } = await db
            .from('users')
            .select('user_id, username')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(400).json({ error: "Please request OTP first" });
        }

        if (user.username !== null) {
            return res.status(400).json({ error: "Email has been used" });
        }

        // 2. ไปเช็ค OTP ในตาราง otps โดยใช้ user_id ที่หามาได้
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

        // 5. เข้ารหัสผ่านและ Update ข้อมูลลงในตาราง users
        let hashedPassword = await bcrypt.hash(password, 8);
        const { error: updateError } = await db
            .from('users')
            .update({ username: username, password: hashedPassword, isdelete: isdelete })
            .eq('user_id', user.user_id);

        if (updateError) throw updateError;

        try {
            await algoliaClient.saveObject({
                indexName: 'WebCommunity_Search', 
                body: {
                    objectID: `user_${user.user_id}`, // ใช้ prefix user_ นำหน้า
                    title: username, // ผู้ใช้ใหม่ยังไม่มี DisplayName ให้เอา username ไปใช้ค้นหาก่อน
                    img: null, // ยังไม่มีรูปโปรไฟล์
                    type: 'user', // ระบุประเภทเป็น user
                    targetId: user.user_id
                }
            });
        } catch (algoliaErr) {
            console.error("Algolia Insert User Warning:", algoliaErr);
        }

        // (Optional) ลบ OTP ทิ้งหลังจากสมัครเสร็จเพื่อความสะอาด
        await db.from('otps').delete().eq('user_id', user.user_id);

        return res.json({ success: true, message: "Register success." });

    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Failed to register user" });
    }
};

exports.sendOtpRegister = async (req, res) => {
    try {
        const { email } = req.body;
        // --- 1. จัดการตาราง 'users' ---
        // ใช้ upsert เพื่อสร้าง user เปล่าๆ ถ้ายังไม่มี หรือดึงข้อมูลถ้ามีอยู่แล้ว
        const { data: user, error: userError } = await db
            .from('users')
            .upsert({ email: email }, { onConflict: 'email' })
            .select('user_id, username')
            .single();

        if (userError) throw userError;

        // ถ้าสมัครไปแล้ว (มี username) ไม่ต้องส่ง OTP
        if (user.username) {
            return res.status(400).json({ error: "Email has been used" });
        }
        // --- 2. สร้าง OTP ---
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // --- 3. จัดการตาราง 'otps' ---
        // ตอนนี้เรามี user.user_id แล้ว เอามาใช้เชื่อมตารางได้เลย
        const { error: otpError } = await db
            .from('otps')
            .upsert({
                user_id: user.user_id, // ใช้ ID จากตาราง users
                otp: String(otp),
                otp_expire: expiresAt
            }, { onConflict: 'user_id' }); // ป้องกันการสร้าง OTP ซ้ำซ้อนให้ user คนเดิม

        if (otpError) throw otpError;

        // --- 4. ส่ง Email (Nodemailer) ---
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: { user: process.env.NODEMAIL_USER, pass: process.env.NODEMAIL_PASS },
        });

        await transporter.sendMail({
            from: process.env.NODEMAIL_USER,
            to: email,
            subject: "PM Request OTP",
            html: `<h2>Your OTP Code</h2><h1>${otp}</h1>`,
        });

        return res.json({ success: true });

    } catch (err) {
        console.error("Detailed Error:", err);
        return res.status(500).json({ success: false, error: "Failed to send OTP" });
    }
};

exports.sendOtpResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // เช็คว่ามี user นี้จริงไหม
        const { data: user, error: userError } = await db
            .from("users")
            .select("user_id")
            .eq("email", email)
            .single();

        if (userError || !user) {
            return res.status(400).json({ error: "Email not found" });
        }

        // สร้าง OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // บันทึก OTP
        const { error: otpError } = await db
            .from("otps")
            .upsert(
                {
                    user_id: user.user_id,
                    otp: String(otp),
                    otp_expire: expiresAt,
                },
                { onConflict: "user_id" }
            );

        if (otpError) throw otpError;

        // ส่ง email
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODEMAIL_USER,
                pass: process.env.NODEMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.NODEMAIL_USER,
            to: email,
            subject: "Reset Password OTP",
            html: `<h2>Your OTP Code</h2><h1>${otp}</h1>`,
        });

        return res.json({ success: true });

    } catch (err) {
        console.error("RESET OTP ERROR:", err);
        return res.status(500).json({ error: "Failed to send OTP" });
    }
};

exports.verifyOtpResetPassword = async (req, res) => {
    const { email, otp } = req.body;

    // หา user
    const { data: user } = await db
        .from("users")
        .select("user_id")
        .eq("email", email)
        .single();

    if (!user) {
        return res.status(400).json({ error: "Email not found" });
    }

    // หา OTP
    const { data: otpData } = await db
        .from("otps")
        .select("*")
        .eq("user_id", user.user_id)
        .single();

    if (!otpData) {
        return res.status(400).json({ error: "OTP not found" });
    }

    if (otpData.otp !== otp) {
        return res.status(400).json({ error: "OTP incorrect" });
    }

    if (new Date(otpData.otp_expire) < new Date()) {
        return res.status(400).json({ error: "OTP expired" });
    }

    await db.from('otps').delete().eq('user_id', user.user_id);

    return res.json({ success: true });
};

exports.updateProfile = async (req, res) => {
    const { userId, displayName, description, city, website, profileimg, coverimg, profilePublicId, coverPublicId } = req.body;

    try {
        const { data: user, error } = await db
            .from("users")
            .select("profile_public_id, cover_public_id, username, name, profilePic")
            .eq("user_id", userId)
            .maybeSingle();
        if (error) {
            return res.status(500).json(error);
        }

        // 2. สร้าง Object สำหรับ Update (เช็คเฉพาะที่มีค่าจริงๆ)
        const updateData = {};

        // ใช้ .trim() เพื่อเช็คว่าไม่ใช่การเคาะ Space bar ว่างๆ
        if (displayName && displayName.trim() !== "") updateData.name = displayName;
        if (displayName.length < 3 || displayName.length > 35) {
            return res.status(400).json({ error: "Display name must be between 3 and 35 characters" });
        }
        if (description && description.trim() !== "") updateData.description = description;
        if (description.length < 3 || description.length > 500) {
            return res.status(400).json({ error: "Description must be between 3 and 500 characters" });
        }
        if (city && city.trim() !== "") updateData.city = city;
        if (website && website.trim() !== "") updateData.website = website;

        // ส่วนของรูปภาพ (ใช้ logic เดิมของคุณ)
        if (profileimg) updateData.profilePic = profileimg;
        if (coverimg) updateData.coverPic = coverimg;
        if (profilePublicId) updateData.profile_public_id = profilePublicId;
        if (coverPublicId) updateData.cover_public_id = coverPublicId;

        // ตรวจสอบว่ามีข้อมูลที่จะ update ไหม (ป้องกันการยิง update เปล่าๆ)
        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({ success: true, message: "Nothing to update" });
        }

        // 3. Update ลง DB
        const { error: updateError } = await db
            .from("users")
            .update(updateData) // ส่งเฉพาะ field ที่มีค่าไป
            .eq("user_id", userId);

        if (updateError) return res.status(500).json(updateError);

        // ============================================================
        // 🚀 [เพิ่มคำสั่ง Algolia v5] อัปเดตข้อมูลผู้ใช้บนคลังค้นหา
        // ============================================================
        try {
            await algoliaClient.saveObject({
                indexName: 'WebCommunity_Search',
                body: {
                    objectID: `user_${userId}`, // ทับ objectID เดิม
                    // ถ้าตั้ง Display Name แล้วให้ใช้คู่กับ Username เพื่อให้เสิร์ชเจอทั้งสองแบบ
                    title: updateData.name || user.name || user.username,
                    img: updateData.profilePic || user.profilePic, // โยน URL รูปโปรไฟล์ล่าสุดเข้าไป
                    type: 'user',
                    targetId: userId
                }
            });
        } catch (algoliaErr) {
            console.error("Algolia Update Profile Warning:", algoliaErr);
        }

        // เก็บ id เก่าไว้ก่อน
        const oldProfileId = user?.profile_public_id;
        const oldCoverId = user?.cover_public_id;

        // แล้วค่อยลบ
        if (profilePublicId && oldProfileId && oldProfileId !== profilePublicId) {
            await cloudinary.uploader.destroy(oldProfileId);
        }

        if (coverPublicId && oldCoverId && oldCoverId !== coverPublicId) {
            await cloudinary.uploader.destroy(oldCoverId);
        }


        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json(err);
    }
};

exports.resetPassword = async (req, res) => {
    const { email, password, confirmpassword } = req.body;
    if (password !== confirmpassword) {
        return res.status(400).json({ error: "Passwords don't match" });
    }
    if (password.length < 10 || password.length > 20) {
        return res.status(400).json({ error: "Password must be between 10 and 20 characters" });
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).+$/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least one uppercase letter, one lowercase letter, and one special character" });
    }

    try {
        let hashedPassword = await bcrypt.hash(password, 8);
        const { error: updateError } = await db
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        if (updateError) throw updateError;
        return res.json({ success: true });
    } catch (err) {
        console.error("Reset Password Error:", err);
        return res.status(500).json({ error: "Failed to reset password" });
    }
};

exports.deleteAccount = async (req, res) => {
    const { email, otp, userId } = req.body;

    if (!email || !otp || !userId) {
        return res.status(400).json({ error: "Email, OTP, and User ID are required" });
    }

    try {        
        // ค้นหา user_id จากอีเมลก่อน
        const { data: users, error: userError } = await db
            .from('users')
            .select('user_id, email, username')
            .eq('user_id', userId)
            .eq('email', email)

        if (userError || !users || users.length === 0) {
            return res.status(404).json({ error: "User account not found" });
        }

        const user = users[0];

        // ดึงข้อมูล OTP ล่าสุดของ user_id นี้มาเช็ค
        const { data: otpData, error: otpError } = await db
            .from('otps')
            .select('otp, otp_expire')
            .eq('user_id', user.user_id)
            .maybeSingle();

        if (otpError || !otpData) {
            return res.status(400).json({ error: "Invalid OTP request or OTP not found" });
        }

        // ตรวจสอบว่า OTP ตรงกันไหม
        if (otpData.otp !== otp) {
            return res.status(400).json({ error: "OTP incorrect" });
        }

        // ตรวจสอบว่า OTP หมดอายุหรือยัง
        if (new Date(otpData.otp_expire) < new Date()) {
            return res.status(400).json({ error: "OTP expired" });
        }

        // ผ่านทุกเงื่อนไข -> เตรียมแปลงอีเมลเพื่อหลบสัญญลักษณ์ UNIQUE ประจำคอลัมน์
        const timestamp = Date.now();
        const maskedEmail = `${user.email}_deleted_${timestamp}`;

        // ผ่านทุกเงื่อนไข -> ทำการเปลี่ยนสถานะเป็นลบบัญชี (Soft Delete)
        const { error: updateError } = await db
            .from('users')
            .update({ 
                email: maskedEmail,
                isdelete: 'deleted',
            })
            .eq('user_id', user.user_id);
            
        if (updateError) throw updateError;
        
        const { error: friendshipDeleteError } = await db
            .from("friendships")
            .delete()
            .eq("status", "pending")
            .or(`requester_id.eq.${user.user_id},receiver_id.eq.${user.user_id}`);

        if (friendshipDeleteError) {
            console.error("Clear Friendships Error:", friendshipDeleteError);
        }

        const { error: DeleteMemberError } = await db
            .from("community_members")
            .update({ status: 'banned' })
            .eq('user_id', user.user_id);

        if (DeleteMemberError) {
            console.error("Delete Member Error:", DeleteMemberError);
        }

        // ============================================================
        // 🔥 [เพิ่มคำสั่ง Algolia v5] สั่งลบชื่อผู้ใช้นี้ออกจากคลังค้นหาทันที
        // ============================================================
        try {
            await algoliaClient.deleteObject({
                indexName: 'WebCommunity_Search', // ชื่อคลังที่คุณตั้งไว้บนเว็บ Algolia
                objectID: `user_${user.user_id}` // ID อ้างอิงเดียวกับตอนที่คุณใช้เซฟข้อมูลขึ้นไป
            });
        } catch (algoliaErr) {
            // แยก try/catch ไว้ป้องกันกรณีที่ผู้ใช้คนนี้ยังไม่เคยถูกบันทึกในคลัง Algolia
            console.error("Algolia Delete Warning:", algoliaErr);
        }
        
        // (เลือกทำ) ลบแถว OTP นี้ทิ้งไปเลยเพื่อไม่ให้เอามาใช้ซ้ำได้อีก
        await db.from('otps').delete().eq('user_id', user.user_id);

        return res
            .clearCookie("accessToken", { httpOnly: true, sameSite: "lax" })
            .status(200)
            .json({ success: true, message: "Account deleted and logged out successfully" });
            
    } catch (err) {
        console.error("Delete Account Error:", err);
        return res.status(500).json({ error: "Failed to delete account" });
    }
};