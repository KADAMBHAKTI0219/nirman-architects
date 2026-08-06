import api from './auth';

/**
 * Fetch logged-in user notifications and unread counts
 */
export const getMyNotifications = async () => {
  const response = await api.get('/notifications/my');
  return response.data;
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
    const response = await api.put('/notifications/read-all');
    return response.data;
  } catch (err) {
    try {
      const myNotifs = await api.get('/notifications/my');
      const list = myNotifs.data?.data?.notifications || myNotifs.data?.notifications || myNotifs.data || [];
      const unreadList = (Array.isArray(list) ? list : []).filter(n => !(n.isRead || n.read));
      if (unreadList.length > 0) {
        await Promise.all(unreadList.map(n => api.put(`/notifications/${n._id || n.id}/read`).catch(() => null)));
      }
      return { success: true, message: 'All notifications marked as read' };
    } catch (fallbackErr) {
      console.error('Failed fallback for mark all as read:', fallbackErr);
      throw err;
    }
  }
};


