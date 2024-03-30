const { connectDB, dropDB, dropCollections } = require("../setuptestdb");
const request = require("supertest");
const express = require("express");
const friend = require("./friend");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", friend);

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Friend = require("../models/friendModel");
const Request = require("../models/requestModel");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
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

jest.mock("jsonwebtoken");

jest.mock("../controllers/verifyToken", () => ({
  verifyToken: jest.fn((req, res, next) => next()),
}));

jest.mock("../controllers/multerConfig", () => ({
  single: () => {
    return (req, res, next) => {
      req.file = {
        filename: "test.png",
        mimetype: "image/png",
        path: "./uploads/test.png",
      };
      return next();
    };
  },
}));

describe("friend routes", () => {
  describe("create_request controller", () => {
    test("responses with null if exsiting friend is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const friend = new Friend({ users: [authUserId, userId] });
      await friend.save();

      const payload = { user_id: userId };

      const response = await request(app)
        .post("/request/create")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body).toBe(null);
    });

    test("responses with created request if friend is not found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const payload = { user_id: userId };

      const response = await request(app)
        .post("/request/create")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.createdRequest.from).toMatch(authUserId.toString());
      expect(response.body.createdRequest.to).toMatch(userId.toString());
    });
  });

  describe("requests controller", () => {
    test("responses with all friend requests", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      await Request.insertMany([
        { from: userId1, to: authUserId },
        { from: authUserId, to: userId2 },
      ]);

      const response = await request(app)
        .get("/requests")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.requests[0]).toEqual(
        expect.objectContaining({
          from: userId1.toString(),
          to: authUserId.toString(),
        })
      );

      expect(response.body.requests[1]).toEqual(
        expect.objectContaining({
          from: authUserId.toString(),
          to: userId2.toString(),
        })
      );
    });
  });

  describe("add_friend controller", () => {
    test("responses with null if exsiting friend is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const friend = new Friend({ users: [authUserId, userId] });
      await friend.save();

      const payload = { user_id: userId };

      const response = await request(app)
        .post("/add")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body).toBe(null);
    });

    test("responses with created friend and remove request if exsiting friend is not found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const requestDoc = new Request({ from: userId, to: authUserId });
      await requestDoc.save();

      const payload = { user_id: userId };

      const response = await request(app)
        .post("/add")
        .set("Content-Type", "application/json")
        .send(payload);

      const findRequest = await Request.findOne({
        from: userId,
        to: authUserId,
      });

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(findRequest).toBe(null);
      expect(response.body.createdFriend).toEqual(
        expect.objectContaining({
          users: [authUserId.toString(), userId.toString()],
        })
      );
    });
  });

  describe("friends controller", () => {
    test("responses with empty list if no friend is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const response = await request(app)
        .get("/friends")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.friendList).toHaveLength(0);
    });

    test("responses with a friend list", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const profile1 = new Profile({ full_name: "foobar1" });
      const profile2 = new Profile({ full_name: "foobar2" });

      const online1 = new Online({ online: false });
      const online2 = new Online({ online: false });

      const user1 = new User({
        email: "foobar",
        password: "foobarfoobar",
        profile: profile1._id,
        online: online1._id,
        _id: userId1,
      });
      const user2 = new User({
        email: "johndoe",
        password: "johndoejohndoe",
        profile: profile2._id,
        online: online2._id,
        _id: userId2,
      });

      await Friend.insertMany([
        { users: [authUserId, userId1] },
        { users: [authUserId, userId2] },
      ]);

      await Profile.insertMany([profile1, profile2]);

      await Online.insertMany([online1, online2]);

      await User.insertMany([user1, user2]);

      const response = await request(app)
        .get("/friends")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      for (const i in response.body.friendList) {
        expect(response.body.friendList[i]).toMatchObject({
          user_id: expect.anything(),
          _id: expect.anything(),
          full_name: expect.anything(),
          online: expect.anything(),
        });
      }
    });
  });
});
