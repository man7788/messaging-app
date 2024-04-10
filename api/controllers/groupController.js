const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const Message = require("../models/messageModel");
const Group = require("../models/groupModel");
const Profile = require("../models/profileModel");

// Handle request group create on POST
exports.create_group = [
  body("user_id_list")
    .trim()
    .isArray({ min: 1 })
    .withMessage("Add member to create group")
    .escape(),
  body("group_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Group name must not be empty")
    .escape()
    .isLength({ max: 50 })
    .withMessage("Group name more than 50 characters")
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
          const userList = [authData.user._id, ...req.body.user_id_list];

          const group = new Group({
            name: req.body.group_name,
            users: [...userList],
          });

          await group.save();

          res.json({ group });
        }
      });
    }
  }),
];

// Handle request for groups on GET
exports.groups = asyncHandler(async (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.json({ error: "invalid token" });
    } else {
      const groups = await Group.find({
        users: { $in: [authData.user._id] },
      });

      if (groups) {
        res.json({ groups });
      } else {
        res.json({ groups: null });
      }
    }
  });
});

// Handle request for group messages on POST
exports.messages = asyncHandler(async (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.json({ error: "invalid token" });
    } else {
      const group = await Group.findById(req.body.group_id);

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

// Handle send group message on POST
exports.group_message = [
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
          const group = await Group.findById(req.body.group_id);
          const author = await Profile.findById(
            authData.user.profile,
            "full_name"
          );

          if (group) {
            const message = new Message({
              chat: req.body.group_id,
              text: req.body.message,
              author: authData.user._id,
              author_name: author.full_name,
              date: new Date(),
              chatModel: "Group",
            });

            const createdMessage = await message.save();

            res.json({ createdMessage });
          } else {
            res.json(null);
          }
        }
      });
    }
  }),
];

// Handle send group image on POST
exports.group_image = [
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
          const group = await Group.findById(req.body.group_id);

          if (group) {
            const obj = {
              img: {
                data: fs.readFileSync(
                  path.join(__dirname + "/../uploads/" + req.file.filename)
                ),
                contentType: ["image/png", "image/jpeg"],
              },
            };

            const message = new Message({
              chat: group._id,
              image: obj.img,
              author: authData.user._id,
              date: new Date(),
              chatModel: "Group",
            });

            const savedImage = await message.save();

            await fs.promises.unlink("./" + req.file.path);

            res.json({ savedImage });
          } else {
            res.json(null);
          }
        }
      });
    }
  }),
];
