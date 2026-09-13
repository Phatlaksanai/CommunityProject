const db = require("../config/db");

exports.getTransection = async (req, res) => {
    try {
        const sellerId = req.user.user_id;

        // เรียกข้อมูล 3 ก้อนพร้อมกัน
        const [groupedRes, statsRes, payoutsRes] = await Promise.all([
            // 1. ดึงกลุ่มสินค้าจาก View
            db.from("view_grouped_earnings").select("*").eq("seller_id", sellerId),
            
            // 2. ดึงยอดสรุปจาก View (ใช้ .maybeSingle() เพราะข้อมูลมีแค่ 1 แถวต่อผู้ขาย)
            db.from("view_summary_stats").select("*").eq("seller_id", sellerId).maybeSingle(),
            
            // 3. ดึงยอดถอนจากตารางปกติ และให้เรียงวันที่จากใหม่ไปเก่าเลย
            db.from("transactions")
                .select("transaction_id, amount, created_at")
                .eq("user_id", sellerId)
                .is("order_item_id", null)
                .order("created_at", { ascending: false }) 
        ]);

        if (groupedRes.error) throw groupedRes.error;
        if (statsRes.error) throw statsRes.error;
        if (payoutsRes.error) throw payoutsRes.error;

        // ถ้าไม่มีข้อมูลยอดสรุป ให้ส่งค่าเริ่มต้นกลับไป
        const defaultStats = { total_quantity: 0, total_sale: 0, day_sale: 0, month_sale: 0, year_sale: 0 };

        res.status(200).json({
            groupedEarnings: groupedRes.data,
            summaryStats: statsRes.data || defaultStats,
            payouts: payoutsRes.data
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load transactions" });
    }
};