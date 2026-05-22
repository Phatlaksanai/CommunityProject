const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

exports.getConversations = async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await db
    .from("conversations")
    .select(
      `
      *,
      user1:users!user1_id ( username, name, profilePic ),
      user2:users!user2_id ( username, name, profilePic )
    `,
    )
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  const formatted = data.map((chat) => {
    // เช็คว่าไอดีของเราตรงกับ user1_id หรือไม่ (ใช้ == เพื่อกันปัญหา String vs Number)
    const isUser1 = chat.user1_id == userId; 
    
    // ถ้าเราเป็น user1 คู่สนทนาคือ user2 แต่ถ้าเราไม่ใช่ ให้คู่สนทนาคือ user1
    const partner = isUser1 ? chat.user2 : chat.user1;

    return {
      ...chat,
      username: partner?.username || null,
      name: partner?.name || null,
      profilePic: partner?.profilePic || null,
    };
  });

  return res.status(200).json(formatted || []);
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
