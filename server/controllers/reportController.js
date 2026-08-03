const db = require("../config/db");

exports.addReport = async (req, res) => {
    const { id } = req.params;
    const actor_id = req.user.user_id;
    // รับ entityType เพิ่มจาก body เพื่อแยกประเภท
    const { type, description, entityType } = req.body;

    try {
        const { data: postData, error: reportError } = await db
            .from("reports")
            .insert([
                {
                    actor_id: actor_id,
                    // เช็คเงื่อนไขจาก entityType เพื่อใส่ id ให้ถูก column
                    target_id: entityType === "user" ? id : null,
                    item_id: entityType === "item" ? id : null,
                    community_id: entityType === "community" ? id : null,
                    post_id: entityType === "post" ? id : null,
                    report_type: type || null,
                    description: description.trim(),
                },
            ])
            .select()
            .single();

        if (reportError) throw reportError;

        // ลบ img, model ออก ป้องกันการเกิด ReferenceError
        return res.status(200).json({ ...postData });
    } catch (error) {
        console.error("Server Error:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};