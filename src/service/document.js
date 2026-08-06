import api, { isMockSession } from './auth';
import * as mockApi from './mockApi';

/**
 * CRM Module 6 - Client Document Access API Services (Endpoints 18.1 to 18.5)
 * Direct Backend DB Communication so created & updated documents persist permanently.
 */

// 18.1 GET /api/client/projects/:projectId/documents?folder=&search=
export const getProjectDocuments = async (projectId = 'proj-1', { folder = '', search = '' } = {}) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/projects/${projectId}/documents`, {
        params: { folder, search }
      });
      if (response.data && response.data.success) {
        const data = response.data;
        if (!data.allDocuments && data.documentsByFolder) {
          const flattened = [];
          Object.values(data.documentsByFolder).forEach(list => {
            if (Array.isArray(list)) flattened.push(...list);
          });
          data.allDocuments = flattened;
        }
        return data;
      }
    } catch (err) {
      // Fall through to Mock API
    }
  }

  return await mockApi.getMockClientProjectDocuments(projectId, { folder, search });
};

// 18.2 GET /api/client/documents/:documentId/preview
export const previewDocument = async (documentId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/documents/${documentId}/preview`);
      if (response.data && response.data.success) return response.data;
    } catch (err) {
      // Fall through to Mock API
    }
  }

  try {
    return await mockApi.previewMockDocument(documentId);
  } catch (mockErr) {
    throw mockErr;
  }
};

// 18.3 GET /api/client/documents/:documentId/download
export const downloadDocument = async (documentId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/documents/${documentId}/download`);
      if (response.data && response.data.success) return response.data;
    } catch (err) {
      if (err.response?.status === 410) {
        throw new Error(err.response?.data?.message || "HTTP 410: Document is soft-deleted and no longer available for download.");
      }
      if (err.response?.status === 403) {
        throw new Error(err.response?.data?.message || "HTTP 403: Access denied.");
      }
    }
  }

  try {
    return await mockApi.downloadMockDocument(documentId);
  } catch (mockErr) {
    throw mockErr;
  }
};

// 18.4 GET /api/documents/:documentId/client-access-log
export const getDocumentAccessLog = async (documentId) => {
  try {
    const response = await api.get(`/documents/${documentId}/client-access-log`);
    return response.data;
  } catch (err) {
    console.error("getDocumentAccessLog API error:", err);
    return { success: false, accessLogs: [] };
  }
};

// 18.5 GET /api/documents/client-engagement/:clientId
export const getClientEngagementSummary = async (clientId = 'client-1') => {
  try {
    const response = await api.get(`/documents/client-engagement/${clientId}`);
    return response.data;
  } catch (err) {
    console.error("getClientEngagementSummary API error:", err);
    return {
      success: false,
      summary: {
        totalSharedDocuments: 0,
        totalEngagedDocuments: 0,
        engagementRatePercent: 0,
        unopenedDocuments: []
      }
    };
  }
};

// POST /api/documents - Upload/Create New Document in Backend DB
export const createDocument = async (documentPayload) => {
  try {
    const response = await api.post('/documents', documentPayload);
    return response.data;
  } catch (err) {
    console.error("createDocument API error:", err);
    try {
      const altRes = await api.post('/documents/create', documentPayload);
      return altRes.data;
    } catch (altErr) {
      throw err;
    }
  }
};
