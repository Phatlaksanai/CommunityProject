const db = require("../config/db");

exports.getItems = async (req, res) => {
  const { category, date } = req.query;

  let query = db.from("items").select("*");

  // ✅ filter category
  if (category) {
    // ถ้าเลือกหลาย category → เป็น array
    const categories = Array.isArray(category) ? category : [category];
    query = query.in("category", categories);
  }

  // ✅ filter date
  if (date && date !== "AllTime") {
    const now = new Date();
    let pastDate = new Date();

    if (date === "ThisMonth") {
      pastDate.setMonth(now.getMonth() - 1);
    } else if (date === "ThisWeek") {
      pastDate.setDate(now.getDate() - 7);
    } else if (date === "ThisDay") {
      pastDate.setDate(now.getDate() - 1);
    }

    query = query.gte("created_at", pastDate.toISOString());
  }

  const { data, error } = await query.order("created_at", { ascending: false });

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
        name,
        profilePic
      )
    `)
    .eq("item_id", id)
    .single();

  if (error) return res.status(404).json({ error: "Item not found" });

  const formatted = {
    ...data,
    username: data.users?.username || null,
    name: data.users?.name || null,
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
  const { modelName, description, price, img, model, category, imgPublicId, modelPublicId } = req.body;

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
        img_public_id: imgPublicId || null,
        model_public_id: modelPublicId || null,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json(error);

  return res.status(201).json(data);
};

// itemController.js (ทำเหมือนกัน)
exports.getItemsForEditProject = async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  const { data, error } = await db
    .from("items")
    .select("*")
    .or(`project_id.eq.${projectId},and(user_id.eq.${userId},project_id.is.null)`);

  if (error) return res.status(500).json(error);
  return res.status(200).json(data || []);
};