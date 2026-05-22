const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

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
