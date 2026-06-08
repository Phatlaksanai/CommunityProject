const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/:userId", friendController.getFriendsByUserId);
router.get("/:userId/alluser", friendController.getAllUserForAdd);
router.post("/addfriend", verifyToken, friendController.addfriend);
router.put("/acceptfriend", verifyToken, friendController.acceptFriend);
router.get("/:userId/requests", verifyToken, friendController.getFriendRequests);
router.get("/:userId/contacts", verifyToken, friendController.getContacts);
router.delete("/declinefriend", verifyToken, friendController.declineFriend);
router.get("/userprofile/:id", friendController.getUserProfile);

module.exports = router;