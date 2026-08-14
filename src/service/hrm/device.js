import api, { isMockSession } from '../auth';
import {
  registerDevice as mockRegisterDevice,
  getDeviceStatus as mockGetDeviceStatus,
  getPendingDeviceRequests as mockGetPendingDeviceRequests,
  approveDevice as mockApproveDevice,
  assignDevice as mockAssignDevice
} from '../mockApi';

/**
 * Machine GUID device binding API Services
 */

export const registerDevice = async (payload) => {
  if (isMockSession()) {
    return await mockRegisterDevice(payload.userId, payload.deviceId);
  }
  const response = await api.post('/device/register', payload);
  return response.data;
};

export const getDeviceStatus = async (userId) => {
  if (isMockSession()) {
    return await mockGetDeviceStatus(userId);
  }
  try {
    const response = await api.get('/device/status', { params: { userId } });
    return response.data;
  } catch (err) {
    return await mockGetDeviceStatus(userId);
  }
};

export const getPendingDeviceRequests = async () => {
  if (isMockSession()) {
    return await mockGetPendingDeviceRequests();
  }
  try {
    const response = await api.get('/device/pending');
    return response.data;
  } catch (err) {
    return await mockGetPendingDeviceRequests();
  }
};

export const approveDeviceRequest = async (payload) => {
  if (isMockSession()) {
    return await mockApproveDevice(payload.requestId, payload.action);
  }
  const response = await api.post('/device/approve', payload);
  return response.data;
};

export const assignDeviceToUser = async (payload) => {
  if (isMockSession()) {
    return await mockAssignDevice(payload.targetUserId, payload.deviceId);
  }
  const response = await api.post('/device/assign', payload);
  return response.data;
};

export const sendDeviceHeartbeat = async (payload) => {
  if (isMockSession()) {
    return { success: true };
  }
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
