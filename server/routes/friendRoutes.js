const express = require("express");
const router = express.Router();
const friendController = require("../controllers/friendController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/add/friend", friendController.getAllUserForAdd);

module.exports = router;