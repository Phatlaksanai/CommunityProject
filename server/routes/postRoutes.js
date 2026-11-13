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
router.get("/user/:id/images", verifyToken, postController.getLatestUserImages);
router.get("/manage/community/:id", verifyToken, postController.getPostsForManageCommunity);

router.get("/likes/post/:post_id", postController.getLikes);
router.post("/likes", verifyToken, postController.addLike);
router.delete("/likes/post/:post_id", verifyToken, postController.deleteLike);

router.get("/comments/count/:post_id", postController.getCommentsCount);

router.post("/delete/post/:post_id", verifyToken, postController.deletePost);
router.post("/delete/posts-community", verifyToken, postController.deletePostsCommunity);

module.exports = router;