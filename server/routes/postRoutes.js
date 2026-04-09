const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", postController.getPosts);
router.get("/user/:id", postController.getPostsByUserId);
router.get("/project/:id", postController.getPostsByProjectId);
router.get("/user/:id/available", postController.getPostsByUserIdAvailable);
router.post("/addpost", verifyToken, postController.addPost);
router.get("/project-edit/:projectId", verifyToken, postController.getPostsForEditProject);
router.post("/addcomment", verifyToken, postController.addComment);
router.get("/comments/:id", postController.getCommentsByPostId);

// 1. ดึงข้อมูล Like (GET /api/posts/likes/post/:post_id)
router.get("/likes/post/:post_id", postController.getLikes);

// 2. เพิ่ม Like (POST /api/posts/likes)
router.post("/likes", verifyToken, postController.addLike);

// 3. ลบ Like (DELETE /api/posts/likes/post/:post_id)
router.delete("/likes/post/:post_id", verifyToken, postController.deleteLike);

module.exports = router;