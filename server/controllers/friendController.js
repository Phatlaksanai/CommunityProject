const db = require("../config/db");

exports.getAllUserForAdd = async (req, res) => {
  const userId = req.params.userId;
  try {
    // 1. ดึง ID ของคนที่เป็นเพื่อนกับเราแล้ว (ทั้งในฐานะผู้ส่งและผู้รับ)
    const { data: friendshipData, error: friendshipError } = await db
      .from("friendships")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    if (friendshipError) throw friendshipError;

    // 2. รวบรวม ID เพื่อนใส่ Array และรวม ID ตัวเราเองเข้าไปด้วย (เพื่อไม่ให้ดึงตัวเองมาแสดง)
    const friendIds = friendshipData.map((f) =>
      f.requester_id == userId ? f.receiver_id : f.requester_id,
    );
    const excludeIds = [...friendIds, userId];

    // 3. ดึงข้อมูล User ทั้งหมด โดยยกเว้นคนที่มี ID อยู่ใน excludeIds
    const { data, error } = await db
      .from("users")
      .select("*")
      .not("user_id", "in", `(${excludeIds.join(",")})`) // ตัดรายชื่อเพื่อนและตัวเองออก
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getFriendsByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    // ดึงข้อมูล friendship พร้อมกับข้อมูลของ requester (สมมติว่าเราเป็นคนรับ)
    // หรือต้องเขียน Logic ให้ครอบคลุมทั้งสองฝั่ง
    const { data, error } = await db
      .from("friendships")
      .select(
        `
        *,
        requester:requester_id (user_id, name, username, profilePic),
        receiver:receiver_id (user_id, name, username, profilePic)
      `,
      )
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`) // ใช้ .or แทน
      .neq("status", "declined") // กรองเฉพาะที่ไม่ใช่ declined
      .order("created_at", { ascending: false }); // เรียงจากใหม่ไปเก่า

    if (error) throw error;

    // จัดระเบียบ Data: เลือกเอาข้อมูลเพื่อน (ที่ไม่ใช่ตัวเรา) ออกมาเป็น Array ของ User
    const friendsList = data.map((item) => {
      // 1. แยกข้อมูล User ออกมาก่อน
      const friendInfo =
        item.requester_id == userId ? item.receiver : item.requester;

      // 2. คืนค่าเป็น Object ใหม่ที่รวม (ข้อมูล User + ข้อมูลจากตาราง friendship)
      return {
        ...friendInfo, // กระจาย name, user_id, profilePic ออกมา
        status: item.status, // เพิ่มค่า status จากตาราง friendships
        friendship_id: item.id, // เพิ่ม ID ของแถวความสัมพันธ์ (จำเป็นมากตอนกด Accept/Decline)
        createdAt: item.created_at,
      };
    });

    return res.status(200).json(friendsList);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.addfriend = async (req, res) => {
  const { receiver_id } = req.body;
  const requesterId = req.user.user_id;
  try {
    if (!receiver_id) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }
    const { data, error } = await db.from("friendships").insert([
      {
        requester_id: requesterId,
        receiver_id: receiver_id,
        status: "pending",
      },
    ]);

    if (error) throw error;

    return res
      .status(200)
      .json({ message: "Friend request sent successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.acceptFriend = async (req, res) => {
  const { requester_id } = req.body; // ไอดีของคนส่งคำขอมา
  const receiverId = req.user.user_id; // ไอดีของเรา (คนกดรับ)

  try {
    const { data, error } = await db
      .from("friendships")
      .update({ status: "accepted" })
      .eq("requester_id", requester_id)
      .eq("receiver_id", receiverId);

    if (error) throw error;

    return res.status(200).json({ message: "Friend request accepted!" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getFriendRequests = async (req, res) => {
  const userId = req.user.user_id;

  try {
    // ดึงข้อมูล friendship พร้อมกับข้อมูลของ requester (สมมติว่าเราเป็นคนรับ)
    // หรือต้องเขียน Logic ให้ครอบคลุมทั้งสองฝั่ง
    const { data, error } = await db
      .from("friendships")
      .select(
        `
        *,
        requester:requester_id (user_id, name, username, profilePic)
      `,
      )
      .eq("receiver_id", userId)
      .eq("status", "pending") // กรองเฉพาะที่ไม่ใช่ declined
      .order("created_at", { ascending: false }); // เรียงจากใหม่ไปเก่า

    if (error) throw error;

    // เนื่องจากเรากรองแล้วว่าเราเป็น receiver ดังนั้น 'เพื่อน' ก็คือ 'requester' เสมอ
    const friendsList = data.map((item) => {
      if (!item.requester) return null;
      return {
        ...item.requester, // ข้อมูลของคนที่ส่งคำขอมาหาเรา
        status: item.status,
        friendship_id: item.friendship_id, // ตรวจสอบชื่อคอลัมน์ใน DB (id หรือ friendship_id)
        createdAt: item.created_at,
      };
    });

    return res.status(200).json(friendsList);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getContacts = async (req, res) => {
  const userId = req.params.userId;

  try {
    const { data, error } = await db
      .from("friendships")
      .select(
        `
        *,
        requester:requester_id (user_id, name, username, profilePic),
        receiver:receiver_id (user_id, name, username, profilePic)
      `,
      )
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`) // ใช้ .or แทน
      .eq("status", "accepted") // กรองเฉพาะที่เป็นเพื่อนกันแล้ว
      .order("created_at", { ascending: false }); // เรียงจากใหม่ไปเก่า

    if (error) throw error;
    
    const formattedContacts = data.map(f => {
      return String(f.requester_id) === String(userId) ? f.receiver : f.requester;
    });

    return res.status(200).json(formattedContacts);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.declineFriend = async (req, res) => {
  // รับไอดีของ "อีกฝ่าย" มา (จะเป็นคนส่งหรือคนรับก็ได้)
  const { targetId } = req.body; 
  const myId = req.user.user_id;

  try {
    const { data, error } = await db
      .from("friendships")
      .delete()
      // ใช้ .or เพื่อครอบคลุมทั้งกรณีที่เราเป็นคนรับ (Decline) หรือเราเป็นคนส่ง (Cancel)
      .or(`and(requester_id.eq.${targetId},receiver_id.eq.${myId}),and(requester_id.eq.${myId},receiver_id.eq.${targetId})`);

    if (error) throw error;

    return res.status(200).json({ message: "Friend request declined" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
