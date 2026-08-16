import api from '../auth';

/**
 * CRM Lead Management API Services
 * Connects directly to backend DB endpoints:
 * - POST /leads/create
 * - GET /leads
 * - GET /leads/followups/due
 * - GET /leads/:id
 * - PUT /leads/:id/update
 * - PUT /leads/:id/update-status
 * - POST /leads/:id/log-interaction
 * - GET /leads/:id/interactions
 * - GET /leads/:id/status-history
 * - POST /leads/:id/convert-to-client
 * - DELETE /leads/:id
 */

export const createLead = async (payload) => {
  const response = await api.post('/leads/create', payload);
  return response.data;
};

export const getLeads = async (params = {}) => {
  try {
    const response = await api.get('/leads', { params });
    if (response.data) {
      if (Array.isArray(response.data)) {
        return { success: true, leads: response.data };
      }
      if (response.data.data && Array.isArray(response.data.data.leads)) {
        return { success: true, leads: response.data.data.leads };
      }
      if (Array.isArray(response.data.leads)) {
        return { success: true, leads: response.data.leads };
      }
      if (Array.isArray(response.data.data)) {
        return { success: true, leads: response.data.data };
      }
      return { success: true, leads: response.data.leads || [] };
    }
    return { success: true, leads: [] };
  } catch (err) {
    console.warn("getLeads API call failed:", err);
    return { success: false, leads: [], message: err.message };
  }
};

export const getDueFollowUps = async (params = {}) => {
  try {
    const response = await api.get('/leads/followups/due', { params });
    return response.data;
  } catch (err) {
    return { success: false, data: [] };
  }
};

export const getLeadById = async (id) => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

export const updateLead = async (id, payload) => {
  const response = await api.put(`/leads/${id}/update`, payload);
  return response.data;
};

export const updateLeadStatus = async (id, payload) => {
  const response = await api.put(`/leads/${id}/update-status`, payload);
  return response.data;
};

export const logInteraction = async (id, payload) => {
  const response = await api.post(`/leads/${id}/log-interaction`, payload);
  return response.data;
};

export const getLeadInteractions = async (id) => {
  const response = await api.get(`/leads/${id}/interactions`);
  return response.data;
};

export const getLeadStatusHistory = async (id) => {
  const response = await api.get(`/leads/${id}/status-history`);
  return response.data;
};

export const convertToClientStub = async (id) => {
  try {
    const response = await api.post(`/leads/${id}/convert-to-client`);
    return response.data;
  } catch (err) {
    console.warn("convert-to-client endpoint error:", err);
    throw err;
  }
};

export const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

export default {
  createLead,
  getLeads,
  getDueFollowUps,
  getLeadById,
  updateLead,
  updateLeadStatus,
  logInteraction,
  getLeadInteractions,
  getLeadStatusHistory,
  convertToClientStub,
  deleteLead
};
