const request = require("supertest");
const express = require("express");
const app = express();

const friend = require("./friend");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Request = require("../models/requestModel");
const Friend = require("../models/friendModel");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", friend);

afterEach(async () => {
  jest.clearAllMocks();
});

jest.mock("../controllers/verifyToken", () => ({
  verifyToken: jest.fn((req, res, next) => next()),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token, secretOrPublicKey, callback) => {
    return callback(null, { user: { _id: "123" } });
  }),
}));

const friendFindOneSpy = jest.spyOn(Friend, "findOne");
const requestSaveSpy = jest.spyOn(Request.prototype, "save");
const requestFindSpy = jest.spyOn(Request, "find");

describe("friend routes", () => {
  describe("create friend request", () => {
    test("responses with null if already friend", async () => {
      friendFindOneSpy.mockResolvedValueOnce({ users: [] });

      const response = await request(app)
        .post("/request/create")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body).toBeNull();
    });

    test("responses with created request", async () => {
      const fromId = new mongoose.Types.ObjectId();
      const toId = new mongoose.Types.ObjectId();
      const user_id = new mongoose.Types.ObjectId();

      friendFindOneSpy.mockResolvedValueOnce(null);
      requestSaveSpy.mockResolvedValueOnce({ from: fromId, to: toId });

      const payload = { user_id: user_id };

      const resObj = {
        createdRequest: { from: fromId.toString(), to: toId.toString() },
      };

      const response = await request(app)
        .post("/request/create")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject(resObj);
    });
  });

  describe("friend request", () => {
    test("responses with all friend requests", async () => {
      const friend_id1 = new mongoose.Types.ObjectId();
      const friend_id2 = new mongoose.Types.ObjectId();
      const friend_id3 = new mongoose.Types.ObjectId();
      const user_id = new mongoose.Types.ObjectId();

      requestFindSpy.mockResolvedValueOnce([
        { from: friend_id2, to: friend_id1 },
        { from: friend_id3, to: friend_id1 },
      ]);

      const payload = { user_id: user_id };

      const resObj = {
        requests: [
          { from: friend_id2.toString(), to: friend_id1.toString() },
          { from: friend_id3.toString(), to: friend_id1.toString() },
        ],
      };

      const response = await request(app)
        .get("/requests")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body).toMatchObject(resObj);
    });
  });
});
