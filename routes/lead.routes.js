const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Protect all lead endpoints with auth & allowed roles (Project Manager, Admin, Super Admin, HR)
const allowedLeadRoles = ['PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN', 'HR'];

router.use(authMiddleware);
router.use(roleMiddleware(allowedLeadRoles));

/**
 * @swagger
 * /leads/create:
 *   post:
 *     summary: Create a new prospective lead
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Lead created successfully
 */
router.post('/create', leadController.createLead);
router.post('/', leadController.createLead);

/**
 * @swagger
 * /leads:
 *   get:
 *     summary: Get paginated & filtered list of leads (or pipeline view)
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
 */
router.get('/', leadController.getLeads);

/**
 * @swagger
 * /leads/followups/due:
 *   get:
 *     summary: Get active leads with follow-up due on or before specified date
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Due follow-ups retrieved
 */
router.get('/followups/due', leadController.getDueFollowUps);

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     summary: Get full lead details and calculated metrics
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lead details retrieved
 */
router.get('/:id', leadController.getLeadById);

/**
 * @swagger
 * /leads/{id}:
 *   put:
 *     summary: Update lead general fields (excluding status)
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lead updated successfully
 */
router.put('/:id/update', leadController.updateLead);
router.put('/:id', leadController.updateLead);

/**
 * @swagger
 * /leads/{id}/update-status:
 *   put:
 *     summary: Update lead lifecycle status (Writes audit log)
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lead status updated
 */
router.put('/:id/update-status', leadController.updateLeadStatus);

/**
 * @swagger
 * /leads/{id}/log-interaction:
 *   post:
 *     summary: Log interaction touchpoint for lead
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Interaction logged successfully
 */
router.post('/:id/log-interaction', leadController.logInteraction);

/**
 * @swagger
 * /leads/{id}/interactions:
 *   get:
 *     summary: Get chronological interaction history timeline for a lead
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Interactions timeline retrieved
 */
router.get('/:id/interactions', leadController.getLeadInteractions);

/**
 * @swagger
 * /leads/{id}/status-history:
 *   get:
 *     summary: Get chronological status-change audit trail for a lead
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Status history audit trail retrieved
 */
router.get('/:id/status-history', leadController.getLeadStatusHistory);

/**
 * @swagger
 * /leads/{id}/convert-to-client:
 *   post:
 *     summary: Trigger client conversion stub for lead
 *     tags:
 *       - CRM Module 1 - Lead Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lead converted to client stub
 */
router.post('/:id/convert-to-client', leadController.convertToClientStub);

module.exports = router;
