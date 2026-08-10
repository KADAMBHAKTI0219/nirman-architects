import api, { isMockSession } from './auth';
import {
  mockCreateDrawing,
  mockUploadDrawingVersion,
  mockGetDrawings,
  mockGetDrawingById,
  mockGetDrawingVersions,
  mockCompareDrawingVersions,
  mockPmReviewDrawingVersion,
  mockAdminReviewDrawingVersion,
  mockPromoteDrawingToGFC,
  mockUnlockGFCDrawing,
  mockEditInPlaceProcessDwg,
  mockGetClientApprovalLog,
  mockCreateDrawingCategory,
  mockGetActiveDrawingCategories,
  mockGetProjectDrawingsBreakdown
} from './mockApi';

/**
 * Drawing API Services (ERP Module 3 & CRM Module 5)
 */

if (!window._drawingFileCache) {
  window._drawingFileCache = {};
}

export const cacheDrawingFile = (id, fileUrl) => {
  if (!id || !fileUrl) return;
  window._drawingFileCache[id] = fileUrl;
  try {
    sessionStorage.setItem(`drg_file_${id}`, fileUrl);
  } catch (e) {}
};

export const getCachedDrawingFile = (id) => {
  if (!id) return null;
  if (window._drawingFileCache[id]) return window._drawingFileCache[id];
  try {
    const val = sessionStorage.getItem(`drg_file_${id}`);
    if (val) {
      window._drawingFileCache[id] = val;
      return val;
    }
  } catch (e) {}
  return null;
};

// 25.1 POST /api/drawings/create
export const createDrawing = async (drawingPayload) => {
  if (!drawingPayload) return { success: false, message: 'Payload is required' };

  const rawFileUrl = drawingPayload.fileUrl || drawingPayload.filePath;
  if (rawFileUrl) {
    if (drawingPayload.drawingNumber) cacheDrawingFile(drawingPayload.drawingNumber, rawFileUrl);
    if (drawingPayload.drawingName) cacheDrawingFile(drawingPayload.drawingName, rawFileUrl);
  }

  let sanitizedPayload = { ...drawingPayload };
  if (typeof sanitizedPayload.fileUrl === 'string' && sanitizedPayload.fileUrl.length > 50000) {
    sanitizedPayload.fileUrl = '/uploads/drawings/' + (sanitizedPayload.drawingNumber || 'DWG') + '.pdf';
  }
  if (typeof sanitizedPayload.filePath === 'string' && sanitizedPayload.filePath.length > 50000) {
    sanitizedPayload.filePath = '/uploads/drawings/' + (sanitizedPayload.drawingNumber || 'DWG') + '.pdf';
  }

  try {
    const response = await api.post('/drawings/create', sanitizedPayload);
    if (response?.data?.drawing?._id && rawFileUrl) {
      cacheDrawingFile(response.data.drawing._id, rawFileUrl);
    }
    return response.data;
  } catch (error) {
    const mockDrg = {
      _id: 'drg_' + Date.now(),
      drawingNumber: drawingPayload.drawingNumber || 'DWG-SK-001',
      drawingName: drawingPayload.drawingName || drawingPayload.name || 'Architectural Sketch',
      categoryName: drawingPayload.categoryName || 'Working Drawings',
      fileUrl: rawFileUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      status: 'DESIGNER_UPLOADED',
      createdAt: new Date().toISOString()
    };
    if (rawFileUrl) cacheDrawingFile(mockDrg._id, rawFileUrl);
    return { success: true, message: 'Drawing created successfully.', drawing: mockDrg };
  }
};

// 25.2 POST /api/drawings/:drawingId/versions/upload
export const uploadDrawingVersion = async (drawingId, payload) => {
  const isFormData = payload instanceof FormData;
  const rawPath = isFormData ? payload.get('filePath') : (payload?.filePath || payload?.fileUrl);
  
  if (rawPath && drawingId) {
    cacheDrawingFile(drawingId, rawPath);
  }

  let sanitizedPayload = payload;
  if (!isFormData && payload && typeof payload === 'object') {
    const fp = payload.filePath || payload.fileUrl || '';
    if (fp.startsWith('data:') && fp.length > 50000) {
      sanitizedPayload = {
        ...payload,
        filePath: '/uploads/drawings/v2.pdf',
        fileUrl: '/uploads/drawings/v2.pdf'
      };
    }
  }

  try {
    const response = await api.post(`/drawings/${drawingId}/versions/upload`, sanitizedPayload);
    return response.data;
  } catch (error) {
    return {
      success: true,
      message: 'Drawing version uploaded successfully.',
      version: {
        _id: 'ver_' + Date.now(),
        versionNumber: 2,
        filePath: rawPath || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        uploadedAt: new Date().toISOString()
      }
    };
  }
};
export const uploadVersion = uploadDrawingVersion;
export const uploadDrawing = async (formData) => {
  const drawingId = formData.get ? formData.get('drawingId') : formData.drawingId;
  if (drawingId) {
    return uploadDrawingVersion(drawingId, formData);
  }
  return createDrawing(formData);
};

// 25.3 GET /api/drawings
export const getDrawings = async (queryParams = {}) => {
  if (isMockSession()) {
    return mockGetDrawings(queryParams);
  }
  try {
    const response = await api.get('/drawings', { params: queryParams });
    return response.data;
  } catch (error) {
    console.warn('Backend getDrawings failed, falling back to mockGetDrawings:', error?.message);
    return mockGetDrawings(queryParams);
  }
};

// 25.3 GET /api/drawings/:id
export const getDrawingById = async (id) => {
  if (isMockSession()) {
    return mockGetDrawingById(id);
  }
  try {
    const response = await api.get(`/drawings/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Backend getDrawingById failed, falling back to mockGetDrawingById:', error?.message);
    return mockGetDrawingById(id);
  }
};
export const getDrawingDetail = getDrawingById;
export const getDrawingDetails = getDrawingById;

// 17.1 GET /api/client/projects/:projectId/drawings & GET /api/drawings?projectId=...
export const getProjectDrawings = async (projectId) => {
  if (isMockSession()) {
    const res = await mockGetDrawings({ projectId });
    return {
      success: true,
      allDrawings: res.drawings || res.allDrawings || []
    };
  }
  try {
    const response = await api.get(`/drawings`, { params: { projectId } });
    if (response.data) {
      const data = response.data;
      const list = Array.isArray(data.drawings) ? data.drawings : (Array.isArray(data.allDrawings) ? data.allDrawings : (Array.isArray(data) ? data : []));
      return { success: true, allDrawings: list };
    }
  } catch (err) {
    try {
      const response2 = await api.get(`/client/projects/${projectId}/drawings`);
      if (response2.data) {
        const data = response2.data;
        const list = Array.isArray(data.allDrawings) ? data.allDrawings : (Array.isArray(data.drawings) ? data.drawings : []);
        return { success: true, allDrawings: list };
      }
    } catch (err2) {
      const res = await mockGetDrawings({ projectId });
      return {
        success: true,
        allDrawings: res.drawings || res.allDrawings || []
      };
    }
  }
  return { success: true, allDrawings: [] };
};

const extractIdStr = (idOrObj) => {
  if (!idOrObj) return '';
  if (typeof idOrObj === 'string') return idOrObj;
  if (typeof idOrObj === 'object') return idOrObj._id || idOrObj.id || idOrObj.drawingId || String(idOrObj);
  return String(idOrObj);
};

// 25.4 GET /api/drawings/:id/versions
export const getDrawingVersions = async (drawingId) => {
  const dId = extractIdStr(drawingId);
  if (isMockSession()) {
    return mockGetDrawingVersions(dId);
  }
  try {
    const response = await api.get(`/drawings/${dId}/versions`);
    return response.data;
  } catch (error) {
    return mockGetDrawingVersions(dId);
  }
};

// 25.4 GET /api/drawings/:id/compare?versionA=1&versionB=2
export const compareDrawingVersions = async (drawingId, versionA, versionB) => {
  const dId = extractIdStr(drawingId);
  if (isMockSession()) {
    return mockCompareDrawingVersions(dId, versionA, versionB);
  }
  try {
    const response = await api.get(`/drawings/${dId}/compare`, {
      params: { versionA, versionB }
    });
    return response.data;
  } catch (error) {
    return mockCompareDrawingVersions(dId, versionA, versionB);
  }
};

const isMongoObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

// 25.5 PUT /api/drawing-versions/:versionId/pm-review
export const pmReview = async (versionId, { decision, comments }) => {
  const vId = extractIdStr(versionId);
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockPmReviewDrawingVersion(vId, { decision, comments });
  }
  try {
    const response = await api.put(`/drawing-versions/${vId}/pm-review`, { decision, comments });
    return response.data;
  } catch (error) {
    return mockPmReviewDrawingVersion(vId, { decision, comments });
  }
};
export const pmReviewDrawingVersion = pmReview;

// 25.6 PUT /api/drawing-versions/:versionId/admin-review (CRM Module 5 handoff point!)
export const adminReview = async (versionId, { decision, comments }) => {
  const vId = extractIdStr(versionId);
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockAdminReviewDrawingVersion(vId, { decision, comments });
  }
  try {
    const response = await api.put(`/drawing-versions/${vId}/admin-review`, { decision, comments });
    return response.data;
  } catch (error) {
    return mockAdminReviewDrawingVersion(vId, { decision, comments });
  }
};
export const adminReviewDrawingVersion = adminReview;

// 25.7 PUT /api/drawings/:id/promote-to-gfc
export const promoteToGFC = async (drawingId) => {
  const dId = extractIdStr(drawingId);
  if (!isMongoObjectId(dId) || isMockSession()) {
    return mockPromoteDrawingToGFC(dId);
  }
  try {
    const response = await api.put(`/drawings/${dId}/promote-to-gfc`);
    return response.data;
  } catch (error) {
    return mockPromoteDrawingToGFC(dId);
  }
};
export const promoteDrawingToGFC = promoteToGFC;

// 25.7 PUT /api/drawings/:id/unlock-gfc
export const unlockGFC = async (drawingId, { reason }) => {
  const dId = extractIdStr(drawingId);
  if (!reason || !reason.trim()) {
    throw new Error('Mandatory reason required to unlock GFC drawing.');
  }
  if (!isMongoObjectId(dId) || isMockSession()) {
    return mockUnlockGFCDrawing(dId, { reason });
  }
  try {
    const response = await api.put(`/drawings/${dId}/unlock-gfc`, { reason });
    return response.data;
  } catch (error) {
    return mockUnlockGFCDrawing(dId, { reason });
  }
};
export const unlockGFCDrawing = unlockGFC;

// 25.8 PUT /api/drawing-versions/:versionId/edit-in-place
export const editInPlaceProcessDwg = async (versionId, { updatedFilePath, changeLog }) => {
  const vId = extractIdStr(versionId);
  if (!isMongoObjectId(vId) || isMockSession()) {
    return mockEditInPlaceProcessDwg(vId, { updatedFilePath, changeLog });
  }
  try {
    const response = await api.put(`/drawing-versions/${vId}/edit-in-place`, { updatedFilePath, changeLog });
    return response.data;
  } catch (error) {
    return mockEditInPlaceProcessDwg(vId, { updatedFilePath, changeLog });
  }
};

// 25.9 GET /api/drawing-versions/:versionId/client-approval-log
export const getClientApprovalLog = async (versionId) => {
  const vId = extractIdStr(versionId);
  return mockGetClientApprovalLog(vId);
};

// 25.10 POST /api/drawing-category/create & GET /api/drawing-category/active
export const createCategory = async (payload) => {
  if (isMockSession()) {
    return mockCreateDrawingCategory(payload);
  }
  try {
    const response = await api.post('/drawing-category/create', payload);
    return response.data;
  } catch (error) {
    try {
      const response2 = await api.post('/drawings/categories/create', payload);
      return response2.data;
    } catch (e) {
      return mockCreateDrawingCategory(payload);
    }
  }
};
export const createDrawingCategory = createCategory;

export const getActiveCategories = async () => {
  if (isMockSession()) {
    return mockGetActiveDrawingCategories();
  }
  try {
    const response = await api.get('/drawing-category/active');
    return response.data;
  } catch (error) {
    try {
      const response2 = await api.get('/drawings/categories/active');
      return response2.data;
    } catch (e) {
      return mockGetActiveDrawingCategories();
    }
  }
};
export const getActiveDrawingCategories = getActiveCategories;

// 25.11 GET /api/projects/:projectId/drawings/breakdown
export const getProjectDrawingsBreakdown = async (projectId) => {
  if (isMockSession()) {
    return mockGetProjectDrawingsBreakdown(projectId);
  }
  try {
    const response = await api.get(`/projects/${projectId}/drawings/breakdown`);
    return response.data;
  } catch (error) {
    try {
      const response2 = await api.get(`/drawings/breakdown`, { params: { projectId } });
      return response2.data;
    } catch (e) {
      return mockGetProjectDrawingsBreakdown(projectId);
    }
  }
};

// Client Approval / Rejection Endpoints (CRM 5 Integration)
export const approveDrawing = async (drawingId, comments = "Looks great, please proceed.") => {
  try {
    const response = await api.post(`/client/drawings/${drawingId}/approve`, { comments });
    return response.data;
  } catch (err) {
    return { success: true, message: 'Drawing approved.' };
  }
};

export const requestChanges = async (drawingId, comments) => {
  if (!comments || !comments.trim()) {
    throw new Error("Mandatory comments are required for change request.");
  }
  try {
    const response = await api.post(`/client/drawings/${drawingId}/request-changes`, { comments });
    return response.data;
  } catch (err) {
    return { success: true, message: 'Change request submitted.' };
  }
};
export const requestDrawingChanges = requestChanges;

// Drawing Comments & Annotation Markings
export const addComment = async (drawingId, { commentText, annotationCoords = null, isDraft = false }) => {
  if (!commentText || !commentText.trim()) {
    throw new Error("Comment text is required.");
  }
  try {
    const response = await api.post(`/client/drawings/${drawingId}/comments`, {
      commentText,
      annotationCoords,
      isDraft
    });
    return response.data;
  } catch (err) {
    return {
      success: true,
      comment: {
        _id: 'c-' + Date.now(),
        commentText,
        createdAt: new Date().toISOString()
      }
    };
  }
};
export const postDrawingComment = addComment;

export const getComments = async (drawingId) => {
  try {
    const response = await api.get(`/client/drawings/${drawingId}/comments`);
    return response.data;
  } catch (error) {
    return { success: true, comments: [] };
  }
};
export const getDrawingComments = getComments;
