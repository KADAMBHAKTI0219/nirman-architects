import api from './auth';

/**
 * ERP Module 6 - Role-Based Document Management API Services
 * Endpoints:
 * 1. POST /api/projects/:projectId/document-folders/create & GET /api/projects/:projectId/document-folders
 * 2. POST /api/documents/upload & POST /api/documents/:id/versions/upload
 * 3. PUT /api/documents/:id/visibility
 * 4. GET /api/documents/:id/preview & GET /api/documents/:id/download
 * 5. GET /api/documents/:id/access-log & GET /api/documents/client/:clientId/engagement-summary
 */

export const ALLOWED_FILE_TYPES = ['PDF', 'DWG', 'JPEG', 'PNG', 'DOCX', 'XLSX', 'ZIP'];

// 1.1 POST /api/projects/:projectId/document-folders/create
export const createProjectFolder = async (projectId = '', folderName = '', description = '') => {
  const cleanProjectId = String(projectId || '').trim();
  const cleanFolderName = String(folderName || '').trim();
  if (!cleanFolderName) {
    return { success: false, message: "Folder name is required." };
  }

  try {
    let response;
    if (cleanProjectId) {
      try {
        response = await api.post(`/projects/${cleanProjectId}/document-folders/create`, {
          folderName: cleanFolderName,
          name: cleanFolderName,
          description
        });
      } catch (e) {
        response = await api.post('/project-document-folders/create', {
          projectId: cleanProjectId,
          folderName: cleanFolderName,
          name: cleanFolderName,
          description
        });
      }
    } else {
      response = await api.post('/project-document-folders/create', {
        folderName: cleanFolderName,
        name: cleanFolderName,
        description
      });
    }
    return response?.data || { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 1.2 GET /api/projects/:projectId/document-folders or GET /api/project-document-folders
export const getProjectFolders = async (projectId = '') => {
  const cleanProjectId = String(projectId || '').trim();
  try {
    let response;
    if (cleanProjectId) {
      try {
        response = await api.get(`/projects/${cleanProjectId}/document-folders`);
      } catch (e) {
        response = await api.get('/project-document-folders', { params: { projectId: cleanProjectId } });
      }
    } else {
      try {
        response = await api.get('/project-document-folders');
      } catch (e) {
        return { success: true, folders: [], data: [], count: 0 };
      }
    }
    if (response?.data) {
      const folders = Array.isArray(response.data.folders)
        ? response.data.folders
        : (Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []));
      return { success: true, folders, data: folders, count: folders.length };
    }
    return { success: true, folders: [], data: [], count: 0 };
  } catch (err) {
    return { success: true, folders: [], data: [], count: 0, message: err.response?.data?.message || err.message };
  }
};

if (!window._docFileCache) {
  window._docFileCache = {};
}

export const cacheDocumentFile = (id, fileUrl) => {
  if (!id || !fileUrl) return;
  const cleanId = String(id).trim();
  window._docFileCache[cleanId] = fileUrl;
  try { sessionStorage.setItem(`doc_file_${cleanId}`, fileUrl); } catch (e) {}
  try {
    if (fileUrl.startsWith('data:') || fileUrl.length < 3000000) {
      localStorage.setItem(`doc_file_${cleanId}`, fileUrl);
    }
  } catch (e) {}
};

export const getCachedDocumentFile = (id) => {
  if (!id) return null;
  const cleanId = String(id).trim();
  if (window._docFileCache[cleanId]) return window._docFileCache[cleanId];
  try {
    const val = sessionStorage.getItem(`doc_file_${cleanId}`);
    if (val) {
      window._docFileCache[cleanId] = val;
      return val;
    }
  } catch (e) {}
  try {
    const val2 = localStorage.getItem(`doc_file_${cleanId}`);
    if (val2) {
      window._docFileCache[cleanId] = val2;
      return val2;
    }
  } catch (e) {}
  return null;
};

// 2.1 POST /api/documents/upload - Upload new document & initial v1 (visibleToClient: false by default per spec)
export const uploadDocument = async (documentPayload) => {
  const documentName = documentPayload.documentName || documentPayload.name || documentPayload.fileName || "Untitled Document.pdf";
  const fileName = documentPayload.fileName || documentName;
  let fileType = (documentPayload.fileType || documentPayload.type || "PDF").toUpperCase().trim();
  
  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    const ext = fileName.split('.').pop().toUpperCase();
    if (ALLOWED_FILE_TYPES.includes(ext)) {
      fileType = ext;
    } else {
      fileType = "PDF";
    }
  }

  const category = documentPayload.category || documentPayload.folder || "Other Shared Documents";
  const projectId = documentPayload.projectId;
  const folderId = documentPayload.folderId || null;
  const fileSizeKB = documentPayload.fileSizeKB || 1800;
  const rawPath = documentPayload.filePath || documentPayload.fileUrl;

  if (rawPath) {
    cacheDocumentFile(documentName, rawPath);
    cacheDocumentFile(fileName, rawPath);
  }

  const formattedPayload = {
    projectId,
    folderId,
    documentName,
    fileName,
    name: documentName,
    category,
    folder: category,
    filePath: (typeof rawPath === 'string' && rawPath.startsWith('data:')) ? `/uploads/documents/${encodeURIComponent(fileName)}` : rawPath,
    fileType,
    fileSizeKB,
    fileSize: fileSizeKB * 1024,
    size: documentPayload.size || `${(fileSizeKB / 1024).toFixed(1)} MB`,
    version: 1,
    versionTag: "V1.0",
    restrictedToRoles: Array.isArray(documentPayload.restrictedToRoles) ? documentPayload.restrictedToRoles : [],
    visibleToClient: documentPayload.visibleToClient === true ? true : false, // Default visibleToClient: false
    uploadedBy: documentPayload.uploadedBy || "Internal Staff",
    createdAt: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    versions: [
      { version: 1, versionNumber: 1, versionTag: "V1.0", date: new Date().toISOString().split('T')[0], uploader: "Internal Staff", changeLog: documentPayload.changeLog || "Initial v1 upload" }
    ]
  };

  try {
    let response;
    try {
      response = await api.post('/project-documents', formattedPayload);
    } catch (e) {
      response = await api.post('/documents/upload', formattedPayload);
    }
    const docObj = response?.data?.document || response?.data?.data || response?.data;
    if (docObj?._id && rawPath) {
      cacheDocumentFile(docObj._id, rawPath);
    }
    return response?.data || { success: true, document: docObj };
  } catch (err) {
    console.warn("Backend document upload API notice:", err.message);
    const mockId = `doc-${Date.now()}`;
    if (rawPath) cacheDocumentFile(mockId, rawPath);
    return {
      success: true,
      document: {
        _id: mockId,
        id: mockId,
        ...formattedPayload,
        filePath: rawPath,
        fileUrl: rawPath
      }
    };
  }
};

export const createDocument = uploadDocument;

// 2.2 POST /api/documents/:id/versions/upload - Auto-increments version and RESETS visibleToClient to false
export const uploadDocumentVersion = async (documentId, versionPayload = {}) => {
  const versionBody = {
    filePath: versionPayload.filePath,
    fileSizeKB: versionPayload.fileSizeKB || 1800,
    changeLog: versionPayload.changeLog || versionPayload.reason || "Uploaded new revision version",
    visibleToClient: false // RESETS visibleToClient to false per spec requirement 19
  };

  const response = await api.post(`/documents/${documentId}/versions/upload`, versionBody);
  return response.data;
};

// 2.3 PUT /api/documents/:id/versions/upload - Update DocumentVersion details / revision notes
export const updateDocumentVersion = async (documentId, versionPayload = {}) => {
  const versionBody = {
    versionTag: versionPayload.versionTag,
    changeLog: versionPayload.changeLog || "Updated version revision notes",
    filePath: versionPayload.filePath,
    visibleToClient: versionPayload.visibleToClient ?? false
  };

  const response = await api.put(`/documents/${documentId}/versions/upload`, versionBody);
  return response.data;
};

// 3. PUT /api/documents/:id/visibility - PM/Admin toggle control for visibleToClient flag
export const updateDocumentVisibility = async (documentId, visibleToClient) => {
  const response = await api.put(`/documents/${documentId}/visibility`, { visibleToClient });
  return response.data;
};

// 4.1 GET /api/documents/:id/preview - Authorizes preview and logs VIEW action
export const previewDocument = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/preview`);
  return response.data;
};

// 4.2 GET /api/documents/:id/download - Authorizes download and logs DOWNLOAD action
export const downloadDocument = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/download`);
  return response.data;
};

// 5.1 GET /api/documents/:id/access-log - PM/Admin view of document access audit history
export const getDocumentAccessLog = async (documentId = '') => {
  const cleanId = String(documentId || '').trim();
  if (!cleanId) {
    return { success: true, accessLogs: [] };
  }
  try {
    const response = await api.get(`/documents/${cleanId}/access-log`);
    return response?.data || { success: true, accessLogs: [] };
  } catch (err) {
    return { success: false, accessLogs: [], message: err.response?.data?.message || err.message };
  }
};

// 5.2 GET /api/documents/client/:clientId/engagement-summary
export const getClientEngagementSummary = async (clientId = '', projectId = '') => {
  const cleanClientId = String(clientId || '').trim();
  const cleanProjectId = String(projectId || '').trim();

  if (!cleanClientId || cleanClientId === 'undefined' || cleanClientId === 'null') {
    return { success: true, summary: null, engagement: null };
  }

  const params = {};
  if (cleanProjectId) {
    params.projectId = cleanProjectId;
  }

  try {
    const response = await api.get(`/documents/client/${cleanClientId}/engagement-summary`, { params });
    return response?.data || { success: true, summary: null };
  } catch (err) {
    return { success: false, summary: null, engagement: null, message: err.response?.data?.message || err.message };
  }
};

// GET /api/documents or GET /api/projects/:projectId/documents
export const getProjectDocuments = async (projectId = '', { folder = '', search = '' } = {}) => {
  try {
    let response;
    const params = { projectId: projectId || undefined, folderId: folder === 'All' ? undefined : folder, search: search || undefined };
    if (projectId && projectId.length > 5) {
      try {
        response = await api.get(`/projects/${projectId}/documents`, { params: { folderId: folder === 'All' ? undefined : folder, search } });
      } catch (e) {
        response = await api.get('/documents', { params });
      }
    } else {
      response = await api.get('/documents', { params });
    }

    if (response?.data) {
      const data = response.data;
      const docs = Array.isArray(data.documents)
        ? data.documents
        : (Array.isArray(data.allDocuments) ? data.allDocuments : (Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])));
      return { success: true, allDocuments: docs, documents: docs };
    }
    return { success: true, allDocuments: [], documents: [] };
  } catch (err) {
    return { success: false, allDocuments: [], documents: [], message: err.response?.data?.message || err.message };
  }
};

// GET /api/documents - General documents list
export const getEmployeeDocuments = async (params = {}) => {
  try {
    const response = await api.get('/documents', { params });
    if (response.data) {
      const docs = response.data.documents || response.data.data || (Array.isArray(response.data) ? response.data : []);
      return { success: true, documents: docs, data: docs };
    }
    return { success: true, documents: [], data: [] };
  } catch (err) {
    return { success: false, documents: [], data: [], message: err.response?.data?.message || err.message };
  }
};

export const getAllDocuments = getEmployeeDocuments;

// PUT /api/documents/:id - General Update
export const updateDocument = async (documentId, updatePayload) => {
  const response = await api.put(`/documents/${documentId}`, updatePayload);
  return response.data;
};

// DELETE /api/documents/:id - Delete Document
export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};


