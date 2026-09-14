const express = require("express");
const router = express.Router();
const reportController = require("../AdminControllers/reportController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/topPosts", verifyToken, reportController.getTopPosts);
router.get("/topCommunities", verifyToken, reportController.getTopCommunities);
router.get("/topReportedUsers", verifyToken, reportController.getTopReportedUsers);
router.get("/topReportingUsers", verifyToken, reportController.getTopReportingUsers);
router.get("/countReportsType", verifyToken, reportController.getCountReportsType);
router.get("/reportsTable", verifyToken, reportController.getReportsTable);
router.put("/updateReport/:reportId", verifyToken, reportController.updateReport);

module.exports = router;