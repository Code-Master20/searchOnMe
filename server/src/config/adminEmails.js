const allowedAdminEmails = [
  "sahidurmiah201920@gmail.com",
  "quranhadish700@gmail.com"
];

const normalizedAdminEmails = allowedAdminEmails.map((email) => email.toLowerCase());

const isAllowedAdminEmail = (email = "") => normalizedAdminEmails.includes(String(email).toLowerCase());

module.exports = {
  allowedAdminEmails,
  isAllowedAdminEmail,
  normalizedAdminEmails
};
