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

jest.mock("multer", () => {
  const multer = () => ({
    single: () => {
      return (req, res, next) => {
        req.file = {
          filename: "test.json",
          mimetype: "application/json",
          path: "./uploads/test.json",
        };
        return next();
      };
    },
  });
  multer.diskStorage = () => jest.fn();
  return multer;
});

describe("group routes", () => {
  describe("group_image controller", () => {
    test("responses with validation error", async () => {
      fs.writeFileSync("./uploads/test.json", "a");

      const authUserId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      jwt.verify.mockImplementationOnce(
        (token, secretOrPublicKey, callback) => {
          return callback(null, { user: { _id: authUserId } });
        }
      );

      const payload = { user_id: userId };

      const response = await request(app).post("/send/image").send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);
      expect(response.body.errors[0].msg).toMatch(/invalid image format/i);
    });
  });
});
