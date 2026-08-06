import api from './auth';
import {
  mockCreateClient,
  mockGetClients,
  mockGetClientById,
  mockUpdateClient,
  mockDeactivateClient,
  mockAddClientContact,
  mockGetClientContacts,
  mockUpdateContactPermission,
  mockDeactivateContact,
  mockResetTempPassword,
  mockClientLogin,
  mockClientChangePassword,
  mockClientForgotPassword,
  mockClientResetPassword,
  mockGetClientMe,
  mockCreateClientProjectLink,
  mockGetLinksByClient,
  mockGetLinksByProject,
  mockToggleProjectLinkVisibility,
  mockUnlinkProject,
  mockGetMyClientProjects
} from './mockApi';

// ==========================================
// CRM MODULE 2 - CLIENT MASTER APIS
// ==========================================

/**
 * Directly create Client account & Primary OWNER Contact (no prior lead)
 * POST /api/clients/create or POST /api/clients
 */
export const createClient = async (payload) => {
  try {
    const response = await api.post('/clients', payload);
    return response.data;
  } catch (error) {
    try {
      const response = await api.post('/clients/create', payload);
      return response.data;
    } catch (err) {
      console.warn("Backend /clients endpoint offline, serving via Mock API:", err?.response?.data || err.message);
      return await mockCreateClient(payload);
    }
  }
};

/**
 * Get paginated and searchable list of Client accounts
 * GET /api/clients
 */
export const getClients = async (params = {}) => {
  try {
    const response = await api.get('/clients', { params });
    return response.data;
  } catch (error) {
    console.warn("Backend /clients offline, serving via Mock API:", error);
    return await mockGetClients(params);
  }
};

/**
 * Get Client details by ID with associated ClientContacts
 * GET /api/clients/:id
 */
export const getClientById = async (id) => {
  try {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend /clients/${id} offline, serving via Mock API:`, error);
    return await mockGetClientById(id);
  }
};

/**
 * Update Client account-level fields
 * PUT /api/clients/:id
 */
export const updateClient = async (id, payload) => {
  try {
    const response = await api.put(`/clients/${id}`, payload);
    return response.data;
  } catch (error) {
    console.warn(`Backend PUT /clients/${id} offline, serving via Mock API:`, error);
    return await mockUpdateClient(id, payload);
  }
};

/**
 * Soft-deactivate Client account (Active project safeguard)
 * PUT /api/clients/:id/deactivate
 */
export const deactivateClient = async (id, force = false) => {
  try {
    const response = await api.put(`/clients/${id}/deactivate`, {}, { params: { force } });
    return response.data;
  } catch (error) {
    console.warn(`Backend PUT /clients/${id}/deactivate offline, serving via Mock API:`, error);
    return await mockDeactivateClient(id, force);
  }
};

// ==========================================
// CRM MODULE 2 - CLIENT CONTACTS APIS
// ==========================================

/**
 * Add additional ClientContact to a Client account
 * POST /api/clients/:clientId/contacts/add
 */
export const addClientContact = async (clientId, payload) => {
  try {
    const response = await api.post(`/clients/${clientId}/contacts/add`, payload);
    return response.data;
  } catch (error) {
    console.warn(`Backend POST /clients/${clientId}/contacts/add offline, serving via Mock API:`, error);
    return await mockAddClientContact(clientId, payload);
  }
};

/**
 * List all ClientContacts for a Client account
 * GET /api/clients/:clientId/contacts
 */
export const getClientContacts = async (clientId) => {
  try {
    const response = await api.get(`/clients/${clientId}/contacts`);
    return response.data;
  } catch (error) {
    console.warn(`Backend GET /clients/${clientId}/contacts offline, serving via Mock API:`, error);
    return await mockGetClientContacts(clientId);
  }
};

/**
 * Update permission level of a ClientContact (OWNER, MEMBER, VIEW_ONLY)
 * PUT /api/clients/:clientId/contacts/:contactId/permission
 */
export const updateContactPermission = async (clientId, contactId, newPermissionLevel) => {
  try {
    const response = await api.put(`/clients/${clientId}/contacts/${contactId}/permission`, { newPermissionLevel });
    return response.data;
  } catch (error) {
    console.warn(`Backend PUT /clients/${clientId}/contacts/${contactId}/permission offline, serving via Mock API:`, error);
    return await mockUpdateContactPermission(clientId, contactId, newPermissionLevel);
  }
};

/**
 * Soft-deactivate a ClientContact account
 * PUT /api/clients/:clientId/contacts/:contactId/deactivate
 */
export const deactivateContact = async (clientId, contactId) => {
  try {
    const response = await api.put(`/clients/${clientId}/contacts/${contactId}/deactivate`);
    return response.data;
  } catch (error) {
    console.warn(`Backend PUT /clients/${clientId}/contacts/${contactId}/deactivate offline, serving via Mock API:`, error);
    return await mockDeactivateContact(clientId, contactId);
  }
};

/**
 * Regenerate temporary password for ClientContact (Admin Helper)
 * POST /api/clients/:clientId/contacts/:contactId/reset-temp-password
 */
export const resetTempPassword = async (clientId, contactId) => {
  try {
    const response = await api.post(`/clients/${clientId}/contacts/${contactId}/reset-temp-password`);
    return response.data;
  } catch (error) {
    console.warn(`Backend POST /clients/${clientId}/contacts/${contactId}/reset-temp-password offline, serving via Mock API:`, error);
    return await mockResetTempPassword(clientId, contactId);
  }
};

// ==========================================
// CRM MODULE 2 - CLIENT PORTAL AUTH APIS
// ==========================================

/**
 * Client Portal Login
 * POST /api/client-auth/login
 */
export const clientLogin = async (credentials) => {
  try {
    const response = await api.post('/client-auth/login', credentials);
    if (response.data && (response.data.success || response.data.token)) {
      return response.data;
    }
    return await mockClientLogin(credentials);
  } catch (error) {
    console.warn("Backend /client-auth/login offline/error, serving via Mock API:", error);
    return await mockClientLogin(credentials);
  }
};

/**
 * Change password for logged-in ClientContact
 * POST /api/client-auth/change-password
 */
export const clientChangePassword = async (payload) => {
  try {
    const response = await api.post('/client-auth/change-password', payload);
    return response.data;
  } catch (error) {
    console.warn("Backend /client-auth/change-password offline, serving via Mock API:", error);
    return await mockClientChangePassword(payload);
  }
};

/**
 * Request password reset token for ClientContact
 * POST /api/client-auth/forgot-password
 */
export const clientForgotPassword = async (email) => {
  try {
    const response = await api.post('/client-auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.warn("Backend /client-auth/forgot-password offline, serving via Mock API:", error);
    return await mockClientForgotPassword(email);
  }
};

/**
 * Reset password using reset token
 * POST /api/client-auth/reset-password
 */
export const clientResetPassword = async (payload) => {
  try {
    const response = await api.post('/client-auth/reset-password', payload);
    return response.data;
  } catch (error) {
    console.warn("Backend /client-auth/reset-password offline, serving via Mock API:", error);
    return await mockClientResetPassword(payload);
  }
};

/**
 * Get current logged-in ClientContact profile & parent Client details
 * GET /api/client-auth/me
 */
export const getClientMe = async () => {
  try {
    const response = await api.get('/client-auth/me');
    return response.data;
  } catch (error) {
    console.warn("Backend /client-auth/me offline, serving via Mock API:", error);
    return await mockGetClientMe();
  }
};

// ==========================================
// CRM MODULE 3 - CLIENT-PROJECT LINKAGE APIS
// ==========================================

/**
 * Link a Project to a Client account (Internal PM / Admin)
 * POST /api/client-project-links/create or POST /api/client-project-links
 */
export const createClientProjectLink = async (payload) => {
  try {
    const response = await api.post('/client-project-links/create', payload);
    return response.data;
  } catch (error) {
    console.warn("Backend /client-project-links/create offline, serving via Mock API:", error);
    return await mockCreateClientProjectLink(payload);
  }
};

/**
 * Get active project links for a specific Client account
 * GET /api/client-project-links/by-client/:clientId
 */
export const getLinksByClient = async (clientId) => {
  try {
    const response = await api.get(`/client-project-links/by-client/${clientId}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend GET /client-project-links/by-client/${clientId} offline, serving via Mock API:`, error);
    return await mockGetLinksByClient(clientId);
  }
};

/**
 * Get active client links for a specific Project
 * GET /api/client-project-links/by-project/:projectId
 */
export const getLinksByProject = async (projectId) => {
  try {
    const response = await api.get(`/client-project-links/by-project/${projectId}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend GET /client-project-links/by-project/${projectId} offline, serving via Mock API:`, error);
    return await mockGetLinksByProject(projectId);
  }
};

/**
 * Toggle project visibility to client portal
 * PUT /api/client-project-links/:id/visibility
 */
export const toggleProjectLinkVisibility = async (id, visibleToClient) => {
  try {
    const response = await api.put(`/client-project-links/${id}/visibility`, { visibleToClient });
    return response.data;
  } catch (error) {
    console.warn(`Backend PUT /client-project-links/${id}/visibility offline, serving via Mock API:`, error);
    return await mockToggleProjectLinkVisibility(id, visibleToClient);
  }
};

/**
 * Soft-delete (unlink) a project from a client (Admin / Super Admin ONLY)
 * DELETE /api/client-project-links/:id
 */
export const unlinkProject = async (id, notes = '') => {
  try {
    const response = await api.delete(`/client-project-links/${id}`, { data: { notes } });
    return response.data;
  } catch (error) {
    console.warn(`Backend DELETE /client-project-links/${id} offline, serving via Mock API:`, error);
    return await mockUnlinkProject(id, notes);
  }
};

/**
 * Get visible linked projects for authenticated ClientContact
 * GET /api/client/projects/my
 */
export const getMyClientProjects = async () => {
  try {
    const response = await api.get('/client/projects/my');
    return response.data;
  } catch (error) {
    console.warn("Backend GET /client/projects/my offline, serving via Mock API:", error);
    return await mockGetMyClientProjects();
  }
};

// Re-export CRM Module 4 Client Portal Core APIs
export {
  getClientDashboard,
  getClientProjectDetail,
  getClientProjectMilestones,
  getClientProjectTimeline,
  updateClientProfile,
  logClientSessionLogin,
  sendClientSessionHeartbeat
} from './clientPortal';

export default {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deactivateClient,
  addClientContact,
  getClientContacts,
  updateContactPermission,
  deactivateContact,
  resetTempPassword,
  clientLogin,
  clientChangePassword,
  clientForgotPassword,
  clientResetPassword,
  getClientMe,
  createClientProjectLink,
  getLinksByClient,
  getLinksByProject,
  toggleProjectLinkVisibility,
  unlinkProject,
  getMyClientProjects
};
