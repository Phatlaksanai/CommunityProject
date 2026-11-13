const db = require("../config/db");

exports.getTransection = async (req, res) => {
    try {
        const sellerId = req.user.user_id;

        const [groupedRes, statsRes, payoutsRes] = await Promise.all([// ดึงข้อมูลพร้อมกัน 3 อัน
            db.from("view_grouped_earnings").select("*").eq("seller_id", sellerId),

            db.from("view_summary_stats").select("*").eq("seller_id", sellerId).maybeSingle(),

            db.from("transactions")
                .select("transaction_id, amount, created_at")
                .eq("user_id", sellerId)
                .is("order_item_id", null)
                .order("created_at", { ascending: false }) 
        ]);

        if (groupedRes.error) throw groupedRes.error;
        if (statsRes.error) throw statsRes.error;
        if (payoutsRes.error) throw payoutsRes.error;

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