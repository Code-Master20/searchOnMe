const express = require("express");
const { body, param } = require("express-validator");
const {
  createAsset,
  deleteAsset,
  getAssets,
  getUploadSignature
} = require("../controllers/assetController");
const {
  getMessageById,
  getMessages,
  loginAdmin,
  logoutAdmin
} = require("../controllers/adminController");
const { replyToMessage } = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Valid email is required."),
    body("password").notEmpty().withMessage("Password is required.")
  ],
  loginAdmin
);

router.post("/logout", logoutAdmin);

router.get("/messages", authMiddleware, getMessages);
router.get(
  "/messages/:id",
  [authMiddleware, param("id").isMongoId().withMessage("Invalid message id.")],
  getMessageById
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

module.exports = router;
