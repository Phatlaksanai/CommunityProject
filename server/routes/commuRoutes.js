const express = require("express");
const router = express.Router();
const commuController = require("../controllers/commuController");
const verifyToken = require("../middleware/verifyToken");

router.post("/addcommu", verifyToken, commuController.addCommunity);
router.get("/:id", commuController.getCommunityById);
router.get("/user/:id", commuController.getCommunitiesByUserId);
router.put("/update", verifyToken, commuController.updateCommunity);
router.get("/:id/images", commuController.getLatestCommunityImages);

module.exports = router;