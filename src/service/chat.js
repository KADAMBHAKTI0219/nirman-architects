import api from './auth';

/**
 * CRM Module 7 - Client & Internal Chat System API Services
 * Pure Real Backend API Integration.
 */

// 1. GET /api/client/chat/unread-counts
export const getUnreadCounts = async () => {
  try {
    const response = await api.get('/client/chat/unread-counts');
    if (response.data) return response.data;
  } catch (err) {}
  return { success: true, unreadCounts: {} };
};

// 2. GET /api/client/chat/:projectId?since=
export const getProjectChat = async (projectId, since = '') => {
  try {
    const response = await api.get(`/client/chat/${projectId}`, { params: { since } });
    if (response.data) {
      return {
        success: true,
        messages: Array.isArray(response.data.messages) ? response.data.messages : (Array.isArray(response.data) ? response.data : [])
      };
    }
  } catch (err) {}
  return { success: true, messages: [] };
};

// 3. POST /api/client/chat/:projectId/message
export const sendClientChatMessage = async (projectId, { messageText, mentionedIds = [], replyToMessageId = null }) => {
  try {
    const response = await api.post(`/client/chat/${projectId}/message`, {
      messageText,
      mentionedIds,
      replyToMessageId
    });
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 4. POST /api/client/chat/:projectId/sync
export const syncOfflineChatMessages = async (projectId, messages = []) => {
  try {
    const response = await api.post(`/client/chat/${projectId}/sync`, { messages });
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 5. PUT /api/client/chat/:projectId/mark-read
export const markChatAsRead = async (projectId) => {
  try {
    const response = await api.put(`/client/chat/${projectId}/mark-read`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 6. GET /api/chat/:projectId - Internal team view
export const getInternalProjectChat = async (projectId) => {
  try {
    const response = await api.get(`/chat/${projectId}`);
    if (response.data) {
      return {
        success: true,
        messages: Array.isArray(response.data.messages) ? response.data.messages : (Array.isArray(response.data) ? response.data : [])
      };
    }
  } catch (err) {}
  return { success: true, messages: [] };
};

// 7. POST /api/chat/:projectId/message - Internal team post message
export const sendInternalChatMessage = async (projectId, { messageText, mentionedIds = [], replyToMessageId = null }) => {
  try {
    const response = await api.post(`/chat/${projectId}/message`, {
      messageText,
      mentionedIds,
      replyToMessageId
    });
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};
