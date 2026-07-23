import api from './api';

export const registerDevice = async (userId, deviceId) => {
  return api.post('/device/register', { userId, deviceId });
};

export const approveDevice = async (requestId, action) => {
  return api.post('/device/approve', { requestId, action }); // action: 'APPROVE' | 'REJECT'
};

export const getDeviceStatus = async (userId) => {
  return api.get(`/device/status?userId=${userId}`);
};

export const getPendingDeviceRequests = async () => {
  return api.get('/device/pending');
};

export const assignDevice = async (targetUserId, deviceId) => {
  return api.post('/device/assign', { targetUserId, deviceId });
};
