const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
// const Chat = require("../models/chatModel");
// const Message = require("../models/messageModel");
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
