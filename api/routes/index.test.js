const { connectDB, dropDB, dropCollections } = require("../setuptestdb");
const request = require("supertest");
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const index = require("./index");
const User = require("../models/userModel");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", index);

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

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn((token, secretOrPublicKey, options, callback) => {
    return callback(null, "123abc$");
  }),
}));

describe("index routes", () => {
  test("index sign-up route responses with created user", async () => {
    const payload = {
      email: "john@doe.com",
      full_name: "foobar",
      password: "johndoefoobar",
      confirm_password: "johndoefoobar",
    };

    const response = await request(app)
      .post("/signup")
      .set("Content-Type", "application/json")
      .send(payload);

    expect(response.header["content-type"]).toMatch(/application\/json/);
    expect(response.status).toEqual(200);

    expect(typeof response.body._id).toBe("string");
    expect(typeof response.body.profile._id).toBe("string");

    expect(response.body.email).toBe("john@doe.com");
    expect(response.body.password).not.toBe("johndoefoobar");
    expect(response.body.profile.full_name).toBe("foobar");
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
