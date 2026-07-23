import api from './api';

// --- HR Dashboard Widgets ---
export const getHRDashboardWidgets = async () => {
  return api.get('/attendance/dashboard/widgets');
};

// --- Office Attendance ---
export const clockOfficeEvent = async (userId, deviceId, type, source, clientTime) => {
  return api.post('/attendance/office/event', {
    userId,
    deviceId,
    type,
    source: source || (type === 'CLOCK_IN' ? 'SYSTEM_BOOT' : 'SYSTEM_SHUTDOWN'),
    clientTime: clientTime || new Date().toISOString(),
    time: clientTime || new Date().toISOString()
  });
};

export const sendHeartbeat = async (deviceId) => {
  return api.post('/attendance/heartbeat', { deviceId });
};

export const syncOfficeOffline = async (userId, deviceId, type, localTime, monotonicTicks) => {
  return api.post('/attendance/office/sync', {
    userId,
    deviceId,
    type,
    localTime,
    monotonicTicks
  });
};

// --- Site Attendance ---
export const siteCheckin = async (userId, projectId, lat, lng, selfieUrl, clientTime) => {
  return api.post('/attendance/site/checkin', {
    userId,
    projectId,
    lat,
    lng,
    selfieUrl,
    clientTime: clientTime || new Date().toISOString()
  });
};

export const siteCheckout = async (userId, projectId, lat, lng, clientTime) => {
  return api.post('/attendance/site/checkout', {
    userId,
    projectId,
    lat,
    lng,
    clientTime: clientTime || new Date().toISOString()
  });
};

export const syncSiteOffline = async (userId, projectId, type, lat, lng, localTime) => {
  return api.post('/attendance/site/sync', {
    userId,
    projectId,
    type, // 'checkin' | 'checkout'
    lat,
    lng,
    localTime
  });
};

// --- HR Management ---
export const getAllAttendance = async (date = '', role = '', department = '') => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (role) params.append('role', role);
  if (department) params.append('department', department);
  
  return api.get(`/attendance/all?${params.toString()}`);
};

export const approveCorrection = async (requestId) => {
  return api.post('/attendance/correction/approve', { requestId });
};

export const rejectCorrection = async (requestId) => {
  return api.post('/attendance/correction/reject', { requestId });
};

export const getAttendanceReport = async (format = 'csv', scope = 'all', projectId = '') => {
  const params = new URLSearchParams({ format, scope });
  if (projectId) params.append('projectId', projectId);
  
  return api.get(`/attendance/report?${params.toString()}`);
};

export const updateHeartbeatConfig = async (timeoutMinutes) => {
  return api.post('/attendance/config/heartbeat-timeout', { timeoutMinutes });
};

export const updateShiftConfig = async (shiftStart, shiftEnd) => {
  return api.post('/attendance/config/shift', { shiftStart, shiftEnd });
};

// --- Project Manager (PM) ---
export const getProjectAttendance = async (projectId) => {
  return api.get(`/attendance/project/${projectId}`);
};

export const saveSiteLocation = async (projectId, lat, lng, radiusMeters = 200) => {
  return api.post('/site-locations', {
    projectId,
    lat,
    lng,
    radiusMeters
  });
};

// --- Self Service ---
export const getMyAttendance = async (month = '', year = '') => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  
  return api.get(`/attendance/my?${params.toString()}`);
};

export const requestCorrection = async (attendanceId, requestedClockIn, requestedClockOut, reason) => {
  return api.post('/attendance/correction/request', {
    attendanceId,
    requestedClockIn,
    requestedClockOut,
    reason
  });
};

export const getAttendanceStatus = async (userId) => {
  const params = new URLSearchParams();
  if (userId) params.append('userId', userId);
  return api.get(`/attendance/status?${params.toString()}`);
};

export const getSiteLocations = async () => {
  return api.get('/site-locations');
};

export const getMyCorrections = async () => {
  return api.get('/attendance/correction/my');
};

export const clockOffice = async (userId, deviceId, type, source, clientTime) => {
  return api.post('/attendance/clock', {
    userId,
    deviceId,
    type,
    source: source || (type === 'CLOCK_IN' ? 'SYSTEM_BOOT' : 'SYSTEM_SHUTDOWN'),
    clientTime: clientTime || new Date().toISOString(),
    time: clientTime || new Date().toISOString()
  });
};
