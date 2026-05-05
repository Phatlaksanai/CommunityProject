const db = require("../config/db")
const cloudinary = require("../config/cloudinary");

exports.getProjectsAddByPostUser = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json(error);

  return res.status(200).json(data || []);
};

exports.getProjectById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("project_id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Project not found" });
  }

  return res.json(data);
};

exports.getProjectsByUserId = async (req, res) => {
  const { id } = req.params;

  // ดึง project_id จาก posts
  const { data: postProjects, error: postError } = await db
    .from("posts")
    .select("project_id")
    .eq("user_id", id)
    .not("project_id", "is", null);

  if (postError) return res.status(500).json(postError);

  // ดึง project_id จาก items
  const { data: itemProjects, error: itemError } = await db
    .from("items")
    .select("project_id")
    .eq("user_id", id)
    .not("project_id", "is", null);

  if (itemError) return res.status(500).json(itemError);

  // รวม id ทั้งหมด
  const projectIds = [
    ...new Set([
      ...postProjects.map(p => p.project_id),
      ...itemProjects.map(i => i.project_id),
    ]),
  ];

  if (projectIds.length === 0) {
    return res.json([]);
  }

  // ดึง project จริง
  const { data: projects, error: projectError } = await db
    .from("projects")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false });

  if (projectError) return res.status(500).json(projectError);
  
  return res.json(projects);
};

exports.addProject = async (req, res) => {
  const { projectName, description, imgUrl, imgPublicId, relatedPosts, relatedItem, userId } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: "Project name required" });
  }
  
  // สร้าง project
  const { data: project, error: projectError } = await db 
    .from("projects")
    .insert([
      {
        project_name: projectName,
        description: description || null,
        img: imgUrl || null,
        img_public_id: imgPublicId || null,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (projectError) {
    console.log("PROJECT ERROR:", projectError);
    return res.status(500).json(projectError);
  }

  const projectId = project.project_id;

  // update posts
  if (relatedPosts && relatedPosts.length > 0) { 
    const { error: postError } = await db
      .from("posts")
      .update({ project_id: projectId })
      .in("post_id", relatedPosts)
      .is("project_id", null)
      
      

    if (postError) {
      console.log("POST UPDATE ERROR:", postError);
      return res.status(500).json(postError);
    }
  }

  // update item
  if (relatedItem) { 
    const { error: itemError } = await db
      .from("items")
      .update({ project_id: projectId })
      .eq("item_id", relatedItem)
      .is("project_id", null);

    if (itemError) {
      console.log("ITEM UPDATE ERROR:", itemError);
      return res.status(500).json(itemError);
    }
  }

  return res.status(201).json({
    success: true,
    project,
  });
};

exports.updateProject = async (req, res) => {
  const { projectId, projectName, description, img, relatedPosts, relatedItem, imgPublicId } = req.body;

  try {
    // 0. ดึง public_id เดิมก่อน
    const { data: oldProject, error } = await db
      .from("projects")
      .select("img_public_id")
      .eq("project_id", projectId)
      .maybeSingle();
      if (error) {
        return res.status(500).json(error);
      }

      // ถ้ามีการอัปโหลดรูปใหม่ และ public_id เปลี่ยน
    if (imgPublicId && oldProject?.img_public_id && oldProject.img_public_id !== imgPublicId) {
  try {
    await cloudinary.uploader.destroy(oldProject.img_public_id);
  } catch (cloudErr) {
    console.log("CLOUD DELETE ERROR:", cloudErr);
  }
}
    
    // 1. อัปเดตข้อมูล Project หลัก
    await db.from("projects").update({ project_name: projectName, description, img, img_public_id: imgPublicId }).eq("project_id", projectId);

    // 2. จัดการ Posts: ล้างค่า FK เดิมที่เป็นของโปรเจกต์นี้ให้เป็น null ทั้งหมดก่อน
    await db.from("posts").update({ project_id: null }).eq("project_id", projectId);

    // แล้วค่อยเอาลิสต์ใหม่ที่ติ๊กเลือก มาใส่ projectId
    if (relatedPosts && relatedPosts.length > 0) {
      await db.from("posts").update({ project_id: projectId }).in("post_id", relatedPosts);
    }

    // 3. จัดการ Items: ล้างค่า FK เดิม
    await db.from("items").update({ project_id: null }).eq("project_id", projectId);

    // ใส่ค่าใหม่ (ถ้ามีเลือก)
    if (relatedItem) {
      await db.from("items").update({ project_id: projectId }).eq("item_id", relatedItem);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};