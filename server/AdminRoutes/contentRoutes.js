const express = require("express");
const router = express.Router();
const contentController = require("../Admincontrollers/contentController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/yearlyPosts", verifyToken, contentController.getDonutYearlyPostStats);
router.get("/postSummary", verifyToken, contentController.getPostSummary);
router.get("/communitySummary", verifyToken, contentController.getCommunitySummary);
router.get("/itemSummary", verifyToken, contentController.getItemSummary);

module.exports = router;