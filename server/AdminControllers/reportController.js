const db = require("../config/db");

exports.getTopPosts = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_top_reported_posts");

    if (error) throw error;

    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Error fetching top reported posts:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getTopCommunities = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_top_reported_communities");

    if (error) throw error;

    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Error fetching top reported communities:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getTopReportedUsers = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_top_reported_users");

    if (error) throw error;

    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Error fetching top reported users:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getTopReportingUsers = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_top_reporting_users");

    if (error) throw error;

    return res.status(200).json(data);
    
  } catch (error) {
    console.error("Error fetching top reporting users:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getCountReportsType = async (req, res) => {
  try {
    const { data, error } = await db
      .from("reports")
      .select("report_type")
      .order("created_at", { ascending: false })

    if (error) throw error;

    // นับจำนวนแต่ละประเภทของ report
    const reportCount = data.reduce((acc, report) => {
      acc[report.report_type] = (acc[report.report_type] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json(reportCount);
  } catch (error) {
    console.error("Error fetching report counts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReportsTable = async (req, res) => {
  try {
    const { data, error } = await db
      .from("reports")
      .select(
        `report_id,
         actor:users!actor_id(username),
         target_id,
         item_id,
         community_id,
         post_id,
         description,
         report_type,
         status,
         created_at`
      )
      .order("report_id", { ascending: true }); // เรียงจากน้อยไปมาก

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateReport = async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body;

  try {
    const { data, error } = await db
      .from("reports")
      .update({
        status: status,
      })
      .eq("report_id", reportId)
      .select(); // ใส่ .select() ถ้าต้องการให้ Supabase รีเทิร์นข้อมูลที่อัปเดตแล้วกลับมา

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Report updated successfully", data });
  } catch (err) {
    console.error("Update Report Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};