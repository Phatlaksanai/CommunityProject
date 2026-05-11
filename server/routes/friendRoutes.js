const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/:userId", friendController.getFriendsByUserId);
router.get("/:userId/alluser", friendController.getAllUserForAdd);
router.post("/addfriend", verifyToken, friendController.addfriend);
router.post("/acceptfriend", verifyToken, friendController.acceptFriend);
router.get("/:userId/requests", verifyToken, friendController.getFriendRequests);

module.exports = router;