const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const verifyToken = require("../middleware/verifyToken");

router.get("/", projectController.getProjects);
router.get("/:id", projectController.getProjectById);
router.get("/user/:id", projectController.getProjectsByUserId);
router.post("/addproject", verifyToken, projectController.addProject);

module.exports = router;