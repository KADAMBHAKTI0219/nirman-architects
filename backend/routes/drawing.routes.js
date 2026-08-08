const express = require('express');
const router = express.Router();
const drawingController = require('../controllers/drawing.controller');

// Note: Ensure authMiddleware and roleMiddleware are mounted in parent router or imported here
// Example:
// const authMiddleware = require('../middlewares/auth.middleware');
// const roleMiddleware = require('../middlewares/role.middleware');
// router.use(authMiddleware);

// 25.1 Parent Drawing Creation
router.post('/create', drawingController.createDrawing);

// 25.2 Multi-Version Upload ("never permanently replaced")
router.post('/:drawingId/versions/upload', drawingController.uploadVersion);

// 25.3 Drawing List & Detail
router.get('/', drawingController.getDrawings);
router.get('/:id', drawingController.getDrawingById);

// 25.4 Versions List & Side-by-Side Comparison
router.get('/:id/versions', drawingController.getDrawingVersions);
router.get('/:id/compare', drawingController.compareVersions);

// 25.5 Internal PM Review Gate
router.put('/versions/:versionId/pm-review', drawingController.pmReview);

// 25.6 Internal Admin Review Gate (CRM Module 5 handoff)
router.put('/versions/:versionId/admin-review', drawingController.adminReview);

// 25.7 GFC Promotion & Lock Management
router.put('/:id/promote-to-gfc', drawingController.promoteToGFC);
router.put('/:id/unlock-gfc', drawingController.unlockGFC);

// 25.8 Process DWG In-Place Edit
router.put('/versions/:versionId/edit-in-place', drawingController.editInPlaceProcessDwg);

// 25.9 CRM Client Approval Audit Log View
router.get('/versions/:versionId/client-approval-log', drawingController.getClientApprovalLog);

module.exports = router;
