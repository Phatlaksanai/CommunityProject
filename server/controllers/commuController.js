const db = require("../config/db");

exports.addCommunity = async (req, res) => {
  const { CommunityName, description, img } = req.body;

  if (!CommunityName?.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await db
    .from("communities")
    .insert([
      {
        name: CommunityName,
        description: description || null,
        cover_img: img || null,
        user_id: req.user.user_id,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json(error);

  return res.status(201).json(data);
};

exports.getCommunities = async (req, res) => {
  const { data, error } = await db.from("communities").select();

  if (error) return res.status(500).json(error);

  return res.status(200).json(data);
};

exports.getCommunitiesByUserId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db.from("communities").select().eq("user_id", id);

  if (error) return res.status(500).json(error);

  return res.status(200).json(data);
};