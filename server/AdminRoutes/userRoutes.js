const express = require("express");
const router = express.Router();
const dashboardController = require("../Admincontrollers/userController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/userRegistrations", verifyToken, dashboardController.userRegistrations);
router.get("/usersTable", verifyToken, dashboardController.getUsersTable);

module.exports = router;