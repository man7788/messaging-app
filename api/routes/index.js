const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Get request for homepage
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Post request for user sign-up
router.post("/signup", userController.sign_up);

// Post request for user user log-in
router.post("/login", userController.log_in);

module.exports = router;
