const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getTransactionSummary = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_transaction_summary");

    if (error) throw error;

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWeeklyOrders = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_weekly_orders_chart");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTransactionsTable = async (req, res) => {
  try {
    const { data, error } = await db
      .from("transactions")
      .select(
        `transaction_id, order_item_id, amount, transaction_type, created_at, 
        users(username)`
      )
      .order("transaction_id", { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getOrderByRange = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_order_by_range");

    if (error) throw error;

    const rangeCount = {
      "฿1–฿100": 0,
      "฿101–฿500": 0,
      "฿501+": 0,
    };

    if (data && data.length > 0) {
      data.forEach((row) => {
        if (rangeCount[row.range_name] !== undefined) {
          rangeCount[row.range_name] = Number(row.total);
        }
      });
    }

    const totalItems = rangeCount["฿1–฿100"] + rangeCount["฿101–฿500"] + rangeCount["฿501+"];

    const formattedData = Object.keys(rangeCount).map((range) => {
      const count = rangeCount[range];
      const percent = totalItems > 0 ? ((count / totalItems) * 100).toFixed(0) : 0;

      return {
        name: `${range} - ${percent}% (${count})`, 
        value: count, // เปลี่ยน key ให้กราฟใช้ค่าตัวเลขนี้
      };
    });

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching order by range:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getWeeklySales = async (req, res) => {
  try {
    const { data, error } = await db.rpc("get_weekly_sales_chart");

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching weekly sales:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};