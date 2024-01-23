const request = require("supertest");
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const index = require("./index");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", index);

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn((token, secretOrPublicKey, options, callback) => {
    return callback(null, "123abc$");
  }),
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn((password, salt, callback) => {
    return callback(null, "hashedpassword");
  }),
}));

const userFindOneSpy = jest.spyOn(User, "findOne");
const userSaveSpy = jest.spyOn(User.prototype, "save");

const profileSaveSpy = jest.spyOn(Profile.prototype, "save");

describe("index routes", () => {
  test("index sign-up route responses with created user", async () => {
    const profile_id = new mongoose.Types.ObjectId();
    const user_id = new mongoose.Types.ObjectId();

    userFindOneSpy.mockResolvedValueOnce(null);
    profileSaveSpy.mockResolvedValueOnce({
      full_name: "foobar",
      _id: profile_id,
    });
    userSaveSpy.mockResolvedValueOnce({
      email: "john@doe.com",
      full_name: "foobar",
      password: "hashedpassword",
      profile: profile_id,
      _id: user_id,
    });

    const payload = {
      email: "john@doe.com",
      full_name: "foobar",
      password: "johndoefoobar",
      confirm_password: "johndoefoobar",
    };

    const resObj = {
      email: "john@doe.com",
      password: "hashedpassword",
      profile: profile_id.toString(),
      _id: user_id.toString(),
    };

    const response = await request(app)
      .post("/signup")
      .set("Content-Type", "application/json")
      .send(payload);

    expect(response.header["content-type"]).toMatch(/application\/json/);
    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject(resObj);
  });

  test("index log-in route responses with token", async () => {
    const hash = bcrypt.hashSync("johndoefoobar", 10);

    const user = new User({
      email: "john@doe.com",
      profile: new mongoose.Types.ObjectId(),
      password: hash,
    });

    await user.save();

    const payload = {
      email: "john@doe.com",
      password: "johndoefoobar",
    };

    const response = await request(app)
      .post("/login")
      .set("Content-Type", "application/json")
      .send(payload);

    expect(response.header["content-type"]).toMatch(/application\/json/);
    expect(response.status).toEqual(200);

    expect(response.body.token).toBe("123abc$");
  });
});
