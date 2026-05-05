const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

exports.addCommunity = async (req, res) => {
  const { CommunityName, description, img } = req.body;

  if (!CommunityName?.trim()) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (CommunityName.length < 3 || CommunityName.length > 100) {
    return res.status(400).json({ error: "Community name must be between 3 and 100 characters" });
  }
  if (description.length > 500) {
    return res.status(400).json({ error: "Description cannot exceed 500 characters" });
  }
  if (!description.trim()) {
    return res.status(400).json({ error: "Description cannot be empty" });
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

exports.getJoinedCommunities = async (req, res) => {
  const { id } = req.params;
  try {
    // ไปดึงข้อมูลจากตาราง community_members และ Join เอาข้อมูลตาราง communities มาด้วย
    const { data, error } = await db
      .from("community_members")
      .select(`
        community_id,
        status,
        communities (*)
      `)
      .eq("user_id", id)
      .eq("status", "active"); // ดึงเฉพาะกลุ่มที่สถานะยัง active (ไม่ได้ถูกแบนหรือออก)

    if (error) return res.status(500).json(error);

    // ข้อมูลที่ Supabase คืนมาจะซ้อนกันอยู่ เราจึงต้อง map เอาเฉพาะข้อมูลด้านใน (communities) ออกมาส่งให้หน้าบ้าน
    const joinedCommunities = data
      .map(item => item.communities)
      .filter(commu => commu !== null); // กรองเผื่อมีค่า null ติดมา

    return res.status(200).json(joinedCommunities);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updateCommunity = async (req, res) => {
  const { communityId, name, description, img, imgPublicId } = req.body;

  try {
    if (name.length < 3 || name.length > 100) {
      return res.status(400).json({ error: "Community name must be between 3 and 100 characters" });
    }
    if (description.length > 500) {
      return res.status(400).json({ error: "Description cannot exceed 500 characters" });
    }
    if (!name.trim()) {
      return res.status(400).json({ error: "Community name cannot be empty" });
    }
    if (!description.trim()) {
      return res.status(400).json({ error: "Description cannot be empty" });
    }
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


exports.addFollower = async (req, res) => {
  const { commu_id } = req.body;
  const user_id = req.user.user_id;

  try {
    const { error } = await db
      .from("community_members")
      .insert([
        { 
          community_id: commu_id, 
          user_id: user_id, 
          status: "active" // กำหนด status เริ่มต้น
        }
      ]);
      // ดึงยอด totalUsers เดิมมา เพื่อเตรียมบวก 1
      const { data: commuData } = await db
      .from("communities")
      .select('"totalUsers"')
      .eq("communities_id", commu_id)
      .single();

      const currentTotal = commuData?.totalUsers || 0;

      // อัปเดตตาราง communities ให้ totalUsers + 1
    await db
      .from("communities")
      .update({ totalUsers: currentTotal + 1 })
      .eq("communities_id", commu_id);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.removeFollower = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.user_id;

  try {
    // ลบคนออกจากตาราง community_members
    const { error: deleteError } = await db
      .from("community_members")
      .delete()
      .eq("community_id", id)
      .eq("user_id", user_id);

    if (deleteError) return res.status(500).json(deleteError);

    // ดึงยอด totalUsers เดิมมา เพื่อเตรียมลบ 1
    const { data: commuData } = await db
      .from("communities")
      .select('"totalUsers"')
      .eq("communities_id", id)
      .single();

    const currentTotal = commuData?.totalUsers || 0;

    // อัปเดตตาราง communities ให้ totalUsers - 1 (เช็คไม่ให้ติดลบด้วย)
    await db
      .from("communities")
      .update({ totalUsers: Math.max(0, currentTotal - 1) })
      .eq("communities_id", id);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getFollwersByCommunityId = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await db
      .from("community_members")
      .select("user_id")
      .eq("community_id", id)
      // สมมติว่าใน Enum ของคุณมีค่า 'active'
      .eq("status", "active"); 

    if (error) return res.status(500).json(error);

    // แปลงให้เป็น Array ของตัวเลข [1, 4, 15] 
    const followerIds = data.map(item => item.user_id);
    return res.status(200).json(followerIds);
    
  } catch (err) {
exports.getLatestCommunityImages = async (req, res) => {
  const { id } = req.params; // id ของคอมมูนิตี้

  try {
    const { data, error } = await db
      .from("imgs")
      .select(`
        img,
        posts!inner(community_id, created_at, status)
      `)
      .eq("posts.community_id", id)
      .eq("posts.status", "show")
      .order("posts(created_at)", { ascending: false })
      .range(0, 3); // ดึงแค่ 4 รูป (index 0 ถึง 3)

    if (error) throw error;

    // แปลงข้อมูลให้เหลือแค่ array ของ URL รูปภาพเพื่อให้ใช้ง่ายขึ้น
    const images = data.map(item => item.img);

    return res.status(200).json(images);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};