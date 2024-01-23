const { connectDB, dropDB, dropCollections } = require("../setuptestdb");
const request = require("supertest");
const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const user = require("./user");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const mongoose = require("mongoose");

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
  jest.clearAllMocks();
});

afterEach(() => {});

jest.mock("../controllers/verifyToken", () => ({
  verifyToken: jest.fn((req, res, next) => next()),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn((token, secretOrPublicKey, callback) => {
    return callback(null, { user: { _id: "123" } });
  }),
}));

const userFindSpy = jest.spyOn(User, "find");
const userFindByIdSpy = jest.spyOn(User, "findById");
const profileFindByIdSpy = jest.spyOn(Profile, "findById");
const profileFindByIdAndUpdateSpy = jest.spyOn(Profile, "findByIdAndUpdate");

// jest.mock("../models/userModel", () => ({
//   findById: jest.fn().mockReturnValue({
//     populate: jest.fn().mockResolvedValueOnce({
//       email: "john@doe.com",
//       profile: { _id: "123abc$", full_name: "john doe" },
//       password: "johndoe123",
//       _id: "$abc123",
//     }),
//   }),
// }));

describe("user routes", () => {
  test("responses with a list of all user profiles", async () => {
    userFindSpy.mockReturnValue({
      populate: jest.fn().mockResolvedValue([
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

  test("responses with verified login user profile", async () => {
    userFindByIdSpy.mockReturnValue({
      populate: jest.fn().mockResolvedValueOnce({
        email: "john@doe.com",
        profile: { _id: "123abc$", full_name: "john doe" },
        password: "johndoe123",
        _id: "$abc123",
      }),
    });

    const resObj = {
      user: {
        email: "john@doe.com",
        profile: { _id: "123abc$", full_name: "john doe" },
        password: "johndoe123",
        _id: "$abc123",
      },
    };

    const response = await request(app)
      .get("/status")
      .set("Content-Type", "application/json");

    expect(response.header["content-type"]).toMatch(/application\/json/);
    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject(resObj);
  });

  test("responses with edited profile", async () => {
    const profile_id = new mongoose.Types.ObjectId();

    profileFindByIdSpy.mockResolvedValueOnce({
      _id: profile_id,
      full_name: "john doe",
    });

    profileFindByIdAndUpdateSpy.mockResolvedValueOnce({
      _id: profile_id,
      full_name: "john doe",
    });

    const payload = {
      profile_id: profile_id,
      new_full_name: "new john doe",
      new_about: "new about",
    };

    const resObj = {
      updated_profile: {
        _id: profile_id.toString(),
        full_name: "new john doe",
        about: "new about",
      },

      previous_profile: {
        _id: profile_id.toString(),
        full_name: "john doe",
      },
    };

    const response = await request(app)
      .post("/profile/edit")
      .set("Content-Type", "application/json")
      .send(payload);

    expect(response.header["content-type"]).toMatch(/application\/json/);
    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject(resObj);
  });
});
