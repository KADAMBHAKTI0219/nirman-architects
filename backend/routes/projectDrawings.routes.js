const express = require('express');
const router = express.Router();
const drawingController = require('../controllers/drawing.controller');

// 25.11 GET /api/projects/:projectId/drawings/breakdown
router.get('/:projectId/drawings/breakdown', drawingController.getProjectDrawingsBreakdown);

module.exports = router;
