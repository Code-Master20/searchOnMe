const express = require("express");
const { body, param } = require("express-validator");
const {
  getAdminAboutContent,
  updateAboutContent
} = require("../controllers/aboutContentController");
const {
  createAsset,
  deleteAsset,
  getAssets,
  getUploadSignature
} = require("../controllers/assetController");
const {
  createProject,
  deleteProject,
  getAdminProjects,
  updateProject
} = require("../controllers/projectController");
const {
  getAdminSession,
  getMessageById,
  getMessages,
  loginAdmin,
  logoutAdmin,
  resetAdminPasswordWithOtp,
  sendPasswordResetOtp,
  verifyAdminLoginOtp
} = require("../controllers/adminController");
const { deleteMessage, replyToMessage } = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
const aboutContentValidators = [
  body("headingTitle")
    .trim()
    .notEmpty()
    .withMessage("About heading is required.")
    .isLength({ max: 240 })
    .withMessage("About heading must not exceed 240 characters."),
  body("profileEyebrow")
    .trim()
    .notEmpty()
    .withMessage("Profile eyebrow is required.")
    .isLength({ max: 120 })
    .withMessage("Profile eyebrow must not exceed 120 characters."),
  body("profileTitle")
    .trim()
    .notEmpty()
    .withMessage("Profile title is required.")
    .isLength({ max: 140 })
    .withMessage("Profile title must not exceed 140 characters."),
  body("profileBody")
    .trim()
    .notEmpty()
    .withMessage("Profile body is required.")
    .isLength({ max: 3000 })
    .withMessage("Profile body must not exceed 3000 characters."),
  body("educationEyebrow")
    .trim()
    .notEmpty()
    .withMessage("Education eyebrow is required.")
    .isLength({ max: 120 })
    .withMessage("Education eyebrow must not exceed 120 characters."),
  body("educationTitle")
    .trim()
    .notEmpty()
    .withMessage("Education title is required.")
    .isLength({ max: 160 })
    .withMessage("Education title must not exceed 160 characters."),
  body("educationBody")
    .trim()
    .notEmpty()
    .withMessage("Education body is required.")
    .isLength({ max: 3000 })
    .withMessage("Education body must not exceed 3000 characters."),
  body("highlights")
    .isArray({ min: 1, max: 6 })
    .withMessage("Highlights must include between 1 and 6 cards."),
  body("highlights.*.title")
    .trim()
    .notEmpty()
    .withMessage("Each highlight title is required.")
    .isLength({ max: 120 })
    .withMessage("Highlight titles must not exceed 120 characters."),
  body("highlights.*.body")
    .trim()
    .notEmpty()
    .withMessage("Each highlight body is required.")
    .isLength({ max: 2000 })
    .withMessage("Highlight body must not exceed 2000 characters."),
  body("assetEyebrow")
    .trim()
    .notEmpty()
    .withMessage("Asset eyebrow is required.")
    .isLength({ max: 120 })
    .withMessage("Asset eyebrow must not exceed 120 characters."),
  body("assetTitle")
    .trim()
    .notEmpty()
    .withMessage("Asset title is required.")
    .isLength({ max: 220 })
    .withMessage("Asset title must not exceed 220 characters."),
  body("assetBody")
    .trim()
    .notEmpty()
    .withMessage("Asset body is required.")
    .isLength({ max: 3000 })
    .withMessage("Asset body must not exceed 3000 characters.")
];
const projectValidators = [
  body("eyebrow")
    .trim()
    .notEmpty()
    .withMessage("Eyebrow is required.")
    .isLength({ max: 80 })
    .withMessage("Eyebrow must not exceed 80 characters."),
  body("tag")
    .trim()
    .notEmpty()
    .withMessage("Tag is required.")
    .isLength({ max: 120 })
    .withMessage("Tag must not exceed 120 characters."),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 120 })
    .withMessage("Title must not exceed 120 characters."),
  body("body")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ max: 5000 })
    .withMessage("Description must not exceed 5000 characters."),
  body("imageUrl").optional().isURL().withMessage("Project image must be a valid URL."),
  body("imageAlt")
    .optional()
    .trim()
    .isLength({ max: 180 })
    .withMessage("Image alt text must not exceed 180 characters."),
  body("images").optional({ nullable: true }).isArray().withMessage("Images must be an array."),
  body("images.*.imageUrl")
    .optional()
    .isURL()
    .withMessage("Each project image must be a valid URL."),
  body("images.*.imageAlt")
    .optional()
    .trim()
    .isLength({ max: 180 })
    .withMessage("Each image alt text must not exceed 180 characters."),
  body("points")
    .optional({ nullable: true })
    .isArray({ max: 8 })
    .withMessage("Points must be an array with up to 8 items."),
  body("points.*")
    .optional()
    .isString()
    .withMessage("Each point must be text.")
    .trim()
    .notEmpty()
    .withMessage("Project points cannot be empty."),
  body("featured").isBoolean().withMessage("Featured must be true or false."),
  body("displayOrder")
    .optional()
    .isInt({ min: 0, max: 999 })
    .withMessage("Display order must be between 0 and 999.")
];

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Valid email is required."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  loginAdmin
);
router.post(
  "/login/verify-otp",
  [
    body("email").trim().isEmail().withMessage("Valid email is required."),
    body("otp")
      .trim()
      .matches(/^\d{6}$/)
      .withMessage("OTP must be a 6-digit code.")
  ],
  verifyAdminLoginOtp
);
router.post(
  "/password-reset/request-otp",
  [body("email").trim().isEmail().withMessage("Valid email is required.")],
  sendPasswordResetOtp
);
router.post(
  "/password-reset/complete",
  [
    body("email").trim().isEmail().withMessage("Valid email is required."),
    body("otp")
      .trim()
      .matches(/^\d{6}$/)
      .withMessage("OTP must be a 6-digit code."),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long.")
  ],
  resetAdminPasswordWithOtp
);

router.post("/logout", logoutAdmin);
router.get("/session", authMiddleware, getAdminSession);

router.get("/about-content", authMiddleware, getAdminAboutContent);
router.put("/about-content", [authMiddleware, ...aboutContentValidators], updateAboutContent);

router.get("/messages", authMiddleware, getMessages);
router.get(
  "/messages/:id",
  [authMiddleware, param("id").isMongoId().withMessage("Invalid message id.")],
  getMessageById
);
router.delete(
  "/messages/:id",
  [authMiddleware, param("id").isMongoId().withMessage("Invalid message id.")],
  deleteMessage
);
router.post(
  "/reply/:id",
  [
    authMiddleware,
    param("id").isMongoId().withMessage("Invalid message id."),
    body("reply")
      .trim()
      .notEmpty()
      .withMessage("Reply is required.")
      .isLength({ max: 5000 })
      .withMessage("Reply must not exceed 5000 characters.")
  ],
  replyToMessage
);

router.post(
  "/assets/signature",
  [
    authMiddleware,
    body("category")
      .isIn(["resume", "education", "image"])
      .withMessage("Category must be resume, education, or image.")
  ],
  getUploadSignature
);
router.get("/assets", authMiddleware, getAssets);
router.post(
  "/assets",
  [
    authMiddleware,
    body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 160 }),
    body("category")
      .isIn(["resume", "education", "image"])
      .withMessage("Category must be resume, education, or image."),
    body("originalName").trim().notEmpty().withMessage("Original file name is required."),
    body("secureUrl").trim().isURL().withMessage("Cloudinary secure URL is required."),
    body("publicId").trim().notEmpty().withMessage("Cloudinary public id is required."),
    body("resourceType").trim().notEmpty().withMessage("Cloudinary resource type is required."),
    body("format").optional().trim(),
    body("bytes").optional().isNumeric().withMessage("Bytes must be numeric.")
  ],
  createAsset
);
router.delete(
  "/assets/:id",
  [authMiddleware, param("id").isMongoId().withMessage("Invalid asset id.")],
  deleteAsset
);
router.get("/projects", authMiddleware, getAdminProjects);
router.post("/projects", [authMiddleware, ...projectValidators], createProject);
router.put(
  "/projects/:id",
  [authMiddleware, param("id").isMongoId().withMessage("Invalid project id."), ...projectValidators],
  updateProject
);
router.delete(
  "/projects/:id",
  [authMiddleware, param("id").isMongoId().withMessage("Invalid project id.")],
  deleteProject
);

module.exports = router;
