const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);
const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

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

const sendVerificationEmail = async (email, token, name) => {
  const verificationLink = getVerificationLink(token);
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(verificationLink);

  await resend.emails.send({
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

  await resend.emails.send({
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

  await resend.emails.send({
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

module.exports = {
  sendVerificationEmail,
  sendAdminNotification,
  sendReplyEmail
};
