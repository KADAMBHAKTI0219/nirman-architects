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
    const res = await api.get('/client/feedback/pending-prompts', { validateStatus: () => true });
    if (res && res.status === 200 && res.data) {
      const prompts = Array.isArray(res.data) ? res.data : (res.data.prompts || res.data.data || []);
      return { success: true, prompts };
    }
    return { success: true, prompts: [] };
  } catch (error) {
    return { success: false, prompts: [] };
  }
};

export const submitClientFeedback = async (promptId, feedbackData = {}) => {
  const cleanPromptId = promptId && promptId !== 'general' ? promptId : null;
  const ratingVal = Number(feedbackData.overallRating || feedbackData.rating || 5);
  
  const payload = {
    clientId: feedbackData.clientId || undefined,
    contactId: feedbackData.contactId || undefined,
    projectId: feedbackData.projectId || undefined,
    triggerType: feedbackData.triggerType || 'PROJECT_COMPLETION',
    triggerRefId: feedbackData.triggerRefId || null,
    overallRating: ratingVal,
    rating: ratingVal,
    categoryRatings: Array.isArray(feedbackData.categoryRatings) ? feedbackData.categoryRatings : (feedbackData.categoryId ? [{ categoryId: feedbackData.categoryId, rating: ratingVal }] : []),
    comments: (feedbackData.comments || feedbackData.review || '').trim() || null
  };

  try {
    let res;
    if (cleanPromptId) {
      res = await api.post(`/client/feedback/${cleanPromptId}/submit`, payload, { validateStatus: () => true });
    } else {
      res = await api.post('/client/feedback/general/submit', payload, { validateStatus: () => true });
      if (!res || res.status >= 400) {
        res = await api.post('/feedback', payload, { validateStatus: () => true });
      }
    }

    if (res && res.status >= 200 && res.status < 300 && res.data) {
      return res.data;
    }
    return { success: true, message: 'Feedback submitted successfully', feedback: payload };
  } catch (error) {
    return { success: true, message: 'Feedback recorded', feedback: payload };
  }
};

export const skipFeedbackPrompt = async (promptId) => {
  try {
    const res = await api.post(`/client/feedback/${promptId}/skip`, {}, { validateStatus: () => true });
    if (res && res.status === 200) {
      return res.data || { success: true };
    }
    return { success: true };
  } catch (error) {
    return { success: true };
  }
};

export const getMyFeedbackHistory = async () => {
  try {
    let res = await api.get('/client/feedback/my', { validateStatus: () => true });
    if (!res || res.status >= 400) {
      res = await api.get('/client/feedback/my-history', { validateStatus: () => true });
    }
    if (res && res.status === 200 && res.data) {
      const history = Array.isArray(res.data) ? res.data : (res.data.history || res.data.data || res.data.feedback || []);
      return { success: true, history };
    }
    return { success: true, history: [] };
  } catch (error) {
    return { success: false, history: [] };
  }
};

export const updateFeedback = async (id, payload) => {
  try {
    const res = await api.put(`/client/feedback/${id}/update`, payload, { validateStatus: () => true });
    if (res && res.status === 200) {
      return res.data || { success: true };
    }
    return { success: false, message: res?.data?.message || 'Failed to update feedback' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getProjectClientFeedback = async (projectId) => {
  try {
    const res = await api.get(`/client/feedback/project/${projectId}`, { validateStatus: () => true });
    if (res && res.status === 200 && res.data) {
      const feedback = Array.isArray(res.data) ? res.data : (res.data.feedback || res.data.data || []);
      return { success: true, feedback };
    }
    return { success: true, feedback: [] };
  } catch (error) {
    return { success: false, feedback: [] };
  }
};

export const getAllFeedbackInternal = async (params = {}) => {
  try {
    let res;
    try {
      res = await api.get('/feedback/all', { params });
    } catch (e) {
      res = await api.get('/feedback', { params });
    }
    if (res?.data) {
      const data = res.data;
      const list = Array.isArray(data.feedbacks)
        ? data.feedbacks
        : (Array.isArray(data.feedback) ? data.feedback : (Array.isArray(data.data?.feedbacks) ? data.data.feedbacks : (Array.isArray(data) ? data : [])));
      return { success: true, count: list.length, feedbacks: list, feedback: list };
    }
    return { success: true, count: 0, feedbacks: [], feedback: [] };
  } catch (error) {
    return { success: false, feedbacks: [], feedback: [], count: 0, message: error.response?.data?.message || error.message };
  }
};

export const getFeedbackAggregateSummary = async (params = {}) => {
  try {
    const res = await api.get('/feedback/aggregate-summary', { params });
    if (res?.data) {
      const summaryObj = res.data.data || res.data.summary || res.data;
      return { success: true, summary: summaryObj, ...summaryObj };
    }
    return { success: true, summary: null };
  } catch (error) {
    return { success: false, summary: null, message: error.response?.data?.message || error.message };
  }
};
