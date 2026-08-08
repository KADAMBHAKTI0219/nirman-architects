import api from '../auth';

/**
 * Screenshot Activity Tracking API Services (9.1 - 9.6)
 */

/** 9.1 Get screenshot capture configuration */
export const getScreenshotConfig = async () => {
  try {
    const response = await api.get('/screenshot/config');
    return response.data;
  } catch (error) {
    return { success: false, config: null, message: error.response?.data?.message || error.message };
  }
};

/** 9.2 Upload screenshot captured by Desktop Agent */
export const uploadScreenshot = async (formData) => {
  const response = await api.post('/screenshot/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

/** 9.3 Sync offline screenshot buffer from Desktop Agent */
export const syncScreenshots = async (payload) => {
  const response = await api.post('/screenshot/sync', payload);
  return response.data;
};

/** 9.4 Update screenshot tracking configuration (SuperAdmin) */
export const updateScreenshotConfig = async (configData) => {
  const response = await api.put('/screenshot/config', configData);
  return response.data;
};

/** 9.5 Get employee screenshot records for a date range */
export const getEmployeeScreenshots = async (userId, date = '') => {
  const params = {};
  if (date) params.date = date;
  const response = await api.get(`/screenshot/employee/${userId}`, { params });
  return response.data;
};

/** 9.6 Download all employee screenshots as a ZIP file */
export const downloadAllScreenshots = async (userId, date = '', employeeName = 'Employee') => {
  const params = {};
  if (date) params.date = date;
  const response = await api.get(`/screenshot/employee/${userId}/download-all`, {
    params,
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/zip' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Screenshots_${employeeName.replace(/\s+/g, '_')}_${date || 'all'}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return { success: true };
};

export default {
  getScreenshotConfig,
  uploadScreenshot,
  syncScreenshots,
  updateScreenshotConfig,
  getEmployeeScreenshots,
  downloadAllScreenshots
};
