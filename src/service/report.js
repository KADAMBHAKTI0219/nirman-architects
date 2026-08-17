import api from './auth';

/**
 * Report Generation & Management API Services
 */

export const generateReport = async (payload) => {
  const response = await api.post('/reports/generate', payload);
  return response.data;
};

export const getMyReports = async () => {
  const response = await api.get('/reports/my');
  return response.data;
};

export const getReportStatus = async (id) => {
  const response = await api.get(`/reports/${id}/status`);
  return response.data;
};

export const downloadReport = async (id) => {
  const response = await api.get(`/reports/${id}/download`, { responseType: 'blob' });
  return response.data;
};

// Convenience Endpoints for Specific Report Types
export const generateAttendanceReport = async (payload = {}) => {
  const response = await api.post('/reports/attendance', payload);
  return response.data;
};

export const generateProductivityReport = async (payload = {}) => {
  const response = await api.post('/reports/productivity', payload);
  return response.data;
};

export const generateProjectReport = async (payload = {}) => {
  const response = await api.post('/reports/project', payload);
  return response.data;
};

export const generateEmployeeReport = async (payload = {}) => {
  const response = await api.post('/reports/employee', payload);
  return response.data;
};

export const generateDrawingReport = async (payload = {}) => {
  const response = await api.post('/reports/drawing', payload);
  return response.data;
};

export const generateSiteReport = async (payload = {}) => {
  const response = await api.post('/reports/site', payload);
  return response.data;
};

export const generateDailyProgressReport = async (payload = {}) => {
  const response = await api.post('/reports/daily-progress', payload);
  return response.data;
};

export const generateMonthlyProgressReport = async (payload = {}) => {
  const response = await api.post('/reports/monthly-progress', payload);
  return response.data;
};

export const generateCustomerReport = async (payload = {}) => {
  const response = await api.post('/reports/customer', payload);
  return response.data;
};

export const generateTaskReport = async (payload = {}) => {
  const response = await api.post('/reports/task', payload);
  return response.data;
};

export const generateApprovalReport = async (payload = {}) => {
  const response = await api.post('/reports/approval', payload);
  return response.data;
};

// Scheduled Report Management
export const createScheduledReport = async (payload) => {
  const response = await api.post('/reports/scheduled/create', payload);
  return response.data;
};

export const getMyScheduledReports = async () => {
  const response = await api.get('/reports/scheduled/my');
  return response.data;
};

export const deleteScheduledReport = async (id) => {
  const response = await api.delete(`/reports/scheduled/${id}`);
  return response.data;
};
