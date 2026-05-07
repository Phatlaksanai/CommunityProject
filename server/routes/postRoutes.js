const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { verifyToken, checkUserOptional } = require("../middleware/verifyToken");

router.get("/", checkUserOptional, postController.getPosts);
router.get("/user/:id", postController.getPostsByUserId);
router.get("/project/:id", postController.getPostsByProjectId);
router.get("/community/:id", postController.getPostsByCommunityId);
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

router.get("/comments/count/:post_id", postController.getCommentsCount);

router.post("/delete/post/:post_id", verifyToken, postController.deletePost);

module.exports = router;