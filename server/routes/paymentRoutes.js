const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/create-payment", verifyToken, paymentController.createPayment);
router.post("/add-to-cart", verifyToken, paymentController.addItemToCart);
router.get("/carditems/:userId", verifyToken, paymentController.getCardItems);

module.exports = router;