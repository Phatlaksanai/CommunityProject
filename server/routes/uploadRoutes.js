const router = require("express").Router();
const uploadController = require("../controllers/uploadController");

router.post("/post", uploadController.uploadPost);
router.post("/item", uploadController.uploadItem);
router.post("/project", uploadController.uploadProject);
router.post("/profile", uploadController.uploadProfile);
router.post("/comment", uploadController.uploadComment);
router.post("/Communities", uploadController.uploadCommunities);

module.exports = router;