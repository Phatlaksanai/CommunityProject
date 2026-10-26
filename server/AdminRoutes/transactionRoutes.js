const express = require("express");
const router = express.Router();
const transactionController = require("../AdminControllers/transactionController");
const { verifyAdminToken } = require("../middleware/verifyToken");

router.get("/transactionSummary", verifyAdminToken, transactionController.getTransactionSummary);
router.get("/WeeklyOrders", verifyAdminToken, transactionController.getWeeklyOrders);
router.get("/transactionsTable", verifyAdminToken, transactionController.getTransactionsTable);
router.get("/OrderByRange", verifyAdminToken, transactionController.getOrderByRange);
router.get("/WeeklySales", verifyAdminToken, transactionController.getWeeklySales);

module.exports = router;