const express = require("express");
const router = express.Router();
const reportController = require("../AdminControllers/reportController");
const { verifyAdminToken } = require("../middleware/verifyToken");

router.get("/topPosts", verifyAdminToken, reportController.getTopPosts);
router.get("/topCommunities", verifyAdminToken, reportController.getTopCommunities);
router.get("/topReportedUsers", verifyAdminToken, reportController.getTopReportedUsers);
router.get("/topReportingUsers", verifyAdminToken, reportController.getTopReportingUsers);
router.get("/countReportsType", verifyAdminToken, reportController.getCountReportsType);
router.get("/reportsTable", verifyAdminToken, reportController.getReportsTable);
router.put("/updateReport/:reportId", verifyAdminToken, reportController.updateReport);

module.exports = router;