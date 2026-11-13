const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const algoliaClient = require("../config/algolia");
const rateLimit = require("express-rate-limit");

// Intl.Segmenter ตัดคำไทยใส่ช่องว่างก่อนส่งเข้า Algolia
const segmenter = new Intl.Segmenter("th", { granularity: "word" });

function tokenizeThai(text) {
  if (!text) return "";
  const segments = segmenter.segment(String(text));
  // แยกคำแล้วเอามาต่อกันด้วยช่องว่างให้ Algolia มองเป็นคนละคำ
  return Array.from(segments)
    .map((s) => s.segment.trim())
    .filter(Boolean)
    .join(" ");
}

const awakeRenderLimiter = rateLimit({
  windowMs: 60 * 1000, 
  limit: 5, // เรียกได้ 5 รอบ / นาที
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

exports.awakeRender = [
  awakeRenderLimiter,
  async (req, res) => {
    return res.json({ message: "Hello world" });
  },
];

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Please enter username and password" });
    }

    const { data: user, error } = await db
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("isdelete", "active")
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
      { expiresIn: "30d" },
    );

    res.cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        success: true,
        user_id: user.user_id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
        description: user.description,
        city: user.city,
        website: user.website,
        balance: user.balance,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.logout = (req, res) => {
  res
    .clearCookie("accessToken", { httpOnly: true, sameSite: "lax" })
    .status(200)
    .json({ success: true });
};

exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.body;

    const { data, error } = await db
      .from("users")
      .select("user_id")
      .eq("username", username)
      .eq("isdelete", "active")
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: "Database error" });
    }

    if (data) {
      return res.status(200).json({ exists: true });
    }

    return res.status(200).json({ exists: false });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  try {
    let { username, password, password2, email, otp, isdelete } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Please enter all required fields" });
    }

    username = username.trim();

    if (!/^(?=(?:.*[a-zA-Z]){3})[a-zA-Z0-9_ ]+$/.test(username)) {
      return res.status(400).json({ error:"Username must contain at least 3 letters and can only letters, include numbers, spaces, and underscores"});
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

    const { data: user, error: userError } = await db
      .from("users")
      .select("user_id, username")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: "Please request OTP first" });
    }

    if (user.username !== null) {
      return res.status(400).json({ error: "Email has been used" });
    }

    const { data: otpRecord, error: otpError } = await db
      .from("otps")
      .select("*")
      .eq("user_id", user.user_id)
      .single();

    if (otpError || !otpRecord) {
      return res.status(400).json({ error: "Please request OTP first" });
    }

    if (String(otp) !== String(otpRecord.otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > new Date(otpRecord.otp_expire)) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    let hashedPassword = await bcrypt.hash(password, 8);
    const { error: updateError } = await db
      .from("users")
      .update({
        username: username,
        password: hashedPassword,
        isdelete: isdelete,
      })
      .eq("user_id", user.user_id);

    if (updateError) throw updateError;

    try {
      await algoliaClient.saveObject({
        indexName: "WebCommunity_Search",
        body: {
          objectID: `user_${user.user_id}`,
          title: username,
          searchable_title: tokenizeThai(username),
          img: null,
          type: "user",
          targetId: user.user_id,
        },
      });
    } catch (algoliaErr) {
      console.error("Algolia Insert User Warning:", algoliaErr);
    }

    // (Optional) ลบ OTP ทิ้งหลังจากสมัครเสร็จเพื่อความสะอาด
    await db.from("otps").delete().eq("user_id", user.user_id);

    return res.json({ success: true, message: "Register success." });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Failed to register user" });
  }
};

exports.sendOtpRegister = async (req, res) => {
  try {
    const { email } = req.body;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { error: cleanupError } = await db
      .from("users")
      .delete()
      .is("username", null)
      .lt("created_at", oneHourAgo);

    if (cleanupError) {
      console.error("Cleanup incomplete users error:", cleanupError);
    }

    // insert + update = upsert แก้อันที่มีหรือเพิ่ม row ใหม่
    const { data: user, error: userError } = await db
      .from("users")
      .upsert({ email: email }, { onConflict: "email" })
      .select("user_id, username")
      .single();

    if (userError) throw userError;

    if (user.username) {
      return res.status(400).json({ error: "Email has been used" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const { error: otpError } = await db
    .from("otps")
    .upsert(
      {
        user_id: user.user_id,
        otp: String(otp),
        otp_expire: expiresAt,
      },
      { onConflict: "user_id" }, // ใช้กับ upsert อิง user_id
    );

    if (otpError) throw otpError;

    // ส่ง Email (Brevo API)
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "PM Admin",
          email: "patlaksanai2548@gmail.com",
        },
        to: [{ email: email.trim() }],
        subject: "PM Request OTP",
        htmlContent: `<h2>Your OTP Code</h2><h1>${otp}</h1>`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      return res.status(500).json({ success: false, error: "Failed to send OTP email" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Fetch Error:", err);
    return res.status(500).json({ success: false, error: "Failed to send OTP email" });
  }
};
// forgot + chane ตอน submit (otp)
exports.sendOtpResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error: userError } = await db
      .from("users")
      .select("user_id")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const { error: otpError } = await db
    .from("otps")
    .upsert(
      {
        user_id: user.user_id,
        otp: String(otp),
        otp_expire: expiresAt,
      },
      { onConflict: "user_id" },
    );

    if (otpError) throw otpError;

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "PM Admin",
          email: "patlaksanai2548@gmail.com",
        },
        to: [{ email: email.trim() }],
        subject: "PM Request OTP",
        htmlContent: `<h2>Your OTP Code</h2><h1>${otp}</h1>`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      return res.status(500).json({ success: false, error: "Failed to send OTP email" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("RESET OTP ERROR:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};
// forgot + chane ตอน next (otp)
exports.verifyOtpResetPassword = async (req, res) => {
  const { email, otp } = req.body;

  const { data: user } = await db
    .from("users")
    .select("user_id")
    .eq("email", email)
    .single();

  if (!user) {
    return res.status(400).json({ error: "Email not found" });
  }

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

  await db.from("otps").delete().eq("user_id", user.user_id);

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

    // เปลี่ยนเป็น array แล้วนับ
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ success: true, message: "Nothing to update" });
    }

    const { error: updateError } = await db
      .from("users")
      .update(updateData) // ส่งเฉพาะ field ที่มีค่าไป
      .eq("user_id", userId);

    if (updateError) return res.status(500).json(updateError);

    finalname = updateData.name || user.name || user.username;
    finaldescription = updateData.description || user.description || "";

    try {
      await algoliaClient.saveObject({
        indexName: "WebCommunity_Search",
        body: {
          objectID: `user_${userId}`,
          title: finalname,
          description: finaldescription,
          searchable_title: tokenizeThai(finalname),
          searchable_description: tokenizeThai(finaldescription),
          img: updateData.profilePic || user.profilePic, // โยน URL รูปโปรไฟล์ล่าสุดเข้าไป
          type: "user",
          targetId: userId,
        },
      });
    } catch (algoliaErr) {
      console.error("Algolia Update Profile Warning:", algoliaErr);
    }

    const oldProfileId = user?.profile_public_id;
    const oldCoverId = user?.cover_public_id;

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
// forgot + chane ตอน submit (password)
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
      .from("users")
      .update({ password: hashedPassword })
      .eq("email", email);

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
    const { data: users, error: userError } = await db
      .from("users")
      .select("user_id, email, username")
      .eq("user_id", userId)
      .eq("email", email);

    if (userError || !users || users.length === 0) {
      return res.status(404).json({ error: "User account not found" });
    }

    const user = users[0];

    const { data: otpData, error: otpError } = await db
      .from("otps")
      .select("otp, otp_expire")
      .eq("user_id", user.user_id)
      .maybeSingle(); // กัน error ถ้าไม่มี row

    if (otpError || !otpData) {
      return res.status(400).json({ error: "Invalid OTP request or OTP not found" });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ error: "OTP incorrect" });
    }

    if (new Date(otpData.otp_expire) < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    const timestamp = Date.now();
    const maskedEmail = `${user.email}_deleted_${timestamp}`;
    const maskedUsername = `${user.username}_deleted_${timestamp}`;

    const { error: updateError } = await db
      .from("users")
      .update({
        email: maskedEmail,
        username: maskedUsername,
        isdelete: "deleted",
      })
      .eq("user_id", user.user_id);

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
      .update({ status: "banned" })
      .eq("user_id", user.user_id);

    if (DeleteMemberError) {
      console.error("Delete Member Error:", DeleteMemberError);
    }

    try {
      await algoliaClient.deleteObject({
        indexName: "WebCommunity_Search",
        objectID: `user_${user.user_id}`,
      });
    } catch (algoliaErr) {
      console.error("Algolia Delete Warning:", algoliaErr);
    }

    await db.from("otps").delete().eq("user_id", user.user_id);

    return res
      .clearCookie("accessToken", { httpOnly: true, sameSite: "lax" })
      .status(200)
      .json({
        success: true,
        message: "Account deleted and logged out successfully",
      });
  } catch (err) {
    console.error("Delete Account Error:", err);
    return res.status(500).json({ error: "Failed to delete account" });
  }
};
// navbar
exports.getUserById = async (req, res) => {
  const userId = req.params.userId;

  try {
    const { data: user, error } = await db
      .from("users")
      .select("user_id, username, name, profilePic, balance")
      .eq("user_id", userId)
      .eq("isdelete", "active")
      .single(); // ใช้ .single() เพื่อให้ได้ object เดียวแทนที่จะเป็น array

    if (error || !user) {
      return res.status(404).json({ error: "User not found or deleted" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ error: "Failed to fetch user data" });
  }
};
