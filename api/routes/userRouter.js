const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Post request for user sign-up
router.post("/sign-up", userController.sign_up);

module.exports = router;
