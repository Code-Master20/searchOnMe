const { validationResult } = require("express-validator");
const defaultAboutContent = require("../data/defaultAboutContent");
const AboutContent = require("../models/AboutContent");

const normalizeHighlights = (highlights = []) =>
  Array.isArray(highlights)
    ? highlights
        .map((item) => ({
          title: String(item?.title || "").trim(),
          body: String(item?.body || "").trim()
        }))
        .filter((item) => item.title && item.body)
        .slice(0, 6)
    : [];

const normalizeAboutPayload = (payload = {}) => ({
  headingTitle: String(payload.headingTitle || "").trim(),
  profileEyebrow: String(payload.profileEyebrow || "").trim(),
  profileTitle: String(payload.profileTitle || "").trim(),
  profileBody: String(payload.profileBody || "").trim(),
  educationEyebrow: String(payload.educationEyebrow || "").trim(),
  educationTitle: String(payload.educationTitle || "").trim(),
  educationBody: String(payload.educationBody || "").trim(),
  highlights: normalizeHighlights(payload.highlights),
  assetEyebrow: String(payload.assetEyebrow || "").trim(),
  assetTitle: String(payload.assetTitle || "").trim(),
  assetBody: String(payload.assetBody || "").trim()
});

const findOrCreateAboutContent = async () => {
  let content = await AboutContent.findOne({ key: "default" });

  if (!content) {
    content = await AboutContent.create(defaultAboutContent);
  }

  return content;
};

const getAboutContent = async (req, res, next) => {
  try {
    const content = await findOrCreateAboutContent();
    return res.status(200).json({ data: content });
  } catch (error) {
    return next(error);
  }
};

const getAdminAboutContent = async (req, res, next) => {
  try {
    const content = await findOrCreateAboutContent();
    return res.status(200).json({ data: content });
  } catch (error) {
    return next(error);
  }
};

const updateAboutContent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const content = await findOrCreateAboutContent();

    Object.assign(content, normalizeAboutPayload(req.body), {
      updatedBy: req.adminId
    });
    await content.save();

    return res.status(200).json({
      message: "About content updated successfully.",
      data: content
    });
  } catch (error) {
    return next(error);
  }
};

const bootstrapAboutContent = async () => {
  const existing = await AboutContent.findOne({ key: "default" });

  if (existing) {
    return;
  }

  await AboutContent.create(defaultAboutContent);
  console.log("Default About content created for portfolio.");
};

module.exports = {
  bootstrapAboutContent,
  getAboutContent,
  getAdminAboutContent,
  updateAboutContent
};
