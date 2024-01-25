const request = require("supertest");
const express = require("express");
const router = express.Router();
const { verifyToken } = require("./verifyToken");
const app = express();

router.post("/", verifyToken, (req, res, next) => {
  res.send("request verified");
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", router);

describe("verifyToken", () => {
  test("request has authorization token", async () => {
    const response = await request(app)
      .post("/")
      .set("Authorization", `Bearer abc123`);

    expect(response.status).toEqual(200);
    expect(response.text).toMatch(/request verified/i);
  });
});
