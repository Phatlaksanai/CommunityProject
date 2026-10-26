const express = require("express");
const router = express.Router();
const userController = require("../AdminControllers/userController");
const { verifyAdminToken } = require("../middleware/verifyToken");

router.get("/userRegistrations", verifyAdminToken, userController.getuserRegistrations);
router.get("/usersTable", verifyAdminToken, userController.getUsersTable);
router.put("/updateUser/:userId", verifyAdminToken, userController.updateUser);
router.get("/userSummary", verifyAdminToken, userController.getUserSummary);
router.get("/WeeklyUsers", verifyAdminToken, userController.getWeeklyUsers);
router.get("/RoleUsers", verifyAdminToken, userController.getUserRolesProportion);
router.post("/addAdmin", verifyAdminToken, userController.addAdmin);

module.exports = router;