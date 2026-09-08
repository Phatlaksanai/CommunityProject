const db = require("../config/db");

exports.getDonutYearlyPostStats = async (req, res) => {
    try {
    const { data, error } = await db.rpc("get_yearly_post_stats");

    if (error) throw error;

    // หาปีปัจจุบันใน JS เพื่อใช้เป็น Label
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // กำหนดค่าเริ่มต้นเป็น 0 เผื่อไม่มีคนโพสต์
    let postsCurrent = 0;
    let postsPrevious = 0;

    // วนลูปจับคู่ข้อมูล (ใช้ Number() ครอบ row.total ไว้เผื่อ DB ส่งมาเป็น String)
    data.forEach((row) => {
      if (Number(row.year) === currentYear) postsCurrent = Number(row.total);
      if (Number(row.year) === previousYear) postsPrevious = Number(row.total);
    });

    // 1. หาผลรวม
    const totalPosts = postsCurrent + postsPrevious;

    // 2. คำนวณเปอร์เซ็นต์
    const percentCurrent = totalPosts > 0 ? ((postsCurrent / totalPosts) * 100).toFixed(0) : 0;
    const percentPrevious = totalPosts > 0 ? ((postsPrevious / totalPosts) * 100).toFixed(0) : 0;

    // 3. จัด Format ข้อความ Name ให้พร้อมแสดงผล และใส่สีไปให้เลย
    const formattedData = [
      {
        name: `${currentYear} - ${percentCurrent}% (${postsCurrent.toLocaleString()})`,
        value: postsCurrent, // ใช้คำว่า value เพื่อให้หน้าบ้านใช้เป็น dataKey="value" ได้ง่ายๆ
      },
      {
        name: `${previousYear} - ${percentPrevious}% (${postsPrevious.toLocaleString()})`,
        value: postsPrevious,
      },
    ];

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching yearly post stats:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPostSummary = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_posts_summary");

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCommunitySummary = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_communities_summary");

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getItemSummary = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_items_summary");

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};