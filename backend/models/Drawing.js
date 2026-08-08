const mongoose = require('mongoose');

const drawingSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    drawingName: {
      type: String,
      required: true,
      trim: true
    },
    drawingNumber: {
      type: String,
      default: null,
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DrawingCategory',
      required: true
    },
    categoryName: {
      type: String,
      default: null
    },
    currentVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DrawingVersion',
      default: null
    },
    currentVersion: {
      type: Number,
      default: 1
    },
    status: {
      type: String,
      enum: [
        'DESIGNER_UPLOADED',
        'PM_APPROVED',
        'PM_REJECTED',
        'PENDING_CLIENT_APPROVAL',
        'ADMIN_REJECTED',
        'APPROVED',
        'CHANGES_REQUESTED',
        'GFC_LOCKED'
      ],
      default: 'DESIGNER_UPLOADED'
    },
    visibleToClient: {
      type: Boolean,
      default: false
    },
    isGFCLocked: {
      type: Boolean,
      default: false
    },
    gfcLockedAt: {
      type: Date,
      default: null
    },
    gfcLockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    fileUrl: {
      type: String,
      default: null
    },
    thumbnailUrl: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    versions: [
      {
        versionNumber: { type: Number, required: true },
        fileUrl: { type: String, required: true },
        thumbnailUrl: { type: String, default: null },
        notes: { type: String, default: null },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        uploadedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Drawing || mongoose.model('Drawing', drawingSchema);
