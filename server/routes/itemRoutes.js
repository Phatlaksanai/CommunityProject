const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/", itemController.getItems);
router.get("/latest", itemController.getLatestItems);
router.get("/project/:id", itemController.getItemsByProjectId);
router.get("/user/:id/available", itemController.getItemsByUserIdAvailable);
router.get("/user/:id", itemController.getItemsByUserId);

router.get("/:id", itemController.getItemsById);

router.post("/additem", verifyToken, itemController.addItem);
router.put("/update-item", verifyToken, itemController.updateItem);

router.get("/project-edit/:projectId", verifyToken, itemController.getItemsForEditProject);

router.post("/review", verifyToken, itemController.addReview);
router.get("/reviews/:itemId", itemController.getReviewsByItemId);

module.exports = router;