const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");
const upload = require("../controllers/multerConfig");

const groupController = require("../controllers/groupController");

// Post request for create group
router.post("/create", verifyToken, groupController.create_group);

// Get request for all groups
router.get("/all", verifyToken, groupController.groups);

// Post request for group chat messages
router.post("/messages", verifyToken, groupController.messages);

// Post request for send group message
router.post("/send", verifyToken, groupController.group_message);

// Post request for send group image
router.post(
  "/send/image",
  verifyToken,
  upload.single("msgImage"),
  groupController.group_image
);

module.exports = router;
