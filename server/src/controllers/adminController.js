const crypto = require("crypto");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const Message = require("../models/Message");
const { normalizedAdminEmails, isAllowedAdminEmail } = require("../config/adminEmails");
const { sendAdminOtpEmail } = require("../services/emailService");
const { generateAuthToken } = require("../utils/generateToken");

const getCookieSameSite = () => {
  if (process.env.COOKIE_SAME_SITE) {
    return process.env.COOKIE_SAME_SITE;
  }

  return process.env.NODE_ENV === "production" ? "none" : "lax";
};

const getCookieSecure = () => process.env.NODE_ENV === "production";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: getCookieSecure(),
  sameSite: getCookieSameSite(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
});

const createOtpCode = () => String(crypto.randomInt(100000, 1000000));
const hashOtpCode = (otpCode) => crypto.createHash("sha256").update(String(otpCode)).digest("hex");
const otpLifetimeMs = 10 * 60 * 1000;
const maxPasswordAttempts = 3;

const assertAllowedAdminEmail = (email) => {
  if (!isAllowedAdminEmail(email)) {
    const error = new Error("This email is not allowed for admin access.");
    error.statusCode = 403;
    throw error;
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { email, password } = req.body;
    assertAllowedAdminEmail(email);
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (admin.mustResetPassword) {
      return res.status(423).json({
        message: "Password reset required. Use OTP verification to change the password, then log in again."
      });
    }

    const passwordMatches = await admin.matchPassword(password);

    if (!passwordMatches) {
      admin.failedPasswordAttempts = Number(admin.failedPasswordAttempts || 0) + 1;

      if (admin.failedPasswordAttempts >= maxPasswordAttempts) {
        admin.failedPasswordAttempts = maxPasswordAttempts;
        admin.mustResetPassword = true;
        admin.loginOtpHash = "";
        admin.loginOtpExpiresAt = null;
        await admin.save();

        return res.status(423).json({
          message:
            "Wrong password entered three times. Reset the password with OTP verification, then log in again."
        });
      }

      await admin.save();

      return res.status(401).json({
        message: `Invalid email or password. ${maxPasswordAttempts - admin.failedPasswordAttempts} attempt(s) remaining before password reset is required.`
      });
    }

    const otpCode = createOtpCode();
    admin.failedPasswordAttempts = 0;
    admin.loginOtpHash = hashOtpCode(otpCode);
    admin.loginOtpExpiresAt = new Date(Date.now() + otpLifetimeMs);
    await admin.save();

    await sendAdminOtpEmail(admin.email, otpCode, "login");

    return res.status(200).json({
      message: "OTP sent to your admin email. Enter it to complete login.",
      requiresOtp: true,
      email: admin.email
    });
  } catch (error) {
    return next(error);
  }
};

const verifyAdminLoginOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { email, otp } = req.body;
    assertAllowedAdminEmail(email);
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (
      !admin ||
      !admin.loginOtpHash ||
      !admin.loginOtpExpiresAt ||
      admin.loginOtpExpiresAt.getTime() < Date.now() ||
      admin.loginOtpHash !== hashOtpCode(otp)
    ) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    admin.loginOtpHash = "";
    admin.loginOtpExpiresAt = null;
    await admin.save();

    const token = generateAuthToken(admin._id);
    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      message: "Login successful.",
      token,
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
      secure: getCookieSecure(),
      sameSite: getCookieSameSite(),
      path: "/"
    });

    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    return next(error);
  }
};

const getAdminSession = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId).select("_id email");

    if (!admin) {
      return res.status(401).json({ message: "Invalid or expired session." });
    }

    return res.status(200).json({
      message: "Admin session is active.",
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (error) {
    return next(error);
  }
};

const sendPasswordResetOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { email } = req.body;
    assertAllowedAdminEmail(email);
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(404).json({ message: "Admin account not found for this email." });
    }

    const otpCode = createOtpCode();
    admin.passwordResetOtpHash = hashOtpCode(otpCode);
    admin.passwordResetOtpExpiresAt = new Date(Date.now() + otpLifetimeMs);
    await admin.save();

    await sendAdminOtpEmail(admin.email, otpCode, "password-reset");

    return res.status(200).json({
      message: "Password reset OTP sent to your admin email.",
      email: admin.email
    });
  } catch (error) {
    return next(error);
  }
};

const resetAdminPasswordWithOtp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { email, otp, newPassword } = req.body;
    assertAllowedAdminEmail(email);
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (
      !admin ||
      !admin.passwordResetOtpHash ||
      !admin.passwordResetOtpExpiresAt ||
      admin.passwordResetOtpExpiresAt.getTime() < Date.now() ||
      admin.passwordResetOtpHash !== hashOtpCode(otp)
    ) {
      return res.status(401).json({ message: "Invalid or expired OTP." });
    }

    admin.password = newPassword;
    admin.failedPasswordAttempts = 0;
    admin.mustResetPassword = false;
    admin.passwordResetOtpHash = "";
    admin.passwordResetOtpExpiresAt = null;
    admin.loginOtpHash = "";
    admin.loginOtpExpiresAt = null;
    await admin.save();

    return res.status(200).json({
      message: "Admin password updated successfully."
    });
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
  const adminEmails = normalizedAdminEmails;
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
  getAdminSession,
  getMessages,
  getMessageById,
  verifyAdminLoginOtp,
  sendPasswordResetOtp,
  resetAdminPasswordWithOtp,
  bootstrapAdmin
};
