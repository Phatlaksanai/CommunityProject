const db = require("../config/db");

exports.getItems = async (req, res) => {
  const { data, error } = await db
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.status(200).json(data || []);
};

exports.getItemsById = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select(`
      *,
      users (
        username,
        profilePic
      )
    `)
    .eq("item_id", id)
    .single();

  if (error) return res.status(404).json({ error: "Item not found" });

  const formatted = {
    ...data,
    username: data.users?.username || null,
    profilePic: data.users?.profilePic || null,
  };

  return res.json(formatted);
};

exports.getItemsByProjectId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
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

  return res.json(data || []);
};

exports.getItemsByUserIdAvailable = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select("*")
    .eq("user_id", id)
    .is("project_id", null)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.json(data || []);
};

exports.getItemsByUserId = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await db
    .from("items")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json(error);

  return res.json(data || []);
};

exports.addItem = async (req, res) => {
  const { modelName, description, price, img, model, category } = req.body;

  if (!modelName || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (isNaN(price)) {
    return res.status(400).json({ error: "Price must be number" });
  }

  const { data, error } = await db
    .from("items")
    .insert([
      {
        modelName,
        description: description || null,
        price: Number(price),
        img: img || null,
        model: model || null,
        category: category || null,
        user_id: req.user.user_id,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json(error);

  return res.status(201).json(data);
};
