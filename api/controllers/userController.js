const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");

// Handle check login status on POST
exports.login_status = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.sendStatus(401);
      } else {
        const profile = await Profile.findById(authData.user.profile);
        res.status(200).json({
          profile,
        });
      }
    });
  }),
];
