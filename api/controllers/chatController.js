const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

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
        res.json({ messages: [] });
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
          const chat = await Chat.findOne({
            users: { $all: [authData.user._id, req.body.user_id] },
          });

          if (chat) {
            const message = new Message({
              chat: chat._id,
              text: req.body.message,
              author: authData.user._id,
              date: new Date(),
              chatModel: "Chat",
            });

            const createdMessage = await message.save();

            res.json({ chat, createdMessage });
          } else {
            res.json({ error: "chat document not found" });
          }
        }
      });
    }
  }),
];

// Handle send image on POST
exports.send_image = [
  body("msgImage").custom(async (value, { req }) => {
    if (req.file) {
      switch (req.file.mimetype) {
        case "image/png":
          return;
        case "image/jpeg":
          return;
        default:
          await fs.promises.unlink("./" + req.file.path);
          throw new Error("Invalid image format");
      }
    } else {
      throw new Error("Missing image file");
    }
  }),

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
              author: authData.user._id,
              date: new Date(),
              chatModel: "Chat",
            });

            const createdImage = await message.save();

            await fs.promises.unlink("./" + req.file.path);

            res.json({ chat, createdImage });
          } else {
            await fs.promises.unlink("./" + req.file.path);

            res.json({ error: "chat document not found" });
          }
        }
      });
    }
  }),
];
