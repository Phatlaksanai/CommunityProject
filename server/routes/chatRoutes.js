const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/:userId", verifyToken, chatController.getConversations);

module.exports = router;