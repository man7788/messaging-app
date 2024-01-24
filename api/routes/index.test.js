const request = require("supertest");
const express = require("express");
const app = express();

const mongoose = require("mongoose");

const index = require("./index");
const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const { errorMonitor } = require("supertest/lib/test");

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
  compare: jest.fn(() => true),
}));

const userFindOneSpy = jest.spyOn(User, "findOne");
const userSaveSpy = jest.spyOn(User.prototype, "save");
const profileSaveSpy = jest.spyOn(Profile.prototype, "save");

const profile_id = new mongoose.Types.ObjectId();
const user_id = new mongoose.Types.ObjectId();

describe("index routes", () => {
  describe("sign-up controller", () => {
    beforeEach(() => {
      userFindOneSpy.mockResolvedValueOnce(null);
    });

    test("successful sign-up responses with created user", async () => {
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

    test("unsuccessful sign-up responses with validation errors", async () => {
      const payload = {
        email: "",
        full_name: "",
        password: "",
        confirm_password: "",
      };

      const response = await request(app)
        .post("/signup")
        .set("Content-Type", "application/json")
        .send(payload);

      expect(response.header["content-type"]).toMatch(/application\/json/);
      expect(response.status).toEqual(200);

      expect(response.body.errors).not.toBeUndefined();
      expect(response.body.errors).not.toHaveLength(0);
    });
  });

  test("index log-in route responses with token", async () => {
    userFindOneSpy.mockResolvedValueOnce(true);

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
