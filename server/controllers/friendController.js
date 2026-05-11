const db = require("../config/db");

exports.getAllUserForAdd = async (req, res) => {
  try {
    const { data, error } = await db
      .from("users") // เปลี่ยนชื่อตารางตามที่คุณใช้
      .select("*") // เลือกเฉพาะฟิลด์ที่ต้องการ
      .order("created_at", { ascending: false }); // เรียงจากใหม่ไปเก่า

    if (error) throw error;
    return res.status(200).json(data);
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
    const { data, error } = await db
      .from("friendships")
      .insert([
        {
          requester_id: requesterId,
          receiver_id: receiver_id,
          status: "pending",
        }
      ]);

    if (error) throw error;

    return res.status(200).json({ message: "Friend request sent successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.acceptFriend = async (req, res) => {
  const { requester_id } = req.body; // ไอดีของคนส่งคำขอมา
  const receiverId = req.user.user_id;      // ไอดีของเรา (คนกดรับ)

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
