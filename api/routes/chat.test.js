const request = require("supertest");
const express = require("express");
const chat = require("./chat");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", chat);

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

const messageFindSpy = jest.spyOn(Message, "find");
const chatFindOneSpy = jest.spyOn(Chat, "findOne");

describe("chat routes", () => {
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
});
