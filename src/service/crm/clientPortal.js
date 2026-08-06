import api, { isMockSession } from '../auth';
import {
  mockGetClientDashboard,
  mockGetClientProjectDetail,
  mockGetClientProjectMilestones,
  mockGetClientProjectTimeline,
  mockUpdateClientProfile,
  mockLogClientSessionLogin,
  mockSendClientSessionHeartbeat
} from '../mockApi';

/**
 * Aggregated Dashboard View for Client Portal (Web & Mobile)
 * GET /api/client/dashboard
 */
export const getClientDashboard = async () => {
  if (!isMockSession()) {
    try {
      const response = await api.get('/client/dashboard');
      if (response.data && response.data.success) return response.data;
    } catch (error) {
      // Fall through to Mock API
    }
  }
  return await mockGetClientDashboard();
};

/**
 * Project Detail View (with Security Isolation Check)
 * GET /api/client/projects/:projectId
 */
export const getClientProjectDetail = async (projectId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/projects/${projectId}`);
      if (response.data && response.data.success) return response.data;
    } catch (error) {
      // Fall through to Mock API
    }
  }
  return await mockGetClientProjectDetail(projectId);
};

/**
 * Get Project Milestones for Client
 * GET /api/client/projects/:projectId/milestones
 */
export const getClientProjectMilestones = async (projectId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/projects/${projectId}/milestones`);
      if (response.data && response.data.success) return response.data;
    } catch (error) {
      // Fall through to Mock API
    }
  }
  return await mockGetClientProjectMilestones(projectId);
};

/**
 * Get Formatted Project Timeline Events for Client
 * GET /api/client/projects/:projectId/timeline
 */
export const getClientProjectTimeline = async (projectId) => {
  if (!isMockSession()) {
    try {
      const response = await api.get(`/client/projects/${projectId}/timeline`);
      if (response.data && response.data.success) return response.data;
    } catch (error) {
      // Fall through to Mock API
    }
  }
  return await mockGetClientProjectTimeline(projectId);
};

/**
 * Update Logged-in ClientContact Profile (Name & Phone only)
 * PUT /api/client-auth/profile
 */
export const updateClientProfile = async (payload) => {
  if (!isMockSession()) {
    try {
      const response = await api.put('/client-auth/profile', payload);
      if (response.data && response.data.success) return response.data;
    } catch (error) {
      // Fall through to Mock API
    }
  }
  return await mockUpdateClientProfile(payload);
};

/**
 * Log Client Portal Session Login (WEB, ANDROID, IOS)
 * POST /api/client/session/log-login
 */
export const logClientSessionLogin = async (platform = 'WEB') => {
  if (!isMockSession()) {
    try {
      const response = await api.post('/client/session/log-login', { platform });
      if (response.data && response.data.success) return response.data;
    } catch (error) {
      // Fall through to Mock API
    }
  }
  return await mockLogClientSessionLogin(platform);
};

/**
 * Client Session Active Heartbeat Timestamp
 * POST /api/client/session/heartbeat
 */
export const sendClientSessionHeartbeat = async (sessionId = null) => {
  if (!isMockSession()) {
    try {
      const response = await api.post('/client/session/heartbeat', { sessionId });
      if (response.data && response.data.success) return response.data;
    } catch (error) {
      // Fall through to Mock API
    }
  }
  return await mockSendClientSessionHeartbeat(sessionId);
};

export default {
  getClientDashboard,
  getClientProjectDetail,
  getClientProjectMilestones,
  getClientProjectTimeline,
  updateClientProfile,
  logClientSessionLogin,
  sendClientSessionHeartbeat
};
