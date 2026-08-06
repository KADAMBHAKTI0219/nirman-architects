import api from './auth';
import * as mockApi from './mockApi';

/**
 * CRM Module 7 - Client Chat System API Services
 * Real-time project chat, unread count badges, batch offline sync,
 * reply threads, mentioned users, and internal team chat workspace.
 */

// 1. GET /api/client/chat/unread-counts
export const getUnreadCounts = async () => {
  try {
    const response = await api.get('/client/chat/unread-counts');
    return response.data;
  } catch (err) {
    console.warn("getUnreadCounts API unreachable, using local fallback:", err.message);
    return mockApi.getMockUnreadCounts();
  }
};

// 2. GET /api/client/chat/:projectId?since=
export const getProjectChat = async (projectId = 'proj-1', since = '') => {
  try {
    const response = await api.get(`/client/chat/${projectId}`, { params: { since } });
    return response.data;
  } catch (err) {
    console.warn("getProjectChat API unreachable, using local fallback:", err.message);
    return mockApi.getMockProjectChat(projectId, since);
  }
};

// 3. POST /api/client/chat/:projectId/message
// Body: { messageText, mentionedIds, replyToMessageId }
export const sendClientChatMessage = async (projectId = 'proj-1', { messageText, mentionedIds = [], replyToMessageId = null }) => {
  try {
    const response = await api.post(`/client/chat/${projectId}/message`, {
      messageText,
      mentionedIds,
      replyToMessageId
    });
    return response.data;
  } catch (err) {
    if (err.response?.status === 403) {
      throw new Error("HTTP 403: VIEW_ONLY contact level blocked from sending chat messages.");
    }
    console.warn("sendClientChatMessage API error, using local fallback:", err.message);
    return mockApi.sendMockClientMessage(projectId, { messageText, mentionedIds, replyToMessageId });
  }
};

// 4. POST /api/client/chat/:projectId/sync
// Body: { messages: [{ messageText, localComposedAt, mentionedIds, replyToMessageId }] }
export const syncOfflineChatMessages = async (projectId = 'proj-1', messages = []) => {
  try {
    const response = await api.post(`/client/chat/${projectId}/sync`, { messages });
    return response.data;
  } catch (err) {
    console.warn("syncOfflineChatMessages API error, using local fallback:", err.message);
    return mockApi.syncMockOfflineMessages(projectId, messages);
  }
};

// 5. PUT /api/client/chat/:projectId/mark-read
export const markChatAsRead = async (projectId = 'proj-1') => {
  try {
    const response = await api.put(`/client/chat/${projectId}/mark-read`);
    return response.data;
  } catch (err) {
    console.warn("markChatAsRead API error, using local fallback:", err.message);
    return mockApi.markMockChatRead(projectId);
  }
};

// 6. GET /api/chat/:projectId - Internal team view
export const getInternalProjectChat = async (projectId = 'proj-1') => {
  try {
    const response = await api.get(`/chat/${projectId}`);
    return response.data;
  } catch (err) {
    console.warn("getInternalProjectChat API error, using local fallback:", err.message);
    return mockApi.getMockInternalChat(projectId);
  }
};

// 7. POST /api/chat/:projectId/message - Internal team post message
export const sendInternalChatMessage = async (projectId = 'proj-1', { messageText, mentionedIds = [], replyToMessageId = null }) => {
  try {
    const response = await api.post(`/chat/${projectId}/message`, {
      messageText,
      mentionedIds,
      replyToMessageId
    });
    return response.data;
  } catch (err) {
    console.warn("sendInternalChatMessage API error, using local fallback:", err.message);
    return mockApi.sendMockInternalMessage(projectId, { messageText, mentionedIds, replyToMessageId });
  }
};
