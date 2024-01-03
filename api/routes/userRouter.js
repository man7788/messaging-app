const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Post request for user sign-up
router.post("/signup", userController.sign_up);

// Post request for user user log-in
router.post("/login", userController.log_in);

module.exports = router;
