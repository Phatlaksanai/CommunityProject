const express = require("express");
const router = express.Router();
const commuController = require("../controllers/commuController");
const verifyToken = require("../middleware/verifyToken");

router.post("/addcommu", verifyToken, commuController.addCommunity);
router.get("/", commuController.getCommunities);
router.get("/user/:id", commuController.getCommunitiesByUserId);

module.exports = router;