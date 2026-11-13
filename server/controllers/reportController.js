const db = require("../config/db");

exports.addReport = async (req, res) => {
    const { id } = req.params;
    const actor_id = req.user.user_id;
    const { type, description, entityType } = req.body;

    try {
        const { data: postData, error: reportError } = await db
            .from("reports")
            .insert([
                {
                    actor_id: actor_id,
                    target_id: entityType === "user" ? id : null,
                    item_id: entityType === "item" ? id : null,
                    community_id: entityType === "community" ? id : null,
                    post_id: entityType === "post" ? id : null,
                    report_type: type || null,
                    description: description.trim(),
                    status: "pending",
                },
            ])
            .select()
            .single();

        if (reportError) throw reportError;

        return res.status(200).json(postData);
    } catch (error) {
        console.error("Server Error:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};