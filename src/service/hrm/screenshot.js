import api from '../auth';

/**
 * Get employee screenshots for a specific date
 * @param {string} userId 
 * @param {string} date - YYYY-MM-DD format (optional)
 */
export const getEmployeeScreenshots = async (userId, date = '') => {
  const params = {};
  if (date) params.date = date;
  const response = await api.get(`/screenshot/employee/${userId}`, { params });
  return response.data;
};

/**
 * Download all employee screenshots as a ZIP file
 * @param {string} userId 
 * @param {string} date - YYYY-MM-DD format (optional)
 */
export const downloadAllScreenshots = async (userId, date = '') => {
  const params = {};
  if (date) params.date = date;
  const response = await api.get(`/screenshot/employee/${userId}/download-all`, {
    params,
    responseType: 'blob'
  });
  return response.data;
};
