const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const generateAuthToken = (adminId) =>
  jwt.sign({ adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const generateVerificationToken = () => crypto.randomBytes(32).toString("hex");

module.exports = {
  generateAuthToken,
  generateVerificationToken
};
