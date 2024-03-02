const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");
const upload = require("../controllers/multerConfig");

const chatController = require("../controllers/chatController");

// Post request for chat messages
router.post("/messages", verifyToken, chatController.chat_messages);

// Post request for send message
router.post("/send", verifyToken, chatController.send_message);

// Post request for send image
router.post(
  "/send/image",
  verifyToken,
  upload.single("msgImage"),
  chatController.send_image
);

module.exports = router;
