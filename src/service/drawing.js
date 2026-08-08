import api from './auth';

/**
 * Drawing API Services (CRM Module 5 & 17.1 to 17.9)
 * Connects directly to backend DB / Cloudinary upload endpoints (/api/drawings)
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

// 17.1 GET /api/client/projects/:projectId/drawings
export const getProjectDrawings = async (projectId) => {
  try {
    const response = await api.get(`/client/projects/${projectId}/drawings`);
    if (response.data) {
      const data = response.data;
      if (!data.allDrawings && (data.pendingApproval || data.approved || data.changesRequested)) {
        data.allDrawings = [
          ...(data.pendingApproval || []),
          ...(data.approved || []),
          ...(data.changesRequested || [])
        ];
      }
      return {
        success: true,
        allDrawings: Array.isArray(data.allDrawings) ? data.allDrawings : (Array.isArray(data.drawings) ? data.drawings : [])
      };
    }
  } catch (err) {}
  return { success: true, allDrawings: [] };
};

// 17.2 GET /api/client/drawings/:drawingId
export const getDrawingDetail = async (drawingId) => {
  const response = await api.get(`/client/drawings/${drawingId}`);
  return response.data;
};
export const getDrawingDetails = getDrawingDetail;

// 17.3 GET /api/client/drawings/:drawingId/versions
export const getDrawingVersions = async (drawingId) => {
  const response = await api.get(`/client/drawings/${drawingId}/versions`);
  return response.data;
};

// 17.4 GET /api/client/drawings/:drawingId/compare?versionA=1&versionB=2
export const compareDrawingVersions = async (drawingId, versionA, versionB) => {
  const response = await api.get(`/client/drawings/${drawingId}/compare`, { 
    params: { versionA, versionB } 
  });
  return response.data;
};

// 17.5 POST /api/client/drawings/:drawingId/approve
export const approveDrawing = async (drawingId, comments = "Looks great, please proceed.") => {
  const response = await api.post(`/client/drawings/${drawingId}/approve`, { comments });
  return response.data;
};

// 17.6 POST /api/client/drawings/:drawingId/request-changes
export const requestChanges = async (drawingId, comments) => {
  if (!comments || !comments.trim()) {
    throw new Error("Mandatory comments are required for change request.");
  }
  const response = await api.post(`/client/drawings/${drawingId}/request-changes`, { comments });
  return response.data;
};
export const requestDrawingChanges = requestChanges;

// 17.7 POST /api/client/drawings/:drawingId/comments
export const addComment = async (drawingId, { commentText, annotationCoords = null, isDraft = false }) => {
  if (!commentText || !commentText.trim()) {
    throw new Error("Comment text is required.");
  }
  const response = await api.post(`/client/drawings/${drawingId}/comments`, { 
    commentText, 
    annotationCoords, 
    isDraft 
  });
  return response.data;
};
export const postDrawingComment = addComment;

// 17.8 GET /api/client/drawings/:drawingId/comments
export const getComments = async (drawingId) => {
  try {
    const response = await api.get(`/client/drawings/${drawingId}/comments`);
    return response.data;
  } catch (error) {
    return { success: false, comments: [] };
  }
};
export const getDrawingComments = getComments;

// 17.9 GET /api/drawings/:drawingId/client-approval-log
export const getClientApprovalLog = async (drawingId) => {
  try {
    const response = await api.get(`/drawings/${drawingId}/client-approval-log`);
    return response.data;
  } catch (error) {
    return { success: false, logs: [] };
  }
};

// POST /api/drawings/upload - CRM Module 5: Upload new Drawing/Blueprint file via FormData
export const uploadDrawing = async (formData) => {
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
  return response.data;
};

// POST /api/drawings/:drawingId/upload-version - CRM Module 5: Upload new revision version (V2, V3...)
export const uploadDrawingVersion = async (drawingId, formData) => {
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
  return response.data;
};

export const createDrawing = async (drawingPayload) => {
  const response = await api.post('/drawings', drawingPayload);
  return response.data;
};
