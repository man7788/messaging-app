const { connectDB, dropDB, dropCollections } = require("../setuptestdb");
const request = require("supertest");
const express = require("express");
const group = require("./group");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", group);

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Group = require("../models/groupModel");
const Message = require("../models/messageModel");

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

describe("group routes", () => {
  describe("create_group controller", () => {
    test.only("responses with created group", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const payload = {
        user_id_list: [userId1, userId2],
        group_name: "new group",
      };

      const response = await request(app)
        .post("/create")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.group).toEqual(
        expect.objectContaining({
          name: "new group",
          users: [
            authUserId.toString(),
            userId1.toString(),
            userId2.toString(),
          ],
        })
      );
    });
  });
});
