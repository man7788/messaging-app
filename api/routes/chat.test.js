const { connectDB, dropDB, dropCollections } = require("../setuptestdb");
const request = require("supertest");
const express = require("express");
const chat = require("./chat");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", chat);

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Chat = require("../models/chatModel");
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

describe("chat routes", () => {
  describe("chat_messages controller", () => {
    test("responses with chat messages if chat is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const chat = new Chat({ users: [authUserId, userId] });
      await chat.save();

      const message1 = new Message({
        chat: chat._id,
        text: "some text",
        date: new Date(),
        author: authUserId,
        chatModel: "Chat",
      });
      const message2 = new Message({
        chat: chat._id,
        text: "more text",
        date: new Date(),
        author: userId,
        chatModel: "Chat",
      });

      await Message.insertMany([message1, message2]);

      const payload = { user_id: userId };
      const response = await request(app)
        .post("/messages")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      for (const i in response.body.messages) {
        expect(response.body.messages[i]).toEqual(
          expect.objectContaining({
            _id: expect.anything(),
            chat: chat._id.toString(),
            text: expect.anything(),
            date: expect.anything(),
            author: expect.anything(),
            date_med: expect.anything(),
            time_simple: expect.anything(),
            chatModel: "Chat",
          })
        );
      }
    });

    test("responses with empty array if chat is not found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const payload = { user_id: userId };
      const response = await request(app)
        .post("/messages")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.messages).toHaveLength(0);
    });
  });

  describe("send_message controller", () => {
    test("responses with error message if chat is not found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const chatFind = await Chat.findOne({ users: [authUserId, userId] });

      expect(chatFind).toBe(null);

      const payload = {
        user_id: userId,
        message: "some text",
      };

      const response = await request(app)
        .post("/send")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.error).toMatch("chat document not found");
    });

    test("responses with existing chat and new message if chat is found", async () => {
      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const chat = new Chat({ users: [authUserId, userId] });
      await chat.save();

      const chatFind = await Chat.findOne({ users: [authUserId, userId] });

      expect(chatFind.users).toEqual([authUserId, userId]);

      const payload = { user_id: userId, message: "some text" };

      const response = await request(app)
        .post("/send")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.chat).toEqual(
        expect.objectContaining({
          users: [authUserId.toString(), userId.toString()],
        })
      );
      expect(response.body.createdMessage).toEqual(
        expect.objectContaining({
          _id: expect.anything(),
          chat: chat._id.toString(),
          text: "some text",
          date: expect.anything(),
          author: authUserId.toString(),
          date_med: expect.anything(),
          time_simple: expect.anything(),
          chatModel: "Chat",
        })
      );
    });
  });

  describe("send_image controller", () => {
    test("responses with error message if chat is not found", async () => {
      fs.writeFileSync("./uploads/test.png", "a");

      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const chatFind = await Chat.findOne({ users: [authUserId, userId] });

      expect(chatFind).toBe(null);

      const payload = { user_id: userId };

      const response = await request(app)
        .post("/send/image")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.error).toMatch("chat document not found");
    });

    test("responses with existing chat and new message if chat is found", async () => {
      fs.writeFileSync("./uploads/test.png", "a");

      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const chat = new Chat({ users: [authUserId, userId] });
      await chat.save();

      const chatFind = await Chat.findOne({ users: [authUserId, userId] });

      expect(chatFind.users).toEqual([authUserId, userId]);

      const payload = { user_id: userId };

      const response = await request(app)
        .post("/send/image")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.chat).toEqual(
        expect.objectContaining({
          users: [authUserId.toString(), userId.toString()],
        })
      );

      expect(response.body.createdImage).toEqual(
        expect.objectContaining({
          _id: expect.anything(),
          chat: chat._id.toString(),
          image: {
            data: expect.objectContaining({
              type: "Buffer",
              data: expect.arrayContaining([expect.anything()]),
            }),
          },
          date: expect.anything(),
          author: authUserId.toString(),
          date_med: expect.anything(),
          time_simple: expect.anything(),
          chatModel: "Chat",
        })
      );
    });
  });
});
