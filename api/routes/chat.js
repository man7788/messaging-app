const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");

const chatController = require("../controllers/chatController");

// Post request for chat messages
router.post("/messages", verifyToken, chatController.chat_messages);

// Post request for send message
router.post("/send", verifyToken, chatController.send_message);

module.exports = router;
