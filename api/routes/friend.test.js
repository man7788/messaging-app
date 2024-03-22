const request = require("supertest");
const express = require("express");
const app = express();

const friend = require("./friend");
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
  });
});
