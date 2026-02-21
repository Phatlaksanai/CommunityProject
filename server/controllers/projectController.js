const db = require("../config/db")

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
  const { projectName, description, img, relatedPosts, relatedItem, userId } = req.body;

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
        img: img || null,
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