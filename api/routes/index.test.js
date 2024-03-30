const { connectDB, dropDB, dropCollections } = require("../setuptestdb");
const request = require("supertest");
const express = require("express");
const index = require("./index");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", index);

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Online = require("../models/onlineModel");

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await dropDB();
});

afterEach(async () => {
  await dropCollections();
  jest.clearAllMocks();
});

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

jest.mock("../controllers/verifyToken", () => ({
  verifyToken: jest.fn((req, res, next) => next()),
}));

describe("index routes", () => {
  describe("sign-up controller", () => {
    test("responses with email already in use error", async () => {
      const user = new User({
        email: "john@doe.com",
        password: "johndoefoobar",
        profile: new mongoose.Types.ObjectId(),
        online: new mongoose.Types.ObjectId(),
      });
      await user.save();

      const payload = {
        email: "john@doe.com",
        full_name: "john doe",
        password: "johndoefoobar",
        confirm_password: "johndoefoobar",
      };

      const response = await request(app)
        .post("/signup")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);
      expect(response.body.errors[0].msg).toBe("Email already in use");
    });

    test("responses with passwords do not match error", async () => {
      const payload = {
        email: "john@doe.com",
        full_name: "john doe",
        password: "johndoefoobar",
        confirm_password: "notmatchingpassword",
      };

      const response = await request(app)
        .post("/signup")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);
      expect(response.body.errors[0].msg).toBe("Passwords do not match");
    });

    test("successful sign-up responses with created user", async () => {
      bcrypt.hash.mockImplementationOnce((password, salt, callback) => {
        return callback(null, "hashedpassword");
      });

      const payload = {
        email: "john@doe.com",
        full_name: "john doe",
        password: "johndoefoobar",
        confirm_password: "johndoefoobar",
      };

      const response = await request(app)
        .post("/signup")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.email).toMatch("john@doe.com");
      expect(response.body.password).toMatch("hashedpassword");
      expect(response.body.profile.full_name).toMatch("john doe");
      expect(response.body.online.online).toBe(false);
    });
  });

  describe("log-in controller", () => {
    describe("failed log-in", () => {
      test("responses with user not found error ", async () => {
        const payload = {
          email: "john@doe.com",
          password: "johndoefoobar",
        };

        const response = await request(app)
          .post("/login")
          .set("Content-Type", "application/json")
          .send(payload);

        expect(response.header["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);

        expect(response.body.errors[0].msg).toMatch(/user not found/i);
      });

      test("manual log-in responses with incorrect password error ", async () => {
        bcrypt.compare.mockImplementationOnce(() => false);

        const user = new User({
          email: "john@doe.com",
          password: "johndoefoobar",
          profile: new mongoose.Types.ObjectId(),
          online: new mongoose.Types.ObjectId(),
        });
        await user.save();

        const payload = {
          email: "john@doe.com",
          password: "johndoefoobar",
        };

        const response = await request(app)
          .post("/login")
          .set("Content-Type", "application/json")
          .send(payload);

        expect(response.header["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);

        expect(response.body.errors[0].msg).toMatch(/incorrect password/i);
      });

      test("auto log-in responses with incorrect password error ", async () => {
        const user = new User({
          email: "john@doe.com",
          password: "johndoefoobar",
          profile: new mongoose.Types.ObjectId(),
          online: new mongoose.Types.ObjectId(),
        });
        await user.save();

        const payload = {
          email: "john@doe.com",
          password: "johndoefoobar",
          auto_login: "wrong password",
        };

        const response = await request(app)
          .post("/login")
          .set("Content-Type", "application/json")
          .send(payload);

        expect(response.header["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);

        expect(response.body.errors[0].msg).toMatch(/incorrect password/i);
      });
    });

    describe("successful log-in", () => {
      test("auto log-in responses with token if user has no online property", async () => {
        jwt.sign.mockImplementationOnce(
          (token, secretOrPublicKey, options, callback) => {
            return callback(null, "123abc$");
          }
        );

        const user = new User({
          email: "john@doe.com",
          password: "johndoefoobar",
          profile: new mongoose.Types.ObjectId(),
        });
        await user.save({ validateBeforeSave: false });

        const offlineUser = await User.findOne({
          email: "john@doe.com",
        }).populate("online");

        expect(offlineUser).toEqual(
          expect.not.objectContaining({ online: false })
        );

        const payload = {
          email: "john@doe.com",
          password: "johndoefoobar",
          auto_login: "johndoefoobar",
        };

        const response = await request(app)
          .post("/login")
          .set("Content-Type", "application/json")
          .send(payload);

        const onlineUser = await User.findOne({
          email: "john@doe.com",
        }).populate("online");

        expect(response.header["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);

        expect(onlineUser.online.online).toBe(true);
        expect(response.body.token).toMatch("123abc$");
      });

      test("auto log-in responses with token if user has online property", async () => {
        jwt.sign.mockImplementationOnce(
          (token, secretOrPublicKey, options, callback) => {
            return callback(null, "123abc$");
          }
        );

        const online = new Online({ online: false });
        await online.save();

        const user = new User({
          email: "john@doe.com",
          password: "johndoefoobar",
          profile: new mongoose.Types.ObjectId(),
          online: online._id,
        });
        await user.save();

        const offlineUser = await User.findOne({
          email: "john@doe.com",
        }).populate("online");

        expect(offlineUser.online.online).toBe(false);

        const payload = {
          email: "john@doe.com",
          password: "johndoefoobar",
          auto_login: "johndoefoobar",
        };

        const response = await request(app)
          .post("/login")
          .set("Content-Type", "application/json")
          .send(payload);

        const onlineUser = await User.findOne({
          email: "john@doe.com",
        }).populate("online");

        expect(response.header["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);

        expect(onlineUser.online.online).toBe(true);
        expect(response.body.token).toMatch("123abc$");
      });

      test("manual log-in responses with token if user has no online property", async () => {
        bcrypt.compare.mockImplementationOnce(() => true);
        jwt.sign.mockImplementationOnce(
          (token, secretOrPublicKey, options, callback) => {
            return callback(null, "123abc$");
          }
        );

        const user = new User({
          email: "john@doe.com",
          password: "johndoefoobar",
          profile: new mongoose.Types.ObjectId(),
        });
        await user.save({ validateBeforeSave: false });

        const offlineUser = await User.findOne({
          email: "john@doe.com",
        }).populate("online");

        expect(offlineUser).toEqual(
          expect.not.objectContaining({ online: false })
        );

        const payload = {
          email: "john@doe.com",
          password: "johndoefoobar",
        };

        const response = await request(app)
          .post("/login")
          .set("Content-Type", "application/json")
          .send(payload);

        const onlineUser = await User.findOne({
          email: "john@doe.com",
        }).populate("online");

        expect(response.header["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);

        expect(onlineUser.online.online).toBe(true);
        expect(response.body.token).toMatch("123abc$");
      });

      test("manual log-in responses with token if user has online property", async () => {
        bcrypt.compare.mockImplementationOnce(() => true);

        jwt.sign.mockImplementationOnce(
          (token, secretOrPublicKey, options, callback) => {
            return callback(null, "123abc$");
          }
        );

        const online = new Online({ online: false });
        await online.save();

        const user = new User({
          email: "john@doe.com",
          password: "johndoefoobar",
          profile: new mongoose.Types.ObjectId(),
          online: online._id,
        });
        await user.save();

        const offlineUser = await User.findOne({
          email: "john@doe.com",
        }).populate("online");

        expect(offlineUser.online.online).toBe(false);

        const payload = {
          email: "john@doe.com",
          password: "johndoefoobar",
        };

        const response = await request(app)
          .post("/login")
          .set("Content-Type", "application/json")
          .send(payload);

        const onlineUser = await User.findOne({
          email: "john@doe.com",
        }).populate("online");

        expect(response.header["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);

        expect(onlineUser.online.online).toBe(true);
        expect(response.body.token).toMatch("123abc$");
      });
    });
  });

  describe("logout controller", () => {
    test("log-out responses with upadted online ", async () => {
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: userId } });
        }
      );

      const online = new Online({ online: true });
      await online.save();

      const user = new User({
        email: "john@doe.com",
        password: "johndoefoobar",
        profile: new mongoose.Types.ObjectId(),
        online: online._id,
        _id: userId,
      });
      await user.save();

      const onlineUser = await User.findOne({
        email: "john@doe.com",
      }).populate("online");

      expect(onlineUser.online.online).toBe(true);

      const response = await request(app)
        .get("/logout")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.updatedOnline.online.online).toBe(false);
    });
  });
});
