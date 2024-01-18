const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

// Handle request for chat messages on POST
exports.chat_messages = [
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
          const chat = await Chat.findOne({
            users: { $all: [authData.user._id, req.body.user_id] },
          });

          if (chat) {
            const messages = await Message.find({ chat: chat._id });
            res.json({ messages });
          } else {
            res.json({ messages: null });
          }
        }
      });
    }
  }),
];

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
      jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
        if (err) {
          res.json({ error: "invalid token" });
        } else {
          let chat;

          const chatData = await Chat.findOne({
            users: { $in: [authData.user._id, req.body.user_id] },
          });

          if (chatData) {
            chat = chatData;
          } else {
            const newChat = new Chat({
              users: [authData.user._id, req.body.user_id],
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
      });
    }
  }),
];
