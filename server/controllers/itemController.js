const db = require("../config/db");

exports.getItems = (req, res) => {
  const q = `SELECT *
             FROM items 
             ORDER BY items.createAt DESC`;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

exports.getItemsById = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT items.*, users.username, users.profilePic 
    FROM items 
    JOIN users ON items.user_id = users.user_id 
    WHERE item_id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(404).json({ error: "Item not found" });

      res.json(result[0]);
    },
  );
};

exports.getItemsByProjectId = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT items.*,users.username,users.profilePic
    FROM items
    LEFT JOIN users ON items.user_id = users.user_id
    WHERE items.project_id = ?
    ORDER BY items.createAt DESC`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) {
        return res.json([]); // ✅ สำคัญ
      }
      res.json(result);
    },
  );
};

exports.getItemsByUserIdAvailable = (req, res) => {
  const { id } = req.params;
  const q =
    "SELECT items.* FROM items WHERE items.user_id = ? AND items.project_id IS NULL ORDER BY items.createAt DESC";
  db.query(q, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.getItemsByUserId = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM items WHERE user_id = ? ORDER BY items.createAt DESC",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) {
        res.json(result);
      }
      res.json(result);
    },
  );
};

exports.addItem = (req, res) => {
  const { modelName, description, price, img, model, category } = req.body;

  if (!modelName || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (isNaN(price)) {
    return res.status(400).json({ error: "Price must be number" });
  }

  const q = `INSERT INTO items (modelName, description, price, img, model, createAt, category, user_id)VALUES (?)`;

  const values = [
    modelName,
    description,
    Number(price),
    img,
    model,
    new Date(),
    category,
    req.user.user_id,
  ];

  db.query(q, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ success: true });
  });
};
