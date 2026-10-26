const express = require("express");
const router = express.Router();
const dashboardController = require("../AdminControllers/dashboardController");
const { verifyAdminToken } = require("../middleware/verifyToken");

router.get("/statistics", verifyAdminToken, dashboardController.getStatistics);
router.get("/revenueOverview", verifyAdminToken, dashboardController.getRevenueOverview);
router.get("/orders", verifyAdminToken, dashboardController.getOrder);
router.get("/countReportsType", verifyAdminToken, dashboardController.getCountReportsType);

module.exports = router;