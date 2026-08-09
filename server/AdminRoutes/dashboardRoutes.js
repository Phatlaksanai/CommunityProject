const express = require("express");
const router = express.Router();
const dashboardController = require("../Admincontrollers/dashboardController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/statistics", verifyToken, dashboardController.getStatistics);

module.exports = router;