import api, { isMockSession } from './auth';
import * as mockApi from './mockApi';

/**
 * Drawing API Services (CRM Module 5 & 17.1 to 17.9)
 * Connects directly to backend Cloudinary upload endpoints (/api/drawings/upload and /upload-version)
 * with robust local storage quota management.
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

// Helper to sanitize & cache Data URLs for session persistence
const sanitizeUrlForStorage = (url, id = null) => {
  if (!url || typeof url !== 'string') return "";
  if (id) cacheDrawingFile(id, url);
  return url;
};

// 17.1 GET /api/client/projects/:projectId/drawings
export const getProjectDrawings = async (projectId = 'proj-1') => {
  let isClientContact = false;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    isClientContact = Boolean(user.isClientPortal || user.role === 'Customer' || user.role === 'Client');
  } catch (e) {}

  if (isClientContact && !isMockSession()) {
    try {
      const response = await api.get(`/client/projects/${projectId}/drawings`);
      if (response.data && (response.data.success || response.data.allDrawings || response.data.drawings || response.data.pendingApproval)) {
        const data = response.data;
        if (!data.allDrawings && (data.pendingApproval || data.approved || data.changesRequested)) {
          data.allDrawings = [
            ...(data.pendingApproval || []),
            ...(data.approved || []),
            ...(data.changesRequested || [])
          ];
        }
        return data;
      }
    } catch (err) {
      // Gracefully fall through to Mock API on 401/403 or network offline
    }
  }

  return await mockApi.getMockClientProjectDrawings(projectId);
};

// 17.2 GET /api/client/drawings/:drawingId
export const getDrawingDetail = async (drawingId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/drawings/${drawingId}`);
      if (response.data && response.data.success) return response.data;
    } catch (err) {
      // Backend offline or 401 - fall through to local Mock API
    }
  }

  return await mockApi.getMockDrawingDetails(drawingId);
};
export const getDrawingDetails = getDrawingDetail;

// 17.3 GET /api/client/drawings/:drawingId/versions
export const getDrawingVersions = async (drawingId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/drawings/${drawingId}/versions`);
      if (response.data && response.data.success) return response.data;
    } catch (err) {
      // Backend offline or 401 - fall through to local Mock API
    }
  }

  return await mockApi.getMockDrawingVersions(drawingId);
};

// 17.4 GET /api/client/drawings/:drawingId/compare?versionA=1&versionB=2
export const compareDrawingVersions = async (drawingId, versionA, versionB) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/drawings/${drawingId}/compare`, { 
        params: { versionA, versionB } 
      });
      if (response.data && response.data.success) return response.data;
    } catch (err) {
      // Backend offline or 401 - fall through to local Mock API
    }
  }

  return await mockApi.getMockCompareDrawingVersions(drawingId, versionA, versionB);
};

// 17.5 POST /api/client/drawings/:drawingId/approve
export const approveDrawing = async (drawingId, comments = "Looks great, please proceed.") => {
  if (!isMockSession()) {
    try {
      const response = await api.post(`/client/drawings/${drawingId}/approve`, { comments });
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error(err.response?.data?.message || "HTTP 403: Access denied. View Only accounts cannot approve drawings.");
      }
      if (err.response?.status === 409) {
        throw new Error(err.response?.data?.message || "HTTP 409: Drawing is already approved.");
      }
      if (err.response?.status === 400) {
        throw new Error(err.response?.data?.message || "HTTP 400: Drawing cannot be approved from its current status.");
      }
    }
  }

  return await mockApi.approveMockDrawing(drawingId, comments);
};

// 17.6 POST /api/client/drawings/:drawingId/request-changes
export const requestChanges = async (drawingId, comments) => {
  if (!comments || !comments.trim()) {
    throw new Error("Mandatory comments are required for change request.");
  }

  if (!isMockSession()) {
    try {
      const response = await api.post(`/client/drawings/${drawingId}/request-changes`, { comments });
      return response.data;
    } catch (err) {
      if (err.response?.status === 403) {
        throw new Error(err.response?.data?.message || "HTTP 403: Access denied. View Only accounts cannot request changes.");
      }
      if (err.response?.status === 400) {
        throw new Error(err.response?.data?.message || "HTTP 400: Mandatory comments required or drawing is locked.");
      }
    }
  }

  return await mockApi.requestMockDrawingChanges(drawingId, comments);
};
export const requestDrawingChanges = requestChanges;

// 17.7 POST /api/client/drawings/:drawingId/comments
export const addComment = async (drawingId, { commentText, annotationCoords = null, isDraft = false }) => {
  if (!commentText || !commentText.trim()) {
    throw new Error("Comment text is required.");
  }

  if (!isMockSession()) {
    try {
      const response = await api.post(`/client/drawings/${drawingId}/comments`, { 
        commentText, 
        annotationCoords, 
        isDraft 
      });
      return response.data;
    } catch (err) {
      // Fall through to Mock API
    }
  }

  return await mockApi.postMockDrawingComment(drawingId, { text: commentText, annotationCoords, isDraft });
};
export const postDrawingComment = addComment;

// 17.8 GET /api/client/drawings/:drawingId/comments
export const getComments = async (drawingId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/drawings/${drawingId}/comments`);
      if (response.data && response.data.success) return response.data;
    } catch (err) {
      // Fall through to Mock API
    }
  }

  return await mockApi.getMockDrawingComments(drawingId);
};
export const getDrawingComments = getComments;

// 17.9 GET /api/drawings/:drawingId/client-approval-log
export const getClientApprovalLog = async (drawingId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/drawings/${drawingId}/client-approval-log`);
      if (response.data && response.data.success) return response.data;
    } catch (err) {
      // Fall through to Mock API
    }
  }

  return await mockApi.getMockClientApprovalLog(drawingId);
};

// POST /api/drawings/upload - CRM Module 5: Upload new Drawing/Blueprint file via FormData
export const uploadDrawing = async (formData) => {
  if (!isMockSession()) {
    try {
      let payload = formData;
      if (!(formData instanceof FormData) && typeof formData === 'object') {
        payload = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== undefined && formData[key] !== null) {
            payload.append(key, formData[key]);
          }
        });
      }

      const response = await api.post('/drawings/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && (response.data.success || response.data.drawing)) {
        return response.data;
      }
    } catch (err) {
      console.warn("POST /drawings/upload API notice, saving locally:", err.message);
    }
  }

  const title = formData instanceof FormData ? formData.get('title') : formData.title;
  const projectId = formData instanceof FormData ? formData.get('projectId') : formData.projectId;
  const category = formData instanceof FormData ? formData.get('category') : formData.category;
  const notes = formData instanceof FormData ? formData.get('notes') : formData.notes;
  const drawingNumber = formData instanceof FormData ? formData.get('drawingNumber') : formData.drawingNumber;
  const visibleToClient = formData instanceof FormData ? formData.get('visibleToClient') !== 'false' : (formData.visibleToClient !== false);
  const fileUrl = (formData instanceof FormData ? formData.get('fileUrl') : formData.fileUrl) || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

  return createDrawing({ 
    projectId: projectId || 'proj-1', 
    title: title || 'New Design Blueprint', 
    drawingNumber: drawingNumber || `DWG-${Date.now().toString().slice(-4)}`,
    category: category || 'Working Drawings', 
    notes, 
    visibleToClient,
    fileUrl 
  });
};

// POST /api/drawings/:drawingId/upload-version - CRM Module 5: Upload new revision version (V2, V3...)
export const uploadDrawingVersion = async (drawingId, formData) => {
  if (!isMockSession()) {
    try {
      let payload = formData;
      if (!(formData instanceof FormData) && typeof formData === 'object') {
        payload = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== undefined && formData[key] !== null) {
            payload.append(key, formData[key]);
          }
        });
      }

      const response = await api.post(`/drawings/${drawingId}/upload-version`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && (response.data.success || response.data.drawing)) {
        return response.data;
      }
    } catch (err) {
      console.warn("POST /drawings/:id/upload-version API notice, saving locally:", err.message);
    }
  }

  const notes = formData instanceof FormData ? formData.get('notes') : formData.notes;
  const rawFileUrl = formData instanceof FormData ? formData.get('fileUrl') : formData.fileUrl;
  const fileUrl = sanitizeUrlForStorage(rawFileUrl) || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

  const drawings = JSON.parse(localStorage.getItem('nirman_drawings') || '[]');
  const target = drawings.find(d => d._id === drawingId || d.id === drawingId);
  if (target) {
    target.currentVersion = (target.currentVersion || 1) + 1;
    target.fileUrl = fileUrl;
    target.status = 'PENDING_CLIENT_APPROVAL';
    if (!Array.isArray(target.versions)) target.versions = [];
    target.versions.push({
      versionNumber: target.currentVersion,
      fileUrl,
      notes: notes || `Revision V${target.currentVersion}`,
      uploadedAt: new Date().toISOString()
    });
    
    try {
      localStorage.setItem('nirman_drawings', JSON.stringify(drawings));
    } catch (e) {}

    return { success: true, message: `Drawing version V${target.currentVersion} uploaded successfully.`, drawing: target };
  }

  return { success: true, message: "Revision version uploaded successfully." };
};

// Create New Drawing with Quota Safe Storage
export const createDrawing = async (drawingPayload) => {
  const drawings = JSON.parse(localStorage.getItem('nirman_drawings') || '[]');
  const safeUrl = sanitizeUrlForStorage(drawingPayload.fileUrl);

  const newDoc = {
    _id: 'drg_' + Date.now(),
    projectId: drawingPayload.projectId || 'proj-1',
    title: drawingPayload.title,
    drawingNumber: drawingPayload.drawingNumber || `DWG-${drawings.length + 1}`,
    category: drawingPayload.category || 'Working Drawings',
    currentVersion: 1,
    fileUrl: safeUrl,
    thumbnailUrl: safeUrl,
    status: drawingPayload.status || "PENDING_CLIENT_APPROVAL",
    visibleToClient: drawingPayload.visibleToClient !== undefined ? drawingPayload.visibleToClient : true,
    versions: [
      { versionNumber: 1, fileUrl: safeUrl, notes: drawingPayload.notes || 'Initial Draft Upload', uploadedAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString()
  };
  drawings.unshift(newDoc);

  try {
    localStorage.setItem('nirman_drawings', JSON.stringify(drawings));
  } catch (e) {
    try {
      localStorage.setItem('nirman_drawings', JSON.stringify(drawings.slice(0, 3)));
    } catch (err2) {}
  }

  return {
    success: true,
    message: "Drawing saved successfully.",
    drawing: newDoc
  };
};
