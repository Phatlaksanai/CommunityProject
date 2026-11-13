const db = require("../config/db");

exports.getPosts = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.user_id : null;
    const limit = 5;
    const page = parseInt(req.query.page) || 0;

    // ดึง id กลุ่มที่เราเข้าแล้วยังไม่โดนแบน
    let myGroupIds = [];
    if (currentUserId) {
      const { data: memberData } = await db
        .from("community_members")
        .select("community_id")
        .eq("user_id", currentUserId)
        .eq("status", "active");
      myGroupIds = memberData?.map((item) => item.community_id) || [];
    }

    let finalPosts = [];
    let currentOffset = page * limit;
    let fetchSize = 10; // ดึงมาตรวจสอบทีละ 10 

    // ลูปดึงให้ครบ 5 โพส
    while (finalPosts.length < limit) { // รอบแรก 0 < 5
      let query = db
        .from("posts")
        .select(
          `
          *,
          imgs(img),
          models(model),
          users!inner(user_id, username, name, profilePic, isdelete),
          communities(
            communities_id, 
            name, 
            cover_img,
            users(isdelete)
          ),
          projects(
            project_id,
            project_name,
            users(isdelete)
          )
        `,
        )
        .eq("status", "show")
        .eq("users.isdelete", "active");

      // กรองโพสจากในคอมมูที่หน้า feed
      if (currentUserId && myGroupIds.length > 0) {
        query = query.or(`community_id.is.null,community_id.in.(${myGroupIds.join(",")})`);
      } else {
        query = query.is("community_id", null);
      }

      // ดึง .range
      const { data: dbData, error } = await query
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + fetchSize - 1);

      if (error) throw error;

      // ถ้าข้อมูลใน DB หมดให้หยุดลูปทันที
      if (!dbData || dbData.length === 0) {
        break;
      }

      // กรองโพสที่เจ้าของ commu ยังไม่ลบบัญชี
      const approvedPosts = dbData.filter((post) => {
        if (post.community_id !== null) {
          if (!post.communities || !post.communities.users || post.communities.users.isdelete === "deleted") {
            return false; // เจ้าของกลุ่มลบบัญชี
          }
        }
        return true;
      });

      finalPosts = [...finalPosts, ...approvedPosts];

      currentOffset += fetchSize; // รอบแรก 0 + 10
    }

    // ตัดเอาข้อมูลให้เหลือพอดี 5 รายการตามต้องการ
    const resultPosts = finalPosts.slice(0, limit); // arr 0 ถึง (limit-1)

    // Format โครงสร้าง Object ก่อนส่งกลับหน้าบ้าน
    const formatted = resultPosts.map((post) => ({
      ...post,
      username: post.users?.username || null,
      name: post.users?.name || null,
      profilePic: post.users?.profilePic || null,
      community_name: post.communities?.name || null,
      community_cover: post.communities?.cover_img || null,
      project_name: post.projects?.project_name || null,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in getPosts:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Profile
exports.getPostsByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const page = parseInt(req.query.page) || 0;
    const limit = 5;

    let finalPosts = [];
    let currentOffset = page * limit;
    let fetchSize = 10;

    while (finalPosts.length < limit) {
      const { data: dbData, error } = await db
        .from("posts")
        .select(
          `
          *,
          imgs(img),
          models(model),
          users!inner(user_id, username, name, profilePic, isdelete),
          communities(
            communities_id, 
            name, 
            cover_img,
            users(isdelete)
          )
        `,
        )
        .eq("user_id", id)
        .eq("status", "show")
        .eq("users.isdelete", "active")
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + fetchSize - 1);

      if (error) return res.status(500).json(error);

      // ถ้าไม่มีข้อมูลใน Database เหลือให้ดึงแล้ว ให้หยุดลูปทันที
      if (!dbData || dbData.length === 0) {
        break;
      }

      // กรองเอาเฉพาะโพสต์ที่ไม่อยู่ในกลุ่มที่เจ้าของกลุ่มลบบัญชีไปแล้ว
      const approvedPosts = dbData.filter((post) => {
        if (post.community_id !== null) {
          if (!post.communities || !post.communities.users || post.communities.users.isdelete === "deleted") {
            return false;
          }
        }
        return true;
      });

      finalPosts = [...finalPosts, ...approvedPosts];

      currentOffset += fetchSize;
    }

    const resultPosts = finalPosts.slice(0, limit);

    const formatted = resultPosts.map((post) => ({
      ...post,
      username: post.users?.username || null,
      name: post.users?.name || null,
      profilePic: post.users?.profilePic || null,
      community_name: post.communities?.name || null,
      community_cover: post.communities?.cover_img || null,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in getPostsByUserId:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.getPostsByProjectId = async (req, res) => {
  const { id } = req.params;

  const page = parseInt(req.query.page) || 0;
  const limit = 5;
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await db
    .from("posts")
    .select(
      `
      *,
      imgs(img),
      models(model),
      users (
        username,
        name,
        profilePic
      )
    `,
    )
    .eq("project_id", id)
    .eq("status", "show")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json(error);

  const formatted = data.map((post) => ({
    ...post,
    username: post.users?.username || null,
    name: post.users?.name || null,
    profilePic: post.users?.profilePic || null,
  }));

  return res.status(200).json(formatted || []);
};

exports.getPostsByCommunityId = async (req, res) => {
  const { id } = req.params;

  try {
    const page = parseInt(req.query.page) || 0;
    const limit = 5;

    let finalPosts = [];
    let currentOffset = page * limit;
    let fetchSize = 10;

    while (finalPosts.length < limit) {
      const { data: dbData, error } = await db
        .from("posts")
        .select(
          `
          *,
          imgs(img),
          models(model),
          users!inner(user_id, username, name, profilePic, isdelete)
        `,
        )
        .eq("community_id", id)
        .eq("status", "show")
        .eq("users.isdelete", "active")
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + fetchSize - 1);

      if (error) return res.status(500).json(error);

      // ถ้าไม่มีข้อมูลใน Database เหลือให้ดึงแล้ว ให้หยุดลูปทันที
      if (!dbData || dbData.length === 0) {
        break;
      }
      finalPosts = [...finalPosts, ...dbData];

      currentOffset += fetchSize;
    }

    const resultPosts = finalPosts.slice(0, limit);

    const formatted = resultPosts.map((post) => ({
      ...post,
      username: post.users?.username || null,
      name: post.users?.name || null,
      profilePic: post.users?.profilePic || null,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Error in getPostsByCommunityId:", error);
    return res.status(500).json({ error: error.message });
  }
};

// add project
exports.getPostsByUserIdAvailable = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("user_id", id)
    .eq("status", "show")
    .is("project_id", null)
    .is("community_id", null)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.status(200).json(data || []);
};

exports.addPost = async (req, res) => {
  const { desc, img, model, project_id, commu_id } = req.body;

  if (!desc?.trim()) {
    // เช็คว่า description มีค่าและไม่ใช่แค่เว้นวรรค
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    // 2. เพิ่มข้อมูลลงในตารางหลัก (posts)
    const { data: postData, error: postError } = await db
      .from("posts")
      .insert([
        {
          description: desc.trim(),
          user_id: req.user.user_id,
          project_id: project_id || null,
          community_id: commu_id || null,
          status: "show",
        },
      ])
      .select()
      .single();

    if (postError) throw postError;

    const postId = postData.post_id;

    if (img) {
      const imageList = Array.isArray(img) ? img : [img]; // เช็คตัวมันว่าเป็น arr ยัง [1,2] -> [1,2] / 1 -> [1]

      const imagesToInsert = imageList.map((url) => ({
        post_id: postId,
        img: url,
        message_id: null,
      }));

      const { error: imgError } = await db
        .from("imgs")
        .insert(imagesToInsert);

      if (imgError) console.error("Image upload error:", imgError);
    }

    // 3. จัดการโมเดล (รองรับทั้งโมเดลเดียว และ หลายโมเดล)
    if (model) {
      const modelList = Array.isArray(model) ? model : [model];

      const modelsToInsert = modelList.map((m) => ({
        post_id: postId,
        model: m,
      }));

      const { error: modelError } = await db
        .from("models")
        .insert(modelsToInsert);
      if (modelError) console.error("Model upload error:", modelError);
    }

    return res.status(200).json({ ...postData, img, model });
  } catch (error) {
    console.error("Server Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// editProject
exports.getPostsForEditProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("status", "show")
    .or(`project_id.eq.${projectId},and(user_id.eq.${userId},project_id.is.null)`) // เลือกโพสที่อยู่ในและนอก pj
    .is("community_id", null)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);
  return res.status(200).json(data || []);
};

exports.addComment = async (req, res) => {
  const { desc, img, postId, userId } = req.body;

  if ((!desc || desc.trim() === "") && (!img || img.length === 0)) {
    return res.status(400).json({ error: "Empty comment" });
  }
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const { data, error } = await db
      .from("comments")
      .insert([
        {
          description: desc,
          img: img || null,
          post_id: postId,
          user_id: userId,
        },
      ])
      .select();
    if (error) throw error;

    res.status(200).json(data[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getCommentsByPostId = async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 0;
  const limit = 5;
  const from = page * limit;
  const to = from + limit - 1;

  try {
    const { data, error } = await db
      .from("comments")
      .select(
        `
        comment_id,
        description,
        img,
        created_at,
        users (
          user_id,
          username,
          name,
          profilePic
        )
      `,
      )
      .eq("post_id", id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formatted = data.map((c) => ({
      comment_id: c.comment_id,
      description: c.description,
      img: c.img,
      created_at: c.created_at,
      user_id: c.users?.user_id,
      username: c.users?.username,
      name: c.users?.name,
      profilePic: c.users?.profilePic,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getLikes = async (req, res) => {
  const { data, error } = await db
    .from("likes")
    .select("user_id")
    .eq("post_id", req.params.post_id);

  if (error) return res.status(500).json(error);

  // [{userId: 1}, {userId: 2}] เป็น [1, 2]
  return res.status(200).json(data ? data.map((like) => like.user_id) : []);
};

exports.addLike = async (req, res) => {
  const userId = req.user.user_id;
  const postId = req.body.post_id;

  if (!postId) {
    return res.status(400).json("post_id is required");
  }

  const { error } = await db
    .from("likes")
    .insert([
      {
        user_id: userId,
        post_id: postId,
      },
    ]);

  if (error) {
    console.error("Like Error:", error);
    return res.status(500).json(error);
  }
  return res.status(200).json("Post has been liked.");
};

exports.deleteLike = async (req, res) => {
  const userId = req.user.user_id;

  const { error } = await db
    .from("likes")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", req.params.post_id);

  if (error) return res.status(500).json(error);
  return res.status(200).json("Like has been removed.");
};

// นับจำนวนคอมเม้น
exports.getCommentsCount = async (req, res) => {
  const { post_id } = req.params;

  const { count, error } = await db
    .from("comments")
    .select("comment_id", { count: "exact", head: true }) // count นับ head เอาแค่เลขที่ count ได้ส่งคืนไม่เอา select
    .eq("post_id", post_id);

  if (error) return res.status(500).json(error);

  return res.status(200).json(count || 0);
};

exports.deletePost = async (req, res) => {
  const userId = req.user.user_id;

  const { error } = await db
    .from("posts")
    .update([{ status: "hide" }])
    .eq("user_id", userId)
    .eq("post_id", req.params.post_id);

  if (error) return res.status(500).json(error);
  return res.status(200).json("Post has been deleted.");
};

// leftDC ของ profile
exports.getLatestUserImages = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await db
      .from("imgs")
      .select(
        `
        img,
        posts!inner(user_id, created_at, status)
      `,
      )
      .eq("posts.user_id", id)
      .eq("posts.status", "show")
      .order("posts(created_at)", { ascending: false });

    if (error) throw error;

    const images = data.map((item) => item.img);
    return res.status(200).json(images);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err);
  }
};

exports.getPostsForManageCommunity = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await db
      .from("posts")
      .select("*, users(name, username)")
      .eq("community_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getPostsForManageCommunity:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.deletePostsCommunity = async (req, res) => {
  const { communityId, postIds = [] } = req.body;

  try {
    if (!communityId) {
      return res.status(400).json({ error: "Community ID not found" });
    }

    const { data: currentHidden, error: fetchError } = await db
      .from("posts")
      .select("post_id")
      .eq("community_id", communityId)
      .eq("status", "hide");

    if (fetchError) throw fetchError;

    const currentHiddenIds = currentHidden.map((post) => post.post_id);
    // Set = currentHiddenIds - postIds
    const postsToShow = currentHiddenIds.filter((id) => !postIds.includes(id));

    // โชว์โพสต์กลับมา postsToShow
    if (postsToShow.length > 0) {
      const { error: showError } = await db
        .from("posts")
        .update({ status: "show" })
        .in("post_id", postsToShow);

      if (showError) throw showError;
    }

    // ซ่อนโพสต์ที่ติ๊กล่าสุด postIds
    if (postIds.length > 0) {
      const { error: hideError } = await db
        .from("posts")
        .update({ status: "hide" })
        .in("post_id", postIds);

      if (hideError) throw hideError;
    }

    return res.status(200).json({ message: "Update posts successfully" });
  } catch (error) {
    console.error("Error hiding posts:", error);
    return res.status(500).json({ error: error.message });
  }
};
