const router = require("express").Router();
const uploadController = require("../controllers/uploadController");

router.post("/post", uploadController.uploadPost);
router.post("/item", uploadController.uploadItem);
router.post("/project", uploadController.uploadProject);
router.post("/profile", uploadController.uploadProfile);

module.exports = router;