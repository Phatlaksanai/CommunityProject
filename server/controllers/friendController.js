const db = require("../config/db");

exports.getAllUserForAdd = async (req, res) => {
  try {
    const { data, error } = await db
      .from("users") // เปลี่ยนชื่อตารางตามที่คุณใช้
      .select("*") // เลือกเฉพาะฟิลด์ที่ต้องการ
      .order("created_at", { ascending: false }) // เรียงจากใหม่ไปเก่า

    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};