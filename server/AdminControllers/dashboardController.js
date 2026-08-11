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

exports.getRevenueOverview = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_weekly_sales");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly sales:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { data, error } = await db
      .from("orders")
      .select(
        `order_id,
        total_amount,
        status,
        users(username, name, profilePic)`,
      )
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    // จัด Format ส่งให้หน้าบ้าน
    const formattedData = data.map(order => ({
      order_id: order.order_id,
      profilePic: order.users?.profilePic,
      name: order.users?.name || order.users?.username || "Unknown User",
      orderRef: `#${order.order_id}`, // แสดงเป็นเลขที่ออเดอร์
      amount: order.total_amount || 0,
      status: order.status
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error" });
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