import api from './api';

export const getNotifications = async () => {
  return api.get('/notifications');
};

export const markNotificationRead = async (id) => {
  return api.put(`/notifications/${id}/read`);
};
