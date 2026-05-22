const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

exports.getConversations = async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await db
    .from("conversations")
    .select(
      `
      *,
      users!user2_id (
        username,
        name,
        profilePic
      )
    `,
    )
    .eq("user1_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  const formatted = data.map((chat) => ({
    ...chat,
    username: chat.users?.username || null,
    name: chat.users?.name || null,
    profilePic: chat.users?.profilePic || null,
  }));

  return res.status(200).json(formatted || []);
};