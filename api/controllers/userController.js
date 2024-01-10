const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Profile = require("../models/profileModel");

// Handle check login status on POST
exports.login_status = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const profile = await Profile.findById(authData.user.profile);
        res.json({
          profile,
        });
      }
    });
  }),
];

// Handle edit profile status on POST
exports.edit_profile = [
  body("id", "Id must not be empty").trim().isLength({ min: 1 }).escape(),
  body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
  body("about")
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
          const profile = new Profile({
            name: req.body.name,
            about: req.body.about,
            _id: req.body.id,
          });
          const updatedProfile = await Profile.findByIdAndUpdate(
            req.body.id,
            profile
          );
          res.json({
            profile,
            updatedProfile,
          });
        }
      });
    }
  }),
];
