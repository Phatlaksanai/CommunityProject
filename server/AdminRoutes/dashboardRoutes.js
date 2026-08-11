const express = require("express");
const router = express.Router();
const dashboardController = require("../Admincontrollers/dashboardController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/statistics", verifyToken, dashboardController.getStatistics);
router.get("/revenueOverview", verifyToken, dashboardController.getRevenueOverview);
router.get("/orders", verifyToken, dashboardController.getOrder);
router.get("/countReportsType", verifyToken, dashboardController.getCountReportsType);

module.exports = router;