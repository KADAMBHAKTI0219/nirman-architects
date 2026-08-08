import api from '../auth';

/**
 * Machine GUID device binding API Services
 * Direct backend DB communication.
 */

export const registerDevice = async (payload) => {
  const response = await api.post('/device/register', payload);
  return response.data;
};

export const getDeviceStatus = async (userId) => {
  try {
    const response = await api.get('/device/status', { params: { userId } });
    return response.data;
  } catch (err) {
    return { success: false, device: null, message: err.response?.data?.message || err.message };
  }
};

export const getPendingDeviceRequests = async () => {
  try {
    const response = await api.get('/device/pending');
    return response.data;
  } catch (err) {
    return { success: false, requests: [], message: err.response?.data?.message || err.message };
  }
};

export const approveDeviceRequest = async (payload) => {
  const response = await api.post('/device/approve', payload);
  return response.data;
};

export const assignDeviceToUser = async (payload) => {
  const response = await api.post('/device/assign', payload);
  return response.data;
};

export const sendDeviceHeartbeat = async (payload) => {
  try {
    const response = await api.post('/device/heartbeat', payload);
    return response.data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export default {
  registerDevice,
  getDeviceStatus,
  getPendingDeviceRequests,
  approveDeviceRequest,
  assignDeviceToUser,
  sendDeviceHeartbeat
};
