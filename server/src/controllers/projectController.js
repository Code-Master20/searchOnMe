const { validationResult } = require("express-validator");
const defaultProjects = require("../data/defaultProjects");
const Project = require("../models/Project");

const normalizePoints = (points = []) =>
  Array.isArray(points)
    ? points
        .map((point) => String(point || "").trim())
        .filter(Boolean)
        .slice(0, 8)
    : [];

const normalizeImages = (images = [], fallbackPayload = {}) => {
  if (Array.isArray(images) && images.length > 0) {
    return images
      .map((image) => ({
        imageUrl: String(image?.imageUrl || "").trim(),
        imageAlt: String(image?.imageAlt || "").trim()
      }))
      .filter((image) => image.imageUrl)
      .slice(0, 10);
  }

  const fallbackImageUrl = String(fallbackPayload.imageUrl || "").trim();
  const fallbackImageAlt = String(fallbackPayload.imageAlt || "").trim();

  return fallbackImageUrl ? [{ imageUrl: fallbackImageUrl, imageAlt: fallbackImageAlt }] : [];
};

const normalizeProjectPayload = (payload = {}) => ({
  eyebrow: String(payload.eyebrow || "").trim(),
  tag: String(payload.tag || "").trim(),
  title: String(payload.title || "").trim(),
  body: String(payload.body || "").trim(),
  imageUrl: String(payload.imageUrl || "").trim(),
  imageAlt: String(payload.imageAlt || "").trim(),
  images: normalizeImages(payload.images, payload),
  points: normalizePoints(payload.points),
  featured: Boolean(payload.featured),
  displayOrder: Number.isFinite(Number(payload.displayOrder)) ? Number(payload.displayOrder) : 0
});

const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ displayOrder: 1, createdAt: -1 });
    return res.status(200).json({ data: projects });
  } catch (error) {
    return next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    return res.status(200).json({ data: project });
  } catch (error) {
    return next(error);
  }
};

const getAdminProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ displayOrder: 1, createdAt: -1 });
    return res.status(200).json({ data: projects });
  } catch (error) {
    return next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const project = await Project.create({
      ...normalizeProjectPayload(req.body),
      createdBy: req.adminId,
      updatedBy: req.adminId
    });

    return res.status(201).json({
      message: "Project saved successfully.",
      data: project
    });
  } catch (error) {
    return next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    Object.assign(project, normalizeProjectPayload(req.body), {
      updatedBy: req.adminId
    });
    await project.save();

    return res.status(200).json({
      message: "Project updated successfully.",
      data: project
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    await project.deleteOne();

    return res.status(200).json({
      message: "Project removed successfully.",
      data: project
    });
  } catch (error) {
    return next(error);
  }
};

const bootstrapProjects = async () => {
  const existingCount = await Project.countDocuments();

  if (existingCount > 0) {
    return;
  }

  await Project.insertMany(defaultProjects);
  console.log("Starter projects created for portfolio navigation.");
};

module.exports = {
  bootstrapProjects,
  createProject,
  deleteProject,
  getAdminProjects,
  getProjectById,
  getProjects,
  updateProject
};
