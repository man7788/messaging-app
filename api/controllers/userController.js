const { body, validationResult } = require("express-validator");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

// Handle sign-up on POST
exports.sign_up = [
  body("username", "Username must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("Username already in use");
      }
    }),
  body("password", "Password must not be empty")
    .trim()
    .isLength({ min: 8 })
    .escape(),
  body("matched-password")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        username: req.body.username,
        password: req.body.password,
        matched_password: req.body.matched_password,
        errors: errors.array(),
      });
    } else {
      const user = new User({
        username: req.body.username,
        password: req.body.password,
      });

      const result = await user.save();
      res.json(result);
    }
  }),
];
