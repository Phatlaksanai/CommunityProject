const express = require("express");
const router = express.Router();
const authController = require("../Admincontrollers/authController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/login-admin", authController.loginAdmin);
router.post("/send-otp", authController.sendOtpAdmin);

module.exports = router;