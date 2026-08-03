const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/addreport/:id", verifyToken, reportController.addReport);

module.exports = router;