import api from './auth';

  * Automated PC Boot Clock-In (API_DOCUMENTATION.md Section 4.1)
  * @param {object} payload - { employeeId, deviceId, loginTime, deviceName, ipAddress }
  */
export const clockInPC = async (payload) => {
  const response = await api.post('/attendance/clock-in', payload);
  return response.data;
};

/**
 * Automated OS Shutdown Clock-Out (API_DOCUMENTATION.md Section 4.2)
 * @param {object} payload - { employeeId, deviceId, logoutTime }
 */
export const clockOutPC = async (payload) => {
  const response = await api.post('/attendance/clock-out', payload);
  return response.data;
};

/**
 * Send 30-Second Heartbeat Ping (API_DOCUMENTATION.md Section 4.3)
 * @param {object} payload - { employeeId, deviceId, status }
 */
export const sendHeartbeat = async (payload) => {
  const response = await api.post('/attendance/heartbeat', payload);
  return response.data;
};

/**
 * Get Today's Attendance Status (API_DOCUMENTATION.md Section 4.4)
 */
export const getTodayAttendance = async () => {
  const response = await api.get('/attendance/today');
  return response.data;
};

/**
 * Realtime Active Employee Tracking (API_DOCUMENTATION.md Section 4.5)
 */
export const getLiveActiveUsers = async () => {
  const response = await api.get('/admin/live-users');
  return response.data;
};

/**
 * Handle unified Attendance Events (clock_in, clock_out, heartbeat)
 * @param {object} payload - { deviceId, type, clientTime, userId }
 */
export const postAttendanceEvent = async (payload) => {
  const response = await api.post('/attendance/event', payload);
  return response.data;
};

/**
 * Sync offline queue.
 * @param {object} payload - { deviceId, type, localTime, clientTime, userId }
 */
export const syncOfflineAttendance = async (payload) => {
  const response = await api.post('/attendance/sync', payload);
  return response.data;
};

/**
 * Get own attendance history
 * @param {object} params - { month, year } (optional)
 */
export const getMyAttendance = async (params) => {
  const response = await api.get('/attendance/my', { params });
  return response.data;
};

/**
 * Get all attendance records (HR / SuperAdmin)
 * @param {object} params - { month, year, userId } (optional)
 */
export const getAllAttendanceList = async (params) => {
  const response = await api.get('/attendance/all', { params });
  return response.data;
};

/**
 * Request attendance record manual correction
 * @param {object} payload - { attendanceId, requestedClockIn, requestedClockOut, reason }
 */
export const requestCorrection = async (payload) => {
  const response = await api.post('/attendance/correction/request', payload);
  return response.data;
};

/**
 * Approve attendance correction request (Super Admin / HR)
 * @param {string} requestId - Correction Request ID
 */
export const approveCorrection = async (requestId) => {
  const response = await api.post('/attendance/correction/approve', { requestId });
  return response.data;
};

/**
 * Reject attendance correction request (Super Admin / HR)
 * @param {string} requestId - Correction Request ID
 * @param {string} reason - Rejection reason (optional)
 */
export const rejectCorrection = async (requestId, reason) => {
  const response = await api.post('/attendance/correction/reject', { requestId, reason });
  return response.data;
};

/**
 * Get attendance & heartbeat configuration settings
 */
export const getAttendanceConfig = async () => {
  const response = await api.get('/attendance/config');
  return response.data;
};

/**
 * Update attendance & heartbeat configuration (Super Admin)
 * @param {object} payload - { heartbeatIntervalSeconds, heartbeatTimeoutMinutes, shiftStartTime, shiftEndTime }
 */
export const updateAttendanceConfig = async (payload) => {
  const response = await api.put('/attendance/config', payload);
  return response.data;
};

/**
 * Get all project site locations.
 */
export const getSiteLocationsList = async () => {
  const response = await api.get('/site-locations');
  return response.data;
};

/**
 * Configure Project Site Geo-Fence Location (PM / HR).
 * @param {object} payload - { projectId, projectName, lat, lng, radiusMeters }
 */
export const createSiteLocation = async (payload) => {
  const response = await api.post('/site-locations', payload);
  return response.data;
};

export default api;
