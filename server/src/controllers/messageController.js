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

const buildVerificationRedirectUrl = (result) => {
  const clientUrl = process.env.CLIENT_URL || "/";

  if (clientUrl === "/") {
    return `/contact?verification=${encodeURIComponent(result)}#contact`;
  }

  const normalizedBase = clientUrl.endsWith("/") ? clientUrl : `${clientUrl}/`;
  const redirectUrl = new URL("contact", normalizedBase);
  redirectUrl.searchParams.set("verification", result);
  redirectUrl.hash = "contact";
  return redirectUrl.toString();
};

const sendVerificationResponse = (req, res, statusCode, title, message, result) => {
  const acceptHeader = req.get("accept") || "";

  if (!acceptHeader.includes("text/html")) {
    return res.status(statusCode).json({ message });
  }

  return res.redirect(303, buildVerificationRedirectUrl(result));
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
      .select("_id message reply status createdAt updatedAt")
      .sort({ createdAt: -1 });

    const responses = messages.map((message) => ({
      id: message._id,
      message: message.message,
      reply: message.reply || "",
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
        "This verification link is invalid or has already expired.",
        "invalid"
      );
    }

    if (savedMessage.isVerified) {
      return sendVerificationResponse(
        req,
        res,
        200,
        "Already confirmed",
        "Your message was already verified earlier, so everything is in place.",
        "confirmed"
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
      "Your message has been successfully sent. Sahidur Miah has been notified.",
      "success"
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
