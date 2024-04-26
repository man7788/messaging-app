const { connectDB, dropDB, dropCollections } = require("../setuptestdb");
const request = require("supertest");
const express = require("express");
const user = require("./user");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", user);

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");

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

describe("user routes", () => {
  describe("user_status controller", () => {
    test("responses with verified login user profile", async () => {
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: userId } });
        }
      );

      const profile = new Profile({
        full_name: "john doe",
      });

      await profile.save();

      const user = new User({
        email: "john@doe.com",
        password: "johndoefoobar",
        profile: profile._id,
        online: new mongoose.Types.ObjectId(),
        _id: userId,
      });
      await user.save();

      const response = await request(app)
        .get("/status")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.user._id).toMatch(userId.toString());
      expect(response.body.user.profile._id).toMatch(profile._id.toString());
      expect(response.body.user.profile.full_name).toMatch("john doe");
    });
  });

  describe("profiles controller", () => {
    test("responses with all user profiles", async () => {
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: userId } });
        }
      );

      const profile = new Profile({
        full_name: "john doe",
        _id: new mongoose.Types.ObjectId(),
        about: "foobar",
      });

      await profile.save();

      await User.insertMany([
        {
          email: "john@doe.com",
          password: "johndoefoobar",
          profile: profile._id,
          online: new mongoose.Types.ObjectId(),
        },
        {
          email: "john@doe2.com",
          password: "johndoefoobar2",
          profile: profile._id,
          online: new mongoose.Types.ObjectId(),
        },
        {
          email: "john@doe3.com",
          password: "johndoefoobar3",
          profile: profile._id,
          online: new mongoose.Types.ObjectId(),
        },
      ]);

      const response = await request(app)
        .get("/profiles")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.profiles).toHaveLength(3);
      for (const i in response.body.profiles) {
        expect(response.body.profiles[i]).toMatchObject({
          user_id: expect.anything(),
          _id: expect.anything(),
          full_name: expect.anything(),
          about: expect.anything(),
        });
      }
    });
  });

  describe("edit_profile controller", () => {
    test("responses with updated profile", async () => {
      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: "some id" } });
        }
      );

      const profileId = new mongoose.Types.ObjectId();

      const profile = new Profile({
        full_name: "john doe",
        about: "my name is john doe",
        _id: profileId,
      });
      profile.save();

      const payload = {
        profile_id: profileId,
        new_full_name: "new full name",
        new_about: "new about",
      };

      const response = await request(app)
        .post("/profile/edit")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.updatedProfile).toEqual(
        expect.objectContaining({
          full_name: "john doe",
          about: "my name is john doe",
        })
      );
    });
  });

  describe("edit_password controller", () => {
    test("responses with incorrect current password error", async () => {
      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: "some id" } });
        }
      );

      bcrypt.compare.mockImplementationOnce(() => false);

      const userId = new mongoose.Types.ObjectId();
      const profileId = new mongoose.Types.ObjectId();
      const onlineId = new mongoose.Types.ObjectId();

      const user = new User({
        email: "john@doe.com",
        password: "johndoefoobar",
        profile: profileId,
        online: onlineId,
        _id: userId,
      });
      await user.save();

      const payload = {
        user_id: userId,
        current_password: "wrongpassword",
        new_password: "newpassword",
        confirm_new_password: "newpassword",
      };

      const response = await request(app)
        .post("/password/edit")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.errors[0].msg).toMatch("Incorrect current password");
    });

    test("responses with new passwords do not match error", async () => {
      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: "some id" } });
        }
      );

      bcrypt.compare.mockImplementationOnce(() => true);

      const userId = new mongoose.Types.ObjectId();
      const profileId = new mongoose.Types.ObjectId();
      const onlineId = new mongoose.Types.ObjectId();

      const user = new User({
        email: "john@doe.com",
        password: "johndoefoobar",
        profile: profileId,
        online: onlineId,
        _id: userId,
      });
      await user.save();

      const payload = {
        user_id: userId,
        current_password: "johndoefoobar",
        new_password: "newpassword",
        confirm_new_password: "newpasswordnotmatch",
      };

      const response = await request(app)
        .post("/password/edit")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.errors[0].msg).toMatch("New passwords do not match");
    });

    test("responses with updated user", async () => {
      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: "some id" } });
        }
      );

      bcrypt.compare.mockImplementationOnce(() => true);

      bcrypt.hashSync.mockImplementationOnce((password, salt) => {
        return "hashedpassword";
      });

      const userId = new mongoose.Types.ObjectId();
      const profileId = new mongoose.Types.ObjectId();
      const onlineId = new mongoose.Types.ObjectId();

      const previosUser = new User({
        email: "john@doe.com",
        password: "johndoefoobar",
        profile: profileId,
        online: onlineId,
        _id: userId,
      });
      await previosUser.save();

      const payload = {
        user_id: userId,
        current_password: "johndoefoobar",
        new_password: "newpassword",
        confirm_new_password: "newpassword",
      };

      const response = await request(app)
        .post("/password/edit")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.updatedUser).toMatch(userId.toString());
    });
  });
});
