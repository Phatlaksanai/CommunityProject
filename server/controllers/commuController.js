const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

exports.addCommunity = async (req, res) => {
  const { CommunityName, description, img } = req.body;
  const userId = req.user.user_id;

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
  try {
    const { data: newCommunity, error: communityError } = await db
      .from("communities")
      .insert([
        {
          name: CommunityName,
          description: description || null,
          cover_img: img || null,
          user_id: userId,
          totalUsers: 1,
        },
      ])
      .select()
      .single();

    if (communityError) return res.status(500).json(communityError);

    // เพิ่มผู้สร้างลงในตาราง community_members ทันที
    // เพื่อให้ระบบนับว่าผู้สร้างเป็นสมาชิกคนแรกอย่างสมบูรณ์
    const { error: memberError } = await db
      .from("community_members")
      .insert([
        {
          user_id: userId,
          community_id: newCommunity.communities_id,
          status: "active", // หรือ status ตามที่คุณตั้งไว้ใน Enum
        },
      ]);
    if (memberError) {
      console.error("Member Insert Error:", memberError);
    }

    return res.status(201).json(newCommunity);
  } catch (err) {
    console.error("Add Community Error:", err);
    return res.status(500).json(err);
  }
};

exports.getCommunityById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("communities")
    .select()
    .eq("communities_id", id)
    .single();

  if (error) return res.status(500).json(error);

  return res.status(200).json(data);
};

exports.getCommunitiesByUserId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("communities")
    .select(`
      *, 
      users!inner(isdelete)
    `) // ใส่ !inner เพื่อบอกว่าถ้าเงื่อนไขตาราง users ไม่ผ่าน ไม่ต้องดึง communities แถวนั้นออกมาเลย
    .eq("user_id", id)
    .eq("users.isdelete", "active") // กรองเฉพาะคอมมูนิตี้ที่เจ้าของยังไม่ถูกลบ
    .order("created_at", { ascending: false });

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
        communities (
          *,
          users!inner(isdelete) 
        )
      `)
      .eq("user_id", id)
      .eq("status", "active") // ดึงเฉพาะกลุ่มที่สถานะยัง active (ไม่ได้ถูกแบนหรือออก)
      .eq("communities.users.isdelete", "active")
      .order("created_at", { ascending: false });

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
    console.error(err);
    return res.status(500).json(err);
  }
};

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

    if (error) throw error;

    // แปลงข้อมูลให้เหลือแค่ array ของ URL รูปภาพเพื่อให้ใช้ง่ายขึ้น
    const images = data.map(item => item.img);

    return res.status(200).json(images);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};

exports.getMembersByCommunityId = async (req, res) => {
  const { id } = req.params;
  try {
    // ดึงข้อมูล Community เพื่อเอาไปใช้กรองออก 
    const { data: community, error: commuError } = await db
      .from("communities")
      .select("user_id")
      .eq("communities_id", id)
      .maybeSingle(); // ใช้ maybeSingle เพื่อป้องกัน error กรณีไม่พบข้อมูล

    if (commuError) {
      console.error("Get Community Error:", commuError);
      return res.status(500).json(commuError);
    }

    const ownerId = community?.user_id;

    // ดึงข้อมูลจากตาราง community_members และ Join เอาข้อมูลตาราง users
    const { data, error } = await db
      .from("community_members")
      .select(`
        user_id,
        status,
        users (
          user_id,
          username,
          name,
          profilePic
        )
      `)
      .eq("community_id", id)
      .neq("user_id", ownerId); // กรองเจ้าของกลุ่มออก

    if (error) {
      console.error("GET MEMBERS ERROR:", error);
      return res.status(500).json(error);
    }

    // ข้อมูลที่ Supabase คืนมาจะซ้อนกันอยู่ (item.users) 
    // เราจึง map กระจาย (spread) ข้อมูลออกมาให้เป็น Object ชั้นเดียว เพื่อให้หน้าบ้านใช้ง่ายๆ
    const members = data.map(item => ({
      user_id: item.user_id,
      status: item.status,
      ...(item.users || {}) // แตก properties ของ users ออกมา
    }));

    return res.status(200).json(members);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json(err);
  }
};

exports.banMember = async (req, res) => {
  const { communityId, userIds = [] } = req.body;

  try {
    if (!communityId) {
      return res.status(400).json({ error: "Community ID not found" });
    }
    // ดึงรายชื่อคนที่กำลังถูกแบนอยู่ปัจจุบัน
    const { data: currentBanned, error: fetchError } = await db
      .from("community_members")
      .select("user_id")
      .eq("community_id", communityId)
      .eq("status", "banned");

    if (fetchError) {
      console.error("FETCH BANNED USERS ERROR:", fetchError);
      return res.status(500).json(fetchError);
    }

    const currentBannedIds = currentBanned.map(user => user.user_id);

    // คัดแยกคนที่ต้อง "ปลดแบน" (คือคนที่เคยโดนแบน แต่ไม่มีชื่อใน userIds ล่าสุดที่ส่งมา)
    const usersToUnban = currentBannedIds.filter(id => !userIds.includes(id));

    // ดำเนินการ "ปลดแบน" และ "โชว์โพสต์"
    if (usersToUnban.length > 0) {
      // ปลดแบนสมาชิก
      const { error: unbanError } = await db
        .from("community_members")
        .update({ status: "active" })
        .eq("community_id", communityId)
        .in("user_id", usersToUnban);

      if (unbanError) return res.status(500).json(unbanError);

      // โชว์โพสต์กลับมา (เปลี่ยนกลับเป็น 'show' หรือ 'active' ตามที่คุณใช้ใน Database)
      const { error: showPostError } = await db
        .from("posts")
        .update({ status: "show" }) // ตรวจสอบว่า Status โพสต์ปกติของคุณคือคำว่าอะไร (เช่น 'show', 'active')
        .eq("community_id", communityId)
        .in("user_id", usersToUnban)
        .eq("status", "hide"); // ป้องกันการไปโชว์โพสต์ที่อาจถูกลบไปแล้ว ให้เปลี่ยนเฉพาะโพสต์ที่ถูกซ่อนอยู่

      if (showPostError) return res.status(500).json(showPostError);
    }

    // 4. ดำเนินการ "แบน" และ "ซ่อนโพสต์" (ตามรายชื่อ userIds ล่าสุด)
    if (userIds.length > 0) {
      // 4.1 แบนสมาชิก
      const { error: banError } = await db
        .from("community_members")
        .update({ status: "banned" })
        .eq("community_id", communityId)
        .in("user_id", userIds);

      if (banError) return res.status(500).json(banError);

      // 4.2 ซ่อนโพสต์
      const { error: hidePostError } = await db
        .from("posts")
        .update({ status: "hide" })
        .eq("community_id", communityId)
        .in("user_id", userIds);

      if (hidePostError) return res.status(500).json(hidePostError);
    }

    return res.status(200).json({ success: true, message: "Update Successful!" });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json(err);
  }
};