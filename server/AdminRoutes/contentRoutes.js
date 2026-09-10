const express = require("express");
const router = express.Router();
const contentController = require("../AdminControllers/contentController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/donutYearlyPosts", verifyToken, contentController.getDonutYearlyPostStats);
router.get("/donutYearlyCommunities", verifyToken, contentController.getDonutYearlyCommunityStats);
router.get("/donutYearlyItems", verifyToken, contentController.getDonutYearlyItemStats);
router.get("/donutDistributionPost", verifyToken, contentController.getDonutDistributionPost);
router.get("/donutDistributionCommunity", verifyToken, contentController.getDonutDistributionCommunity);
router.get("/donutDistributionItem", verifyToken, contentController.getDonutDistributionItem);

router.get("/postSummary", verifyToken, contentController.getPostSummary);
router.get("/communitySummary", verifyToken, contentController.getCommunitySummary);
router.get("/itemSummary", verifyToken, contentController.getItemSummary);

router.get("/weeklyPosts", verifyToken, contentController.getWeeklyPosts);
router.get("/weeklyCommunities", verifyToken, contentController.getWeeklyCommunities);
router.get("/weeklyItems", verifyToken, contentController.getWeeklyItems);

router.get("/postsTable", verifyToken, contentController.getPostsTable);
router.get("/communitiesTable", verifyToken, contentController.getCommunitiesTable);
router.get("/itemsTable", verifyToken, contentController.getItemsTable);
router.put("/updatePost/:postId", verifyToken, contentController.updatePost);
router.put("/updateCommunity/:communityId", verifyToken, contentController.updateCommunity);
router.put("/updateItem/:itemId", verifyToken, contentController.updateItem);
router.get("/categories", verifyToken, contentController.getCategories);

module.exports = router;