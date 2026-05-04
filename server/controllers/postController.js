const db = require("../config/db");

exports.getPosts = async (req, res) => {
  // รับค่า page จาก query string (เริ่มต้นที่ 0)
  const page = parseInt(req.query.page) || 0;
  const limit = 5; // กำหนดให้โหลดทีละ 5 โพสต์
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await db
    .from("posts")
    .select(`
      *,
      imgs(img),
      models(model),
      users (user_id, username, name, profilePic),
      communities (communities_id, name, cover_img)
    `)
    .eq("status", "show")
    .order("created_at", { ascending: false })
    .range(from, to); // ดึงข้อมูลในช่วงที่กำหนด

  if (error) return res.status(500).json(error);

  const formatted = data.map((post) => ({
    ...post,
    username: post.users?.username || null,
    name: post.users?.name || null,
    profilePic: post.users?.profilePic || null,
    community_name: post.communities?.name || null,
    community_cover: post.communities?.cover_img || null,
  }));

  return res.status(200).json(formatted);
};

exports.getPostsByUserId = async (req, res) => {
  const { id } = req.params;

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
      ),
      communities (communities_id, name, cover_img)
    `,
    )
    .eq("user_id", id)
    .eq("status", "show")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  const formatted = data.map((post) => ({
    ...post,
    username: post.users?.username || null,
    name: post.users?.name || null,
    profilePic: post.users?.profilePic || null,
    community_name: post.communities?.name || null,
    community_cover: post.communities?.cover_img || null,
  }));

  return res.status(200).json(formatted || []);
};

exports.getPostsByProjectId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("posts")
    .select(
      `
      *,
      imgs(img),
      models(model),
      users (
        username,
        profilePic
      )
    `,
    )
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  const formatted = data.map((post) => ({
    ...post,
    username: post.users?.username || null,
    profilePic: post.users?.profilePic || null,
  }));

  return res.status(200).json(formatted || []);
};

exports.getPostsByUserIdAvailable = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("user_id", id)
    .eq("status", "show")
    .is("project_id", null)
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

    const postId = postData.post_id; // ดึง ID ของโพสต์ที่เพิ่งสร้าง

    // 2. จัดการรูปภาพ (รองรับทั้งรูปเดียว และ หลายรูปเป็น Array)
    if (img) {
      // ทำให้เป็น Array เสมอเพื่อความง่ายในการจัดการ
      const imageList = Array.isArray(img) ? img : [img];

      // เตรียมข้อมูลสำหรับ Bulk Insert
      const imagesToInsert = imageList.map((url) => ({
        post_id: postId,
        img: url,
        message_id: null, // ใส่ไว้กัน Error ตามที่คุณเจอตอนแรก
      }));

      const { error: imgError } = await db.from("imgs").insert(imagesToInsert);
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

    // 5. ส่งข้อมูลโพสต์ที่สร้างเสร็จแล้วกลับไป
    return res.status(200).json({ ...postData, img, model });
  } catch (error) {
    console.error("Server Error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// postController.js
exports.getPostsForEditProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("status", "show")
    // ดึงอันที่เป็นของโปรเจกต์นี้ OR (เป็นของเรา AND ยังไม่มีโปรเจกต์)
    .or(
      `project_id.eq.${projectId},and(user_id.eq.${userId},project_id.is.null)`,
    );

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
  // 1. รับค่า page จาก Query String (เช่น /comments/123?page=0)
  const page = parseInt(req.query.page) || 0;
  const limit = 5; // โหลดทีละ 5 คอมเมนต์ (หรือ 10 ก็ได้ตามเหมาะสม)
  const from = page * limit;
  const to = from + limit - 1;

  try {
    const { data, error } = await db
      .from("comments")
      .select(`
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
      `)
      .eq("post_id", id)
      .order("created_at", { ascending: false }) // เอาคอมเมนต์ใหม่ขึ้นก่อน
      .range(from, to); // 2. ดึงข้อมูลตามช่วง

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
    console.log(err);
    res.status(500).json(err);
  }
};

exports.getLikes = async (req, res) => {
  const { data, error } = await db
    .from("likes")
    .select("user_id")
    .eq("post_id", req.params.post_id);

  if (error) return res.status(500).json(error);
  
  // แปลงจาก [{userId: 1}, {userId: 2}] เป็น [1, 2]
  return res.status(200).json(data ? data.map((like) => like.user_id) : []);
};

// POST: เพิ่ม Like
exports.addLike = async (req, res) => {
  const userId = req.user.user_id; 
  // ดึงค่าได้ทั้งสองแบบกันพลาด
  const postId = req.body.post_id; 

  if (!postId) {
    return res.status(400).json("post_id is required");
  }

  const { error } = await db
    .from("likes")
    .insert([{ 
      user_id: userId,        
      post_id: postId 
    }]);

  if (error) {
    console.error("Like Error:", error);
    return res.status(500).json(error);
  }
  return res.status(200).json("Post has been liked.");
};

// DELETE: ลบ Like
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

// postController.js

exports.getCommentsCount = async (req, res) => {
  const { post_id } = req.params;

  const { count, error } = await db
    .from("comments")
    .select("*", { count: 'exact', head: true }) // head: true คือเอาเฉพาะ count ไม่เอาเนื้อหา
    .eq("post_id", post_id);

  if (error) return res.status(500).json(error);
  
  return res.status(200).json(count || 0);
};

exports.deletePost = async (req, res) => {
  const userId = req.user.user_id;

  const { error } = await db
    .from("posts")
    .update([{ status: "hide" },]) // เปลี่ยนสถานะเป็น "hide"
    .eq("user_id", userId)
    .eq("post_id", req.params.post_id);

  if (error) return res.status(500).json(error);
  return res.status(200).json("Post has been deleted.");
};