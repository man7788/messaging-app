const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Request = require("../models/requestModel");
const Friend = require("../models/friendModel");

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
              (id) => id.toString() !== authData.user._id.toString()
            );

            const user = await User.findOne(
              { _id: friendId[0] },
              "profile online"
            )
              .populate("profile")
              .populate("online");

            friendList.push({
              friend_id: friend._id,
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
