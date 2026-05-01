const express = require("express");
const { body } = require("express-validator");
const {
  createMessage,
  getMessageResponses,
  verifyMessage
} = require("../controllers/messageController");

const router = express.Router();

router.post(
  "/",
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
  [body("email").trim().isEmail().withMessage("Valid email is required.")],
  getMessageResponses
);

module.exports = router;
