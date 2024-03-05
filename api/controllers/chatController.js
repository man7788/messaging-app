const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Image = require("../models/imageModel");

// Handle request for chat messages on POST
exports.chat_messages = asyncHandler(async (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.json({ error: "invalid token" });
    } else {
      const chat = await Chat.findOne({
        users: { $all: [authData.user._id, req.body.user_id] },
      });

      if (chat) {
        const messages = await Message.find({ chat: chat._id }).sort({
          date: 1,
        });

        res.json({ messages });
      } else {
        res.json({ messages: null });
      }
    }
  });
});

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
            users: { $all: [authData.user._id, req.body.user_id] },
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
            author: authData.user._id,
          });

          const createdMessage = await message.save();

          res.json({ chat, createdMessage });
        }
      });
    }
  }),
];

// Handle send image on POST
exports.send_image = asyncHandler(async (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.json({ error: "invalid token" });
    } else {
      let chat;

      const chatData = await Chat.findOne({
        users: { $all: [authData.user._id, req.body.user_id] },
      });

      if (chatData) {
        chat = chatData;
      } else {
        const newChat = new Chat({
          users: [authData.user._id, req.body.user_id],
        });

        chat = await newChat.save();
      }

      const obj = {
        img: {
          data: fs.readFileSync(
            path.join(__dirname + "/../uploads/" + req.file.filename)
          ),
          contentType: ["image/png", "image/jpeg"],
        },
      };

      const message = new Message({
        chat: chat._id,
        image: obj.img,
        date: new Date(),
        author: authData.user._id,
      });

      const savedImage = await message.save();

      await fs.promises.unlink("./" + req.file.path);

      res.json({ chat, savedImage });
    }
  });
});
