const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/createpayment", verifyToken, paymentController.createPayment);
router.post("/addToCart", verifyToken, paymentController.addItemToCart);
router.get("/carditems/:userId", verifyToken, paymentController.getCardItems);
router.delete("/removeitem/:itemId", verifyToken, paymentController.removeItemFromCart);

module.exports = router;