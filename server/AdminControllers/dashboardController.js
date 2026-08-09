const db = require("../config/db");

exports.getStatistics = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_dashboard_summary");

    if (error) throw error;

    // ส่งข้อมูล index แรกกลับไปให้หน้าบ้าน
    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
