const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const Message = require("../models/Message");
const { generateAuthToken } = require("../utils/generateToken");

const getCookieSameSite = () => process.env.COOKIE_SAME_SITE || "strict";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: getCookieSameSite(),
  maxAge: 7 * 24 * 60 * 60 * 1000
});

const loginAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateAuthToken(admin._id);
    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      message: "Login successful.",
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    return next(error);
  }
};

const logoutAdmin = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: getCookieSameSite()
    });

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: messages });
  } catch (error) {
    return next(error);
  }
};

const getMessageById = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    return res.status(200).json({ data: message });
  } catch (error) {
    return next(error);
  }
};

const bootstrapAdmin = async () => {
  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmails.length === 0 || !adminPassword) {
    console.warn(
      "Admin bootstrap skipped. Set ADMIN_EMAILS and ADMIN_PASSWORD in your environment."
    );
    return;
  }

  for (const adminEmail of adminEmails) {
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      const passwordMatches = await existingAdmin.matchPassword(adminPassword);

      if (!passwordMatches) {
        existingAdmin.password = adminPassword;
        await existingAdmin.save();
        console.log(`Admin password synced for ${adminEmail}`);
      }

      continue;
    }

    await Admin.create({
      email: adminEmail,
      password: adminPassword
    });

    console.log(`Admin account created for ${adminEmail}`);
  }
};

module.exports = {
  loginAdmin,
  logoutAdmin,
  getMessages,
  getMessageById,
  bootstrapAdmin
};
