import api from '../auth';
import { 
  getMockPendingDeviceRequests, 
  approveMockDeviceRequest, 
  assignMockDevice, 
  getMockDeviceStatus, 
  registerMockDevice, 
  sendMockHeartbeat 
} from '../mockApi';

/**
 * Register or request machine GUID device binding.
 * POST /api/device/register
 * @param {object} payload - { deviceId, userId }
 */
export const registerDevice = async (payload) => {
  try {
    const response = await api.post('/device/register', payload);
    return response.data;
  } catch (err) {
    console.warn("[Device API] Falling back to mock device register:", err.message);
    return getMockDeviceStatus(payload.userId || 'u2', payload.deviceId);
  }
};

/**
 * Get logged-in or target user device status & pending requests.
 * GET /api/device/status
 * @param {string} userId - (Optional) Target User ID
 */
export const getDeviceStatus = async (userId) => {
  try {
    const response = await api.get('/device/status', { params: { userId } });
    return response.data;
  } catch (err) {
    console.warn("[Device API] Falling back to mock device status:", err.message);
    return getMockDeviceStatus(userId);
  }
};

/**
 * List all pending device change requests (Super Admin / HR).
 * GET /api/device/pending
 */
export const getPendingDeviceRequests = async () => {
  try {
    const response = await api.get('/device/pending');
    return response.data;
  } catch (err) {
    console.warn("[Device API] Falling back to mock pending device requests:", err.message);
    return getMockPendingDeviceRequests();
  }
};

/**
 * Approve or reject a device change request (Super Admin / HR).
 * POST /api/device/approve
 * @param {object} payload - { requestId, action: 'APPROVE' | 'REJECT' }
 */
export const approveDeviceRequest = async (payload) => {
  try {
    const response = await api.post('/device/approve', payload);
    return response.data;
  } catch (err) {
    console.warn("[Device API] Falling back to mock approve device:", err.message);
    return approveMockDeviceRequest(payload.requestId, payload.action);
  }
};

/**
 * Directly assign a Device ID to a user (Super Admin / HR).
 * POST /api/device/assign
 * @param {object} payload - { targetUserId, deviceId }
 */
export const assignDeviceToUser = async (payload) => {
  try {
    const response = await api.post('/device/assign', payload);
    return response.data;
  } catch (err) {
    console.warn("[Device API] Falling back to mock assign device:", err.message);
    return assignMockDevice(payload.targetUserId, payload.deviceId);
  }
};

/**
 * 30-Second Desktop Agent heartbeat ping endpoint.
 * POST /api/device/heartbeat
 * @param {object} payload - { deviceId, clientTime, userId }
 */
export const sendDeviceHeartbeat = async (payload) => {
  try {
    const response = await api.post('/device/heartbeat', payload);
    return response.data;
  } catch (err) {
    console.warn("[Device API] Falling back to mock heartbeat:", err.message);
    return sendMockHeartbeat(payload);
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
