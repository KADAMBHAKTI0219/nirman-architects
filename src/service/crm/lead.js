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
 */

export const createLead = async (payload) => {
  const response = await api.post('/leads/create', payload);
  return response.data;
};

export const getLeads = async (params = {}) => {
  const response = await api.get('/leads', { params });
  return response.data;
};

export const getDueFollowUps = async (params = {}) => {
  const response = await api.get('/leads/followups/due', { params });
  return response.data;
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
  const response = await api.post(`/leads/${id}/convert-to-client`);
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
  convertToClientStub
};
