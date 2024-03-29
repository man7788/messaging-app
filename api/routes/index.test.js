const request = require("supertest");
const express = require("express");
const index = require("./index");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", index);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Profile = require("../models/profileModel");
const userFindOneSpy = jest.spyOn(User, "findOne");
const userSaveSpy = jest.spyOn(User.prototype, "save");
const profileSaveSpy = jest.spyOn(Profile.prototype, "save");

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const profile_id = new mongoose.Types.ObjectId();
const user_id = new mongoose.Types.ObjectId();

describe("index routes", () => {
  describe("sign-up controller", () => {
    beforeEach(() => {
      userFindOneSpy.mockResolvedValueOnce(null);
    });

    test("successful sign-up responses with created user", async () => {
      bcrypt.hash.mockImplementationOnce((password, salt, callback) => {
        return callback(null, "hashedpassword");
      });

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
  });

  describe("log-in controller", () => {
    describe("successful log-in", () => {
      test("manual log-in responses with token", async () => {
        userFindOneSpy.mockResolvedValueOnce(true);
        bcrypt.compare.mockImplementationOnce(() => true);
        jwt.sign.mockImplementationOnce(
          (token, secretOrPublicKey, options, callback) => {
            return callback(null, "123abc$");
          }
        );

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

      test("auto log-in responses with token", async () => {
        userFindOneSpy.mockResolvedValueOnce({
          email: "john@doe.com",
          password: "johndoefoobar",
        });
        jwt.sign.mockImplementationOnce(
          (token, secretOrPublicKey, options, callback) => {
            return callback(null, "123abc$");
          }
        );

        const payload = {
          email: "john@doe.com",
          password: "placeholder",
          auto_login: "johndoefoobar",
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

    describe("failed log-in", () => {
      test("responses with user not found", async () => {
        userFindOneSpy.mockResolvedValueOnce(null);

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

        expect(response.body.errors[0].msg).toMatch(/User Not Found/i);
      });

      test("manual log-in responses with incorrect password", async () => {
        userFindOneSpy.mockResolvedValueOnce(true);
        bcrypt.compare.mockImplementationOnce(() => false);

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

        expect(response.body.errors[0].msg).toMatch(/Incorrect Password/i);
      });

      test("auto log-in responses with incorrect password", async () => {
        userFindOneSpy.mockResolvedValueOnce({
          email: "john@doe.com",
          password: "johndoefoobar",
        });

        const payload = {
          email: "john@doe.com",
          password: "wrongpassword",
        };

        const response = await request(app)
          .post("/login")
          .set("Content-Type", "application/json")
          .send(payload);

        expect(response.header["content-type"]).toMatch(/application\/json/);
        expect(response.status).toEqual(200);

        expect(response.body.errors[0].msg).toMatch(/Incorrect Password/i);
      });
    });
  });
});
