const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

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

exports.getCommunityById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db.from("communities").select().eq("communities_id", id).single();

  if (error) return res.status(500).json(error);

  return res.status(200).json(data);
};

exports.getCommunitiesByUserId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db.from("communities").select().eq("user_id", id);

  if (error) return res.status(500).json(error);

  return res.status(200).json(data);
};

exports.updateCommunity = async (req, res) => {
  const { communityId, name, description, img, imgPublicId } = req.body;

  try {
    // 0. ดึง public_id เดิมก่อน
    const { data: oldCommunity, error } = await db
      .from("communities")
      .select("cover_public_id")
      .eq("communities_id", communityId)
      .maybeSingle();
      if (error) {
        return res.status(500).json(error);
      }
      // ถ้ามีการอัปโหลดรูปใหม่ และ public_id เปลี่ยน
    if (imgPublicId && oldCommunity?.cover_public_id && oldCommunity.cover_public_id !== imgPublicId) {
  try {
    await cloudinary.uploader.destroy(oldCommunity.cover_public_id);
  } catch (cloudErr) {
    console.log("CLOUD DELETE ERROR:", cloudErr);
  }
}
    const { error: updateError } = await db
      .from("communities")
      .update({
      name,
      description,
      cover_img: img,
      cover_public_id: imgPublicId
    })
    .eq("communities_id", communityId);

    if (updateError) {
      console.error("UPDATE ERROR:", updateError);
      return res.status(500).json(updateError);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};