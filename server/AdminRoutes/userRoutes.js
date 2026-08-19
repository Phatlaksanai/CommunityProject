const express = require("express");
const router = express.Router();
const userController = require("../Admincontrollers/userController");
const { verifyToken } = require("../middleware/verifyToken");

router.get("/userRegistrations", verifyToken, userController.getuserRegistrations);
router.get("/usersTable", verifyToken, userController.getUsersTable);
router.put("/updateUser/:userId", verifyToken, userController.updateUser);
router.get("/userSummary", verifyToken, userController.getUserSummary);
router.get("/WeeklyUsers", verifyToken, userController.getWeeklyUsers);
router.get("/RoleUsers", verifyToken, userController.getUserRolesProportion);
router.post("/addAdmin", verifyToken, userController.addAdmin);

module.exports = router;