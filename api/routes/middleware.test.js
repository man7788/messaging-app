const request = require("supertest");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const app = express();

const expressValidator = [
  body("validator_1")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("validator_1 must not be empty"),
  body("validator_2")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("validator_2 must not be empty"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
      });
    }
  }),
];

const jwtVerify = asyncHandler(async (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET, async (err, authData) => {
    if (err) {
      res.json({ error: "invalid token" });
    }
  });
});

router.post("/express-validator", expressValidator);
router.post("/jsonwebtoken", jwtVerify);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", router);

describe("express-validator", () => {
  test("validation failed", async () => {
    const payload = {
      validator_1: "",
      validator_2: "",
    };

    const response = await request(app)
      .post("/express-validator")
      .send(payload);

    expect(response.status).toEqual(200);
    expect(response.body.errors).toHaveLength(2);
    expect(response.body.errors[0].msg).toMatch(
      /validator_1 must not be empty/i
    );
    expect(response.body.errors[1].msg).toMatch(
      /validator_2 must not be empty/i
    );
  });
});

describe("jsonwebtoken", () => {
  test("validation failed", async () => {
    jest.mock("jsonwebtoken", () => ({
      verify: jest.fn((token, secretOrPublicKey, callback) => {
        return callback(true);
      }),
    }));

    const resObj = { error: "invalid token" };

    const response = await request(app).post("/jsonwebtoken");

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(resObj);
  });
});
