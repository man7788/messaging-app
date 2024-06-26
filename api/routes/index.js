const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");

const indexController = require("../controllers/indexController");

// Get request for homepage
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Post request for user sign-up
router.post("/signup", indexController.sign_up);

// Post request for user log-in
router.post("/login", indexController.log_in);

// Get request for user log-out
router.get("/logout", verifyToken, indexController.log_out);

module.exports = router;
