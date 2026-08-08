const express = require('express');
const router = express.Router();
const drawingReviewController = require('../controllers/drawingReview.controller');

// 26.1 Aggregated Review Data Payload for Viewer Component
router.get('/:versionId/review-data', drawingReviewController.getAggregatedReviewData);

// 26.2 Pinned Notes & General Comments
router.post('/:versionId/comments', drawingReviewController.postCommentOrNote);
router.get('/:versionId/comments', drawingReviewController.getVersionComments);

// 26.3 Freehand & Shape Markings
router.post('/:versionId/markings', drawingReviewController.postMarking);
router.get('/:versionId/markings', drawingReviewController.getVersionMarkings);

// 26.4 Delete Marking Annotation
router.delete('/:versionId/markings/:markingId', drawingReviewController.deleteMarking);

module.exports = router;
