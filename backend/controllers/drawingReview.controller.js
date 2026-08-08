const DrawingVersion = require('../models/DrawingVersion');
const Drawing = require('../models/Drawing');
const DrawingMarking = require('../models/DrawingMarking');

/**
 * 26.1 GET /api/drawing-versions/:versionId/review-data
 * Returns aggregated review data payload (drawingVersion, drawing, comments, markings)
 */
exports.getAggregatedReviewData = async (req, res) => {
  try {
    const { versionId } = req.params;

    const drawingVersion = await DrawingVersion.findById(versionId).populate('uploadedBy', 'name email designation');
    if (!drawingVersion) {
      return res.status(404).json({ success: false, message: 'Drawing version not found.' });
    }

    const drawing = await Drawing.findById(drawingVersion.drawingId).populate('categoryId', 'name requiresClientApproval restrictedEditing');
    const markings = await DrawingMarking.find({ drawingVersionId: versionId }).sort({ createdAt: 1 });

    // Aggregated payload
    return res.status(200).json({
      success: true,
      message: 'Aggregated review data retrieved successfully.',
      data: {
        drawingVersion,
        drawing,
        comments: [], // General comments & pinned notes
        markings
      },
      drawingVersion,
      drawing,
      markings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve review data.', error: error.message });
  }
};

/**
 * 26.2 POST /api/drawing-versions/:versionId/comments & GET /api/drawing-versions/:versionId/comments
 * General comments or pinned notes
 */
exports.postCommentOrNote = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { commentText, annotationCoords, isDraft } = req.body;

    if (!commentText || !commentText.trim()) {
      return res.status(400).json({ success: false, message: 'commentText is required.' });
    }

    const drawingVersion = await DrawingVersion.findById(versionId);
    if (!drawingVersion) {
      return res.status(404).json({ success: false, message: 'Drawing version not found.' });
    }

    const userId = req.user ? (req.user._id || req.user.id) : null;

    const newComment = {
      _id: 'cmt_' + Date.now(),
      drawingVersionId: versionId,
      drawingId: drawingVersion.drawingId,
      authorId: userId,
      authorName: req.user ? (req.user.name || req.user.email) : 'Internal Employee',
      commentText: commentText.trim(),
      annotationCoords: annotationCoords || null, // { x, y } coordinates if pinned note
      isDraft: Boolean(isDraft),
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      message: annotationCoords ? 'Pinned note created successfully.' : 'Comment posted successfully.',
      data: { comment: newComment },
      comment: newComment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to post comment or note.', error: error.message });
  }
};

exports.getVersionComments = async (req, res) => {
  try {
    const { versionId } = req.params;
    return res.status(200).json({
      success: true,
      message: 'Version comments retrieved successfully.',
      data: { comments: [] },
      comments: []
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve version comments.', error: error.message });
  }
};

/**
 * 26.3 POST /api/drawing-versions/:versionId/markings & GET /api/drawing-versions/:versionId/markings
 * Shape or freehand markings (FREEHAND, RECTANGLE, CIRCLE, ARROW, HIGHLIGHT_AREA)
 */
exports.postMarking = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { markingType, geometry, color, linkedCommentId } = req.body;

    const validTypes = ['FREEHAND', 'RECTANGLE', 'CIRCLE', 'ARROW', 'HIGHLIGHT_AREA'];
    if (!markingType || !validTypes.includes(markingType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid markingType. Allowed types: ${validTypes.join(', ')}`
      });
    }

    if (!geometry) {
      return res.status(400).json({ success: false, message: 'geometry object is required.' });
    }

    const drawingVersion = await DrawingVersion.findById(versionId);
    if (!drawingVersion) {
      return res.status(404).json({ success: false, message: 'Drawing version not found.' });
    }

    const userId = req.user ? (req.user._id || req.user.id) : null;

    const marking = await DrawingMarking.create({
      drawingVersionId: versionId,
      drawingId: drawingVersion.drawingId,
      authorType: 'EMPLOYEE',
      authorId: userId || drawingVersion.uploadedBy,
      authorModel: 'User',
      markingType: markingType.toUpperCase(),
      geometry,
      color: color || '#FF0000',
      linkedCommentId: linkedCommentId || null
    });

    return res.status(201).json({
      success: true,
      message: 'Marking annotation created successfully.',
      data: { marking },
      marking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save marking annotation.', error: error.message });
  }
};

exports.getVersionMarkings = async (req, res) => {
  try {
    const { versionId } = req.params;
    const markings = await DrawingMarking.find({ drawingVersionId: versionId }).sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      message: 'Version markings retrieved successfully.',
      data: { markings },
      markings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve version markings.', error: error.message });
  }
};

/**
 * 26.4 DELETE /api/drawing-versions/:versionId/markings/:markingId
 * Delete a marking annotation
 */
exports.deleteMarking = async (req, res) => {
  try {
    const { versionId, markingId } = req.params;
    const marking = await DrawingMarking.findOne({ _id: markingId, drawingVersionId: versionId });

    if (!marking) {
      return res.status(404).json({ success: false, message: 'Marking annotation not found.' });
    }

    await DrawingMarking.deleteOne({ _id: markingId });

    return res.status(200).json({
      success: true,
      message: 'Marking annotation deleted successfully.',
      data: { markingId }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete marking annotation.', error: error.message });
  }
};
