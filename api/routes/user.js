const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");

const userController = require("../controllers/userController");

// Get request for user status
router.get("/status", verifyToken, userController.user_status);

// Post request for edit profile
router.post("/profile/edit", verifyToken, userController.edit_profile);

// Post request for change password
router.post("/password/edit", verifyToken, userController.edit_password);

module.exports = router;
