const mongoose = require("mongoose");

const projectImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    imageAlt: {
      type: String,
      trim: true,
      maxlength: 180,
      default: ""
    }
  },
  {
    _id: false
  }
);

const projectSchema = new mongoose.Schema(
  {
    eyebrow: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    tag: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
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
      maxlength: 5000
    },
    imageUrl: {
      type: String,
      default: ""
    },
    imageAlt: {
      type: String,
      trim: true,
      maxlength: 180,
      default: ""
    },
    images: {
      type: [projectImageSchema],
      default: []
    },
    points: {
      type: [String],
      default: []
    },
    featured: {
      type: Boolean,
      default: false
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
      max: 999
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
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

module.exports = mongoose.model("Project", projectSchema);
