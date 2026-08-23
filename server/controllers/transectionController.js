const db = require("../config/db");

exports.getTransection = async (req, res) => {
    try {
        const [salesRes, withdrawRes] = await Promise.all([
            // 1. ยอดขาย: กรองจาก order_items.seller_id และทำ Inner Join เพื่อตัด null ออก
            db.from("transactions")
                .select(`
                    transaction_id,
                    amount,
                    created_at,
                    transaction_type,
                    order_items!inner(
                        items(
                            modelName
                        )
                    )
                `)
                .eq("order_items.seller_id", req.user.user_id),

            // 2. ยอดถอน: กรองจาก transactions.user_id และ order_item_id เป็น null
            db.from("transactions")
                .select(`
                    transaction_id,
                    amount,
                    created_at,
                    transaction_type,
                    order_items(
                        items(
                            modelName
                        )
                    )
                `)
                .eq("user_id", req.user.user_id)
                .is("order_item_id", null)
        ]);

        if (salesRes.error) throw salesRes.error;
        if (withdrawRes.error) throw withdrawRes.error;

        // รวม Array และเรียงลำดับจากล่าสุดไปเก่าสุด
        const combinedData = [...salesRes.data, ...withdrawRes.data];
        combinedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.status(200).json(combinedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to load transections",
        });
    }
};