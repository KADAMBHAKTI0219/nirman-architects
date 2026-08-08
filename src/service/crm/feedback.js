import api from '../auth';

/**
 * CRM Feedback API Services (Endpoints 21.1 to 21.10)
 * Direct backend DB communication.
 */

export const getActiveFeedbackCategories = async () => {
  try {
    const res = await api.get('/feedback-category/active');
    if (res.data) {
      if (Array.isArray(res.data)) return { success: true, categories: res.data };
      return res.data;
    }
    return { success: true, categories: [] };
  } catch (error) {
    return { success: false, categories: [], message: error.response?.data?.message || error.message };
  }
};

export const createFeedbackCategory = async (name) => {
  const res = await api.post('/feedback-category/create', { name });
  return res.data;
};

export const toggleFeedbackCategoryDeactivate = async (categoryId, isActive) => {
  const res = await api.put(`/feedback-category/${categoryId}/deactivate`, { isActive });
  return res.data;
};

export const getPendingFeedbackPrompts = async () => {
  try {
    const res = await api.get('/client/feedback/pending-prompts');
    return res.data;
  } catch (error) {
    return { success: false, prompts: [], message: error.response?.data?.message || error.message };
  }
};

export const submitClientFeedback = async (promptId, feedbackData) => {
  const res = await api.post(`/client/feedback/${promptId}/submit`, feedbackData);
  return res.data;
};

export const skipFeedbackPrompt = async (promptId) => {
  const res = await api.post(`/client/feedback/${promptId}/skip`);
  return res.data;
};

export const getMyFeedbackHistory = async () => {
  try {
    const res = await api.get('/client/feedback/my-history');
    return res.data;
  } catch (error) {
    return { success: false, history: [], message: error.response?.data?.message || error.message };
  }
};

export const getProjectClientFeedback = async (projectId) => {
  try {
    const res = await api.get(`/client/projects/${projectId}/feedback`);
    return res.data;
  } catch (error) {
    return { success: false, feedback: [], message: error.response?.data?.message || error.message };
  }
};

export const getAllFeedbackInternal = async (params = {}) => {
  try {
    const res = await api.get('/feedback', { params });
    if (res.data) {
      if (Array.isArray(res.data)) return { success: true, feedback: res.data };
      return res.data;
    }
    return { success: true, feedback: [] };
  } catch (error) {
    return { success: false, feedback: [], message: error.response?.data?.message || error.message };
  }
};

export const getFeedbackAggregateSummary = async (params = {}) => {
  try {
    const res = await api.get('/feedback/aggregate-summary', { params });
    return res.data;
  } catch (error) {
    return { success: false, summary: null, message: error.response?.data?.message || error.message };
  }
};
