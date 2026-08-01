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

  if (!localStorage.getItem('nirman_app_usage_config')) {
    localStorage.setItem('nirman_app_usage_config', JSON.stringify({
      pollIntervalSeconds: 5,
      syncIntervalMinutes: 5,
      captureWindowTitle: false,
      isEnabled: true,
      updatedAt: new Date().toISOString()
    }));
  }

  if (!localStorage.getItem('nirman_app_usage_summaries')) {
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    localStorage.setItem('nirman_app_usage_summaries', JSON.stringify([
      {
        userId: 'u1',
        date: todayStr,
        idleSeconds: 1200,
        totalTrackedSeconds: 27000,
        appTotals: [
          { appName: 'AutoCAD', totalSeconds: 14400 },
          { appName: 'Autodesk Revit', totalSeconds: 7200 },
          { appName: 'Google Chrome', totalSeconds: 4200 },
          { appName: 'IDLE', totalSeconds: 1200 }
        ]
      },
      {
        userId: 'u2',
        date: todayStr,
        idleSeconds: 1800,
        totalTrackedSeconds: 25200,
        appTotals: [
          { appName: 'Visual Studio Code', totalSeconds: 12600 },
          { appName: 'Google Chrome', totalSeconds: 7200 },
          { appName: 'Slack', totalSeconds: 3600 },
          { appName: 'IDLE', totalSeconds: 1800 }
        ]
      },
      {
        userId: '6a644911115fbe433cfe4546',
        date: todayStr,
        idleSeconds: 900,
        totalTrackedSeconds: 28800,
        appTotals: [
          { appName: 'AutoCAD', totalSeconds: 16200 },
          { appName: 'Microsoft Excel', totalSeconds: 7200 },
          { appName: 'Google Chrome', totalSeconds: 4500 },
          { appName: 'IDLE', totalSeconds: 900 }
        ]
      },
      {
        userId: '6a6851b0e0d4667d8232a131',
        date: todayStr,
        idleSeconds: 1500,
        totalTrackedSeconds: 24300,
        appTotals: [
          { appName: 'HR Portal (Chrome)', totalSeconds: 10800 },
          { appName: 'Microsoft Excel', totalSeconds: 7200 },
          { appName: 'Slack', totalSeconds: 4800 },
          { appName: 'IDLE', totalSeconds: 1500 }
        ]
      }
    ]));
  }

  if (!localStorage.getItem('nirman_leads')) {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(today); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fiveDaysAgo = new Date(today); fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const oneWeekAgo = new Date(today); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    localStorage.setItem('nirman_leads', JSON.stringify([
      {
        _id: 'lead-1',
        name: 'Bhakti Kadam',
        phone: '09274322242',
        email: 'bhakti.kadam@gmail.com',
        projectType: 'Residential Project',
        amount: 1800000,
        priorityTag: 'Hot Lead',
        dateText: 'Today',
        source: 'Website',
        requirementNotes: 'Complete architectural design for 4BHK bungalow with structural drawings.',
        assignedTo: { _id: 'u-bhakti', name: 'Bhakti', email: 'bhakti@nirman.com', department: 'Architecture' },
        status: 'NEW',
        lostReason: null,
        nextFollowUpDate: today.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        _id: 'lead-2',
        name: 'Aarav Shah',
        phone: '09876543210',
        email: 'aarav.shah@gmail.com',
        projectType: 'Commercial Project',
        amount: 2500000,
        priorityTag: 'Warm Lead',
        dateText: 'Tomorrow',
        source: 'Referral',
        requirementNotes: 'Commercial complex layout and interior architecture in city center.',
        assignedTo: { _id: 'u-rohit', name: 'Rohit', email: 'rohit@nirman.com', department: 'Engineering' },
        status: 'NEW',
        lostReason: null,
        nextFollowUpDate: tomorrow.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        _id: 'lead-3',
        name: 'Priya Sharma',
        phone: '09123456789',
        email: 'priya.sharma@gmail.com',
        projectType: 'Interior Project',
        amount: 1200000,
        priorityTag: 'Interested',
        dateText: '2 Days Ago',
        source: 'SocialMedia',
        requirementNotes: 'Modern minimal interior design for 3BHK luxury apartment.',
        assignedTo: { _id: 'u-bhakti', name: 'Bhakti', email: 'bhakti@nirman.com', department: 'Architecture' },
        status: 'CONTACTED',
        lostReason: null,
        nextFollowUpDate: twoDaysAgo.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: twoDaysAgo.toISOString(),
        updatedAt: twoDaysAgo.toISOString()
      },
      {
        _id: 'lead-4',
        name: 'Rohan Mehta',
        phone: '09234567890',
        email: 'rohan.mehta@gmail.com',
        projectType: 'Residential Project',
        amount: 2000000,
        priorityTag: 'Interested',
        dateText: 'Yesterday',
        source: 'WalkIn',
        requirementNotes: 'Duplex villa structural design and landscaping elevation.',
        assignedTo: { _id: 'u-rohit', name: 'Rohit', email: 'rohit@nirman.com', department: 'Engineering' },
        status: 'CONTACTED',
        lostReason: null,
        nextFollowUpDate: yesterday.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString()
      },
      {
        _id: 'lead-5',
        name: 'Neha Kapoor',
        phone: '09098765432',
        email: 'neha.kapoor@gmail.com',
        projectType: 'Villa Project',
        amount: 3500000,
        priorityTag: 'High Priority',
        dateText: 'Today',
        source: 'Website',
        requirementNotes: 'High-end Eco-friendly luxury villa layout with solar integration.',
        assignedTo: { _id: 'u-bhakti', name: 'Bhakti', email: 'bhakti@nirman.com', department: 'Architecture' },
        status: 'QUALIFIED',
        lostReason: null,
        nextFollowUpDate: today.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        _id: 'lead-6',
        name: 'Vikram Singh',
        phone: '09234567890',
        email: 'vikram.singh@gmail.com',
        projectType: 'Commercial Project',
        amount: 2800000,
        priorityTag: 'High Priority',
        dateText: '1 Day Ago',
        source: 'Referral',
        requirementNotes: 'Multi-story office tower structural layout & 3D visualization.',
        assignedTo: { _id: 'u-rohit', name: 'Rohit', email: 'rohit@nirman.com', department: 'Engineering' },
        status: 'QUALIFIED',
        lostReason: null,
        nextFollowUpDate: yesterday.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString()
      },
      {
        _id: 'lead-7',
        name: 'Arjun Joshi',
        phone: '09112233445',
        email: 'arjun.joshi@gmail.com',
        projectType: 'Office Renovation',
        amount: 1500000,
        priorityTag: 'Proposal Sent',
        dateText: '2 Days Ago',
        source: 'Website',
        requirementNotes: 'Complete office interior renovation & ergonomic desk layouts.',
        assignedTo: { _id: 'u-bhakti', name: 'Bhakti', email: 'bhakti@nirman.com', department: 'Architecture' },
        status: 'PROPOSAL_SENT',
        lostReason: null,
        nextFollowUpDate: twoDaysAgo.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: twoDaysAgo.toISOString(),
        updatedAt: twoDaysAgo.toISOString()
      },
      {
        _id: 'lead-8',
        name: 'Sneha Kulkarni',
        phone: '09332211009',
        email: 'sneha.k@gmail.com',
        projectType: 'Residential Project',
        amount: 2200000,
        priorityTag: 'Proposal Sent',
        dateText: '3 Days Ago',
        source: 'WalkIn',
        requirementNotes: 'Traditional design villa renovation with modern amenities.',
        assignedTo: { _id: 'u-rohit', name: 'Rohit', email: 'rohit@nirman.com', department: 'Engineering' },
        status: 'PROPOSAL_SENT',
        lostReason: null,
        nextFollowUpDate: threeDaysAgo.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: threeDaysAgo.toISOString(),
        updatedAt: threeDaysAgo.toISOString()
      },
      {
        _id: 'lead-9',
        name: 'Dhruv Malhotra',
        phone: '09090909090',
        email: 'dhruv.m@gmail.com',
        projectType: 'Luxury Villa',
        amount: 4500000,
        priorityTag: 'Client Won',
        dateText: '5 Days Ago',
        source: 'Referral',
        requirementNotes: 'Ultra luxury smart villa with swimming pool & structural planning.',
        assignedTo: { _id: 'u-bhakti', name: 'Bhakti', email: 'bhakti@nirman.com', department: 'Architecture' },
        status: 'WON',
        lostReason: null,
        nextFollowUpDate: fiveDaysAgo.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: fiveDaysAgo.toISOString(),
        updatedAt: fiveDaysAgo.toISOString()
      },
      {
        _id: 'lead-10',
        name: 'Pooja Ghosh',
        phone: '09121212121',
        email: 'pooja.g@gmail.com',
        projectType: 'Commercial Project',
        amount: 3000000,
        priorityTag: 'Client Won',
        dateText: '1 Week Ago',
        source: 'SocialMedia',
        requirementNotes: 'Boutique hotel exterior architecture & elevation designs.',
        assignedTo: { _id: 'u-rohit', name: 'Rohit', email: 'rohit@nirman.com', department: 'Engineering' },
        status: 'WON',
        lostReason: null,
        nextFollowUpDate: oneWeekAgo.toISOString(),
        createdBy: { _id: 'u6', name: 'Nirman Admin' },
        createdAt: oneWeekAgo.toISOString(),
        updatedAt: oneWeekAgo.toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('nirman_lead_interactions')) {
    localStorage.setItem('nirman_lead_interactions', JSON.stringify([
      {
        _id: 'inter-1',
        leadId: 'lead-101',
        type: 'Call',
        notes: 'Initial phone consultation with client regarding site dimensions.',
        loggedBy: { _id: 'u1', name: 'Sarah Connor', email: 'architect@nirman.com' },
        loggedAt: new Date().toISOString()
      },
      {
        _id: 'inter-2',
        leadId: 'lead-102',
        type: 'Meeting',
        notes: 'In-office meeting discussing commercial complex timeline and budget.',
        loggedBy: { _id: 'u4', name: 'Charlie Brown', email: 'pm@nirman.com' },
        loggedAt: new Date().toISOString()
      }
    ]));
  }

  if (!localStorage.getItem('nirman_lead_status_history')) {
    localStorage.setItem('nirman_lead_status_history', JSON.stringify([
      {
        _id: 'sh-1',
        leadId: 'lead-101',
        fromStatus: null,
        toStatus: 'NEW',
        changedBy: { _id: 'u6', name: 'Nirman Admin' },
        changedAt: new Date().toISOString()
      },
      {
        _id: 'sh-2',
        leadId: 'lead-102',
        fromStatus: 'NEW',
        toStatus: 'CONTACTED',
        changedBy: { _id: 'u4', name: 'Charlie Brown' },
        changedAt: new Date().toISOString()
      }
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

  const requests = allRequests.filter(r =>
    r.userId === user.id ||
    (user.email && r.userEmail && r.userEmail.toLowerCase() === user.email.toLowerCase()) ||
    (user.name && r.employeeName && r.employeeName.toLowerCase() === user.name.toLowerCase()) ||
    allRequests.length === 1
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
      }).catch(() => { });
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
      }).catch(() => { });
    }
  } catch (e) { }
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


// --- APP USAGE TRACKING MOCKS ---

export const mockSyncAppUsage = async (payload) => {
  await delay();
  const { userId, appUsage, isOfflineSync } = payload || {};
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

  const summaries = JSON.parse(localStorage.getItem('nirman_app_usage_summaries') || '[]');
  let userSummary = summaries.find(s => s.userId === userId && s.date === todayStr);

  if (!userSummary) {
    userSummary = {
      userId,
      date: todayStr,
      appTotals: [],
      idleSeconds: 0,
      totalTrackedSeconds: 0
    };
    summaries.push(userSummary);
  }

  let batchTotalTracked = 0;
  let batchIdle = 0;

  if (Array.isArray(appUsage)) {
    for (const item of appUsage) {
      const appName = item.appName || 'Unknown';
      const secondsActive = Number(item.secondsActive) || 0;
      if (secondsActive <= 0) continue;

      batchTotalTracked += secondsActive;
      if (appName.toUpperCase() === 'IDLE') {
        batchIdle += secondsActive;
      }

      const existingApp = userSummary.appTotals.find(a => a.appName.toLowerCase() === appName.toLowerCase());
      if (existingApp) {
        existingApp.totalSeconds += secondsActive;
      } else {
        userSummary.appTotals.push({ appName, totalSeconds: secondsActive });
      }
    }
  }

  userSummary.idleSeconds += batchIdle;
  userSummary.totalTrackedSeconds += batchTotalTracked;

  localStorage.setItem('nirman_app_usage_summaries', JSON.stringify(summaries));

  return {
    success: true,
    message: 'App usage batch synced successfully.',
    logId: 'log_' + Date.now(),
    date: userSummary.date,
    totalTrackedSeconds: userSummary.totalTrackedSeconds
  };
};

export const mockGetAppUsageConfig = async () => {
  await delay();
  const config = JSON.parse(localStorage.getItem('nirman_app_usage_config') || '{}');
  return {
    success: true,
    message: 'App usage config retrieved successfully.',
    data: config
  };
};

export const mockUpdateAppUsageConfig = async (configData) => {
  await delay();
  let config = JSON.parse(localStorage.getItem('nirman_app_usage_config') || '{}');
  config = {
    ...config,
    ...configData,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('nirman_app_usage_config', JSON.stringify(config));
  return {
    success: true,
    message: 'App usage config updated successfully.',
    data: config
  };
};

export const mockGetEmployeeAppUsage = async (userId, params = {}) => {
  await delay();
  const users = JSON.parse(localStorage.getItem('nirman_users') || '[]');
  const foundUser = users.find(u => u.id === userId || u._id === userId) || {
    _id: userId,
    name: 'Selected Employee',
    email: 'employee@nirman.com',
    department: 'Architecture',
    designation: 'Architect'
  };

  const { date, fromDate, toDate } = params;
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const summaries = JSON.parse(localStorage.getItem('nirman_app_usage_summaries') || '[]');

  let filtered = summaries.filter(s => s.userId === userId || s.userId === 'u1' || s.userId === '6a644911115fbe433cfe4546');

  if (date) {
    filtered = filtered.filter(s => s.date === date);
  } else if (fromDate || toDate) {
    if (fromDate) filtered = filtered.filter(s => s.date >= fromDate);
    if (toDate) filtered = filtered.filter(s => s.date <= toDate);
  }

  if (filtered.length === 0) {
    filtered = [{
      userId: foundUser._id || userId,
      date: date || todayStr,
      idleSeconds: 1800,
      totalTrackedSeconds: 28800,
      appTotals: [
        { appName: 'AutoCAD', totalSeconds: 14400 },
        { appName: 'Autodesk Revit', totalSeconds: 7200 },
        { appName: 'Google Chrome', totalSeconds: 5400 },
        { appName: 'IDLE', totalSeconds: 1800 }
      ]
    }];
  }

  const grandTotals = {};
  let totalTrackedSeconds = 0;
  let totalIdleSeconds = 0;

  for (const s of filtered) {
    totalTrackedSeconds += s.totalTrackedSeconds || 0;
    totalIdleSeconds += s.idleSeconds || 0;
    for (const app of (s.appTotals || [])) {
      grandTotals[app.appName] = (grandTotals[app.appName] || 0) + app.totalSeconds;
    }
  }

  const appBreakdown = Object.entries(grandTotals).map(([appName, totalSeconds]) => ({
    appName,
    totalSeconds,
    hoursFormatted: `${Math.floor(totalSeconds / 3600)}h ${Math.floor((totalSeconds % 3600) / 60)}m ${totalSeconds % 60}s`
  })).sort((a, b) => b.totalSeconds - a.totalSeconds);

  return {
    success: true,
    message: 'Employee app usage breakdown retrieved.',
    user: foundUser,
    queryDate: date || { fromDate, toDate },
    totalTrackedSeconds,
    totalIdleSeconds,
    totalTrackedFormatted: `${Math.floor(totalTrackedSeconds / 3600)}h ${Math.floor((totalTrackedSeconds % 3600) / 60)}m`,
    appBreakdown,
    dailySummaries: filtered
  };
};

export const mockExportEmployeeAppUsage = async (userId, params = {}) => {
  await delay();
  const res = await mockGetEmployeeAppUsage(userId, params);
  const user = res.user;
  const summaries = res.dailySummaries;

  if (params.format === 'csv') {
    let csv = 'Date,Employee Name,Employee Email,Application Name,Active Seconds,Formatted Duration\n';
    for (const s of summaries) {
      for (const app of (s.appTotals || [])) {
        const hrs = `${Math.floor(app.totalSeconds / 3600)}h ${Math.floor((app.totalSeconds % 3600) / 60)}m`;
        csv += `"${s.date}","${user.name}","${user.email}","${app.appName}",${app.totalSeconds},"${hrs}"\n`;
      }
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    return blob;
  }

  return {
    success: true,
    message: 'Export data retrieved.',
    user,
    summaries
  };
};


// --- CRM MODULE 1: LEAD MANAGEMENT MOCKS ---

export const mockCreateLead = async (payload) => {
  await delay();
  const leads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');
  const users = JSON.parse(localStorage.getItem('nirman_users') || '[]');
  const currentUser = getSessionUser() || { id: 'u6', name: 'Nirman Admin' };

  const { name, phone, email, source, requirementNotes, assignedTo, nextFollowUpDate, status, projectType, amount, priorityTag } = payload || {};

  if (!name || !phone || !source) {
    return { success: false, message: 'Name, phone, and source are required fields.' };
  }

  const assignedUserObj = (assignedTo && typeof assignedTo === 'object')
    ? assignedTo
    : users.find(u => u.id === assignedTo || u._id === assignedTo) || {
      _id: assignedTo || currentUser.id,
      name: typeof assignedTo === 'string' && assignedTo ? assignedTo : (currentUser.name || 'Admin'),
      email: 'user@nirman.com'
    };

  const existingActive = leads.find(l => l.phone === phone.trim() && l.status !== 'WON' && l.status !== 'LOST');

  const initialStatus = status || 'NEW';

  const newLead = {
    _id: 'lead-' + Date.now(),
    name: name.trim(),
    phone: phone.trim(),
    email: email ? email.trim() : null,
    source,
    projectType: projectType || 'Residential Project',
    amount: amount ? Number(amount) : 1500000,
    priorityTag: priorityTag || (initialStatus === 'NEW' ? 'Hot Lead' : initialStatus === 'QUALIFIED' ? 'High Priority' : initialStatus === 'PROPOSAL_SENT' ? 'Proposal Sent' : initialStatus === 'WON' ? 'Client Won' : 'Interested'),
    dateText: 'Today',
    requirementNotes: requirementNotes || '',
    assignedTo: assignedUserObj,
    status: initialStatus,
    lostReason: null,
    nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : new Date().toISOString(),
    convertedToClientId: null,
    createdBy: { _id: currentUser.id, name: currentUser.name || 'Admin' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  leads.unshift(newLead);
  localStorage.setItem('nirman_leads', JSON.stringify(leads));

  // Initial status history entry
  const statusHistory = JSON.parse(localStorage.getItem('nirman_lead_status_history') || '[]');
  statusHistory.push({
    _id: 'sh-' + Date.now(),
    leadId: newLead._id,
    fromStatus: null,
    toStatus: initialStatus,
    changedBy: { _id: currentUser.id, name: currentUser.name || 'Admin' },
    changedAt: new Date().toISOString()
  });
  localStorage.setItem('nirman_lead_status_history', JSON.stringify(statusHistory));

  let duplicateWarning = false;
  let duplicateLeadInfo = null;
  if (existingActive) {
    duplicateWarning = true;
    duplicateLeadInfo = {
      id: existingActive._id,
      name: existingActive.name,
      status: existingActive.status,
      assignedTo: existingActive.assignedTo
    };
  }

  return {
    success: true,
    message: 'Lead created successfully.',
    lead: newLead,
    duplicateWarning,
    ...(duplicateWarning && { duplicateLeadInfo })
  };
};

export const mockGetLeads = async (params = {}) => {
  await delay();
  const leads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');
  const { status, assignedTo, search, page = 1, limit = 10, pipelineView } = params;

  let filtered = [...leads];

  if (status) {
    filtered = filtered.filter(l => l.status === status);
  }

  if (assignedTo) {
    filtered = filtered.filter(l => (l.assignedTo?._id || l.assignedTo?.id || l.assignedTo) === assignedTo);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(l =>
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q))
    );
  }

  if (pipelineView === 'true' || pipelineView === true) {
    const pipeline = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      PROPOSAL_SENT: [],
      NEGOTIATION: [],
      closedLeads: []
    };

    filtered.forEach(lead => {
      if (pipeline[lead.status]) {
        pipeline[lead.status].push(lead);
      } else {
        pipeline.closedLeads.push(lead);
      }
    });

    return {
      success: true,
      message: 'Lead pipeline retrieved successfully.',
      pipeline
    };
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(skip, skip + limitNum);

  return {
    success: true,
    message: 'Leads retrieved successfully.',
    leads: paginated,
    pagination: {
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(filtered.length / limitNum) || 1
    }
  };
};

export const mockGetDueFollowUps = async (params = {}) => {
  await delay();
  const leads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');
  const { date } = params;

  let targetDate = new Date();
  if (date) targetDate = new Date(date);
  targetDate.setHours(23, 59, 59, 999);

  const dueLeads = leads.filter(l => {
    if (l.status === 'WON' || l.status === 'LOST') return false;
    if (!l.nextFollowUpDate) return false;
    return new Date(l.nextFollowUpDate) <= targetDate;
  });

  return {
    success: true,
    message: 'Due follow-up leads retrieved successfully.',
    count: dueLeads.length,
    leads: dueLeads
  };
};

export const mockGetLeadById = async (id) => {
  await delay();
  const leads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');
  const lead = leads.find(l => l._id === id || l.id === id);

  if (!lead) {
    return { success: false, message: 'Lead not found.' };
  }

  const interactions = JSON.parse(localStorage.getItem('nirman_lead_interactions') || '[]').filter(i => i.leadId === id);
  const lastInteraction = interactions.length > 0 ? interactions[interactions.length - 1] : null;

  const now = new Date();
  const daysSinceCreation = Math.floor((now - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));
  let daysSinceLastContact = null;
  if (lastInteraction) {
    daysSinceLastContact = Math.floor((now - new Date(lastInteraction.loggedAt)) / (1000 * 60 * 60 * 24));
  }

  return {
    success: true,
    message: 'Lead details retrieved successfully.',
    lead,
    metrics: {
      interactionCount: interactions.length,
      lastInteractionDate: lastInteraction ? lastInteraction.loggedAt : null,
      daysSinceLastContact,
      daysSinceCreation
    }
  };
};

export const mockUpdateLead = async (id, payload) => {
  await delay();
  const leads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');
  const leadIndex = leads.findIndex(l => l._id === id || l.id === id);

  if (leadIndex === -1) {
    return { success: false, message: 'Lead not found.' };
  }

  const lead = leads[leadIndex];
  const { name, phone, email, requirementNotes, assignedTo, nextFollowUpDate, source } = payload || {};

  if (name) lead.name = name.trim();
  if (phone) lead.phone = phone.trim();
  if (email !== undefined) lead.email = email ? email.trim() : null;
  if (requirementNotes !== undefined) lead.requirementNotes = requirementNotes;
  if (source) lead.source = source;
  if (nextFollowUpDate !== undefined) {
    lead.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null;
  }

  if (assignedTo && typeof assignedTo === 'object') {
    lead.assignedTo = assignedTo;
  }

  lead.updatedAt = new Date().toISOString();
  leads[leadIndex] = lead;
  localStorage.setItem('nirman_leads', JSON.stringify(leads));

  return {
    success: true,
    message: 'Lead updated successfully.',
    lead
  };
};

export const mockUpdateLeadStatus = async (id, payload) => {
  await delay();
  const leads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');
  const currentUser = getSessionUser() || { id: 'u6', name: 'Nirman Admin' };
  const leadIndex = leads.findIndex(l => l._id === id || l.id === id);

  if (leadIndex === -1) {
    return { success: false, message: 'Lead not found.' };
  }

  const lead = leads[leadIndex];
  const { newStatus, lostReason } = payload || {};
  const validStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST'];

  if (!newStatus || !validStatuses.includes(newStatus)) {
    return { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` };
  }

  if (newStatus === 'LOST') {
    if (!lostReason || !lostReason.trim()) {
      return { success: false, message: 'A lostReason is mandatory when marking a lead as LOST.' };
    }
    lead.lostReason = lostReason.trim();
  } else {
    lead.lostReason = null;
  }

  const fromStatus = lead.status;
  lead.status = newStatus;
  lead.updatedAt = new Date().toISOString();
  leads[leadIndex] = lead;
  localStorage.setItem('nirman_leads', JSON.stringify(leads));

  const statusHistory = JSON.parse(localStorage.getItem('nirman_lead_status_history') || '[]');
  const historyDoc = {
    _id: 'sh-' + Date.now(),
    leadId: lead._id,
    fromStatus,
    toStatus: newStatus,
    changedBy: { _id: currentUser.id, name: currentUser.name || 'Admin' },
    changedAt: new Date().toISOString()
  };
  statusHistory.push(historyDoc);
  localStorage.setItem('nirman_lead_status_history', JSON.stringify(statusHistory));

  return {
    success: true,
    message: `Lead status updated from ${fromStatus} to ${newStatus}.`,
    lead,
    statusHistory: historyDoc
  };
};

export const mockLogInteraction = async (id, payload) => {
  await delay();
  const leads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');
  const currentUser = getSessionUser() || { id: 'u6', name: 'Nirman Admin' };
  const lead = leads.find(l => l._id === id || l.id === id);

  if (!lead) {
    return { success: false, message: 'Lead not found.' };
  }

  const { type, notes } = payload || {};
  const validTypes = ['Call', 'Meeting', 'Email', 'Note'];

  if (!type || !validTypes.includes(type)) {
    return { success: false, message: `Invalid interaction type. Must be one of: ${validTypes.join(', ')}` };
  }

  if (!notes || !notes.trim()) {
    return { success: false, message: 'Interaction notes are required.' };
  }

  const interactions = JSON.parse(localStorage.getItem('nirman_lead_interactions') || '[]');
  const newInteraction = {
    _id: 'inter-' + Date.now(),
    leadId: id,
    type,
    notes: notes.trim(),
    loggedBy: { _id: currentUser.id, name: currentUser.name || 'Admin', designation: currentUser.designation || 'Staff' },
    loggedAt: new Date().toISOString()
  };

  interactions.unshift(newInteraction);
  localStorage.setItem('nirman_lead_interactions', JSON.stringify(interactions));

  return {
    success: true,
    message: 'Lead interaction logged successfully.',
    interaction: newInteraction
  };
};

export const mockGetLeadInteractions = async (id) => {
  await delay();
  const interactions = JSON.parse(localStorage.getItem('nirman_lead_interactions') || '[]').filter(i => i.leadId === id);
  return {
    success: true,
    message: 'Lead interactions retrieved successfully.',
    interactions
  };
};

export const mockGetLeadStatusHistory = async (id) => {
  await delay();
  const history = JSON.parse(localStorage.getItem('nirman_lead_status_history') || '[]').filter(h => h.leadId === id);
  return {
    success: true,
    message: 'Lead status history retrieved successfully.',
    history
  };
};

export const mockConvertToClientStub = async (id) => {
  await delay();
  const leads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');
  const currentUser = getSessionUser() || { id: 'u6', name: 'Nirman Admin' };
  const leadIndex = leads.findIndex(l => l._id === id || l.id === id);

  if (leadIndex === -1) {
    return { success: false, message: 'Lead not found.' };
  }

  const lead = leads[leadIndex];
  if (lead.status === 'WON') {
    return { success: false, message: 'This lead has already been converted to WON status.' };
  }

  if (lead.status === 'LOST') {
    return { success: false, message: 'A LOST lead cannot be directly converted to a Client without reactivating it first.' };
  }

  const fromStatus = lead.status;
  lead.status = 'WON';
  lead.updatedAt = new Date().toISOString();
  leads[leadIndex] = lead;
  localStorage.setItem('nirman_leads', JSON.stringify(leads));

  const statusHistory = JSON.parse(localStorage.getItem('nirman_lead_status_history') || '[]');
  statusHistory.push({
    _id: 'sh-' + Date.now(),
    leadId: lead._id,
    fromStatus,
    toStatus: 'WON',
    changedBy: { _id: currentUser.id, name: currentUser.name || 'Admin' },
    changedAt: new Date().toISOString()
  });
  localStorage.setItem('nirman_lead_status_history', JSON.stringify(statusHistory));

  return {
    success: true,
    message: 'Lead successfully marked as WON and queued for Module 2 Client creation.',
    leadId: lead._id,
    leadStatus: 'WON',
    module2Pending: true
  };
};

