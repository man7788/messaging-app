const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");
const upload = require("../controllers/multerConfig");

const groupController = require("../controllers/groupController");

// Post request for create group
router.post("/create", verifyToken, groupController.create_group);

module.exports = router;
