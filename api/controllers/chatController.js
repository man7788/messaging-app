const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

// Handle request for chat messages on GET
// exports.chat_messages = [
//   asyncHandler(async (req, res, next) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       res.json({
//         errors: errors.array(),
//       });
//     } else {
//       jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
//         if (err) {
//           res.json({ error: "invalid token" });
//         } else {
//           let messages;
//           const chat = await Chat.find({
//             users: { $in: [authData.user._id, req.body._user_id] },
//           });

//           messages = await messages.find({ _id: chat._id });

//           // if (chatData) {
//           // } else {
//           //   const newChat = new Chat({
//           //     users: [req.body.user_id, req.body._user_id],
//           //   });

//           //   chat = await newChat.save();
//           // }

//           // const message = new Message({
//           //   chat: chat._id,
//           //   text: req.body.message,
//           //   date: new Date(),
//           //   author: req.body.user_id,
//           // });

//           // const createdMessage = await message.save();

//           // res.json({ chat, createdMessage });
//           res.json({ chat });
//         }
//       });
//     }
//   }),
// ];

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
