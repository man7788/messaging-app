const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");

const friendController = require("../controllers/friendController");

// Post request for create friend request
router.post("/request/create", verifyToken, friendController.create_request);

// Get request for all requests
router.get("/requests", verifyToken, friendController.requests);

// Post request for add friend
router.post("/add", verifyToken, friendController.add_friend);

// Get request for all friends
router.get("/friends", verifyToken, friendController.friends);

module.exports = router;
