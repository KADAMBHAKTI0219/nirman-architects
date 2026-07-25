// Unified Mock API Layer - Decoupled completely from network Axios services
// All states are persisted in the browser's localStorage.

const EMAIL_ROLE_MAP = {
  'admin@nirman.com': 'Admin',
  'hr@nirman.com': 'HR',
  'pm@nirman.com': 'ProjectManager',
  'architect@nirman.com': 'Architect',
  'engineer@nirman.com': 'SiteEngineer',
  'employee@gmail.com': 'Employee',
  'customer@nirman.com': 'Customer'
};

const initLocalStorage = () => {
  if (!localStorage.getItem('nirman_users')) {
    localStorage.setItem('nirman_users', JSON.stringify([
      { id: 'u1', name: 'Sarah Connor', email: 'architect@nirman.com', role: 'Architect', department: 'Architecture', registeredDeviceId: 'dev-architect' },
      { id: 'u2', name: 'Alice Smith', email: 'employee@gmail.com', role: 'Employee', department: 'Engineering', registeredDeviceId: 'dev-employee' },
      { id: 'u3', name: 'Bob Johnson', email: 'engineer@nirman.com', role: 'SiteEngineer', department: 'Construction', registeredDeviceId: 'dev-site' },
      { id: 'u4', name: 'Charlie Brown', email: 'pm@nirman.com', role: 'ProjectManager', department: 'Management', registeredDeviceId: 'dev-pm' },
      { id: 'u5', name: 'HR Manager', email: 'hr@nirman.com', role: 'HR', department: 'HR', registeredDeviceId: 'dev-hr' },
      { id: 'u6', name: 'Nirman Admin', email: 'admin@nirman.com', role: 'Admin', department: 'Executive', registeredDeviceId: 'dev-admin' }
    ]));
  }

  if (!localStorage.getItem('nirman_leave_types')) {
    localStorage.setItem('nirman_leave_types', JSON.stringify([
      { id: 'leave-casual', name: 'Casual Leave', code: 'CASUAL', defaultQuota: 12, colorTag: '#10B981', active: true },
      { id: 'leave-sick', name: 'Sick Leave', code: 'SICK', defaultQuota: 8, colorTag: '#EF4444', active: true },
      { id: 'leave-unpaid', name: 'Unpaid Leave', code: 'UNPAID', defaultQuota: 30, colorTag: '#6366F1', active: true },
      { id: '6a62efaeca3553ab61cb7c1e', name: 'Annual Leave', code: 'ANNUAL', defaultQuota: 15, colorTag: '#3B82F6', active: true }
    ]));
  }

  if (!localStorage.getItem('nirman_leave_requests')) {
    localStorage.setItem('nirman_leave_requests', JSON.stringify([
      { id: 'req1', userId: 'u1', employeeName: 'Sarah Connor', leaveTypeId: '6a62efaeca3553ab61cb7c1e', leaveTypeName: 'Annual Leave', code: 'ANNUAL', colorTag: '#3B82F6', fromDate: '2026-08-01', toDate: '2026-08-05', reason: 'Family vacation', status: 'PENDING', createdAt: new Date().toISOString() },
      { id: 'req2', userId: 'u2', employeeName: 'Alice Smith', leaveTypeId: 'leave-sick', leaveTypeName: 'Sick Leave', code: 'SICK', colorTag: '#EF4444', fromDate: '2026-07-20', toDate: '2026-07-21', reason: 'Doctor checkup', status: 'APPROVED', createdAt: new Date().toISOString() }
    ]));
  }

  if (!localStorage.getItem('nirman_attendance_logs')) {
    localStorage.setItem('nirman_attendance_logs', JSON.stringify([
      { id: 'att1', userId: 'u1', employeeName: 'Sarah Connor', userEmail: 'architect@nirman.com', type: 'CLOCK_IN', time: new Date().toISOString(), source: 'SYSTEM_BOOT', mode: 'OFFICE_AUTO', deviceId: 'dev-architect', isOffline: false },
      { id: 'att2', userId: 'u2', employeeName: 'Alice Smith', userEmail: 'employee@gmail.com', type: 'CLOCK_IN', time: new Date().toISOString(), source: 'SYSTEM_BOOT', mode: 'OFFICE_AUTO', deviceId: 'dev-employee', isOffline: false }
    ]));
  }

  if (!localStorage.getItem('nirman_corrections')) {
    localStorage.setItem('nirman_corrections', JSON.stringify([
      { id: 'corr1', userId: 'u2', employeeName: 'Alice Smith', requestedClockIn: new Date().toISOString(), requestedClockOut: new Date().toISOString(), reason: 'Forgot to punch out due to client meeting', status: 'PENDING' }
    ]));
  }

  if (!localStorage.getItem('nirman_devices')) {
    localStorage.setItem('nirman_devices', JSON.stringify([
      { id: 'dev1', userId: 'u1', employeeName: 'Sarah Connor', deviceId: 'dev-architect', status: 'APPROVED' },
      { id: 'dev2', userId: 'u2', employeeName: 'Alice Smith', deviceId: 'dev-employee', status: 'APPROVED' }
    ]));
  }

  if (!localStorage.getItem('nirman_site_locations')) {
    localStorage.setItem('nirman_site_locations', JSON.stringify([
      { id: 'site1', projectId: '6a607dae7f99c70902371c1d', lat: 23.0225, lng: 72.5714, radiusMeters: 200 }
    ]));
  }

  if (!localStorage.getItem('nirman_notifications')) {
    localStorage.setItem('nirman_notifications', JSON.stringify([
      { id: 'n1', text: "Drawing 'Ground Floor Plan V1.1' was approved by Project Manager.", time: "10 mins ago", read: false },
      { id: 'n2', text: "Overdue task alert: 'Site Survey Report' is past deadline.", time: "1 hour ago", read: false }
    ]));
  }
};

// Auto-run data initializer
initLocalStorage();

const getSessionUser = () => {
  try {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

const delay = (ms = 100) => new Promise(res => setTimeout(res, ms));


// --- AUTHENTICATION MOCKS ---

export const getRoles = async () => {
  await delay();
  return { success: true, roles: Object.values(EMAIL_ROLE_MAP) };
};

export const register = async (payload) => {
  await delay();
  return { success: true, message: 'User registered successfully (Simulation)' };
};

export const login = async (email, password) => {
  await delay();
  const cleanEmail = email || 'employee@gmail.com';
  const role = EMAIL_ROLE_MAP[cleanEmail] || 'Employee';
  const user = {
    id: cleanEmail.split('@')[0],
    name: cleanEmail.split('@')[0].toUpperCase(),
    email: cleanEmail,
    role,
    department: 'Development',
    registeredDeviceId: 'dev-' + cleanEmail.split('@')[0]
  };

  const users = JSON.parse(localStorage.getItem('nirman_users'));
  if (!users.some(u => u.email === cleanEmail)) {
    users.push(user);
    localStorage.setItem('nirman_users', JSON.stringify(users));
  }

  localStorage.setItem('token', 'mock-jwt-token-xyz');
  localStorage.setItem('user', JSON.stringify(user));
  return { success: true, token: 'mock-jwt-token-xyz', user };
};

export const getMe = async () => {
  await delay();
  const user = getSessionUser();
  return user ? { success: true, user } : { success: false, message: 'Unauthenticated' };
};

export const logout = async () => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      const isSiteEngineer = user.role?.toLowerCase().includes('site');
      const nowISO = new Date().toISOString();
      const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs') || '[]');
      const newLog = {
        id: 'att_' + Math.random().toString(36).substr(2, 9),
        userId: user.id || user._id,
        employeeName: user.name || 'User',
        userEmail: user.email,
        type: 'CLOCK_OUT',
        time: nowISO,
        source: 'LOGOUT',
        mode: isSiteEngineer ? 'SITE_GPS' : 'OFFICE_AUTO',
        deviceId: user.registeredDeviceId || user.deviceId || 'web-browser',
        isOffline: false
      };
      logs.push(newLog);
      localStorage.setItem('nirman_attendance_logs', JSON.stringify(logs));

      // Await backend HTTP clock-out request BEFORE redirecting
      await syncAttendanceToBackend(newLog);
    } catch (err) {
      console.error("Logout clock-out sync error:", err);
    }
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isCheckedIn');
  window.location.href = '/';
};

export const getUsers = async () => {
  await delay();
  const users = JSON.parse(localStorage.getItem('nirman_users'));
  return { success: true, users };
};


// --- LEAVE MANAGEMENT MOCKS ---

export const applyLeave = async (data) => {
  await delay();
  const user = getSessionUser() || { id: 'u2', name: 'Alice Smith' };
  const requests = JSON.parse(localStorage.getItem('nirman_leave_requests') || '[]');
  const leaveTypes = JSON.parse(localStorage.getItem('nirman_leave_types') || '[]');
  
  const searchId = String(data.leaveTypeId || '').toLowerCase();
  const activeType = leaveTypes.find(t => 
    String(t.id).toLowerCase() === searchId || 
    (t.code && String(t.code).toLowerCase() === searchId) ||
    (t.name && String(t.name).toLowerCase().includes(searchId)) ||
    (t.name && searchId.includes(String(t.name).toLowerCase()))
  ) || {
    id: data.leaveTypeId || 'leave-unpaid',
    name: 'Unpaid Leave',
    code: 'UNPAID',
    colorTag: '#6366F1'
  };

  const newRequest = {
    id: 'req_' + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    employeeName: user.name,
    leaveTypeId: activeType.id,
    leaveTypeName: activeType.name,
    code: activeType.code,
    colorTag: activeType.colorTag,
    fromDate: data.fromDate,
    toDate: data.toDate,
    reason: data.reason || 'Personal Work',
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
  requests.push(newRequest);
  localStorage.setItem('nirman_leave_requests', JSON.stringify(requests));
  return { success: true, request: newRequest };
};

export const getMyLeaves = async (year) => {
  await delay();
  const user = getSessionUser() || { id: 'u2' };
  const allRequests = JSON.parse(localStorage.getItem('nirman_leave_requests') || '[]');
  
  // Filter user requests matching by ID, email, or name
  const requests = allRequests.filter(r => 
    r.userId === user.id || 
    (user.email && r.userEmail && r.userEmail.toLowerCase() === user.email.toLowerCase()) ||
    (user.name && r.employeeName && r.employeeName.toLowerCase() === user.name.toLowerCase()) ||
    allRequests.length === 1 // If demo single user session
  );
  
  const leaveTypes = JSON.parse(localStorage.getItem('nirman_leave_types') || '[]');
  
  const balances = leaveTypes.map(t => {
    const approvedRequests = requests.filter(r => {
      const isApproved = r.status && String(r.status).toUpperCase() === 'APPROVED';
      const isSameType = r.leaveTypeId === t.id || 
                         (r.code && t.code && String(r.code).toUpperCase() === String(t.code).toUpperCase()) || 
                         (r.leaveTypeName && t.name && String(r.leaveTypeName).toLowerCase().includes(String(t.name).toLowerCase())) ||
                         (r.leaveTypeName && t.name && String(t.name).toLowerCase().includes(String(r.leaveTypeName).toLowerCase()));
      return isApproved && isSameType;
    });

    const usedDays = approvedRequests.reduce((sum, r) => {
      const from = r.fromDate ? new Date(r.fromDate) : null;
      const to = r.toDate ? new Date(r.toDate) : null;
      const calcDays = (from && to && !isNaN(from.getTime()) && !isNaN(to.getTime())) 
        ? Math.max(1, Math.round(Math.abs(to - from) / (1000 * 60 * 60 * 24)) + 1)
        : (r.days || r.totalDays || 1);
      return sum + calcDays;
    }, 0);

    const quota = t.defaultQuota || 12;
    const remainingDays = Math.max(0, quota - usedDays);

    return {
      leaveTypeId: t.id,
      leaveTypeName: t.name,
      code: t.code,
      colorTag: t.colorTag,
      allocatedDays: quota,
      usedDays,
      remainingDays
    };
  });

  return { success: true, balances, requests, year: year || new Date().getFullYear() };
};

export const cancelLeave = async (leaveRequestId) => {
  await delay();
  const requests = JSON.parse(localStorage.getItem('nirman_leave_requests'));
  const updated = requests.map(r => r.id === leaveRequestId ? { ...r, status: 'CANCELLED' } : r);
  localStorage.setItem('nirman_leave_requests', JSON.stringify(updated));
  return { success: true, message: 'Cancelled successfully' };
};

export const getPendingLeaveRequests = async () => {
  await delay();
  const requests = JSON.parse(localStorage.getItem('nirman_leave_requests')).filter(r => r.status === 'PENDING');
  return { success: true, requests };
};

export const approveLeaveRequest = async (leaveRequestId) => {
  await delay();
  const requests = JSON.parse(localStorage.getItem('nirman_leave_requests'));
  const updated = requests.map(r => r.id === leaveRequestId ? { ...r, status: 'APPROVED' } : r);
  localStorage.setItem('nirman_leave_requests', JSON.stringify(updated));
  return { success: true, message: 'Approved successfully' };
};

export const rejectLeaveRequest = async (leaveRequestId, rejectionReason) => {
  await delay();
  const requests = JSON.parse(localStorage.getItem('nirman_leave_requests'));
  const updated = requests.map(r => r.id === leaveRequestId ? { ...r, status: 'REJECTED', rejectionReason } : r);
  localStorage.setItem('nirman_leave_requests', JSON.stringify(updated));
  return { success: true, message: 'Rejected successfully' };
};

export const getCompanyLeaves = async () => {
  await delay();
  const requests = JSON.parse(localStorage.getItem('nirman_leave_requests'));
  return { success: true, requests };
};

export const adjustLeaveBalance = async (data) => {
  await delay();
  return { success: true, message: 'Balance adjusted successfully' };
};

export const getProjectTeamLeaves = async (projectId) => {
  await delay();
  const requests = JSON.parse(localStorage.getItem('nirman_leave_requests'));
  return { success: true, requests };
};

export const exportLeaveReport = async () => {
  await delay();
  const requests = JSON.parse(localStorage.getItem('nirman_leave_requests'));
  const activeCount = requests.filter(r => r.status === 'APPROVED').length;
  return {
    success: true,
    report: [
      { name: 'Active Approved Leaves', value: activeCount },
      { name: 'Pending Leaves', value: requests.filter(r => r.status === 'PENDING').length },
      { name: 'Rejected/Cancelled', value: requests.filter(r => r.status === 'REJECTED' || r.status === 'CANCELLED').length }
    ]
  };
};

export const createLeaveType = async (data) => {
  await delay();
  const types = JSON.parse(localStorage.getItem('nirman_leave_types'));
  const newType = {
    id: 'lt_' + Math.random().toString(36).substr(2, 9),
    name: data.name,
    code: data.code,
    defaultQuota: data.defaultQuota || 10,
    colorTag: data.colorTag || '#94A3B8',
    active: true
  };
  types.push(newType);
  localStorage.setItem('nirman_leave_types', JSON.stringify(types));
  return { success: true, leaveType: newType };
};

export const getAllLeaveTypes = async () => {
  await delay();
  const leaveTypes = JSON.parse(localStorage.getItem('nirman_leave_types'));
  return { success: true, leaveTypes };
};

export const getActiveLeaveTypes = async () => {
  await delay();
  const leaveTypes = JSON.parse(localStorage.getItem('nirman_leave_types'));
  return { success: true, leaveTypes: leaveTypes.filter(t => t.active !== false) };
};

export const updateLeaveType = async (id, data) => {
  await delay();
  const types = JSON.parse(localStorage.getItem('nirman_leave_types'));
  const updated = types.map(t => t.id === id ? { ...t, ...data } : t);
  localStorage.setItem('nirman_leave_types', JSON.stringify(updated));
  return { success: true, leaveType: updated.find(t => t.id === id) };
};

export const deactivateLeaveType = async (id) => {
  await delay();
  const types = JSON.parse(localStorage.getItem('nirman_leave_types'));
  const updated = types.map(t => t.id === id ? { ...t, active: false } : t);
  localStorage.setItem('nirman_leave_types', JSON.stringify(updated));
  return { success: true, message: 'Deactivated successfully' };
};


// --- ATTENDANCE MOCKS ---

export const getHRDashboardWidgets = async () => {
  await delay();
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs'));
  const onlineCount = logs.filter(l => l.type === 'CLOCK_IN').length;
  return {
    success: true,
    data: {
      totalUsers: 148,
      onlineCount,
      offlineCount: 148 - onlineCount,
      pendingCorrections: JSON.parse(localStorage.getItem('nirman_corrections')).filter(c => c.status === 'PENDING').length,
      securityAlerts: 0
    }
  };
};

const syncAttendanceToBackend = async (payload) => {
  try {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env?.VITE_API_URL || 'https://nirman-architects.onrender.com/api';
    const endpoint = payload.type === 'CLOCK_OUT' ? '/attendance/clock-out' : '/attendance/clock-in';
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const nowISO = payload.time || new Date().toISOString();
    const bodyData = JSON.stringify({
      employeeId: payload.userId,
      userId: payload.userId,
      deviceId: payload.deviceId || 'web-browser',
      loginTime: nowISO,
      logoutTime: nowISO,
      clockOutTime: nowISO,
      clientClockOut: nowISO,
      time: nowISO,
      deviceName: 'WEB_BROWSER',
      ipAddress: '127.0.0.1',
      type: payload.type,
      source: payload.source || (payload.type === 'CLOCK_OUT' ? 'LOGOUT' : 'SYSTEM_BOOT'),
      mode: payload.mode || 'OFFICE_AUTO',
      lat: payload.lat,
      lng: payload.lng,
      selfieUrl: payload.selfieUrl
    });

    const res = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: bodyData
    });

    if (!res.ok) {
      await fetch(`${backendUrl}/attendance/event`, {
        method: 'POST',
        headers,
        body: bodyData
      }).catch(() => {});
    }
  } catch (err) {
    console.log("Backend auto-attendance sync notice:", err.message);
  }
};

export const clockOfficeEvent = async (userId, deviceId, type, source, clientTime) => {
  await delay();
  const user = getSessionUser() || { id: 'u2', name: 'Alice Smith', email: 'employee@gmail.com' };
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs') || '[]');
  const newLog = {
    id: 'att_' + Math.random().toString(36).substr(2, 9),
    userId: userId || user.id,
    employeeName: user.name,
    userEmail: user.email,
    type,
    time: clientTime || new Date().toISOString(),
    source: source || (type === 'CLOCK_IN' ? 'SYSTEM_BOOT' : 'LOGOUT'),
    mode: 'OFFICE_AUTO',
    deviceId: deviceId || user.deviceId || 'web-browser',
    isOffline: false
  };
  logs.push(newLog);
  localStorage.setItem('nirman_attendance_logs', JSON.stringify(logs));
  
  await syncAttendanceToBackend(newLog);
  return { success: true, log: newLog };
};

export const sendHeartbeat = async (deviceId) => {
  try {
    const token = localStorage.getItem('token');
    const backendUrl = import.meta.env?.VITE_API_URL || 'https://nirman-architects.onrender.com/api';
    if (token) {
      fetch(`${backendUrl}/attendance/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deviceId, status: 'ONLINE' })
      }).catch(() => {});
    }
  } catch (e) {}
  return { success: true, message: 'Heartbeat recorded' };
};

export const syncOfficeOffline = async (userId, deviceId, type, localTime, monotonicTicks) => {
  return { success: true, message: 'Offline sync successful' };
};

export const siteCheckin = async (userId, projectId, lat, lng, selfieUrl, clientTime) => {
  await delay();
  const user = getSessionUser() || { id: 'u3', name: 'Bob Johnson', email: 'engineer@nirman.com' };
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs'));
  const newLog = {
    id: 'att_' + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    employeeName: user.name,
    userEmail: user.email,
    type: 'CLOCK_IN',
    time: clientTime || new Date().toISOString(),
    source: 'BIOMETRIC_PUNCH',
    mode: 'SITE_GPS',
    deviceId: 'web-mobile-gps',
    isOffline: false,
    lat,
    lng,
    selfieUrl
  };
  logs.push(newLog);
  localStorage.setItem('nirman_attendance_logs', JSON.stringify(logs));

  syncAttendanceToBackend(newLog);
  return { success: true, log: newLog };
};

export const siteCheckout = async (userId, projectId, lat, lng, clientTime) => {
  await delay();
  const user = getSessionUser() || { id: 'u3', name: 'Bob Johnson', email: 'engineer@nirman.com' };
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs'));
  const newLog = {
    id: 'att_' + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    employeeName: user.name,
    userEmail: user.email,
    type: 'CLOCK_OUT',
    time: clientTime || new Date().toISOString(),
    source: 'BIOMETRIC_PUNCH',
    mode: 'SITE_GPS',
    deviceId: 'web-mobile-gps',
    isOffline: false,
    lat,
    lng
  };
  logs.push(newLog);
  localStorage.setItem('nirman_attendance_logs', JSON.stringify(logs));

  syncAttendanceToBackend(newLog);
  return { success: true, log: newLog };
};

export const syncSiteOffline = async (userId, projectId, type, lat, lng, localTime) => {
  return { success: true, message: 'Offline sync successful' };
};

export const getAllAttendance = async (date = '', role = '', department = '') => {
  await delay();
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs'));
  return { success: true, logs };
};

export const approveCorrection = async (requestId) => {
  await delay();
  const corrections = JSON.parse(localStorage.getItem('nirman_corrections'));
  const updated = corrections.map(c => c.id === requestId ? { ...c, status: 'APPROVED' } : c);
  localStorage.setItem('nirman_corrections', JSON.stringify(updated));
  return { success: true, message: 'Approved successfully' };
};

export const rejectCorrection = async (requestId) => {
  await delay();
  const corrections = JSON.parse(localStorage.getItem('nirman_corrections'));
  const updated = corrections.map(c => c.id === requestId ? { ...c, status: 'REJECTED' } : c);
  localStorage.setItem('nirman_corrections', JSON.stringify(updated));
  return { success: true, message: 'Rejected successfully' };
};

export const getAttendanceReport = async (format = 'csv', scope = 'all', projectId = '') => {
  await delay();
  return { success: true, message: 'Report data generated' };
};

export const updateHeartbeatConfig = async (timeoutMinutes) => {
  await delay();
  return { success: true, message: 'Heartbeat timeout updated' };
};

export const updateShiftConfig = async (shiftStart, shiftEnd) => {
  await delay();
  return { success: true, message: 'Shift times updated' };
};

export const getProjectAttendance = async (projectId) => {
  await delay();
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs'));
  return { success: true, logs };
};

export const saveSiteLocation = async (projectId, lat, lng, radiusMeters = 200) => {
  await delay();
  const locations = JSON.parse(localStorage.getItem('nirman_site_locations'));
  const newLoc = {
    id: 'site_' + Math.random().toString(36).substr(2, 9),
    projectId,
    lat,
    lng,
    radiusMeters
  };
  locations.push(newLoc);
  localStorage.setItem('nirman_site_locations', JSON.stringify(locations));
  return { success: true, location: newLoc };
};

export const getMyAttendance = async (month = '', year = '') => {
  await delay();
  const user = getSessionUser() || { id: 'u2' };
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs')).filter(l => l.userId === user.id);
  return { success: true, logs };
};

export const requestCorrection = async (attendanceId, requestedClockIn, requestedClockOut, reason) => {
  await delay();
  const user = getSessionUser() || { id: 'u2', name: 'Alice Smith' };
  const corrections = JSON.parse(localStorage.getItem('nirman_corrections'));
  const newCorr = {
    id: 'corr_' + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    employeeName: user.name,
    requestedClockIn,
    requestedClockOut,
    reason,
    status: 'PENDING'
  };
  corrections.push(newCorr);
  localStorage.setItem('nirman_corrections', JSON.stringify(corrections));
  return { success: true, correction: newCorr };
};

export const getAttendanceStatus = async (userId) => {
  await delay();
  const user = getSessionUser() || { id: 'u2' };
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs')).filter(l => l.userId === (userId || user.id));
  const isOnline = logs.length > 0 && logs[logs.length - 1].type === 'CLOCK_IN';
  return {
    success: true,
    data: {
      isOnline,
      currentSession: isOnline ? logs[logs.length - 1] : null
    }
  };
};

export const getSiteLocations = async () => {
  await delay();
  const locations = JSON.parse(localStorage.getItem('nirman_site_locations'));
  return { success: true, locations };
};

export const getMyCorrections = async () => {
  await delay();
  const user = getSessionUser() || { id: 'u2' };
  const corrections = JSON.parse(localStorage.getItem('nirman_corrections')).filter(c => c.userId === user.id);
  return { success: true, corrections };
};

export const clockOffice = async (userId, deviceId, type, source, clientTime) => {
  await delay();
  const user = getSessionUser() || { id: 'u2', name: 'Alice Smith', email: 'employee@gmail.com' };
  const logs = JSON.parse(localStorage.getItem('nirman_attendance_logs'));
  const newLog = {
    id: 'att_' + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    employeeName: user.name,
    userEmail: user.email,
    type,
    time: clientTime || new Date().toISOString(),
    source: source || (type === 'CLOCK_IN' ? 'SYSTEM_BOOT' : 'SYSTEM_SHUTDOWN'),
    mode: 'OFFICE_AUTO',
    deviceId: deviceId || 'web-browser',
    isOffline: false
  };
  logs.push(newLog);
  localStorage.setItem('nirman_attendance_logs', JSON.stringify(logs));
  return { success: true, log: newLog };
};


// --- DEVICE MOCKS ---

export const registerDevice = async (userId, deviceId) => {
  await delay();
  const user = getSessionUser() || { id: 'u2', name: 'Alice Smith' };
  const devices = JSON.parse(localStorage.getItem('nirman_devices'));
  const newDev = {
    id: 'dev_' + Math.random().toString(36).substr(2, 9),
    userId: user.id,
    employeeName: user.name,
    deviceId,
    status: 'PENDING'
  };
  devices.push(newDev);
  localStorage.setItem('nirman_devices', JSON.stringify(devices));
  return { success: true, data: newDev };
};

export const approveDevice = async (requestId, action) => {
  await delay();
  const devices = JSON.parse(localStorage.getItem('nirman_devices'));
  const updated = devices.map(d => d.id === requestId ? { ...d, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : d);
  localStorage.setItem('nirman_devices', JSON.stringify(updated));
  return { success: true, message: 'Device status updated' };
};

export const getDeviceStatus = async (userId) => {
  await delay();
  const user = getSessionUser() || { id: 'u2' };
  const devices = JSON.parse(localStorage.getItem('nirman_devices')).filter(d => d.userId === (userId || user.id));
  return { success: true, data: devices[0] || null };
};

export const getPendingDeviceRequests = async () => {
  await delay();
  const devices = JSON.parse(localStorage.getItem('nirman_devices')).filter(d => d.status === 'PENDING');
  return { success: true, requests: devices };
};

export const assignDevice = async (targetUserId, deviceId) => {
  await delay();
  return { success: true, message: 'Device assigned successfully' };
};


// --- NOTIFICATIONS MOCK ---

export const getNotifications = async () => {
  await delay();
  const notifications = JSON.parse(localStorage.getItem('nirman_notifications'));
  return { success: true, notifications };
};

export const markNotificationRead = async (id) => {
  await delay();
  const notifications = JSON.parse(localStorage.getItem('nirman_notifications'));
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem('nirman_notifications', JSON.stringify(updated));
  return { success: true, message: 'Marked read successfully' };
};
