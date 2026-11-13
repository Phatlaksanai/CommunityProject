const db = require("../config/db");

exports.getConversations = async (req, res) => {
    const { userId } = req.params;

    try {
        const page = parseInt(req.query.page) || 0;
        const limit = 12;
        const from = page * limit;
        const to = from + limit - 1;

        const { data, error } = await db
            .from("conversations")
            .select(`
                *,
                friendships!inner (
                friendship_id,
                requester_id,
                receiver_id,
                requester:users!requester_id ( user_id, username, name, profilePic, isdelete ),
                receiver:users!receiver_id ( user_id, username, name, profilePic, isdelete )
                )
            `)
            // foreignTable กรองตาราง friendships
            .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`, { foreignTable: "friendships" })
            .order("updated_at", { ascending: false })
            .range(from, to);

        if (error) throw error;

        const formatted = data.map((chat) => {
            const friendship = chat.friendships;

            if (!friendship) return null;

            const isRequester = friendship.requester_id == userId;
            const partnerInfo = isRequester ? friendship.receiver : friendship.requester;

            return {
                username: partnerInfo?.username || null,
                name: partnerInfo?.name || null,
                profilePic: partnerInfo?.profilePic || null,
                isdelete: partnerInfo?.isdelete || "active",

                conversation_id: chat.conversation_id,
                friendship_id: chat.friendship_id,
                last_message: chat.last_message,
                updated_at: chat.updated_at,
                created_at: chat.created_at,
            };
        }).filter(Boolean); // กรองเอาค่า null ออกในกรณีที่ดึงติดขัด

        return res.status(200).json(formatted);

    } catch (err) {
        console.error("Error in getConversations:", err);
        return res.status(500).json({ error: err.message });
    }
};

exports.createConversation = async (req, res) => {
    const { user2Id } = req.body;
    const myuserId = req.user.user_id;

    try {
        // หาว่าเป็นเพื่อนกันหรือไม่
        const { data: friendship, error: friendError } = await db
            .from("friendships")
            .select("friendship_id")
            .or(`and(status.eq.accepted,requester_id.eq.${myuserId},receiver_id.eq.${user2Id}),and(status.eq.accepted,requester_id.eq.${user2Id},receiver_id.eq.${myuserId})`)
            .maybeSingle(); // ใช้ maybeSingle เพื่อไม่ให้ throw error ถ้าไม่เจอ

        if (friendError) throw friendError;
        if (!friendship) {
            return res.status(400).json({ error: "Not found friendship" });
        }

        const targetFriendshipId = friendship.friendship_id;

        // ดูว่ามีห้องแชทยัง
        const { data: existingChat, error: checkError } = await db
            .from("conversations")
            .select("*")
            .eq("friendship_id", targetFriendshipId)
            .maybeSingle();

        if (checkError) throw checkError;

        // ถ้ามีห้องอยู่แล้ว ให้ส่งข้อมูลห้องเดิมกลับไปเลย
        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        // ถ้ายังไม่มีห้อง ให้สร้างห้องใหม่
        const { data: newChat, error: chatError } = await db
            .from("conversations")
            .insert({
                friendship_id: targetFriendshipId
            })
            .select()
            .single();

        if (chatError) throw chatError;

        return res.status(200).json(newChat);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.getMessages = async (req, res) => {
    const { conversationId } = req.params;
    try {

        const page = parseInt(req.query.page) || 0;
        const limit = 15;
        const from = page * limit;
        const to = from + limit - 1;

        const { data, error } = await db
            .from("messages")
            .select(`
                *,
                imgs ( img ) 
            `)
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.addMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { text, img, is_read } = req.body;
    const senderId = req.user.user_id;
    try {
        const { data: chatData, error: chatGetError } = await db
            .from("conversations")
            .select(`
                friendship_id,
                friendships!inner (
                    requester_id,
                    receiver_id,
                    requester:users!requester_id ( isdelete ),
                    receiver:users!receiver_id ( isdelete )
                )
            `)
            .eq("conversation_id", conversationId)
            .maybeSingle();

        if (chatGetError || !chatData) throw chatGetError || new Error("Conversation not found");

        const friendship = chatData.friendships;
        if (friendship) {
            const isRequester = friendship.requester_id == senderId;
            const partner = isRequester ? friendship.receiver : friendship.requester;

            // ถ้าเพื่อนลบบช.
            if (partner && partner.isdelete === 'deleted') {
                return res.status(400).json({ error: "This account has been deleted" });
            }
        }

        const { data: messageData, error: messageError } = await db
            .from("messages")
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                text: text || null,
                is_read: is_read
            })
            .select()
            .single();

        if (messageError) throw messageError;

        let savedImgUrl = null;
        if (img) {
            const { error: imgError } = await db
                .from("imgs")
                .insert({
                    message_id: messageData.message_id,
                    post_id: null,
                    img: img
                });

            if (imgError) throw imgError;
            savedImgUrl = img;
        }
        let lastMessageText = text;
        if (!text && img) {
            lastMessageText = "📷 Sent an image";
        }

        const { error: updateError } = await db
            .from("conversations")
            .update({
                last_message: lastMessageText,
                updated_at: new Date()
            })
            .eq("conversation_id", conversationId);

        if (updateError) throw updateError;

        return res.status(200).json({
            ...messageData,
            img: savedImgUrl
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.markAsRead = async (req, res) => {
    const { conversationId } = req.params;
    const { userId } = req.body;
    try {
        const { error } = await db
            .from("messages")
            .update({ is_read: "read" })
            .eq("conversation_id", conversationId)
            .neq("sender_id", userId) // อัปเดตเฉพาะข้อความที่ไม่ใช่ของเราเท่านั้น
            .eq("is_read", "sent"); // อัปเดตเฉพาะข้อความที่ยังไม่ได้อ่าน (สถานะ sent)

        if (error) throw error;
        return res.status(200).json({ message: "Messages marked as read" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};