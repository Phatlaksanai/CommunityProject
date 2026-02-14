const db = require("../config/db")

exports.getProjects = (req, res) => {
  const q = `SELECT *
             FROM projects 
             ORDER BY createAt DESC`;
  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

exports.getProjectById = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT *
     FROM projects
     WHERE project_id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(404).json({ error: "Project not found" });

      res.json(result[0]);
    },
  );
};

exports.getProjectsByUserId = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT DISTINCT projects.*
     FROM projects
     LEFT JOIN posts ON posts.project_id = projects.project_id
     LEFT JOIN items ON items.project_id = projects.project_id
     WHERE posts.user_id = ? OR items.user_id = ?
     ORDER BY projects.createAt DESC`,
    [id, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    },
  );
};

exports.addProject = (req, res) => {
  const { projectName, description, img, relatedPosts, relatedItem } = req.body;
  const qProject = `INSERT INTO projects (project_name, description, img, createAt)VALUES (?)`;

  const values = [projectName, description, img, new Date()];

  db.query(qProject, [values], (err, data) => {
    if (err) return res.status(500).json(err);
    const projectId = data.insertId; // project_id ใหม่

    // ถ้าไม่มีโพสต์ที่เลือก
    if (relatedPosts && relatedPosts.length > 0) {
      const qUpdatePost =
        "UPDATE posts SET project_id = ? WHERE post_id IN (?) AND project_id IS NULL";
      db.query(qUpdatePost, [projectId, relatedPosts], (err2) => {
        if (err2) return res.status(500).json(err2);
      });
    }
    if (relatedItem) {
      const qUpdateItem = `UPDATE items SET project_id = ?  WHERE item_id = ? AND project_id IS NULL`;
      db.query(qUpdateItem, [projectId, relatedItem], (err3) => {
        if (err3) return res.status(500).json(err3);
        return res.status(200).json({
          success: true,
          projectId,
        });
      });
    } else {
      return res.status(200).json({
        success: true,
        projectId,
      });
    }
  });
};