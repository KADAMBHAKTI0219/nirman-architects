const mongoose = require('mongoose');

const clientApprovalLogSchema = new mongoose.Schema(
  {
    drawingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drawing',
      required: true,
      index: true
    },
    drawingVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DrawingVersion',
      default: null
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    action: {
      type: String,
      enum: ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED'],
      required: true
    },
    comments: {
      type: String,
      default: null
    },
    clientIp: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.ClientApprovalLog || mongoose.model('ClientApprovalLog', clientApprovalLogSchema);
