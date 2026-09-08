const express = require("express");
const router = express.Router();
const transactionController = require("../AdminControllers/transactionController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/transactionSummary", verifyToken, transactionController.getTransactionSummary);
router.get("/WeeklyOrders", verifyToken, transactionController.getWeeklyOrders);
router.get("/transactionsTable", verifyToken, transactionController.getTransactionsTable);
router.get("/OrderByRange", verifyToken, transactionController.getOrderByRange);
router.get("/WeeklySales", verifyToken, transactionController.getWeeklySales);

module.exports = router;