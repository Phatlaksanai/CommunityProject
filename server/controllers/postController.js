const db = require("../config/db");

exports.getPosts = async (req, res) => {
  const { data, error } = await db
    .from("posts")
    .select(`
      *,
      users (
        user_id,
        username,
        profilePic
      )
    `)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json(error);

  const formatted = data.map(post => ({
    ...post,
    username: post.users?.username || null,
    profilePic: post.users?.profilePic || null,
  }));

  return res.status(200).json(formatted);
};

exports.getPostsByUserId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("posts")
    .select(`
      *,
      users (
        username,
        profilePic
      )
    `)
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  const formatted = data.map(post => ({
    ...post,
    username: post.users?.username || null,
    profilePic: post.users?.profilePic || null,
  }));

  return res.status(200).json(formatted || []);
};

exports.getPostsByProjectId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("posts")
    .select(`
      *,
      users (
        username,
        profilePic
      )
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  const formatted = data.map(post => ({
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
    .is("project_id", null)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.status(200).json(data || []);
};

exports.addPost = async (req, res) => {
  const { desc, img, model } = req.body;

  if (!desc?.trim()) {
    return res.status(400).json({ error: "Description is required" });
  }

  const { data, error } = await db
    .from("posts")
    .insert([
      {
        description: desc.trim(),
        img: img || null,
        model: model || null,
        user_id: req.user.user_id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }

  return res.status(200).json(data);
};
