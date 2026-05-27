const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/:userId", verifyToken, chatController.getConversations);
router.post("/createconversation", verifyToken, chatController.createConversation);
router.get("/:conversationId/messages", verifyToken, chatController.getMessages);
router.post("/:conversationId/messages", verifyToken, chatController.addMessage);
router.put("/:conversationId/read", verifyToken, chatController.markAsRead);    

module.exports = router;