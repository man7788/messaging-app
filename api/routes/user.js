const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");

const userController = require("../controllers/userController");

// Post request for login status
router.post("/status", verifyToken, userController.login_status);

// Post request for edit profile
router.post("/edit", verifyToken, userController.edit_profile);

module.exports = router;
