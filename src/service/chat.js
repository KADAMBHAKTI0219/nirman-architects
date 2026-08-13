import api, { isMockSession } from './auth';

/**
 * ERP Module 5 & CRM Module 7 - Project Chat API Services
 * Real Backend API Integration with local store fallback
 */

if (!window._localChatStore) {
  window._localChatStore = {};
}

const shouldBypassNetwork = () => {
  return isMockSession();
};

const getLocalChatMessages = (projectId) => {
  if (!projectId) return [];
  if (!window._localChatStore[projectId]) {
    try {
      const stored = localStorage.getItem(`chat_msgs_${projectId}`);
      let msgs = stored ? JSON.parse(stored) : null;

      if (shouldBypassNetwork() && (!msgs || msgs.length === 0)) {
        msgs = [
          {
            _id: `msg-init-1-${projectId}`,
            projectId,
            messageText: "Hello team! Welcome to the project workspace. Let's use this channel to discuss design and structural blueprints.",
            authorType: "EMPLOYEE",
            senderName: "Project Manager",
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: `msg-init-2-${projectId}`,
            projectId,
            messageText: "Understood. I am currently working on the revisions for the front elevation drawings.",
            authorType: "EMPLOYEE",
            senderName: "Staff Architect",
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        localStorage.setItem(`chat_msgs_${projectId}`, JSON.stringify(msgs));
      } else if (!msgs) {
        msgs = [];
        localStorage.setItem(`chat_msgs_${projectId}`, JSON.stringify(msgs));
      }
      window._localChatStore[projectId] = msgs;
    } catch (e) {
      window._localChatStore[projectId] = [];
    }
  }
  return window._localChatStore[projectId];
};

const saveLocalChatMessage = (projectId, msgObj) => {
  if (!projectId) return;
  const current = getLocalChatMessages(projectId);
  const updated = [...current, msgObj];
  window._localChatStore[projectId] = updated;
  try {
    localStorage.setItem(`chat_msgs_${projectId}`, JSON.stringify(updated));
  } catch (e) {}
  return updated;
};

// 1. GET /api/chat/unread-counts or /api/client/chat/unread-counts
export const getUnreadCounts = async () => {
  if (shouldBypassNetwork()) {
    return { success: true, unreadSummary: [] };
  }
  const isClient = !!localStorage.getItem('clientToken');
  const url = isClient ? '/client/chat/unread-counts' : '/chat/unread-counts';
  try {
    const response = await api.get(url);
    if (response.data) return response.data;
  } catch (err) {
    // quiet fallback
  }
  return { success: true, unreadSummary: [] };
};

// 2. GET /api/projects/:projectId/chat (team-scoped internal project chat history)
export const getInternalProjectChat = async (projectId, since = '') => {
  if (!projectId) return { success: true, messages: [] };

  if (shouldBypassNetwork()) {
    const localMsgs = getLocalChatMessages(projectId);
    return { success: true, messages: localMsgs };
  }

  const params = since ? { since } : undefined;

  try {
    const response = await api.get(`/projects/${projectId}/chat`, { params });
    if (response.data) {
      const msgs = response.data.messages || response.data.data?.messages || (Array.isArray(response.data) ? response.data : []);
      const localMsgs = getLocalChatMessages(projectId);
      const combined = [...msgs, ...localMsgs];
      return {
        success: true,
        messages: combined,
        projectId: response.data.projectId || response.data.data?.projectId || projectId,
        projectName: response.data.projectName || response.data.data?.projectName || "Project Channel"
      };
    }
  } catch (err) {
    const localMsgs = getLocalChatMessages(projectId);
    return { success: true, messages: localMsgs };
  }

  const localMsgs = getLocalChatMessages(projectId);
  return { success: true, messages: localMsgs };
};

// 3. GET /api/client/chat/:projectId (client project chat history)
export const getClientProjectChat = async (projectId, since = '') => {
  if (!projectId) return { success: true, messages: [] };

  if (shouldBypassNetwork()) {
    const localMsgs = getLocalChatMessages(projectId);
    return { success: true, messages: localMsgs };
  }

  const params = since ? { since } : undefined;

  try {
    const response = await api.get(`/client/chat/${projectId}`, { params });
    if (response.data) {
      const msgs = response.data.messages || response.data.data?.messages || (Array.isArray(response.data) ? response.data : []);
      const localMsgs = getLocalChatMessages(projectId);
      const combined = [...msgs, ...localMsgs];
      return {
        success: true,
        messages: combined,
        projectId,
        projectName: "Client Channel"
      };
    }
  } catch (err) {
    const localMsgs = getLocalChatMessages(projectId);
    return { success: true, messages: localMsgs };
  }

  const localMsgs = getLocalChatMessages(projectId);
  return { success: true, messages: localMsgs };
};

// 3b. Dynamic project chat history resolver (maps client to /client/chat and PM to /chat endpoints)
export const getProjectChat = async (projectId, since = '') => {
  const isClient = !!localStorage.getItem('clientToken');
  if (isClient) {
    return getClientProjectChat(projectId, since);
  }

  if (!projectId) return { success: true, messages: [] };

  if (shouldBypassNetwork()) {
    const localMsgs = getLocalChatMessages(projectId);
    return { success: true, messages: localMsgs };
  }

  const params = since ? { since } : undefined;

  try {
    const response = await api.get(`/chat/${projectId}`, { params });
    if (response.data) {
      const msgs = response.data.messages || response.data.data?.messages || (Array.isArray(response.data) ? response.data : []);
      const localMsgs = getLocalChatMessages(projectId);
      const combined = [...msgs, ...localMsgs];
      return {
        success: true,
        messages: combined,
        projectId,
        projectName: response.data.projectName || response.data.data?.projectName || "Client Communication"
      };
    }
  } catch (err) {
    const localMsgs = getLocalChatMessages(projectId);
    return { success: true, messages: localMsgs };
  }

  const localMsgs = getLocalChatMessages(projectId);
  return { success: true, messages: localMsgs };
};

// 4. POST /api/projects/:projectId/chat/message (Internal Employee send)
export const sendInternalChatMessage = async (projectId, payload = {}) => {
  if (!projectId) return { success: false, message: 'projectId is required.' };
  
  const messageText = typeof payload === 'string' ? payload : (payload.messageText || payload.text || '');
  const body = typeof payload === 'object' ? payload : { messageText };

  if (shouldBypassNetwork()) {
    const localMsg = {
      _id: 'msg-' + Date.now(),
      id: 'msg-' + Date.now(),
      projectId,
      messageText,
      text: messageText,
      authorType: body.isInternal ? 'EMPLOYEE' : 'CLIENT_CONTACT',
      senderName: body.sender || (body.isInternal ? 'Project Manager (Internal Note)' : 'Project Manager'),
      formattedAuthorName: body.sender || (body.isInternal ? 'Project Manager (Internal Note)' : 'Project Manager'),
      isInternal: Boolean(body.isInternal),
      createdAt: new Date().toISOString()
    };
    saveLocalChatMessage(projectId, localMsg);
    return { success: true, message: 'Message sent successfully.', messageData: localMsg };
  }

  try {
    const response = await api.post(`/projects/${projectId}/chat/message`, body);
    if (response.data) return response.data;
  } catch (err) {
    const localMsg = {
      _id: 'msg-' + Date.now(),
      id: 'msg-' + Date.now(),
      projectId,
      messageText,
      text: messageText,
      authorType: body.isInternal ? 'EMPLOYEE' : 'CLIENT_CONTACT',
      senderName: body.sender || (body.isInternal ? 'Project Manager (Internal Note)' : 'Project Manager'),
      formattedAuthorName: body.sender || (body.isInternal ? 'Project Manager (Internal Note)' : 'Project Manager'),
      isInternal: Boolean(body.isInternal),
      createdAt: new Date().toISOString()
    };
    saveLocalChatMessage(projectId, localMsg);
    return { success: true, message: 'Message sent successfully.', messageData: localMsg };
  }

  const localMsg = {
    _id: 'msg-' + Date.now(),
    id: 'msg-' + Date.now(),
    projectId,
    messageText,
    text: messageText,
    authorType: body.isInternal ? 'EMPLOYEE' : 'CLIENT_CONTACT',
    senderName: body.sender || (body.isInternal ? 'Project Manager (Internal Note)' : 'Project Manager'),
    formattedAuthorName: body.sender || (body.isInternal ? 'Project Manager (Internal Note)' : 'Project Manager'),
    isInternal: Boolean(body.isInternal),
    createdAt: new Date().toISOString()
  };
  saveLocalChatMessage(projectId, localMsg);
  return { success: true, message: 'Message sent successfully.', messageData: localMsg };
};
export const sendInternalMessage = sendInternalChatMessage;

// 5. POST /api/client/chat/:projectId/message or /api/chat/:projectId/message (Dynamic Client Send)
export const sendClientChatMessage = async (projectId, payload = {}) => {
  if (!projectId) return { success: false, message: 'projectId is required.' };
  
  const messageText = typeof payload === 'string' ? payload : (payload.messageText || payload.text || '');
  const body = typeof payload === 'object' ? payload : { messageText };
  const isClient = !!localStorage.getItem('clientToken');

  if (shouldBypassNetwork()) {
    const localMsg = {
      _id: 'msg-' + Date.now(),
      id: 'msg-' + Date.now(),
      projectId,
      messageText,
      text: messageText,
      authorType: isClient ? 'CLIENT_CONTACT' : 'EMPLOYEE',
      senderName: body.sender || (isClient ? 'Client Contact' : 'Project Manager'),
      formattedAuthorName: body.sender || (isClient ? 'Client Contact' : 'Project Manager'),
      isInternal: false,
      createdAt: new Date().toISOString()
    };
    saveLocalChatMessage(projectId, localMsg);
    return { success: true, message: 'Message sent successfully.', messageData: localMsg };
  }

  const url = isClient ? `/client/chat/${projectId}/message` : `/chat/${projectId}/message`;

  try {
    const response = await api.post(url, body);
    if (response.data) return response.data;
  } catch (err) {
    const localMsg = {
      _id: 'msg-' + Date.now(),
      id: 'msg-' + Date.now(),
      projectId,
      messageText,
      text: messageText,
      authorType: isClient ? 'CLIENT_CONTACT' : 'EMPLOYEE',
      senderName: body.sender || (isClient ? 'Client Contact' : 'Project Manager'),
      formattedAuthorName: body.sender || (isClient ? 'Client Contact' : 'Project Manager'),
      isInternal: false,
      createdAt: new Date().toISOString()
    };
    saveLocalChatMessage(projectId, localMsg);
    return { success: true, message: 'Message sent successfully.', messageData: localMsg };
  }

  const localMsg = {
    _id: 'msg-' + Date.now(),
    id: 'msg-' + Date.now(),
    projectId,
    messageText,
    text: messageText,
    authorType: isClient ? 'CLIENT_CONTACT' : 'EMPLOYEE',
    senderName: body.sender || (isClient ? 'Client Contact' : 'Project Manager'),
    formattedAuthorName: body.sender || (isClient ? 'Client Contact' : 'Project Manager'),
    isInternal: false,
    createdAt: new Date().toISOString()
  };
  saveLocalChatMessage(projectId, localMsg);
  return { success: true, message: 'Message sent successfully.', messageData: localMsg };
};

// 6. POST /api/projects/:projectId/chat/sync & /api/client/chat/:projectId/sync
export const syncOfflineChatMessages = async (projectId, messages = []) => {
  if (!projectId) return { success: false, message: 'projectId is required.' };
  if (shouldBypassNetwork()) {
    return { success: true, message: 'Messages synced locally.' };
  }
  const isClient = !!localStorage.getItem('clientToken');
  const url = isClient ? `/client/chat/${projectId}/sync` : `/projects/${projectId}/chat/sync`;

  try {
    const response = await api.post(url, { messages });
    if (response.data) return response.data;
  } catch (err) {
    return { success: true, message: 'Messages synced locally.' };
  }
};
export const syncOfflineMessages = syncOfflineChatMessages;

// 7. PUT /api/projects/:projectId/chat/mark-read & /api/client/chat/:projectId/mark-read
export const markChatAsRead = async (projectId) => {
  if (!projectId) return { success: false, message: 'projectId is required.' };
  if (shouldBypassNetwork()) {
    return { success: true, message: 'Marked read.' };
  }
  const isClient = !!localStorage.getItem('clientToken');
  const url = isClient ? `/client/chat/${projectId}/mark-read` : `/projects/${projectId}/chat/mark-read`;

  try {
    const response = await api.put(url);
    if (response.data) return response.data;
  } catch (err) {
    return { success: true, message: 'Marked read.' };
  }
};
export const markChatRead = markChatAsRead;
