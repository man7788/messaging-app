const { connectDB, dropDB, dropCollections } = require("../setuptestdb");
const request = require("supertest");
const express = require("express");
const app = express();

const user = require("./user");
const User = require("../models/userModel");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", user);

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await dropDB();
});

afterEach(async () => {
  await dropCollections();
});

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock("../controllers/verifyToken", () => ({
  verifyToken: jest.fn((req, res, next) => next()),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token, secretOrPublicKey, callback) => {
    return callback(null, "123abc$");
  }),
}));

jest.spyOn(User, "find").mockReturnValue({
  populate: jest.fn().mockResolvedValueOnce([
    {
      email: "john@doe.com",
      profile: { _id: "123abc$", full_name: "john doe" },
      password: "johndoe123",
      _id: "$abc123",
    },
    {
      email: "foo@bar.com",
      profile: { _id: "$abc123", full_name: "foo bar" },
      password: "foobar123",
      _id: "$abc456",
    },
  ]),
});

describe("user routes", () => {
  test("responses with a list of all user profiles", async () => {
    const resObj = {
      profiles: [
        { user_id: "$abc123", _id: "123abc$", full_name: "john doe" },
        { user_id: "$abc456", _id: "$abc123", full_name: "foo bar" },
      ],
    };
    const response = await request(app)
      .get("/profiles")
      .set("Content-Type", "application/json");

    expect(response.header["content-type"]).toMatch(/application\/json/);
    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject(resObj);
  });
});
