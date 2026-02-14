const db = require("../config/db");

exports.getPosts = (req, res) => {
  const q = `SELECT p.*, p.description AS \`desc\`, u.user_id AS userId, u.username, u.profilePic 
             FROM posts AS p 
             JOIN users AS u ON (u.user_id = p.user_id) 
             ORDER BY p.createdAt DESC`;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

exports.getPostsByUserId = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT posts.*, users.username, users.profilePic FROM posts JOIN users ON posts.user_id = users.user_id WHERE posts.user_id = ? ORDER BY posts.createdAt DESC",
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0) {
        return res.json(result); // ปล่อย [] ไปเลย
      }
      res.json(result);
    },
  );
};

exports.getPostsByProjectId = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT posts.*, users.username, users.profilePic
    FROM posts
    LEFT JOIN users ON posts.user_id = users.user_id
    WHERE posts.project_id = ?
    ORDER BY posts.createdAt DESC`,
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

exports.getPostsByUserIdAvailable = (req, res) => {
  const { id } = req.params;
  const q =
    "SELECT posts.* FROM posts WHERE posts.user_id = ? AND posts.project_id IS NULL ORDER BY posts.createdAt DESC";
  db.query(q, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

exports.addPost = (req, res) => {
  const { desc, img, model } = req.body;
  const description = desc?.trim();

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  if (description.length > 1000) {
    return res.status(400).json({ error: "Description too long" });
  }

  const q =
    "INSERT INTO posts (`description`, `img`, `model`, `createdAt`, `user_id`) VALUES (?)";

  const values = [
    description, // รับจากหน้าบ้าน
    img || null,
    model || null,
    new Date(), // วันที่ปัจจุบัน
    req.user.user_id, // ดึงมาจาก Token (ที่ verifyToken ใส่มาให้)
  ];

  db.query(q, [values], (err, data) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // ส่งข้อมูลกลับไปให้หน้าบ้านเพื่ออัปเดต UI ทันที
    return res.status(200).json({
      post_id: data.insertId,
      description: req.body.desc,
      img: req.body.img || null,
      createdAt: new Date(),
      username: req.user.username, // มาจาก token // อันเก่า username: req.body.username, // ส่งชื่อกลับไปโชว์ด้วยถ้าต้องการ
    });
  });
};
