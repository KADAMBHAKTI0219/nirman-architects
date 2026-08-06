import api from '../auth';
import {
  mockSyncAppUsage,
  mockGetAppUsageConfig,
  mockUpdateAppUsageConfig,
  mockGetEmployeeAppUsage,
  mockExportEmployeeAppUsage
} from '../mockApi';

/**
 * Sync App Usage 5-Minute Batch from Desktop Agent
 * POST /api/app-usage/sync
 */
export const syncAppUsageBatch = async (payload) => {
  try {
    const response = await api.post('/app-usage/sync', payload);
    return response.data;
  } catch (error) {
    console.warn("Backend /app-usage/sync offline, serving via Mock API:", error);
    return await mockSyncAppUsage(payload);
  }
};

/**
 * Get App Usage Configuration
 * GET /api/app-usage/config
 */
export const getAppUsageConfig = async () => {
  try {
    const response = await api.get('/app-usage/config');
    return response.data;
  } catch (error) {
    console.warn("Backend /app-usage/config offline, serving via Mock API:", error);
    return await mockGetAppUsageConfig();
  }
};

/**
 * Update App Usage Configuration (Super Admin Only)
 * PUT /api/app-usage/config
 */
export const updateAppUsageConfig = async (configData) => {
  try {
    const response = await api.put('/app-usage/config', configData);
    return response.data;
  } catch (error) {
    console.warn("Backend PUT /app-usage/config offline, serving via Mock API:", error);
    return await mockUpdateAppUsageConfig(configData);
  }
};

/**
 * Get Employee App Usage Breakdown (Super Admin / HR)
 * GET /api/app-usage/employee/:userId?date=YYYY-MM-DD&fromDate=&toDate=
 */
export const getEmployeeAppUsage = async (userId, params = {}) => {
  try {
    const response = await api.get(`/app-usage/employee/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.warn("Backend /app-usage/employee offline, serving via Mock API:", error);
    return await mockGetEmployeeAppUsage(userId, params);
  }
};

/**
 * Export Employee App Usage Data (Super Admin / HR)
 * GET /api/app-usage/employee/:userId/export?format=csv|json&fromDate=&toDate=
 */
export const exportEmployeeAppUsage = async (userId, params = {}) => {
  try {
    const response = await api.get(`/app-usage/employee/${userId}/export`, { 
      params,
      responseType: params.format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  } catch (error) {
    console.warn("Backend /app-usage/employee/export offline, serving via Mock API:", error);
    return await mockExportEmployeeAppUsage(userId, params);
  }
};

export default {
  syncAppUsageBatch,
  getAppUsageConfig,
  updateAppUsageConfig,
  getEmployeeAppUsage,
  exportEmployeeAppUsage
};
