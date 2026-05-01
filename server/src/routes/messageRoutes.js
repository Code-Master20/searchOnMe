const express = require("express");
const { body } = require("express-validator");
const rateLimit = require("express-rate-limit");
const {
  createMessage,
  getMessageResponses,
  verifyMessage
} = require("../controllers/messageController");

const router = express.Router();

const createMessageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many message requests from this IP. Please try again later."
  }
});

const responseLookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many response checks from this IP. Please try again later."
  }
});

router.post(
  "/",
  createMessageLimiter,
  [
    body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 100 }),
    body("email").trim().isEmail().withMessage("Valid email is required."),
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required.")
      .isLength({ max: 5000 })
      .withMessage("Message must not exceed 5000 characters.")
  ],
  createMessage
);

router.get("/verify/:token", verifyMessage);

router.post(
  "/responses",
  responseLookupLimiter,
  [body("email").trim().isEmail().withMessage("Valid email is required.")],
  getMessageResponses
);

module.exports = router;
