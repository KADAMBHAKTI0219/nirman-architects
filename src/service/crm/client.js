import api, { isMockSession } from '../auth';
import * as mockApi from '../mockApi';

// ==========================================
// CRM MODULE 2 - CLIENT MASTER APIS
// ==========================================

export const createClient = async (payload) => {
  if (isMockSession()) return await mockApi.mockCreateClient(payload);
  try {
    const response = await api.post('/clients', payload);
    return response.data;
  } catch (error) {
    const response = await api.post('/clients/create', payload);
    return response.data;
  }
};

export const getClients = async (params = {}) => {
  if (isMockSession()) return await mockApi.mockGetClients(params);
  const response = await api.get('/clients', { params });
  return response.data;
};

export const getClientById = async (id) => {
  if (isMockSession()) return await mockApi.mockGetClientById(id);
  const response = await api.get(`/clients/${id}`);
  return response.data;
};

export const updateClient = async (id, payload) => {
  if (isMockSession()) return await mockApi.mockUpdateClient(id, payload);
  const response = await api.put(`/clients/${id}`, payload);
  return response.data;
};

export const deactivateClient = async (id, force = false) => {
  if (isMockSession()) return await mockApi.mockDeactivateClient(id, force);
  const response = await api.put(`/clients/${id}/deactivate`, {}, { params: { force } });
  return response.data;
};

// ==========================================
// CRM MODULE 2 - CLIENT CONTACTS APIS
// ==========================================

export const addClientContact = async (clientId, payload) => {
  const response = await api.post(`/clients/${clientId}/contacts/add`, payload);
  return response.data;
};

export const getClientContacts = async (clientId) => {
  const response = await api.get(`/clients/${clientId}/contacts`);
  return response.data;
};

export const updateContactPermission = async (clientId, contactId, newPermissionLevel) => {
  const response = await api.put(`/clients/${clientId}/contacts/${contactId}/permission`, { newPermissionLevel });
  return response.data;
};

export const deactivateContact = async (clientId, contactId) => {
  const response = await api.put(`/clients/${clientId}/contacts/${contactId}/deactivate`);
  return response.data;
};

export const resetTempPassword = async (clientId, contactId) => {
  const response = await api.post(`/clients/${clientId}/contacts/${contactId}/reset-temp-password`);
  return response.data;
};

// ==========================================
// CRM MODULE 2 - CLIENT PORTAL AUTH APIS
// ==========================================

export const clientLogin = async (credentials) => {
  try {
    const response = await api.post('/client-auth/login', credentials);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 429) {
        const retryAfterHeader = error.response.headers?.['retry-after'];
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 180;
        return {
          success: false,
          isRateLimited: true,
          status: 429,
          retryAfter: retryAfterSeconds,
          message: error.response?.data?.message || '5 consecutive failed login attempts detected. Access has been temporarily restricted for security.'
        };
      }
      return {
        success: false,
        status: error.response.status,
        message: error.response?.data?.message || error.response?.data?.error || 'Invalid credentials or login failed.'
      };
    }
    return {
      success: false,
      message: error.message || 'Error authenticating client.'
    };
  }
};

export const clientChangePassword = async (payload) => {
  try {
    const token = payload?.token || localStorage.getItem('token') || localStorage.getItem('clientToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const requestData = {
      oldPassword: payload.oldPassword || payload.currentPassword || payload.tempPassword,
      currentPassword: payload.oldPassword || payload.currentPassword || payload.tempPassword,
      tempPassword: payload.oldPassword || payload.currentPassword || payload.tempPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword || payload.newPassword
    };

    const response = await api.post('/client-auth/change-password', requestData, { headers });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to update password.'
    };
  }
};

export const clientForgotPassword = async (email) => {
  const response = await api.post('/client-auth/forgot-password', { email });
  return response.data;
};

export const clientResetPassword = async (payload) => {
  const response = await api.post('/client-auth/reset-password', payload);
  return response.data;
};

export const getClientMe = async () => {
  const response = await api.get('/client-auth/me');
  return response.data;
};

// ==========================================
// CRM MODULE 3 - CLIENT-PROJECT LINKAGE APIS
// ==========================================

export const createClientProjectLink = async (payload) => {
  const response = await api.post('/client-project-links/create', payload);
  return response.data;
};

export const getLinksByClient = async (clientId) => {
  const response = await api.get(`/client-project-links/by-client/${clientId}`);
  return response.data;
};

export const getLinksByProject = async (projectId) => {
  const response = await api.get(`/client-project-links/by-project/${projectId}`);
  return response.data;
};

export const toggleProjectLinkVisibility = async (id, visibleToClient) => {
  const response = await api.put(`/client-project-links/${id}/visibility`, { visibleToClient });
  return response.data;
};

export const unlinkProject = async (id, notes = '') => {
  const response = await api.delete(`/client-project-links/${id}`, { data: { notes } });
  return response.data;
};

export const getMyClientProjects = async () => {
  const response = await api.get('/client/projects/my');
  return response.data;
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
