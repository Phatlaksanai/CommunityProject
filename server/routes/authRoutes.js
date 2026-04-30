const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/send-otp-register", authController.sendOtpRegister);
router.post("/send-otp-resetpassword", authController.sendOtpResetPassword);
router.post("/logout", authController.logout);
router.put("/update-profile", verifyToken, authController.updateProfile);
router.put("/update-item", verifyToken, authController.updateItem);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-otp-resetpassword", authController.verifyOtpResetPassword);

module.exports = router;