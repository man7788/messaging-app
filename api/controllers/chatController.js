const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

// Handle send message on POST
exports.send_message = [
  body("message")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Message must not be empty"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
      });
    } else {
      let chat;

      const chatData = await Chat.findOne({
        users: { $in: [req.body.user_id, req.body._user_id] },
      });

      if (chatData) {
        chat = chatData;
      } else {
        const newChat = new Chat({
          users: [req.body.user_id, req.body._user_id],
        });

        chat = await newChat.save();
      }

      const message = new Message({
        chat: chat._id,
        text: req.body.message,
        date: new Date(),
        author: req.body.user_id,
      });

      const createdMessage = await message.save();

      res.json({ chat, createdMessage });
    }
  }),
];
