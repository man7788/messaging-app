const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Profile = require("../models/profileModel");
const User = require("../models/userModel");
const Request = require("../models/requestModel");
const Friend = require("../models/friendModel");
const Online = require("../models/onlineModel");

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
            about: user.profile.about,
          });
        }
        res.json({
          profiles,
        });
      }
    });
  }),
];

// Handle request for create friend request on POST
exports.create_request = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const friend = await Friend.findOne({
          users: { $all: [authData.user._id, req.body.user_id] },
        });

        if (friend) {
          res.json(null);
        } else {
          const request = new Request({
            from: authData.user._id,
            to: req.body.user_id,
          });

          const createdRequest = await request.save();

          res.json({ createdRequest });
        }
      }
    });
  }),
];

// Handle request for all friend requests on Get
exports.requests = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const requests = await Request.find({
          $or: [{ from: authData.user._id }, { to: authData.user._id }],
        });

        res.json({ requests });
      }
    });
  }),
];

// Handle request for add friend on POST
exports.add_friend = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const isFriend = await Friend.findOne({
          users: { $all: [authData.user._id, req.body.user_id] },
        });

        if (isFriend) {
          res.json(null);
        } else {
          const friend = new Friend({
            users: [authData.user._id, req.body.user_id],
          });
          const createdFriend = await friend.save();

          const request = Request.findOne({
            from: req.body.user_id,
            to: authData.user._id,
          });

          await request.deleteOne();

          res.json({ createdFriend });
        }
      }
    });
  }),
];

// Handle request for all friends on GET
exports.friends = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const friendList = [];

        const friends = await Friend.find({
          users: { $in: [authData.user._id] },
        });

        if (friends) {
          for (const friend of friends) {
            const friendId = friend.users.filter(
              (id) => id.toString() !== authData.user._id
            );

            const user = await User.findOne(
              { _id: friendId[0] },
              "profile online"
            )
              .populate("profile")
              .populate("online");

            friendList.push({
              user_id: user._id,
              _id: user.profile._id,
              full_name: user.profile.full_name,
              about: user.profile?.about,
              online: user?.online.online,
            });
          }

          res.json({ friendList });
        } else {
          res.json({ friendList });
        }
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
