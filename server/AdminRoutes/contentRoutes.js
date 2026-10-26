const express = require("express");
const router = express.Router();
const contentController = require("../AdminControllers/contentController");
const { verifyAdminToken } = require("../middleware/verifyToken");

router.get("/donutYearlyPosts", verifyAdminToken, contentController.getDonutYearlyPostStats);
router.get("/donutYearlyCommunities", verifyAdminToken, contentController.getDonutYearlyCommunityStats);
router.get("/donutYearlyItems", verifyAdminToken, contentController.getDonutYearlyItemStats);
router.get("/donutDistributionPost", verifyAdminToken, contentController.getDonutDistributionPost);
router.get("/donutDistributionCommunity", verifyAdminToken, contentController.getDonutDistributionCommunity);
router.get("/donutDistributionItem", verifyAdminToken, contentController.getDonutDistributionItem);

router.get("/postSummary", verifyAdminToken, contentController.getPostSummary);
router.get("/communitySummary", verifyAdminToken, contentController.getCommunitySummary);
router.get("/itemSummary", verifyAdminToken, contentController.getItemSummary);

router.get("/weeklyPosts", verifyAdminToken, contentController.getWeeklyPosts);
router.get("/weeklyCommunities", verifyAdminToken, contentController.getWeeklyCommunities);
router.get("/weeklyItems", verifyAdminToken, contentController.getWeeklyItems);

router.get("/postsTable", verifyAdminToken, contentController.getPostsTable);
router.get("/communitiesTable", verifyAdminToken, contentController.getCommunitiesTable);
router.get("/itemsTable", verifyAdminToken, contentController.getItemsTable);
router.put("/updatePost/:postId", verifyAdminToken, contentController.updatePost);
router.put("/updateCommunity/:communityId", verifyAdminToken, contentController.updateCommunity);
router.put("/updateItem/:itemId", verifyAdminToken, contentController.updateItem);
router.get("/categories", verifyAdminToken, contentController.getCategories);
router.post("/addNewCategory", verifyAdminToken, contentController.addNewCategory);

module.exports = router;