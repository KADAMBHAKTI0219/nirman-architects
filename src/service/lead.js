import api from './auth';
import {
  mockCreateLead,
  mockGetLeads,
  mockGetDueFollowUps,
  mockGetLeadById,
  mockUpdateLead,
  mockUpdateLeadStatus,
  mockLogInteraction,
  mockGetLeadInteractions,
  mockGetLeadStatusHistory,
  mockConvertToClientStub
} from './mockApi';

/**
 * Create a new lead
 * POST /api/leads/create or POST /api/leads
 */
export const createLead = async (payload) => {
  try {
    const response = await api.post('/leads/create', payload);
    return response.data;
  } catch (error) {
    console.warn("Backend /leads/create offline, serving via Mock API:", error);
    return await mockCreateLead(payload);
  }
};

/**
 * Get paginated and filtered list of leads
 * GET /api/leads
 */
export const getLeads = async (params = {}) => {
  try {
    const response = await api.get('/leads', { params });
    return response.data;
  } catch (error) {
    console.warn("Backend /leads offline, serving via Mock API:", error);
    return await mockGetLeads(params);
  }
};

/**
 * Get leads with follow-ups due on or before specified date
 * GET /api/leads/followups/due
 */
export const getDueFollowUps = async (params = {}) => {
  try {
    const response = await api.get('/leads/followups/due', { params });
    return response.data;
  } catch (error) {
    console.warn("Backend /leads/followups/due offline, serving via Mock API:", error);
    return await mockGetDueFollowUps(params);
  }
};

/**
 * Get lead details by ID
 * GET /api/leads/:id
 */
export const getLeadById = async (id) => {
  try {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend /leads/${id} offline, serving via Mock API:`, error);
    return await mockGetLeadById(id);
  }
};

/**
 * Update general fields of a lead (excluding status)
 * PUT /api/leads/:id/update or PUT /api/leads/:id
 */
export const updateLead = async (id, payload) => {
  try {
    const response = await api.put(`/leads/${id}/update`, payload);
    return response.data;
  } catch (error) {
    console.warn(`Backend PUT /leads/${id}/update offline, serving via Mock API:`, error);
    return await mockUpdateLead(id, payload);
  }
};

/**
 * Update lead lifecycle status with mandatory audit log
 * PUT /api/leads/:id/update-status
 */
export const updateLeadStatus = async (id, payload) => {
  try {
    const response = await api.put(`/leads/${id}/update-status`, payload);
    return response.data;
  } catch (error) {
    console.warn(`Backend PUT /leads/${id}/update-status offline, serving via Mock API:`, error);
    return await mockUpdateLeadStatus(id, payload);
  }
};

/**
 * Log interaction touchpoint for lead
 * POST /api/leads/:id/log-interaction
 */
export const logInteraction = async (id, payload) => {
  try {
    const response = await api.post(`/leads/${id}/log-interaction`, payload);
    return response.data;
  } catch (error) {
    console.warn(`Backend POST /leads/${id}/log-interaction offline, serving via Mock API:`, error);
    return await mockLogInteraction(id, payload);
  }
};

/**
 * Get lead interactions timeline
 * GET /api/leads/:id/interactions
 */
export const getLeadInteractions = async (id) => {
  try {
    const response = await api.get(`/leads/${id}/interactions`);
    return response.data;
  } catch (error) {
    console.warn(`Backend GET /leads/${id}/interactions offline, serving via Mock API:`, error);
    return await mockGetLeadInteractions(id);
  }
};

/**
 * Get lead status change audit trail
 * GET /api/leads/:id/status-history
 */
export const getLeadStatusHistory = async (id) => {
  try {
    const response = await api.get(`/leads/${id}/status-history`);
    return response.data;
  } catch (error) {
    console.warn(`Backend GET /leads/${id}/status-history offline, serving via Mock API:`, error);
    return await mockGetLeadStatusHistory(id);
  }
};

/**
 * Trigger client conversion stub for lead
 * POST /api/leads/:id/convert-to-client
 */
export const convertToClientStub = async (id) => {
  try {
    const response = await api.post(`/leads/${id}/convert-to-client`);
    return response.data;
  } catch (error) {
    console.warn(`Backend POST /leads/${id}/convert-to-client offline, serving via Mock API:`, error);
    return await mockConvertToClientStub(id);
  }
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
