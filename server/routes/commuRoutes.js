const express = require("express");
const router = express.Router();
const commuController = require("../controllers/commuController");
const { verifyToken } = require("../middleware/verifyToken");

router.post("/addcommu", verifyToken, commuController.addCommunity);
router.get("/:id", commuController.getCommunityById);
router.get("/user/:id", verifyToken, commuController.getCommunitiesByUserId);
router.get("/joined/:id", verifyToken, commuController.getJoinedCommunities);
router.put("/update", verifyToken, commuController.updateCommunity);
router.get("/followers/:id", commuController.getFollwersByCommunityId);
router.post("/follow", verifyToken, commuController.addFollower);
router.delete("/unfollow/:id", verifyToken, commuController.removeFollower);
router.get("/:id/images", commuController.getLatestCommunityImages);
router.get("/members/:id", commuController.getMembersByCommunityId);
router.post("/ban", verifyToken, commuController.banMember);
router.post("/delete/community/:id", verifyToken, commuController.deleteCommunity);

module.exports = router;