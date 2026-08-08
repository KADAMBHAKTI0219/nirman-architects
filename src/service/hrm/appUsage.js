import api from '../auth';

/**
 * App Usage Tracking API Services
 * Direct backend DB communication.
 */

export const syncAppUsageBatch = async (payload) => {
  const response = await api.post('/app-usage/sync', payload);
  return response.data;
};

export const getAppUsageConfig = async () => {
  try {
    const response = await api.get('/app-usage/config');
    return response.data;
  } catch (error) {
    return { success: false, config: null, message: error.response?.data?.message || error.message };
  }
};

export const updateAppUsageConfig = async (configData) => {
  const response = await api.put('/app-usage/config', configData);
  return response.data;
};

export const getEmployeeAppUsage = async (userId, params = {}) => {
  try {
    const response = await api.get(`/app-usage/employee/${userId}`, { params });
    return response.data;
  } catch (error) {
    return { success: false, usage: null, message: error.response?.data?.message || error.message };
  }
};

export const exportEmployeeAppUsage = async (userId, params = {}) => {
  const response = await api.get(`/app-usage/employee/${userId}/export`, { 
    params,
    responseType: params.format === 'csv' ? 'blob' : 'json'
  });
  return response.data;
};

export default {
  syncAppUsageBatch,
  getAppUsageConfig,
  updateAppUsageConfig,
  getEmployeeAppUsage,
  exportEmployeeAppUsage
};
