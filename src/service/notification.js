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
