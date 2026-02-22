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

module.exports = router;