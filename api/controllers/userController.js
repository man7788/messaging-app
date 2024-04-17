const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Profile = require("../models/profileModel");
const User = require("../models/userModel");

// Handle check login status on POST
exports.user_status = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const user = await User.findById(
          authData.user._id,
          "_id profile"
        ).populate("profile");

        res.json({
          user,
        });
      }
    });
  }),
];

// Handle request for all profiles on GET
exports.profiles = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const profiles = [];
        const users = await User.find({}, "profile").populate("profile");

        for (const user of users) {
          profiles.push({
            user_id: user._id,
            _id: user.profile._id,
            full_name: user.profile.full_name,
            about: user.profile?.about,
          });
        }
        res.json({
          profiles,
        });
      }
    });
  }),
];

// Handle edit profile on POST
exports.edit_profile = [
  body("profile_id", "Id must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("new_full_name", "Full Name must not be empty")
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape(),
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
            updatedProfile,
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
        throw new Error("Incorrect current password");
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
            email: userDoc.email,
            password: hashedPassword,
            profile: userDoc.profile,
            online: userDoc.online,
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
