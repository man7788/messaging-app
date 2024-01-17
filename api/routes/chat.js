const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

// Post request for send message
router.post("/send", chatController.send_message);

module.exports = router;
