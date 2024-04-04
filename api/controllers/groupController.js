const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");

// Handle request group create on POST
exports.create_group = asyncHandler(async (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.json({ error: "invalid token" });
    } else {
      const userList = [authData.user._id, ...req.body.user_id_list];

      const group = await Group.findOne({
        users: { $all: [...userList] },
      });

      if (group) {
        res.json(null);
      } else {
        const group = new Group({ users: [...userList] });

        await group.save();

        res.json({ group });
      }
    }
  });
});

// Handle request for group chat on POST
exports.group_chat = asyncHandler(async (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.json({ error: "invalid token" });
    } else {
      const userList = [authData.user._id, ...req.body.user_id_list];

      const group = await Group.findOne({
        users: { $all: [...userList] },
      });

      if (group) {
        const messages = await Message.find({ chat: group._id }).sort({
          date: 1,
        });

        res.json({ messages });
      } else {
        res.json({ messages: null });
      }
    }
  });
});
