import api from './auth';

/**
 * Fetch logged-in user notifications and unread counts
 */
export const getMyNotifications = async () => {
  try {
    const response = await api.get('/notifications/my');
    return response.data;
  } catch (err) {
    return { success: false, notifications: [], unreadCount: 0, message: err.response?.data?.message || err.message };
  }
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all notifications as read for logged-in user
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const myNotifs = await getMyNotifications();
    const list = myNotifs?.notifications || myNotifs?.data?.notifications || myNotifs?.data || (Array.isArray(myNotifs) ? myNotifs : []);
    const unreadList = (Array.isArray(list) ? list : []).filter(n => !(n.isRead || n.read));
    if (unreadList.length > 0) {
      await Promise.all(unreadList.map(n => markNotificationAsRead(n._id || n.id).catch(() => null)));
    }
    return { success: true, message: 'All notifications marked as read' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

// ==========================================
// CRM MODULE 10 - CLIENT NOTIFICATIONS APIS (22.1 to 22.10)
// ==========================================

// 22.1 GET /api/client/notifications/my
export const getClientNotificationsMy = async (params = {}) => {
  try {
    const response = await api.get('/client/notifications/my', { params });
    return response.data;
  } catch (err) {
    return { success: false, notifications: [], message: err.response?.data?.message || err.message };
  }
};

// 22.2 GET /api/client/notifications/unread-count
export const getClientNotificationsUnreadCount = async () => {
  try {
    const response = await api.get('/client/notifications/unread-count');
    return response.data;
  } catch (err) {
    return { success: false, unreadCount: 0, message: err.response?.data?.message || err.message };
  }
};

// 22.3 PUT /api/client/notifications/:id/read
export const markClientNotificationRead = async (id) => {
  try {
    const response = await api.put(`/client/notifications/${id}/read`);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 22.4 PUT /api/client/notifications/mark-all-read
export const markAllClientNotificationsRead = async () => {
  try {
    const response = await api.put('/client/notifications/mark-all-read');
    return response.data;
  } catch (err) {
    try {
      const myNotifs = await getClientNotificationsMy();
      const list = myNotifs?.notifications || myNotifs?.data || (Array.isArray(myNotifs) ? myNotifs : []);
      const unreadList = (Array.isArray(list) ? list : []).filter(n => !(n.isRead || n.read));
      if (unreadList.length > 0) {
        await Promise.all(unreadList.map(n => markClientNotificationRead(n._id || n.id).catch(() => null)));
      }
      return { success: true, message: 'All client notifications marked as read' };
    } catch (fallbackErr) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  }
};

// 22.5 GET /api/client/notifications/preferences
export const getClientNotificationPreferences = async () => {
  try {
    const response = await api.get('/client/notifications/preferences');
    return response.data;
  } catch (err) {
    return { success: false, preferences: { pushEnabled: true, emailEnabled: true, whatsappEnabled: true }, message: err.response?.data?.message || err.message };
  }
};

// 22.6 PUT /api/client/notifications/preferences
export const updateClientNotificationPreferences = async (preferences) => {
  try {
    const response = await api.put('/client/notifications/preferences', preferences);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 22.7 POST /api/client/notifications/register-device
export const registerClientDeviceToken = async (deviceData = {}) => {
  try {
    const response = await api.post('/client/notifications/register-device', deviceData);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 22.8 DELETE /api/client/notifications/unregister-device
export const unregisterClientDeviceToken = async (deviceToken) => {
  try {
    const response = await api.delete('/client/notifications/unregister-device', { data: { deviceToken } });
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

// 22.9 GET /api/notifications/:notificationId/delivery-log
export const getNotificationDeliveryLog = async (notificationId) => {
  try {
    const response = await api.get(`/notifications/${notificationId}/delivery-log`);
    return response.data;
  } catch (err) {
    return { success: false, deliveryLogs: [], message: err.response?.data?.message || err.message };
  }
};

// 22.10 POST /api/notifications/whatsapp-config & GET /api/notifications/whatsapp-config/status
export const configureWhatsAppBusiness = async (configData) => {
  try {
    const response = await api.post('/notifications/whatsapp-config', configData);
    return response.data;
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const getWhatsAppConfigStatus = async () => {
  try {
    const response = await api.get('/notifications/whatsapp-config/status');
    return response.data;
  } catch (err) {
    return { success: false, isConfigured: false, status: 'Not Configured', message: err.response?.data?.message || err.message };
  }
};


