const mongoose = require('mongoose');

const drawingVersionSchema = new mongoose.Schema(
  {
    drawingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drawing',
      required: true,
      index: true
    },
    versionNumber: {
      type: Number,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      default: null
    },
    fileType: {
      type: String,
      enum: ['DWG', 'PDF', 'BIM', 'PNG', 'JPG', 'ZIP', 'OTHER'],
      default: 'DWG'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    changeLog: {
      type: String,
      default: null
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
    pmReviewComments: {
      type: String,
      default: null
    },
    pmReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    pmReviewedAt: {
      type: Date,
      default: null
    },
    adminReviewComments: {
      type: String,
      default: null
    },
    adminReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    adminReviewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

drawingVersionSchema.index({ drawingId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.models.DrawingVersion || mongoose.model('DrawingVersion', drawingVersionSchema);
