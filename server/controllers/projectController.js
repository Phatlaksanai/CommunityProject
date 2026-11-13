const db = require("../config/db");
const cloudinary = require("../config/cloudinary");

// เลือก pj ตอนโพส
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

exports.getProjectForEdit = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", req.user.user_id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Project not found" });
  }

  return res.json(data);
};

// profile
exports.getProjectsByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const page = parseInt(req.query.page) || 0;
    const limit = 15;
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await db
      .from("projects")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(500).json(error);
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.addProject = async (req, res) => {
  const { projectName, description, imgUrl, imgPublicId, relatedPosts, relatedItem, userId } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: "Project name required" });
  }

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
      .is("project_id", null);

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
    const { data: oldProject, error } = await db
      .from("projects")
      .select("img_public_id")
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) {
      return res.status(500).json(error);
    }

    if ( imgPublicId && oldProject?.img_public_id && oldProject.img_public_id !== imgPublicId ) {
      try {
        await cloudinary.uploader.destroy(oldProject.img_public_id);
      } catch (cloudErr) {
        console.log("CLOUD DELETE ERROR:", cloudErr);
      }
    }

    await db
      .from("projects")
      .update({
        project_name: projectName,
        description,
        img,
        img_public_id: imgPublicId,
      })
      .eq("project_id", projectId);

    await db // ล้างโพสใน pj นั้นออก
      .from("posts")
      .update({ project_id: null })
      .eq("project_id", projectId);

    if (relatedPosts && relatedPosts.length > 0) { // ยัดโพสที่เลือกใหม่
      await db
        .from("posts")
        .update({ project_id: projectId })
        .in("post_id", relatedPosts);
    }

    await db
      .from("items")
      .update({ project_id: null })
      .eq("project_id", projectId);

    if (relatedItem) {
      await db
        .from("items")
        .update({ project_id: projectId })
        .eq("item_id", relatedItem);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};