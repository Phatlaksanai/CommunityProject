const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

exports.getConversations = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. ทำระบบ Pagination (ดึงทีละ 12 รายการ เหมือนใน getPosts)
    const page = parseInt(req.query.page) || 0; // ถ้าไม่ส่งมาจะเริ่มต้นที่หน้า 0
    const limit = 12; // กำหนดให้โหลดทีละ 12 แชทตามที่ต้องการ
    const from = page * limit;
    const to = from + limit - 1;

    // 2. ดึงข้อมูลจากตาราง conversations พร้อมข้อมูลผู้ใช้ทั้ง 2 ฝั่ง
    const { data, error } = await db
      .from("conversations")
      .select(
        `
        *,
        user1:users!user1_id ( user_id, username, name, profilePic ),
        user2:users!user2_id ( user_id, username, name, profilePic )
      `
      )
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      // แนะนำให้เปลี่ยนมาเรียงตาม updated_at จากใหม่ไปเก่า 
      // เพื่อให้แชทที่มีข้อความใหม่ล่าสุดเด้งขึ้นมาอยู่ด้านบนสุดเสมอครับ
      .order("updated_at", { ascending: false }) 
      .range(from, to); // ใส่ช่วงที่ต้องการตัดดึงข้อมูลมาแสดงผล

    if (error) throw error;

    // 3. จัดระเบียบ Data เลียนแบบ getFriendsByUserId
    const formatted = data.map((chat) => {
      // เช็คว่าเราเป็น user1 หรือไม่
      const isUser1 = chat.user1_id == userId; 
      
      // เลือกเอาข้อมูลโปรไฟล์ของ "คู่สนทนา" (คนที่ไม่ใช่เรา) ออกมา
      const partnerInfo = isUser1 ? chat.user2 : chat.user1;

      return {
        // กระจายข้อมูลโปรไฟล์ของคู่สนทนาออกมาเป็นชั้นนอกสุด (เหมือน ...friendInfo)
        partner_id: partnerInfo?.user_id || null,
        username: partnerInfo?.username || null,
        name: partnerInfo?.name || null,
        profilePic: partnerInfo?.profilePic || null,
        
        // ส่งค่าจากตารางตัวเองไปด้วยตามที่คุณต้องการ
        conversation_id: chat.conversation_id,
        user1_id: chat.user1_id,
        user2_id: chat.user2_id,
        last_message: chat.last_message, // ข้อความล่าสุดที่ส่งมา
        updated_at: chat.updated_at,     // เวลาล่าสุดที่มีการส่งข้อความ
        created_at: chat.created_at,
      };
    });

    return res.status(200).json(formatted);

  } catch (err) {
    console.error("Error in getConversations:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.createConversation = async (req, res) => {
  const { user2Id } = req.body;
  const myuserId = req.user.user_id;

  try {
    // ตรวจสอบว่ามี conversation อยู่แล้วหรือไม่
    const { data: existingChats, error: checkError } = await db
      .from("conversations")
      .select("*")
      .or(`and(user1_id.eq.${myuserId},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${myuserId})`);

    if (checkError) throw checkError;

    // ถ้ามีห้องอยู่แล้ว ให้ส่งข้อมูลห้องเดิมกลับไปเลย โดยไม่ต้องสร้างใหม่
    if (existingChats && existingChats.length > 0) {
      return res.status(200).json(existingChats[0]);
    }

    const { data: newChat, error: chatError } = await db
      .from("conversations")
      .insert({
        user1_id: myuserId,
        user2_id: user2Id
      })
      .select()
      .single();

    if (chatError) throw chatError;

    return res.status(200).json(newChat); // ส่งกลับข้อมูล conversation
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const { data, error } = await db
            .from("messages")
            .select("*")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.addMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { text } = req.body;
    const senderId = req.user.user_id;
    try {
        const { data: messageData, error: messageError } = await db
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                text: text,
            })
            .select()
            .single();

        if (messageError) throw messageError;

        const { error: updateError } = await db
            .from("conversations")
            .update({ 
                last_message: text,
                updated_at: new Date() // อัปเดตเวลาเพื่อให้ช่องแชทที่มีคนพิมพ์ล่าสุดเด้งขึ้นมาบนสุด
            })
            .eq("conversation_id", conversationId);

        if (updateError) throw updateError;

        return res.status(200).json(messageData);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};