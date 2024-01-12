const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");

// Handle sign-up on POST
exports.sign_up = [
  body("username", "Username must not be empty")
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      if (user) {
        throw new Error("Username already in use");
      }
    }),
  body("password", "Password must not be empty")
    .trim()
    .isLength({ min: 8, max: 200 })
    .withMessage("Password at least contains 8 characters")
    .escape(),
  body("confirmPassword")
    .trim()
    .isLength({ min: 8, max: 200 })
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        }
        try {
          const profile = new Profile();

          const user = new User({
            username: req.body.username,
            password: hashedPassword,
            profile,
          });

          const createdProfile = await profile.save();
          const result = await user.save();
          res.json(result);
        } catch (err) {
          return next(err);
        }
      });
    }
  }),
];

// Handle log-in on POST
exports.log_in = [
  body("username", "Username must not be empty")
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape(),
  body("password", "Password must not be empty")
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
      });
    } else {
      const user = await User.findOne({ username: req.body.username });

      if (!user) {
        return res.json({
          errors: [{ msg: "User Not Found" }],
        });
      }

      const comparePassword = async () => {
        let match;
        if (req.body.autoLogin) {
          match = req.body.autoLogin === user.password;
        } else {
          match = await bcrypt.compare(req.body.password, user.password);
        }
        return match;
      };

      const match = await comparePassword();

      if (!match) {
        return res.json({
          errors: [{ msg: "Incorrect Password" }],
        });
      }

      jwt.sign({ user }, process.env.JWT_SECRET, (err, token) => {
        res.json({
          token,
        });
      });
    }
  }),
];
