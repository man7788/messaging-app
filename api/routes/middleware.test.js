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

router.post("/express-validator", expressValidator);
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
  });
});
