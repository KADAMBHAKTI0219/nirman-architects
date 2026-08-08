const express = require('express');
const router = express.Router();
const drawingCategoryController = require('../controllers/drawingCategory.controller');

// 25.10 Category Creation & Active List
router.post('/create', drawingCategoryController.createCategory);
router.get('/active', drawingCategoryController.getActiveCategories);
router.put('/:id/deactivate', drawingCategoryController.deactivateCategory);

module.exports = router;
