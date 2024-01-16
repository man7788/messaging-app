const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Profile = require("../models/profileModel");
const User = require("../models/userModel");

// Handle request for all user profiles on GET
exports.profiles = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const profiles = await Profile.find();
        res.json({
          profiles,
        });
      }
    });
  }),
];

// Handle check login status on POST
exports.user_status = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const user = await User.findById(authData.user._id).populate("profile");
        res.json({
          user,
        });
      }
    });
  }),
];

// Handle edit profile status on POST
exports.edit_profile = [
  body("profile_id", "Id must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("new_full_name", "Full Name must not be empty")
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape()
    .custom(async (value, { req }) => {
      const user = await User.findOne({ username: value });
      if (user && user._id.valueOf() !== req.body.user_id) {
        throw new Error("Username already in use");
      }
    }),
  body("new_about")
    .trim()
    .isLength({ max: 150 })
    .withMessage("About should contain less than 150 words")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
      });
    } else {
      jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.json({ error: "invalid token" });
        } else {
          const profileDoc = await Profile.findById(req.body.profile_id);

          const profile = new Profile({
            full_name: req.body.new_full_name,
            about: req.body.new_about,
            _id: profileDoc._id,
          });

          const updatedProfile = await Profile.findByIdAndUpdate(
            profileDoc._id,
            profile
          );

          res.json({
            updated_profile: profile,
            previous_profile: updatedProfile,
          });
        }
      });
    }
  }),
];

// Handle change password on POST
exports.edit_password = [
  body("user_id", "Id must not be empty").trim().isLength({ min: 1 }).escape(),
  body("current_password")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Current password must not be empty")
    .bail()
    .escape()
    .custom(async (value, { req }) => {
      const user = await User.findById(req.body.user_id, "password");
      const match = await bcrypt.compare(value, user.password);
      if (!match) {
        throw new Error("Incorrect current Password");
      }
    }),
  body("new_password")
    .trim()
    .isLength({ min: 8, max: 200 })
    .withMessage("New password must at least contains 8 characters")
    .escape(),
  body("confirm_new_password")
    .trim()
    .custom((value, { req }) => {
      return value === req.body.new_password;
    })
    .withMessage("New passwords do not match")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
      });
    } else {
      jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.json({ error: "invalid token" });
        } else {
          const userDoc = await User.findById(req.body.user_id);

          const hashedPassword = bcrypt.hashSync(req.body.new_password, 10);

          const user = new User({
            username: userDoc.username,
            password: hashedPassword,
            profile: userDoc.profile,
            friends: userDoc.friends,
            _id: userDoc._id,
          });

          const updatedUser = await User.findByIdAndUpdate(
            req.body.user_id,
            user
          );

          res.json({
            updated_user: user,
            previous_user: updatedUser,
          });
        }
      });
    }
  }),
];
