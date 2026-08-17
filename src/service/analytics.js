import api from './auth';

/**
 * ERP Module 7 - Project Analysis & Dashboards API Services
 */

// 1. GET /api/analytics/company-wide-summary
export const getCompanyWideSummary = async () => {
  try {
    const response = await api.get('/analytics/company-wide-summary');
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice loading company wide summary:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 2. GET /api/projects/:id/dashboard
export const getProjectDashboardMetrics = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/dashboard`);
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice loading project dashboard metrics:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 3. GET /api/projects/:id/analysis/employee-wise
export const getEmployeeWiseAnalysis = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/analysis/employee-wise`);
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice loading employee-wise analysis:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 4. GET /api/projects/:id/analysis/employee-wise/:userId
export const getSingleEmployeeAnalysis = async (projectId, userId) => {
  try {
    const response = await api.get(`/projects/${projectId}/analysis/employee-wise/${userId}`);
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice loading single employee analysis:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 5. GET /api/projects/:id/analysis/task-wise
export const getTaskWiseAnalysis = async (projectId, params = {}) => {
  try {
    const response = await api.get(`/projects/${projectId}/analysis/task-wise`, { params });
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice loading task-wise analysis:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 6. GET /api/projects/:id/analysis/drawing-wise
export const getDrawingWiseProgress = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/analysis/drawing-wise`);
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice loading drawing-wise progress:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 7. GET /api/projects/:id/analysis/department-wise
export const getDepartmentWiseProgress = async (projectId) => {
  try {
    const response = await api.get(`/projects/${projectId}/analysis/department-wise`);
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice loading department-wise progress:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 8. POST /api/analytics/refresh-snapshot/:projectId
export const refreshProjectSnapshot = async (projectId) => {
  try {
    const response = await api.post(`/analytics/refresh-snapshot/${projectId}`);
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice refreshing project snapshot:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 9. GET /api/analytics/snapshot/:projectId
export const getCachedSnapshot = async (projectId) => {
  try {
    const response = await api.get(`/analytics/snapshot/${projectId}`);
    return response?.data || { success: true };
  } catch (err) {
    console.warn("Notice loading cached snapshot:", err.message);
    return { success: false, message: err.response?.data?.message || err.message };
  }
};
