const express = require("express");
const router = express.Router();
const authController = require("../AdminControllers/authController");

router.post("/login-admin", authController.loginAdmin);
router.post("/logout-admin", authController.logoutAdmin);
router.post("/send-otp", authController.sendOtpAdmin);

module.exports = router;