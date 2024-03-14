const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");

const userController = require("../controllers/userController");

// Get request for user status
router.get("/status", verifyToken, userController.user_status);

// Get request for all user profiles
router.get("/profiles", verifyToken, userController.profiles);

// Post request for create friend request
router.post("/friend/request/send", verifyToken, userController.request_friend);

// Get request for all requests
router.get("/friend/requests", verifyToken, userController.requests);

// Post request for add friend
router.post("/friend/add", verifyToken, userController.add_friend);

// Get request for all friends
router.get("/friends/", verifyToken, userController.friends);

// Post request for edit profile
router.post("/profile/edit", verifyToken, userController.edit_profile);

// Post request for change password
router.post("/password/edit", verifyToken, userController.edit_password);

module.exports = router;
