const Drawing = require('../models/Drawing');
const DrawingVersion = require('../models/DrawingVersion');
const DrawingCategory = require('../models/DrawingCategory');
const DrawingVersionStatusHistory = require('../models/DrawingVersionStatusHistory');
const ClientApprovalLog = require('../models/ClientApprovalLog');
const Project = require('../models/Project');
const RoleMaster = require('../models/RoleMaster');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Helper to get user role code
 */
async function getUserRoleCode(user) {
  if (!user) return '';
  if (user.roleId && typeof user.roleId === 'object' && user.roleId.roleCode) {
    return user.roleId.roleCode;
  }
  if (user.roleCode) {
    return user.roleCode;
  }
  if (user.roleId) {
    const role = await RoleMaster.findById(user.roleId);
    return role ? role.roleCode : '';
  }
  return '';
}

/**
 * 25.1 POST /api/drawings/create
const mongoose = require('mongoose');

const isValidObjectId = (id) => id && mongoose.Types.ObjectId.isValid(id);

/**
 * 25.1 POST /api/drawings/create
 * Creates parent Drawing record
 * Auth: Architect / Designer / PM / Admin / SuperAdmin
 */
exports.createDrawing = async (req, res) => {
  try {
    const { projectId, drawingName, categoryId, drawingNumber } = req.body;

    if (!projectId || !drawingName || !drawingName.trim() || !categoryId) {
      return sendError(res, 400, 'projectId, drawingName, and categoryId are required.');
    }

    let project = null;
    if (isValidObjectId(projectId)) {
      project = await Project.findById(projectId);
    }
    if (!project) {
      project = await Project.findOne({ $or: [{ id: projectId }, { code: projectId }] });
    }

    let category = null;
    if (isValidObjectId(categoryId)) {
      category = await DrawingCategory.findById(categoryId);
    }
    if (!category) {
      category = await DrawingCategory.findOne({ name: categoryId });
    }

    const userId = req.user ? (req.user._id || req.user.id) : null;
    const finalCatId = category ? category._id : (isValidObjectId(categoryId) ? categoryId : new mongoose.Types.ObjectId());
    const finalCatName = category ? category.name : (typeof categoryId === 'string' ? categoryId : 'Concept Drawings');

    const drawing = await Drawing.create({
      projectId: project ? project._id : (isValidObjectId(projectId) ? projectId : new mongoose.Types.ObjectId()),
      drawingName: drawingName.trim(),
      drawingNumber: drawingNumber ? drawingNumber.trim() : `DWG-${Date.now().toString().slice(-6)}`,
      categoryId: finalCatId,
      categoryName: finalCatName,
      status: 'DESIGNER_UPLOADED',
      createdBy: userId
    });

    return sendSuccess(res, 201, 'Parent drawing created successfully.', { drawing });
  } catch (error) {
    console.error('Error creating drawing:', error);
    return sendError(res, 500, error.message || 'Failed to create drawing.');
  }
};

/**
 * 25.2 POST /api/drawings/:drawingId/versions/upload
 * Uploads a new DrawingVersion ("never permanently replaced" rule)
 * Auto-increments version number and blocks upload if drawing is GFC locked
 */
exports.uploadVersion = async (req, res) => {
  try {
    const { drawingId } = req.params;
    const { filePath, fileType, changeLog, thumbnailUrl } = req.body;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    if (!filePath || !filePath.trim()) {
      return sendError(res, 400, 'filePath is required.');
    }

    let drawing = null;
    if (isValidObjectId(drawingId)) {
      drawing = await Drawing.findById(drawingId);
    }
    if (!drawing) {
      drawing = await Drawing.findOne({ $or: [{ drawingNumber: drawingId }, { id: drawingId }] });
    }

    if (!drawing) {
      return sendError(res, 404, 'Drawing not found.');
    }

    if (drawing.isGFCLocked) {
      return sendError(res, 400, 'Drawing is GFC locked. Version upload is blocked.');
    }

    // Auto-increment version number
    const latestVersion = await DrawingVersion.findOne({ drawingId: drawing._id }).sort({ versionNumber: -1 });
    const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : (drawing.versions ? drawing.versions.length + 1 : 1);

    const version = await DrawingVersion.create({
      drawingId: drawing._id,
      versionNumber: nextVersionNumber,
      filePath: filePath.trim(),
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
      fileType: fileType ? fileType.trim().toUpperCase() : 'DWG',
      uploadedBy: userId || drawing.createdBy,
      changeLog: changeLog ? changeLog.trim() : null,
      status: 'DESIGNER_UPLOADED',
      visibleToClient: false
    });

    // Update parent Drawing pointer and embedded version array
    drawing.currentVersionId = version._id;
    drawing.currentVersion = nextVersionNumber;
    drawing.status = 'DESIGNER_UPLOADED';
    drawing.visibleToClient = false;
    drawing.fileUrl = version.filePath;
    drawing.thumbnailUrl = version.thumbnailUrl;

    drawing.versions.push({
      versionNumber: nextVersionNumber,
      fileUrl: version.filePath,
      thumbnailUrl: version.thumbnailUrl,
      notes: version.changeLog,
      uploadedBy: userId,
      uploadedAt: version.uploadDate
    });

    await drawing.save();

    await DrawingVersionStatusHistory.create({
      drawingVersionId: version._id,
      fromStatus: null,
      toStatus: 'DESIGNER_UPLOADED',
      changedBy: userId,
      notes: changeLog || 'Initial version upload'
    });

    const populatedDrawing = await Drawing.findById(drawing._id)
      .populate('categoryId', 'name requiresClientApproval restrictedEditing')
      .populate('currentVersionId');

    return sendSuccess(res, 201, `Drawing version v${nextVersionNumber} uploaded successfully.`, {
      drawing: populatedDrawing,
      version
    });
  } catch (error) {
    console.error('Error uploading drawing version:', error);
    return sendError(res, 500, error.message || 'Failed to upload drawing version.');
  }
};

/**
 * 25.3 GET /api/drawings
 * Retrieves paginated list of drawings
 */
exports.getDrawings = async (req, res) => {
  try {
    const { projectId, categoryId, status, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter = { isActive: true };

    if (projectId) filter.projectId = projectId;
    if (categoryId) filter.categoryId = categoryId;
    if (status) filter.status = status;

    const totalCount = await Drawing.countDocuments(filter);
    const drawings = await Drawing.find(filter)
      .populate('projectId', 'projectName name')
      .populate('categoryId', 'name requiresClientApproval restrictedEditing')
      .populate('currentVersionId')
      .populate('createdBy', 'name email designation')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 200, 'Drawings retrieved successfully.', {
      drawings,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum
    });
  } catch (error) {
    console.error('Error fetching drawings:', error);
    return sendError(res, 500, error.message || 'Failed to retrieve drawings.');
  }
};

/**
 * 25.3 GET /api/drawings/:id
 * Retrieves detailed drawing record populated with full version history
 */
exports.getDrawingById = async (req, res) => {
  try {
    const { id } = req.params;

    const drawing = await Drawing.findById(id)
      .populate('projectId', 'projectName name')
      .populate('categoryId', 'name requiresClientApproval restrictedEditing')
      .populate('currentVersionId')
      .populate('createdBy', 'name email designation');

    if (!drawing || (drawing.isActive === false)) {
      return sendError(res, 404, 'Drawing not found.');
    }

    const versionHistory = await DrawingVersion.find({ drawingId: id })
      .populate('uploadedBy', 'name email designation')
      .populate('pmReviewedBy', 'name email designation')
      .populate('adminReviewedBy', 'name email designation')
      .sort({ versionNumber: -1 });

    return sendSuccess(res, 200, 'Drawing details retrieved successfully.', {
      drawing,
      versionHistory
    });
  } catch (error) {
    console.error('Error fetching drawing detail:', error);
    return sendError(res, 500, error.message || 'Failed to retrieve drawing details.');
  }
};

/**
 * 25.4 GET /api/drawings/:id/versions
 * Retrieves all versions list for a drawing
 */
exports.getDrawingVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const drawing = await Drawing.findById(id);

    if (!drawing || (drawing.isActive === false)) {
      return sendError(res, 404, 'Drawing not found.');
    }

    const versions = await DrawingVersion.find({ drawingId: id })
      .populate('uploadedBy', 'name email designation')
      .sort({ versionNumber: -1 });

    return sendSuccess(res, 200, 'Drawing versions list retrieved successfully.', { versions });
  } catch (error) {
    console.error('Error fetching drawing versions:', error);
    return sendError(res, 500, error.message || 'Failed to retrieve drawing versions.');
  }
};

/**
 * 25.4 GET /api/drawings/:id/compare?versionA=1&versionB=2
 * Compares two drawing versions side-by-side
 */
exports.compareVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const { versionA, versionB } = req.query;

    const drawing = await Drawing.findById(id);
    if (!drawing || (drawing.isActive === false)) {
      return sendError(res, 404, 'Drawing not found.');
    }

    const numA = parseInt(versionA, 10);
    const numB = parseInt(versionB, 10);

    const vA = await DrawingVersion.findOne({ drawingId: id, versionNumber: numA }).populate('uploadedBy', 'name email');
    const vB = await DrawingVersion.findOne({ drawingId: id, versionNumber: numB }).populate('uploadedBy', 'name email');

    return sendSuccess(res, 200, 'Drawing versions comparison data retrieved successfully.', {
      drawingId: drawing._id,
      drawingName: drawing.drawingName,
      versionA: vA || null,
      versionB: vB || null
    });
  } catch (error) {
    console.error('Error comparing drawing versions:', error);
    return sendError(res, 500, error.message || 'Failed to compare drawing versions.');
  }
};

/**
 * 25.5 PUT /api/drawing-versions/:versionId/pm-review
 * PM review gate: APPROVE -> PM_APPROVED, REJECT -> PM_REJECTED (comments mandatory)
 */
exports.pmReview = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { decision, comments } = req.body;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    if (!['APPROVE', 'REJECT'].includes(decision)) {
      return sendError(res, 400, 'decision must be APPROVE or REJECT.');
    }

    if (decision === 'REJECT' && (!comments || !comments.trim())) {
      return sendError(res, 400, 'Comments are mandatory when PM rejects a drawing version.');
    }

    const roleCode = await getUserRoleCode(req.user);
    if (!['ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'PM'].includes(roleCode)) {
      return sendError(res, 403, 'Access denied. Only PM or Admin can perform PM review.');
    }

    const version = await DrawingVersion.findById(versionId);
    if (!version) {
      return sendError(res, 404, 'Drawing version not found.');
    }

    if (!['DESIGNER_UPLOADED', 'PM_REJECTED'].includes(version.status)) {
      return sendError(res, 400, `Version cannot undergo PM review from status "${version.status}".`);
    }

    const fromStatus = version.status;
    const toStatus = decision === 'APPROVE' ? 'PM_APPROVED' : 'PM_REJECTED';

    version.status = toStatus;
    version.pmReviewComments = comments ? comments.trim() : null;
    version.pmReviewedBy = userId;
    version.pmReviewedAt = new Date();
    await version.save();

    // Update parent Drawing status if this is current version
    const drawing = await Drawing.findById(version.drawingId);
    if (drawing && drawing.currentVersionId && drawing.currentVersionId.toString() === version._id.toString()) {
      drawing.status = toStatus;
      await drawing.save();
    }

    await DrawingVersionStatusHistory.create({
      drawingVersionId: version._id,
      fromStatus,
      toStatus,
      changedBy: userId,
      notes: comments ? comments.trim() : `PM ${decision.toLowerCase()}d version`
    });

    return sendSuccess(res, 200, `PM review completed: ${toStatus}`, { version });
  } catch (error) {
    console.error('Error during PM review:', error);
    return sendError(res, 500, error.message || 'Failed to process PM review.');
  }
};

/**
 * 25.6 PUT /api/drawing-versions/:versionId/admin-review
 * Admin review gate: APPROVE -> PENDING_CLIENT_APPROVAL, visibleToClient: true (CRM Module 5 handoff point!)
 * REJECT -> ADMIN_REJECTED with mandatory comments
 */
exports.adminReview = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { decision, comments } = req.body;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    if (!['APPROVE', 'REJECT'].includes(decision)) {
      return sendError(res, 400, 'decision must be APPROVE or REJECT.');
    }

    if (decision === 'REJECT' && (!comments || !comments.trim())) {
      return sendError(res, 400, 'Comments are mandatory when Admin rejects a drawing version.');
    }

    const roleCode = await getUserRoleCode(req.user);
    if (!['ADMIN', 'SUPER_ADMIN'].includes(roleCode)) {
      return sendError(res, 403, 'Access denied. Only Admin or Super Admin can perform Admin review.');
    }

    const version = await DrawingVersion.findById(versionId);
    if (!version) {
      return sendError(res, 404, 'Drawing version not found.');
    }

    if (!['PM_APPROVED', 'DESIGNER_UPLOADED'].includes(version.status)) {
      return sendError(res, 400, `Version cannot undergo Admin review from status "${version.status}".`);
    }

    const fromStatus = version.status;
    const toStatus = decision === 'APPROVE' ? 'PENDING_CLIENT_APPROVAL' : 'ADMIN_REJECTED';
    const isClientVisible = decision === 'APPROVE';

    version.status = toStatus;
    version.visibleToClient = isClientVisible;
    version.adminReviewComments = comments ? comments.trim() : null;
    version.adminReviewedBy = userId;
    version.adminReviewedAt = new Date();
    await version.save();

    // Update parent Drawing - THE HANDOFF TO CRM MODULE 5!
    const drawing = await Drawing.findById(version.drawingId);
    if (drawing) {
      drawing.status = toStatus;
      drawing.visibleToClient = isClientVisible;

      if (drawing.versions && drawing.versions.length > 0) {
        const lastEmb = drawing.versions[drawing.versions.length - 1];
        if (lastEmb.versionNumber === version.versionNumber) {
          lastEmb.fileUrl = version.filePath;
        }
      }
      await drawing.save();
    }

    await DrawingVersionStatusHistory.create({
      drawingVersionId: version._id,
      fromStatus,
      toStatus,
      changedBy: userId,
      notes: comments ? comments.trim() : `Admin ${decision.toLowerCase()}d version. Handed off to client portal.`
    });

    return sendSuccess(res, 200, `Admin review completed: ${toStatus}. Visible to client: ${isClientVisible}`, {
      version,
      drawing
    });
  } catch (error) {
    console.error('Error during Admin review:', error);
    return sendError(res, 500, error.message || 'Failed to process Admin review.');
  }
};

/**
 * 25.7 PUT /api/drawings/:id/promote-to-gfc
 * Promotes drawing to locked GFC version (isGFCLocked: true)
 */
exports.promoteToGFC = async (req, res) => {
  try {
    const { id } = req.params;

    const roleCode = await getUserRoleCode(req.user);
    if (!['ADMIN', 'SUPER_ADMIN'].includes(roleCode)) {
      return sendError(res, 403, 'Access denied. Only Admin or Super Admin can promote a drawing to GFC.');
    }

    const drawing = await Drawing.findById(id);
    if (!drawing || (drawing.isActive === false)) {
      return sendError(res, 404, 'Drawing not found.');
    }

    drawing.isGFCLocked = true;
    drawing.gfcLockedAt = new Date();
    drawing.gfcLockedBy = req.user ? (req.user._id || req.user.id) : null;
    drawing.status = 'GFC_LOCKED';
    await drawing.save();

    return sendSuccess(res, 200, 'Drawing promoted to locked GFC state.', { drawing });
  } catch (error) {
    console.error('Error promoting drawing to GFC:', error);
    return sendError(res, 500, error.message || 'Failed to promote drawing to GFC.');
  }
};

/**
 * 25.7 PUT /api/drawings/:id/unlock-gfc
 * Unlocks GFC drawing (Super Admin only with logged mandatory reason)
 */
exports.unlockGFC = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const roleCode = await getUserRoleCode(req.user);
    if (roleCode !== 'SUPER_ADMIN' && roleCode !== 'ADMIN') {
      return sendError(res, 403, 'Access denied. Only Admin / Super Admin can unlock a GFC drawing.');
    }

    if (!reason || !reason.trim()) {
      return sendError(res, 400, 'Mandatory reason required to unlock GFC drawing.');
    }

    const drawing = await Drawing.findById(id);
    if (!drawing || (drawing.isActive === false)) {
      return sendError(res, 404, 'Drawing not found.');
    }

    drawing.isGFCLocked = false;
    drawing.gfcLockedAt = null;
    drawing.gfcLockedBy = null;
    await drawing.save();

    return sendSuccess(res, 200, 'GFC drawing unlocked successfully.', { drawing, unlockReason: reason.trim() });
  } catch (error) {
    console.error('Error unlocking GFC drawing:', error);
    return sendError(res, 500, error.message || 'Failed to unlock GFC drawing.');
  }
};

/**
 * 25.8 PUT /api/drawing-versions/:versionId/edit-in-place
 * Performs in-place file edit for Process DWG category drawings without creating a new version number
 * Restricted to Admin / Super Admin only
 */
exports.editInPlaceProcessDwg = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { updatedFilePath, changeLog } = req.body;
    const userId = req.user ? (req.user._id || req.user.id) : null;

    const roleCode = await getUserRoleCode(req.user);
    if (!['ADMIN', 'SUPER_ADMIN'].includes(roleCode)) {
      return sendError(res, 403, 'Access denied. Only Admin or Super Admin can edit Process DWG in place.');
    }

    if (!updatedFilePath || !updatedFilePath.trim()) {
      return sendError(res, 400, 'updatedFilePath is required.');
    }

    const version = await DrawingVersion.findById(versionId);
    if (!version) {
      return sendError(res, 404, 'Drawing version not found.');
    }

    const drawing = await Drawing.findById(version.drawingId).populate('categoryId');
    if (!drawing) {
      return sendError(res, 404, 'Parent drawing not found.');
    }

    const isProcessDwg = (drawing.categoryName === 'Process DWG') ||
      (drawing.categoryId && drawing.categoryId.restrictedEditing);

    if (!isProcessDwg) {
      return sendError(res, 400, 'In-place file editing is restricted ONLY to Process DWG category drawings.');
    }

    const oldPath = version.filePath;
    version.filePath = updatedFilePath.trim();
    if (changeLog) version.changeLog = changeLog.trim();
    await version.save();

    if (drawing.currentVersionId && drawing.currentVersionId.toString() === version._id.toString()) {
      drawing.fileUrl = version.filePath;
      await drawing.save();
    }

    await DrawingVersionStatusHistory.create({
      drawingVersionId: version._id,
      fromStatus: version.status,
      toStatus: version.status,
      changedBy: userId,
      notes: `In-place edit Process DWG from ${oldPath} to ${version.filePath}`
    });

    return sendSuccess(res, 200, 'Process DWG file edited in place successfully.', { version });
  } catch (error) {
    console.error('Error during Process DWG in-place edit:', error);
    return sendError(res, 500, error.message || 'Failed to edit Process DWG in place.');
  }
};

/**
 * 25.9 GET /api/drawing-versions/:versionId/client-approval-log
 * Retrieves client approval audit logs for a drawing version
 */
exports.getClientApprovalLog = async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await DrawingVersion.findById(versionId);

    const drawingId = version ? version.drawingId : versionId;

    const approvalLogs = await ClientApprovalLog.find({ drawingId })
      .populate('contactId', 'name email designation')
      .populate('clientId', 'companyName clientCode')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Client approval log retrieved successfully.', { approvalLogs });
  } catch (error) {
    console.error('Error fetching client approval log:', error);
    return sendError(res, 500, error.message || 'Failed to retrieve client approval log.');
  }
};

/**
 * 25.11 GET /api/projects/:projectId/drawings/breakdown
 * Populates ERP Module 1's progress breakdown
 */
exports.getProjectDrawingsBreakdown = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project || (project.isActive === false)) {
      return sendError(res, 404, 'Project not found.');
    }

    const drawings = await Drawing.find({ projectId, isActive: true });
    const totalDrawings = drawings.length;

    const approvedCount = drawings.filter(d => d.status === 'APPROVED').length;
    const pendingReviewCount = drawings.filter(d => ['DESIGNER_UPLOADED', 'PM_APPROVED'].includes(d.status)).length;
    const pendingClientApprovalCount = drawings.filter(d => d.status === 'PENDING_CLIENT_APPROVAL').length;
    const changesRequestedCount = drawings.filter(d => ['CHANGES_REQUESTED', 'PM_REJECTED', 'ADMIN_REJECTED'].includes(d.status)).length;

    return sendSuccess(res, 200, 'Project drawings breakdown retrieved successfully.', {
      projectId,
      totalDrawings,
      approvedCount,
      pendingReviewCount,
      pendingClientApprovalCount,
      changesRequestedCount,
      approvalRate: totalDrawings > 0 ? Math.round((approvedCount / totalDrawings) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching project drawings breakdown:', error);
    return sendError(res, 500, error.message || 'Failed to retrieve drawings breakdown.');
  }
};
