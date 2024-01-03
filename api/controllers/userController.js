const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");

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
  body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const profile = new Profile({ name: req.body.name });

    const user = new User({
      username: req.body.username,
      password: req.body.password,
      profile,
    });

    if (!errors.isEmpty()) {
      res.json({
        username: req.body.username,
        password: req.body.password,
        matched_password: req.body.matched_password,
        errors: errors.array(),
      });
    } else {
      const result = await user.save();
      res.json(result);
    }
  }),
];
