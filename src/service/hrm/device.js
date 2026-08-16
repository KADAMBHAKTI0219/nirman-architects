import api from '../auth';

/**
 * Machine GUID device binding API Services
 * Direct 100% Real Backend API Integration
 */

export const registerDevice = async (payload) => {
  const response = await api.post('/device/register', payload);
  return response.data;
};

export const getDeviceStatus = async (userId) => {
  const response = await api.get('/device/status', { params: { userId } });
  return response.data;
};

export const getPendingDeviceRequests = async () => {
  const response = await api.get('/device/pending');
  return response.data;
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

