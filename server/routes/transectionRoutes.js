const express = require("express");
const router = express.Router();
const transectionController = require("../controllers/transectionController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/", verifyToken ,transectionController.getTransection);

module.exports = router;