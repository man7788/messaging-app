const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const Online = require("../models/onlineModel");

// Handle sign-up on POST
exports.sign_up = [
  body("email")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Email must not be empty")
    .bail()
    .isEmail()
    .withMessage("Email format is invalid")
    .bail()
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email already in use");
      }
    }),
  body("full_name", "Full name must not be empty")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("password", "Password must not be empty")
    .trim()
    .isLength({ min: 8, max: 200 })
    .withMessage("Password at least contains 8 characters")
    .escape(),
  body("confirm_password")
    .trim()
    .isLength({ min: 8, max: 200 })
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          return next(err);
        }
        try {
          const profile = new Profile({ full_name: req.body.full_name });
          const online = new Online();

          const user = new User({
            email: req.body.email,
            password: hashedPassword,
            profile,
            online,
          });

          await profile.save();
          await online.save();
          const createdUser = await user.save();

          res.json({ createdUser });
        } catch (err) {
          return next(err);
        }
      });
    }
  }),
];

// Handle log-in on POST
exports.log_in = [
  body("email")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Email must not be empty")
    .bail()
    .isEmail()
    .withMessage("Email format is invalid")
    .bail()
    .escape(),
  body("password", "Password must not be empty")
    .trim()
    .isLength({ min: 1, max: 200 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
      });
    } else {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.json({
          errors: [{ msg: "User Not Found" }],
        });
      }

      const comparePassword = async () => {
        let match;
        if (req.body.auto_login) {
          match = req.body.auto_login === user.password;
        } else {
          match = await bcrypt.compare(req.body.password, user.password);
        }
        return match;
      };

      const match = await comparePassword();

      if (!match) {
        return res.json({
          errors: [{ msg: "Incorrect Password" }],
        });
      }

      const expireTime = process.env.JWT_EXPIRATION_TIME;

      jwt.sign(
        { user },
        process.env.JWT_SECRET,
        { expiresIn: expireTime },
        async (err, token) => {
          if (err) {
            return next(err);
          }
          try {
            if (!user.online) {
              const online = new Online({ online: true });
              const newOnlineUser = new User({
                ...user.toObject(),
                online,
                _id: user._id,
              });

              await online.save();
              await User.findByIdAndUpdate(user._id, newOnlineUser);
            } else {
              const online = await Online.findById(user.online);
              const newOnline = new Online({
                online: true,
                _id: online._id,
              });

              await Online.findByIdAndUpdate(user.online, newOnline);
            }

            res.json({
              token,
            });
          } catch (err) {
            return next(err);
          }
        }
      );
    }
  }),
];

// Handle log-out on GET
exports.log_out = [
  asyncHandler(async (req, res, next) => {
    jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        res.json({ error: "invalid token" });
      } else {
        const user = await User.findById(authData.user._id);

        const online = await Online.findById(user.online);
        const newOnline = new Online({
          online: false,
          _id: online._id,
        });

        await Online.findByIdAndUpdate(user.online, newOnline);

        const updatedOnline = await User.findById(
          authData.user._id,
          "online"
        ).populate("online");

        res.json({ updatedOnline });
      }
    });
  }),
];
