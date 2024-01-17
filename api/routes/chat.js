const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");

const chatController = require("../controllers/chatController");

// Post request for send message
router.post("/send", verifyToken, chatController.send_message);

module.exports = router;
