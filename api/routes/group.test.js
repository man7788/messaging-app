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
    test("responses with created group", async () => {
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

  describe("groups controller", () => {
    test("responses with empty array if no group is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );
      const response = await request(app)
        .get("/all")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.groups).toHaveLength(0);
    });

    test("responses with a list of groups", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const group1 = new Group({
        name: "group1",
        users: [authUserId, userId1, userId2],
      });

      const group2 = new Group({
        name: "group2",
        users: [authUserId, userId1, userId2],
      });

      Group.insertMany([group1, group2]);

      const response = await request(app)
        .get("/all")
        .set("Content-Type", "application/json");

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.groups).toHaveLength(2);
    });
  });

  describe("messages controller", () => {
    test("responses with null if no group is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const payload = { group_id: group._id };

      const response = await request(app)
        .post("/messages")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.messages).toBe(null);
    });

    test("responses with empty array if no message is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const group = new Group({
        name: "group1",
        users: [authUserId, userId1, userId2],
      });

      await group.save();

      const payload = { group_id: group._id };

      const response = await request(app)
        .post("/messages")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.messages).toHaveLength(0);
    });

    test("responses with array of messages", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const group = new Group({
        name: "group1",
        users: [authUserId, userId1, userId2],
      });

      await group.save();

      const message1 = new Message({
        chat: group._id,
        text: "some text",
        date: new Date(),
        author: authUserId,
        chatModel: "Group",
      });
      const message2 = new Message({
        chat: group._id,
        text: "more text",
        date: new Date(),
        author: userId1,
        chatModel: "Group",
      });

      await Message.insertMany([message1, message2]);

      const payload = { group_id: group._id };

      const response = await request(app)
        .post("/messages")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.messages).toHaveLength(2);

      for (const i in response.body.messages) {
        expect(response.body.messages[i]).toEqual(
          expect.objectContaining({
            _id: expect.anything(),
            chat: group._id.toString(),
            text: expect.anything(),
            date: expect.anything(),
            author: expect.anything(),
            date_med: expect.anything(),
            time_simple: expect.anything(),
            chatModel: "Group",
          })
        );
      }
    });
  });

  describe("group_message controller", () => {
    test("responses with null if no group is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const payload = { message: "some text" };

      const response = await request(app)
        .post("/send")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.createdMessage).toBe(null);
    });
  });
});
