const { validationResult } = require("express-validator");
const Message = require("../models/Message");
const {
  sendAdminNotification,
  sendReplyEmail,
  sendVerificationEmail
} = require("../services/emailService");
const { generateVerificationToken } = require("../utils/generateToken");

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sendVerificationResponse = (req, res, statusCode, title, message) => {
  const acceptHeader = req.get("accept") || "";
  const backUrl = escapeHtml(process.env.CLIENT_URL || "/");

  if (!acceptHeader.includes("text/html")) {
    return res.status(statusCode).json({ message });
  }

  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);

  return res.status(statusCode).send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #07111f;
        --panel: rgba(8, 18, 36, 0.86);
        --border: rgba(163, 230, 53, 0.24);
        --accent: #c5ff6a;
        --accent-soft: #83e8ff;
        --text: #f7f8fc;
        --muted: #b7c2d8;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(131, 232, 255, 0.18), transparent 35%),
          radial-gradient(circle at bottom right, rgba(197, 255, 106, 0.18), transparent 40%),
          linear-gradient(135deg, #040913 0%, #07111f 55%, #0d1526 100%);
        color: var(--text);
      }
      .card {
        width: min(100%, 680px);
        padding: 40px;
        border-radius: 28px;
        border: 1px solid var(--border);
        background: var(--panel);
        backdrop-filter: blur(22px);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
      }
      .eyebrow {
        margin: 0 0 12px;
        font-size: 0.82rem;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: var(--accent-soft);
      }
      h1 {
        margin: 0 0 16px;
        font-size: clamp(2rem, 5vw, 3.2rem);
        line-height: 1;
      }
      p {
        margin: 0;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.7;
      }
      a {
        display: inline-flex;
        margin-top: 24px;
        color: #04111f;
        background: linear-gradient(135deg, var(--accent), #e9ffaf);
        padding: 14px 18px;
        border-radius: 999px;
        font-weight: 700;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <p class="eyebrow">searchOnMe verification</p>
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
      <a href="${backUrl}">Back to portfolio</a>
    </main>
  </body>
</html>`);
};

const createMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { name, email, message } = req.body;
    const verificationToken = generateVerificationToken();

    const savedMessage = await Message.create({
      name,
      email,
      message,
      verificationToken
    });

    try {
      await sendVerificationEmail(savedMessage.email, verificationToken, savedMessage.name);
    } catch (emailError) {
      await Message.findByIdAndDelete(savedMessage._id);
      console.error("Verification email failed", {
        to: savedMessage.email,
        provider: emailError.provider,
        providerStatusCode: emailError.providerStatusCode,
        providerName: emailError.providerName,
        providerMessage: emailError.message
      });
      emailError.statusCode = 502;
      emailError.message =
        "Unable to send the verification email right now. Please check the email address or try again later.";
      throw emailError;
    }

    return res.status(201).json({
      message: "Verification email sent. Please confirm your email to complete the message."
    });
  } catch (error) {
    return next(error);
  }
};

const getMessageResponses = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const email = req.body.email.toLowerCase();
    const messages = await Message.find({ email, isVerified: true })
      .select("_id status createdAt updatedAt")
      .sort({ createdAt: -1 });

    const responses = messages.map((message) => ({
      id: message._id,
      status: message.status === "replied" ? "replied" : "pending",
      submittedAt: message.createdAt,
      repliedAt: message.status === "replied" ? message.updatedAt : null
    }));

    return res.status(200).json({ data: responses });
  } catch (error) {
    return next(error);
  }
};

const verifyMessage = async (req, res, next) => {
  try {
    const { token } = req.params;
    const savedMessage = await Message.findOne({ verificationToken: token });

    if (!savedMessage) {
      return sendVerificationResponse(
        req,
        res,
        404,
        "Link not valid",
        "This verification link is invalid or has already expired."
      );
    }

    if (savedMessage.isVerified) {
      return sendVerificationResponse(
        req,
        res,
        200,
        "Already confirmed",
        "Your message was already verified earlier, so everything is in place."
      );
    }

    savedMessage.isVerified = true;
    savedMessage.status = "confirmed";
    await savedMessage.save();

    await sendAdminNotification(savedMessage);

    return sendVerificationResponse(
      req,
      res,
      200,
      "Message confirmed",
      "Your message has been successfully sent. Sahidur Miah has been notified."
    );
  } catch (error) {
    return next(error);
  }
};

const replyToMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const messageRecord = await Message.findById(req.params.id);

    if (!messageRecord) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (!messageRecord.isVerified) {
      return res.status(400).json({ message: "Cannot reply before the message is verified." });
    }

    const { reply } = req.body;
    messageRecord.reply = reply;
    messageRecord.status = "replied";
    await messageRecord.save();

    await sendReplyEmail(messageRecord.email, reply, messageRecord.name);

    return res.status(200).json({
      message: "Reply sent successfully.",
      data: messageRecord
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createMessage,
  getMessageResponses,
  verifyMessage,
  replyToMessage
};
