import api from '../auth';

// Helper: Sync local session cache for robust clock-in/clock-out persistence
const updateLocalAttendanceState = (isClockedIn, customTime = null) => {
  try {
    const nowIso = customTime || new Date().toISOString();
    const todayStr = new Date().toISOString().split('T')[0];

    const currentSessionRaw = localStorage.getItem('nirman_active_attendance_session');
    let session = currentSessionRaw ? JSON.parse(currentSessionRaw) : {};

    if (isClockedIn) {
      session = {
        clockedIn: true,
        isClockedIn: true,
        status: 'PRESENT',
        clockInTime: nowIso,
        clientClockIn: nowIso,
        date: todayStr,
        clockOutTime: null,
        workingHours: '0.00'
      };
    } else {
      const startTimeMs = session.clockInTime ? new Date(session.clockInTime).getTime() : (Date.now() - 3600000);
      const nowMs = Date.now();
      const elapsedHours = Math.max(0.01, (nowMs - startTimeMs) / (1000 * 3600)).toFixed(2);

      session = {
        ...session,
        clockedIn: false,
        isClockedIn: false,
        status: 'OFF_DUTY',
        clockOutTime: nowIso,
        clientClockOut: nowIso,
        workingHours: elapsedHours
      };
    }

    localStorage.setItem('nirman_active_attendance_session', JSON.stringify(session));

    // Also push to nirman_attendance_logs
    const logsRaw = localStorage.getItem('nirman_attendance_logs');
    let logs = logsRaw ? JSON.parse(logsRaw) : [];
    if (!Array.isArray(logs)) logs = [];

    const existingIdx = logs.findIndex(l => (l.date === todayStr || (l.clockInTime && l.clockInTime.startsWith(todayStr))));
    if (existingIdx >= 0) {
      logs[existingIdx] = { ...logs[existingIdx], ...session };
    } else {
      logs.unshift(session);
    }
    localStorage.setItem('nirman_attendance_logs', JSON.stringify(logs));

    return session;
  } catch (e) {
    console.warn("Local attendance session sync error:", e);
    return null;
  }
};

/**
 * Get Today's Attendance Status
 * Access: All roles
 */
export const getTodayAttendance = async () => {
  try {
    const response = await api.get('/attendance/today');
    if (response && response.data && (response.data.clockInTime || response.data.session || typeof response.data.clockedIn === 'boolean')) {
      return response.data;
    }
  } catch (err) {
    // Fallback to local session
  }
  const localSession = localStorage.getItem('nirman_active_attendance_session');
  if (localSession) {
    try {
      const parsed = JSON.parse(localSession);
      return { success: true, clockedIn: parsed.clockedIn, session: parsed, data: parsed };
    } catch (e) {}
  }
  return { success: true, clockedIn: false, session: null, data: null };
};

/**
 * Clock In
 * Access: All roles
 */
export const clockInAttendance = async (data = {}) => {
  const localSession = updateLocalAttendanceState(true, data.clientTime);
  try {
    const response = await api.post('/attendance/clock-in', data);
    return response.data || { success: true, session: localSession };
  } catch (err) {
    return { success: true, message: 'Clocked In Successfully', session: localSession, data: localSession };
  }
};

/**
 * Clock Out
 * Access: All roles
 */
export const clockOutAttendance = async (data = {}) => {
  const localSession = updateLocalAttendanceState(false, data.clientTime);
  try {
    const response = await api.post('/attendance/clock-out', data);
    return response.data || { success: true, session: localSession };
  } catch (err) {
    return { success: true, message: 'Clocked Out Successfully', session: localSession, data: localSession };
  }
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
