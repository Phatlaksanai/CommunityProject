const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const algoliaClient = require("../config/algolia");

const segmenter = new Intl.Segmenter('th', { granularity: 'word' });

function tokenizeThai(text) {
  if (!text) return "";
  const segments = segmenter.segment(String(text));
  return Array.from(segments)
    .map(s => s.segment.trim())
    .filter(Boolean)
    .join(" ");
}

exports.addCommunity = async (req, res) => {
  const { CommunityName, description, img, public_id } = req.body;
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
          cover_public_id: public_id || null,
          user_id: userId,
          totalUsers: 1,
          status: "show",
        },
      ])
      .select()
      .single();

    if (communityError) return res.status(500).json(communityError);

    try {
      await algoliaClient.saveObject({
        indexName: 'WebCommunity_Search',
        body: {
          objectID: `commu_${newCommunity.communities_id}`,
          title: newCommunity.name,
          description: newCommunity.description,
          searchable_title: tokenizeThai(newCommunity.name),
          searchable_description: tokenizeThai(newCommunity.description),
          img: newCommunity.cover_img,
          type: 'community',
          targetId: newCommunity.communities_id
        }
      });
    } catch (algoliaErr) {
      console.error("Algolia Insert Warning:", algoliaErr);
    }

    const { error: memberError } = await db
      .from("community_members")
      .insert([
        {
          user_id: userId,
          community_id: newCommunity.communities_id,
          status: "active",
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
  try {
    const { id } = req.params;
    const userId = req.user?.user_id;

    let query = db
      .from("communities")
      .select(`
        *,
        community_members(user_id, status),
        users!inner(isdelete)
      `)
      .eq("communities_id", id)
      .eq("status", "show")
      .eq("users.isdelete", "active");

    // ถ้าล็อกอินอยู่ ให้กรองตาราง community_members เฉพาะของ user คนนี้
    if (userId) {
      query = query.eq("community_members.user_id", userId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return res.status(404).json({ message: "Community not found or deleted" });
    }

    // เช็คว่าถ้ามีข้อมูลใน community_members และสถานะเป็น banned (หรือไม่ใช่ active) ให้บล็อก
    const memberRecord = data.community_members?.[0];
    if (memberRecord && memberRecord.status !== "active") {
      return res.status(403).json({ message: "You are banned from this community" });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// ดึงข้อมูลมาอสดงหน้า edit commu
exports.getCommunityForEdit = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await db
      .from("communities")
      .select()
      .eq("communities_id", id)
      .eq("status", "show")
      .eq("user_id", req.user.user_id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Community not found or deleted" });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
// เอากลุ่มที่เราสร้าง
exports.getCommunitiesByUserId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("communities")
    .select(`
      *, 
      users!inner(isdelete)
    `)
    .eq("status", "show")
    .eq("user_id", id)
    .eq("users.isdelete", "active")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.status(200).json(data);
};
// กลุ่มที่เราเข้าร่วม
exports.getJoinedCommunities = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await db
      .from("community_members")
      .select(`
        community_id,
        status,
        communities!inner (
          *,
          users!inner(isdelete) 
        )
      `)
      .eq("user_id", id)
      .eq("status", "active")
      .eq("communities.users.isdelete", "active")
      .eq("communities.status", "show")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json(error);

    // ตัดส่วนของ commu_member ส่งออกแค่ commu
    const Communities = data
      .map(commu => commu.communities)

    return res.status(200).json(Communities);
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

    const { data: oldCoverPb_Ib, error } = await db
      .from("communities")
      .select("cover_public_id")
      .eq("communities_id", communityId)
      .maybeSingle();
    if (error) {
      return res.status(500).json(error);
    }

    // ตรวจสอบการเปลี่ยนรูป
    if (imgPublicId && oldCoverPb_Ib?.cover_public_id && oldCoverPb_Ib.cover_public_id !== imgPublicId) {
      try {
        await cloudinary.uploader.destroy(oldCoverPb_Ib.cover_public_id);
      } catch (cloudErr) {
        console.log("CLOUD DELETE ERROR:", cloudErr);
      }
    }

    // update ข้อมูลชุมชน
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

    try {
      await algoliaClient.saveObject({
        indexName: 'WebCommunity_Search',
        body: {
          objectID: `commu_${communityId}`,
          title: name,
          description: description,
          searchable_title: tokenizeThai(name),
          searchable_description: tokenizeThai(description),
          img: img,
          type: 'community',
          targetId: communityId
        }
      });
    } catch (algoliaErr) {
      console.error("Algolia Update Warning:", algoliaErr);
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
    await db
      .from("community_members")
      .insert([
        {
          community_id: commu_id,
          user_id: user_id,
          status: "active"
        }
      ]);

    const { data: commuData } = await db
      .from("communities")
      .select("totalUsers")
      .eq("communities_id", commu_id)
      .single();

    const currentTotal = commuData?.totalUsers || 0;

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
    const { error: deleteError } = await db
      .from("community_members")
      .delete()
      .eq("community_id", id)
      .eq("user_id", user_id);

    if (deleteError) return res.status(500).json(deleteError);

    const { data: commuData } = await db
      .from("communities")
      .select("totalUsers")
      .eq("communities_id", id)
      .single();

    const currentTotal = commuData?.totalUsers || 0;

    await db
      .from("communities")
      .update({ totalUsers: Math.max(0, currentTotal - 1) })
      .eq("communities_id", id);

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};
// ดูว่าติดตามยัง และนับจน.ผู้ติดตาม (CommuDetail, DescCommu)
exports.getFollwersByCommunityId = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await db
      .from("community_members")
      .select("user_id")
      .eq("community_id", id)
      .eq("status", "active");

    if (error) return res.status(500).json(error);

    // จัด id ผู้ติดตามเป็น Array [1, 4, 15] 
    const followerIds = data.map(id => id.user_id);
    return res.status(200).json(followerIds);

  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};

exports.getLatestCommunityImages = async (req, res) => {
  const { id } = req.params;

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

    const { data: community, error: commuError } = await db
      .from("communities")
      .select("user_id")
      .eq("communities_id", id)
      .eq("status", "show")
      .eq("user_id", req.user.user_id)
      .maybeSingle();

    if (commuError) {
      console.error("Get Community Error:", commuError);
      return res.status(500).json(commuError);
    }

    const ownerId = community?.user_id;

    const { data, error } = await db
      .from("community_members")
      .select(`
        user_id,
        status,
        users!inner (
          username,
          name,
          profilePic
        )
      `)
      .eq("community_id", id)
      .neq("user_id", ownerId);

    if (error) {
      console.error("GET MEMBERS ERROR:", error);
      return res.status(500).json(error);
    }

    const members = data.map(item => ({
      user_id: item.user_id,
      status: item.status,
      ...(item.users || {})
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

    const { data: currentBanned, error: fetchError } = await db
      .from("community_members")
      .select("user_id")
      .eq("community_id", communityId)
      .eq("status", "banned");

    if (fetchError) {
      console.error("FETCH BANNED USERS ERROR:", fetchError);
      return res.status(500).json(fetchError);
    }
    // แบนเก่า
    const currentBannedIds = currentBanned.map(user => user.user_id);

    // หาคนที่ปลดแบน / (Set) currentBannedIds[1,2,3] - userIds[1,4] = [2,3] 
    const usersToUnban = currentBannedIds.filter(id => !userIds.includes(id));

    // ปลดแบน + โชว์โพสต์
    if (usersToUnban.length > 0) {
      const { error: unbanError } = await db
        .from("community_members")
        .update({ status: "active" })
        .eq("community_id", communityId)
        .in("user_id", usersToUnban);

      if (unbanError) return res.status(500).json(unbanError);

      const { error: showPostError } = await db
        .from("posts")
        .update({ status: "show" })
        .eq("community_id", communityId)
        .in("user_id", usersToUnban)
        .eq("status", "hide");

      if (showPostError) return res.status(500).json(showPostError);
    }

    // แบน
    if (userIds.length > 0) {
      const { error: banError } = await db
        .from("community_members")
        .update({ status: "banned" })
        .eq("community_id", communityId)
        .in("user_id", userIds);

      if (banError) return res.status(500).json(banError);

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

exports.deleteCommunity = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  const { error: commuError } = await db
    .from("communities")
    .update({ status: "hide" })
    .eq("user_id", userId)
    .eq("communities_id", id);

  if (commuError) return res.status(500).json(commuError);

  const { error: postsError } = await db
    .from("posts")
    .update({ status: "hide" })
    .eq("community_id", id);

  if (postsError) return res.status(500).json(postsError);

  try {
    await algoliaClient.deleteObject({
      indexName: 'WebCommunity_Search',
      objectID: `commu_${id}`,
    });
  } catch (algoliaErr) {
    console.error("Algolia Delete Warning:", algoliaErr);
  }

  return res.status(200).json("Community has been deleted.");
};