const { validationResult } = require("express-validator");
const PortfolioAsset = require("../models/PortfolioAsset");
const {
  createUploadSignature,
  deleteCloudinaryAsset
} = require("../services/cloudinaryService");

const getUploadSignature = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const signature = createUploadSignature(req.body.category);
    return res.status(200).json({ data: signature });
  } catch (error) {
    return next(error);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const {
      title,
      category,
      originalName,
      secureUrl,
      publicId,
      resourceType,
      format,
      bytes
    } = req.body;

    const asset = await PortfolioAsset.create({
      title,
      category,
      originalName,
      secureUrl,
      publicId,
      resourceType,
      format,
      bytes,
      uploadedBy: req.adminId
    });

    return res.status(201).json({
      message: "Portfolio asset saved successfully.",
      data: asset
    });
  } catch (error) {
    return next(error);
  }
};

const getAssets = async (req, res, next) => {
  try {
    const assets = await PortfolioAsset.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: assets });
  } catch (error) {
    return next(error);
  }
};

const deleteAsset = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const asset = await PortfolioAsset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ message: "Portfolio asset not found." });
    }

    const deleteResult = await deleteCloudinaryAsset(asset.publicId, asset.resourceType);

    if (!["ok", "not found"].includes(deleteResult.result)) {
      return res.status(502).json({
        message: "Asset file could not be removed from Cloudinary."
      });
    }

    await asset.deleteOne();

    return res.status(200).json({
      message: "Portfolio asset removed successfully.",
      data: asset
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createAsset,
  deleteAsset,
  getAssets,
  getUploadSignature
};
