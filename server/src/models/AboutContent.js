const mongoose = require("mongoose");

const aboutHighlightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    }
  },
  {
    _id: false
  }
);

const aboutContentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default"
    },
    headingTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240
    },
    profileEyebrow: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    profileTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    profileBody: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    educationEyebrow: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    educationTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    educationBody: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    highlights: {
      type: [aboutHighlightSchema],
      default: []
    },
    assetEyebrow: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    assetTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220
    },
    assetBody: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AboutContent", aboutContentSchema);
