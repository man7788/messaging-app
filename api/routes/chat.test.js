const request = require("supertest");
const express = require("express");
const chat = require("./chat");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", chat);

const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

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

jest.mock("multer", () => {
  const multer = () => ({
    single: () => {
      return (req, res, next) => {
        req.file = {
          filename: "some name",
        };
        return next();
      };
    },
  });
  multer.diskStorage = () => jest.fn();
  return multer;
});

jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  promises: { unlink: () => jest.fn().mockResolvedValueOnce() },
}));

const messageFindSpy = jest.spyOn(Message, "find");
const messageSaveSpy = jest.spyOn(Message.prototype, "save");
const chatFindOneSpy = jest.spyOn(Chat, "findOne");
const chatSaveSpy = jest.spyOn(Chat.prototype, "save");

const chat_id = new mongoose.Types.ObjectId();
const user_id_1 = new mongoose.Types.ObjectId();
const user_id_2 = new mongoose.Types.ObjectId();

describe("chat routes", () => {
  describe("chat_messages controller", () => {
    test("responses with chat messages", async () => {
      chatFindOneSpy.mockResolvedValueOnce(true);

      messageFindSpy.mockReturnValueOnce({
        sort: jest
          .fn()
          .mockResolvedValueOnce([
            { text: "Get to the chopper!" },
            { text: "I'll be back." },
          ]),
      });

      const payload = {
        user_id: "123",
      };

      const resObj = {
        messages: [{ text: "Get to the chopper!" }, { text: "I'll be back." }],
      };

      const response = await request(app)
        .post("/messages")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body).toMatchObject(resObj);
    });

    test("responses with null", async () => {
      chatFindOneSpy.mockResolvedValueOnce(false);

      const payload = {
        user_id: "abc",
      };

      const resObj = {
        messages: null,
      };

      const response = await request(app)
        .post("/messages")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body).toMatchObject(resObj);
    });
  });

  describe("send_message controller", () => {
    test("responses with new chat and new message", async () => {
      const date = new Date();

      chatFindOneSpy.mockResolvedValueOnce(false);

      chatSaveSpy.mockResolvedValueOnce({
        users: [user_id_1, user_id_2],
        _id: chat_id,
      });

      messageSaveSpy.mockResolvedValueOnce({
        chat: chat_id,
        text: "Get to the chopper!",
        date: date,
        author: user_id_1,
      });

      const payload = {
        user_id: user_id_2,
        message: "Get to the chopper!",
      };

      const resObj = {
        chat: {
          users: [user_id_1.toString(), user_id_2.toString()],
          _id: chat_id.toString(),
        },
        createdMessage: {
          chat: chat_id.toString(),
          text: "Get to the chopper!",
          date: date.toISOString(),
          author: user_id_1.toString(),
        },
      };

      const response = await request(app)
        .post("/send")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body).toMatchObject(resObj);
    });

    test("responses with existing chat and new message", async () => {
      const date = new Date();

      chatFindOneSpy.mockResolvedValueOnce({
        users: [user_id_1, user_id_2],
        _id: chat_id,
      });

      messageSaveSpy.mockResolvedValueOnce({
        chat: chat_id,
        text: "Get to the chopper!",
        date: date,
        author: user_id_1,
      });

      const payload = {
        user_id: user_id_2,
        message: "Get to the chopper!",
      };

      const resObj = {
        chat: {
          users: [user_id_1.toString(), user_id_2.toString()],
          _id: chat_id.toString(),
        },
        createdMessage: {
          chat: chat_id.toString(),
          text: "Get to the chopper!",
          date: date.toISOString(),
          author: user_id_1.toString(),
        },
      };

      const response = await request(app)
        .post("/send")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body).toMatchObject(resObj);
    });
  });

  describe("send_image controller", () => {
    test("responses with existing chat and new image", async () => {
      const date = new Date();

      chatFindOneSpy.mockResolvedValueOnce(false);

      chatSaveSpy.mockResolvedValueOnce({
        users: [user_id_1, user_id_2],
        _id: chat_id,
      });

      messageSaveSpy.mockResolvedValueOnce({
        chat: chat_id,
        image: { imageFile: {} },
        date: date,
        author: user_id_1,
      });

      const payload = {
        user_id: user_id_2,
        image: { imageFile: {} },
      };

      const resObj = {
        chat: {
          users: [user_id_1.toString(), user_id_2.toString()],
          _id: chat_id.toString(),
        },
        savedImage: {
          chat: chat_id.toString(),
          image: { imageFile: {} },
          date: date.toISOString(),
          author: user_id_1.toString(),
        },
      };

      const response = await request(app).post("/send/image").send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject(resObj);
    });

    test("responses with new chat and new image", async () => {
      const date = new Date();

      chatFindOneSpy.mockResolvedValueOnce({
        users: [user_id_1, user_id_2],
        _id: chat_id,
      });

      chatSaveSpy.mockResolvedValueOnce({
        users: [user_id_1, user_id_2],
        _id: chat_id,
      });

      messageSaveSpy.mockResolvedValueOnce({
        chat: chat_id,
        image: { imageFile: {} },
        date: date,
        author: user_id_1,
      });

      const payload = {
        user_id: user_id_2,
        image: { imageFile: {} },
      };

      const resObj = {
        chat: {
          users: [user_id_1.toString(), user_id_2.toString()],
          _id: chat_id.toString(),
        },
        savedImage: {
          chat: chat_id.toString(),
          image: { imageFile: {} },
          date: date.toISOString(),
          author: user_id_1.toString(),
        },
      };

      const response = await request(app).post("/send/image").send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject(resObj);
    });
  });
});
