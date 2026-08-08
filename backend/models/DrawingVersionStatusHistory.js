const mongoose = require('mongoose');

const drawingVersionStatusHistorySchema = new mongoose.Schema(
  {
    drawingVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DrawingVersion',
      required: true,
      index: true
    },
    fromStatus: {
      type: String,
      default: null
    },
    toStatus: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    notes: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.DrawingVersionStatusHistory || mongoose.model('DrawingVersionStatusHistory', drawingVersionStatusHistorySchema);
