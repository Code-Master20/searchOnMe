const mongoose = require("mongoose");

const portfolioAssetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    category: {
      type: String,
      enum: ["resume", "education", "image"],
      required: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    secureUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true,
      index: true
    },
    resourceType: {
      type: String,
      required: true
    },
    format: {
      type: String,
      default: ""
    },
    bytes: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PortfolioAsset", portfolioAssetSchema);
