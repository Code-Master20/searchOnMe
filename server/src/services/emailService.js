const { Resend } = require("resend");
const { normalizedAdminEmails } = require("../config/adminEmails");

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const adminEmails = normalizedAdminEmails;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getVerificationLink = (token) => {
  const baseUrl = process.env.APP_BASE_URL || "http://localhost:5000";
  return `${baseUrl}/api/messages/verify/${token}`;
};

const assertEmailConfig = () => {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!fromAddress) {
    throw new Error("EMAIL_FROM is not configured.");
  }
};

const sendEmail = async (emailOptions) => {
  assertEmailConfig();

  const { data, error } = await resend.emails.send(emailOptions);

  if (error) {
    const message = error.message || "Email provider rejected the request.";
    const sendError = new Error(message);
    sendError.provider = "resend";
    sendError.providerStatusCode = error.statusCode;
    sendError.providerName = error.name;
    throw sendError;
  }

  return data;
};

const sendVerificationEmail = async (email, token, name) => {
  const verificationLink = getVerificationLink(token);
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(verificationLink);

  return sendEmail({
    from: fromAddress,
    to: email,
    subject: "Verify your searchOnMe message",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Hello${safeName ? ` ${safeName}` : ""},</h2>
        <p>Thanks for reaching out through searchOnMe.</p>
        <p>Please verify your email address to confirm your message submission.</p>
        <p>
          <a href="${safeLink}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">
            Verify Message
          </a>
        </p>
        <p>If the button does not work, use this link:</p>
        <p>${safeLink}</p>
      </div>
    `
  });
};

const sendAdminNotification = async (message) => {
  const safeName = escapeHtml(message.name);
  const safeEmail = escapeHtml(message.email);
  const safeMessage = escapeHtml(message.message);

  if (adminEmails.length === 0) {
    throw new Error("No admin notification email is configured.");
  }

  return sendEmail({
    from: fromAddress,
    to: adminEmails,
    subject: "New verified message on searchOnMe",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>New verified contact message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      </div>
    `
  });
};

const sendReplyEmail = async (email, reply, name) => {
  const safeName = escapeHtml(name);
  const safeReply = escapeHtml(reply);

  return sendEmail({
    from: fromAddress,
    to: email,
    subject: "Reply from searchOnMe",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Hello${safeName ? ` ${safeName}` : ""},</h2>
        <p>Thanks for your message. Here is the reply from searchOnMe:</p>
        <p>${safeReply}</p>
      </div>
    `
  });
};

const sendAdminOtpEmail = async (email, otpCode, purpose) => {
  const safeCode = escapeHtml(otpCode);
  const isPasswordReset = purpose === "password-reset";
  const title = isPasswordReset ? "Admin password reset verification" : "Admin login verification";
  const intro = isPasswordReset
    ? "Use this one-time password to change your searchOnMe admin password."
    : "Use this one-time password to finish signing in to the searchOnMe admin area.";

  return sendEmail({
    from: fromAddress,
    to: email,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>${title}</h2>
        <p>${intro}</p>
        <p style="font-size: 2rem; font-weight: 700; letter-spacing: 0.24em; margin: 20px 0;">${safeCode}</p>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, you can safely ignore the email.</p>
      </div>
    `
  });
};

module.exports = {
  sendAdminOtpEmail,
  sendVerificationEmail,
  sendAdminNotification,
  sendReplyEmail
};
