const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/createconversation", verifyToken, chatController.createConversation);

module.exports = router;