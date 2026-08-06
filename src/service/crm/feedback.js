import axios from 'axios';
import {
  mockGetActiveFeedbackCategories,
  mockCreateFeedbackCategory,
  mockDeactivateFeedbackCategory,
  mockGetPendingFeedbackPrompts,
  mockSubmitClientFeedback,
  mockSkipFeedbackPrompt,
  mockGetMyFeedbackHistory,
  mockGetProjectClientFeedback,
  mockGetAllFeedbackInternal,
  mockGetFeedbackAggregateSummary
} from '../mockApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * 21.1 GET /api/feedback-category/active
 * Retrieves active feedback rating categories for rendering client portal feedback forms.
 */
export const getActiveFeedbackCategories = async () => {
  try {
    const res = await axios.get(`${API_URL}/feedback-category/active`);
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getActiveFeedbackCategories");
    return mockGetActiveFeedbackCategories();
  }
};

/**
 * 21.2 POST /api/feedback-category/create
 * Creates a new dynamic feedback rating category (e.g. "Value for Money", "Communication").
 */
export const createFeedbackCategory = async (name) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/feedback-category/create`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for createFeedbackCategory");
    return mockCreateFeedbackCategory(name);
  }
};

/**
 * 21.3 PUT /api/feedback-category/:id/deactivate
 * Toggles active state of a feedback category.
 */
export const toggleFeedbackCategoryDeactivate = async (categoryId, isActive) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.put(`${API_URL}/feedback-category/${categoryId}/deactivate`, { isActive }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for toggleFeedbackCategoryDeactivate");
    return mockDeactivateFeedbackCategory(categoryId, isActive);
  }
};

/**
 * 21.4 GET /api/client/feedback/pending-prompts
 * Retrieves all PENDING feedback prompts for the calling client contact.
 */
export const getPendingFeedbackPrompts = async () => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/client/feedback/pending-prompts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getPendingFeedbackPrompts");
    return mockGetPendingFeedbackPrompts();
  }
};

/**
 * 21.5 POST /api/client/feedback/:promptId/submit
 * Submits client satisfaction feedback (1-5 stars overall rating, category ratings, comments).
 * Exception: Allowed for ALL permission levels (OWNER, MEMBER, and VIEW_ONLY).
 */
export const submitClientFeedback = async (promptId, feedbackData) => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/client/feedback/${promptId}/submit`, feedbackData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for submitClientFeedback");
    return mockSubmitClientFeedback(promptId, feedbackData);
  }
};

/**
 * 21.6 POST /api/client/feedback/:promptId/skip
 * Permanently skips a pending feedback prompt for a trigger event.
 */
export const skipFeedbackPrompt = async (promptId) => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/client/feedback/${promptId}/skip`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for skipFeedbackPrompt");
    return mockSkipFeedbackPrompt(promptId);
  }
};

/**
 * 21.7 GET /api/client/feedback/my
 * Retrieves calling contact's personal submitted feedback history.
 */
export const getMyFeedbackHistory = async () => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/client/feedback/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getMyFeedbackHistory");
    return mockGetMyFeedbackHistory();
  }
};

/**
 * 21.8 GET /api/client/feedback/project/:projectId
 * Retrieves all feedback submitted for a project by any contact under the client account.
 */
export const getProjectClientFeedback = async (projectId) => {
  try {
    const token = localStorage.getItem('clientToken') || localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/client/feedback/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getProjectClientFeedback");
    return mockGetProjectClientFeedback(projectId);
  }
};

/**
 * 21.9 GET /api/feedback/all?projectId=&clientId=&minRating=&maxRating=
 * Internal team view listing all submitted client feedback with rating range, project, client, and date filters.
 */
export const getAllFeedbackInternal = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/feedback/all`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getAllFeedbackInternal");
    return mockGetAllFeedbackInternal(params);
  }
};

/**
 * 21.10 GET /api/feedback/aggregate-summary?projectId=&clientId=
 * Internal team view computing aggregate satisfaction metrics (average overall rating, star rating distribution, category rating averages).
 */
export const getFeedbackAggregateSummary = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/feedback/aggregate-summary`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.warn("API Server un-reachable, using mock fallback for getFeedbackAggregateSummary");
    return mockGetFeedbackAggregateSummary(params);
  }
};
