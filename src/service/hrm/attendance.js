import api from '../auth';

/**
 * Get Today's Attendance Status
 * Access: All roles
 */
export const getTodayAttendance = async () => {
  const response = await api.get('/attendance/today');
  return response.data;
};

/**
 * Clock In
 * Access: All roles
 */
export const clockInAttendance = async (data = {}) => {
  const response = await api.post('/attendance/clock-in', data);
  return response.data;
};

/**
 * Clock Out
 * Access: All roles
 */
export const clockOutAttendance = async (data = {}) => {
  const response = await api.post('/attendance/clock-out', data);
  return response.data;
};

/**
 * Universal attendance event (heartbeat, clock-in, clock-out)
 */
export const postAttendanceEvent = async (data) => {
  const response = await api.post('/attendance/event', data);
  return response.data;
};

/**
 * Sync offline attendance entries
 */
export const syncAttendanceLogs = async (data) => {
  const response = await api.post('/attendance/sync', data);
  return response.data;
};

/**
 * Get own attendance history
 * Access: All roles
 * @param {object} params - { month, year } (optional)
 */
export const getMyAttendance = async (params) => {
  const response = await api.get('/attendance/my', { params });
  return response.data;
};

/**
 * Get all attendance records (HR / SuperAdmin / Admin)
 * Access: HR / SuperAdmin
 * @param {object} params - { month, year, userId } (optional)
 */
export const getAllAttendanceList = async (params) => {
  const response = await api.get('/attendance/all', { params });
  return response.data;
};

/**
 * Request attendance correction
 */
export const requestAttendanceCorrection = async (data) => {
  const response = await api.post('/attendance/correction/request', data);
  return response.data;
};

/**
 * Approve attendance correction request (HR / SuperAdmin)
 */
export const approveAttendanceCorrection = async (data) => {
  const response = await api.post('/attendance/correction/approve', data);
  return response.data;
};

/**
 * Reject attendance correction request (HR / SuperAdmin)
 */
export const rejectAttendanceCorrection = async (data) => {
  const response = await api.post('/attendance/correction/reject', data);
  return response.data;
};

/**
 * Get Attendance Config
 */
export const getAttendanceConfig = async () => {
  const response = await api.get('/attendance/config');
  return response.data;
};

/**
 * Update Attendance Config
 */
export const updateAttendanceConfig = async (data) => {
  const response = await api.put('/attendance/config', data);
  return response.data;
};

export default api;
