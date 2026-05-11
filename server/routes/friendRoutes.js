const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/:userId", friendController.getFriendsByUserId);
router.get("/:userId/alluser", friendController.getAllUserForAdd);


module.exports = router;