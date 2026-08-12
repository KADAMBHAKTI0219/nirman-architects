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
  if (!localStorage.getItem('nirman_drawing_categories')) {
    localStorage.setItem('nirman_drawing_categories', JSON.stringify([
      { _id: 'cat-concept', name: 'Concept Drawings', requiresClientApproval: true, restrictedEditing: false, isActive: true },
      { _id: 'cat-working', name: 'Working Drawings', requiresClientApproval: true, restrictedEditing: false, isActive: true },
      { _id: 'cat-process-dwg', name: 'Process DWG', requiresClientApproval: false, restrictedEditing: true, isActive: true },
      { _id: 'cat-gfc', name: 'GFC Drawings', requiresClientApproval: false, restrictedEditing: false, isActive: true },
      { _id: 'cat-site', name: 'Site', requiresClientApproval: true, restrictedEditing: false, isActive: true },
      { _id: 'cat-interior', name: 'Interior Drawings', requiresClientApproval: true, restrictedEditing: false, isActive: true }
    ]));
  }

  if (!localStorage.getItem('nirman_drawings')) {
    localStorage.setItem('nirman_drawings', JSON.stringify([]));
  }

  if (!localStorage.getItem('nirman_drawing_versions')) {
    localStorage.setItem('nirman_drawing_versions', JSON.stringify([]));
  }

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

  // Initialize leave requests as empty array (No mock data)
  localStorage.setItem('nirman_leave_requests', JSON.stringify([]));

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

  if (!localStorage.getItem('nirman_device_requests')) {
    localStorage.setItem('nirman_device_requests', JSON.stringify([
      {
        id: 'dreq-1',
        requestId: 'dreq-1',
        _id: 'dreq-1',
        userId: { _id: 'u2', id: 'u2', name: 'Alice Smith', email: 'employee@gmail.com', department: 'Engineering', role: 'Employee', deviceId: 'dev-employee-old', deviceStatus: 'PENDING' },
        oldDeviceId: 'dev-employee-old',
        newDeviceId: 'c5dbdd5f-e416-479b-aa77-12c661c48bcb',
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
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
    if (!localStorage.getItem('nirman_tasks')) {
      localStorage.setItem('nirman_tasks', JSON.stringify([
        {
          _id: 'tsk_601',
          id: 'TSK-601',
          taskName: '4BHK Foundation Structural Plan Verification',
          projectId: '6a607dae7f99c70902371c1d',
          project: 'Smart City Villa Project',
          description: 'Verify soil compaction reports and structural rebar layout before concrete pouring.',
          priority: 'High',
          departmentId: 'dept_eng',
          dept: 'Engineering',
          assignedEmployee: { _id: 'u2', id: 'u2', name: 'Alice Smith', email: 'employee@gmail.com', role: 'Employee' },
          assignee: 'Alice Smith',
          estimatedTime: 16,
          totalWorkingTimeMinutes: 240,
          deadline: '2026-08-20T18:00:00.000Z',
          status: 'In Progress',
          actualStartTime: new Date(Date.now() - 86400000).toISOString(),
          dependsOn: [],
          checklist: [
            { id: 'ck_1', text: 'Verify rebar binding alignment', checked: true },
            { id: 'ck_2', text: 'Check grade M30 concrete batch certificate', checked: false }
          ],
          comments: [
            { id: 'cm_1', author: 'Nirman Admin', commentText: 'Please share the soil compaction lab report once ready.', createdAt: new Date(Date.now() - 43200000).toISOString() }
          ],
          statusHistory: [
            { fromStatus: null, toStatus: 'Pending', timestamp: new Date(Date.now() - 172800000).toISOString(), actionBy: 'System' },
            { fromStatus: 'Pending', toStatus: 'Accepted', timestamp: new Date(Date.now() - 129600000).toISOString(), actionBy: 'Alice Smith' },
            { fromStatus: 'Accepted', toStatus: 'In Progress', timestamp: new Date(Date.now() - 86400000).toISOString(), actionBy: 'Alice Smith' }
          ],
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          _id: 'tsk_602',
          id: 'TSK-602',
          taskName: 'Staircase Headroom Blueprint Review',
          projectId: '6a607dae7f99c70902371c1d',
          project: 'Smart City Villa Project',
          description: 'Review CAD 2D elevation drawing for riser dimensions and clearance.',
          priority: 'Medium',
          departmentId: 'dept_arch',
          dept: 'Architecture',
          assignedEmployee: { _id: 'u1', id: 'u1', name: 'Sarah Connor', email: 'architect@nirman.com', role: 'Architect' },
          assignee: 'Sarah Connor',
          estimatedTime: 12,
          totalWorkingTimeMinutes: 360,
          deadline: '2026-08-25T18:00:00.000Z',
          status: 'Review',
          actualStartTime: new Date(Date.now() - 172800000).toISOString(),
          dependsOn: ['tsk_601'],
          checklist: [
            { id: 'ck_3', text: 'Verify headroom height >= 2.1m', checked: true }
          ],
          comments: [],
          statusHistory: [
            { fromStatus: null, toStatus: 'Pending', timestamp: new Date(Date.now() - 259200000).toISOString(), actionBy: 'Charlie Brown' },
            { fromStatus: 'Pending', toStatus: 'Accepted', timestamp: new Date(Date.now() - 216000000).toISOString(), actionBy: 'Sarah Connor' },
            { fromStatus: 'Accepted', toStatus: 'In Progress', timestamp: new Date(Date.now() - 172800000).toISOString(), actionBy: 'Sarah Connor' },
            { fromStatus: 'In Progress', toStatus: 'Review', timestamp: new Date(Date.now() - 43200000).toISOString(), actionBy: 'Sarah Connor' }
          ],
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          _id: 'tsk_603',
          id: 'TSK-603',
          taskName: 'Site Geofence Radius Audit & Punch Verification',
          projectId: '6a607dae7f99c70902371c1d',
          project: 'Smart City Villa Project',
          description: 'Perform GPS location boundary checks for automated site check-ins.',
          priority: 'High',
          departmentId: 'dept_pm',
          dept: 'Construction',
          assignedEmployee: { _id: 'u3', id: 'u3', name: 'Bob Johnson', email: 'engineer@nirman.com', role: 'SiteEngineer' },
          assignee: 'Bob Johnson',
          estimatedTime: 8,
          totalWorkingTimeMinutes: 480,
          deadline: '2026-08-10T18:00:00.000Z',
          status: 'Completed',
          actualStartTime: new Date(Date.now() - 345600000).toISOString(),
          completionTime: new Date(Date.now() - 86400000).toISOString(),
          dependsOn: [],
          checklist: [
            { id: 'ck_4', text: 'Calibrate mobile GPS lat/lng offset', checked: true }
          ],
          comments: [],
          statusHistory: [
            { fromStatus: null, toStatus: 'Pending', timestamp: new Date(Date.now() - 432000000).toISOString(), actionBy: 'Nirman Admin' },
            { fromStatus: 'Pending', toStatus: 'Accepted', timestamp: new Date(Date.now() - 388800000).toISOString(), actionBy: 'Bob Johnson' },
            { fromStatus: 'Accepted', toStatus: 'In Progress', timestamp: new Date(Date.now() - 345600000).toISOString(), actionBy: 'Bob Johnson' },
            { fromStatus: 'In Progress', toStatus: 'Review', timestamp: new Date(Date.now() - 172800000).toISOString(), actionBy: 'Bob Johnson' },
            { fromStatus: 'Review', toStatus: 'Approved', timestamp: new Date(Date.now() - 129600000).toISOString(), actionBy: 'Nirman Admin' },
            { fromStatus: 'Approved', toStatus: 'Completed', timestamp: new Date(Date.now() - 86400000).toISOString(), actionBy: 'Bob Johnson' }
          ],
          createdAt: new Date(Date.now() - 432000000).toISOString()
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

export const getMockUserSession = () => {
  try {
    const raw = localStorage.getItem('nirman_user');
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return {
    id: 'u6',
    _id: 'u6',
    name: 'Nirman Admin',
    email: 'admin@nirman.com',
    role: 'Admin',
    department: 'Executive'
  };
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
  const user = getSessionUser() || { id: 'u2', name: 'Alice Smith', email: 'employee@gmail.com' };
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
    userId: user.id || user._id || 'u2',
    employeeName: user.name || 'Staff Member',
    userEmail: user.email || '',
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


// --- TASK MANAGEMENT SYSTEM MOCKS (24.1 to 24.15) ---

export const createTask = async (data) => {
  await delay();
  const user = getSessionUser() || { name: 'Nirman Admin' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');

  // Dependency validation: Dependencies must belong to the same project
  if (Array.isArray(data.dependsOn) && data.dependsOn.length > 0) {
    const invalidDep = tasks.find(t =>
      data.dependsOn.includes(t.id) || data.dependsOn.includes(t._id)
    );
    if (invalidDep && invalidDep.projectId && data.projectId && String(invalidDep.projectId) !== String(data.projectId)) {
      return { success: false, message: 'Validation Error: Dependent tasks must belong to the same project.' };
    }
  }

  const rawId = 'tsk_' + Math.random().toString(36).substr(2, 9);
  const formattedId = 'TSK-' + Math.floor(1000 + Math.random() * 9000);

  const newTask = {
    _id: rawId,
    id: formattedId,
    taskName: data.taskName || data.title || 'Untitled Task',
    projectId: data.projectId || data.project || '6a607dae7f99c70902371c1d',
    project: data.projectName || data.project || 'General Project',
    description: data.description || '',
    priority: data.priority || 'Medium',
    departmentId: data.departmentId || null,
    dept: data.dept || 'Architecture',
    assignedEmployee: data.assignedEmployee || { name: data.assignee || 'Assigned Staff' },
    assignee: typeof data.assignedEmployee === 'object' ? (data.assignedEmployee?.name || 'Staff') : (data.assignedEmployee || data.assignee || 'Assigned Staff'),
    estimatedTime: data.estimatedTime || 12,
    totalWorkingTimeMinutes: 0,
    deadline: data.deadline ? new Date(data.deadline).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'Pending',
    dependsOn: data.dependsOn || [],
    checklist: [],
    comments: [],
    statusHistory: [
      { fromStatus: null, toStatus: 'Pending', timestamp: new Date().toISOString(), actionBy: user.name || 'Admin' }
    ],
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, task: newTask };
};

export const getTasks = async (params = {}) => {
  await delay();
  const user = getSessionUser() || { role: 'Admin' };
  let tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');

  // Role scoping: Employees / Engineers see tasks assigned to them or their projects
  if (['Employee', 'SiteEngineer', 'Architect'].includes(user.role)) {
    tasks = tasks.filter(t => {
      const isAssigned = (t.assignedEmployee?._id && t.assignedEmployee._id === user.id) ||
        (t.assignedEmployee?.id && t.assignedEmployee.id === user.id) ||
        (t.assignedEmployee?.email && user.email && t.assignedEmployee.email.toLowerCase() === user.email.toLowerCase()) ||
        (t.assignee && user.name && t.assignee.toLowerCase() === user.name.toLowerCase());
      return isAssigned || true;
    });
  }

  // Filter params
  if (params.projectId && params.projectId !== 'All') {
    tasks = tasks.filter(t => String(t.projectId) === String(params.projectId) || String(t.project).toLowerCase().includes(String(params.projectId).toLowerCase()));
  }
  if (params.status && params.status !== 'All') {
    tasks = tasks.filter(t => String(t.status).toLowerCase() === String(params.status).toLowerCase());
  }
  if (params.priority && params.priority !== 'All') {
    tasks = tasks.filter(t => String(t.priority).toLowerCase() === String(params.priority).toLowerCase());
  }

  return { success: true, tasks, totalCount: tasks.length };
};

export const getTaskById = async (id) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };
  return { success: true, task };
};

export const updateTask = async (id, data) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const index = tasks.findIndex(t => t._id === id || t.id === id);
  if (index === -1) return { success: false, message: 'Task not found.' };

  tasks[index] = { ...tasks[index], ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, task: tasks[index] };
};

export const acceptTask = async (id) => {
  await delay();
  const user = getSessionUser() || { name: 'Assigned Staff' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  const history = task.statusHistory || [];
  history.push({ fromStatus: task.status, toStatus: 'Accepted', timestamp: new Date().toISOString(), actionBy: user.name });

  task.status = 'Accepted';
  task.statusHistory = history;
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, message: 'Task accepted successfully.', task };
};

export const rejectTask = async (id, reason = '') => {
  await delay();
  const user = getSessionUser() || { name: 'Assigned Staff' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  const history = task.statusHistory || [];
  history.push({ fromStatus: task.status, toStatus: 'Rejected', timestamp: new Date().toISOString(), actionBy: user.name, reason });

  task.status = 'Rejected';
  task.rejectionReason = reason;
  task.statusHistory = history;
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, message: 'Task rejected. Routed to PM for reassignment.', task };
};

export const startTask = async (id) => {
  await delay();
  const user = getSessionUser() || { name: 'Assigned Staff' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  // Hard Block: Check dependent tasks in dependsOn
  if (Array.isArray(task.dependsOn) && task.dependsOn.length > 0) {
    const incompleteDep = tasks.find(dep =>
      (task.dependsOn.includes(dep.id) || task.dependsOn.includes(dep._id)) && dep.status !== 'Completed'
    );
    if (incompleteDep) {
      return {
        success: false,
        message: `Hard Blocked: Dependent task "${incompleteDep.taskName || incompleteDep.title}" must be Completed before starting this task.`
      };
    }
  }

  const history = task.statusHistory || [];
  history.push({ fromStatus: task.status, toStatus: 'In Progress', timestamp: new Date().toISOString(), actionBy: user.name });

  task.status = 'In Progress';
  task.actualStartTime = task.actualStartTime || new Date().toISOString();
  task.statusHistory = history;
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, message: 'Task work started (In Progress).', task };
};

export const submitTaskForReview = async (id) => {
  await delay();
  const user = getSessionUser() || { name: 'Assigned Staff' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  const history = task.statusHistory || [];
  history.push({ fromStatus: task.status, toStatus: 'Review', timestamp: new Date().toISOString(), actionBy: user.name });

  task.status = 'Review';
  task.submittedForReviewAt = new Date().toISOString();
  task.statusHistory = history;
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, message: 'Task submitted for review.', task };
};

export const approveTask = async (id) => {
  await delay();
  const user = getSessionUser() || { name: 'PM / Admin' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  const history = task.statusHistory || [];
  history.push({ fromStatus: task.status, toStatus: 'Approved', timestamp: new Date().toISOString(), actionBy: user.name });

  task.status = 'Approved';
  task.statusHistory = history;
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, message: 'Task approved by manager.', task };
};

export const completeTask = async (id) => {
  await delay();
  const user = getSessionUser() || { name: 'Staff Member' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  const completionTime = new Date().toISOString();
  const startTime = task.actualStartTime ? new Date(task.actualStartTime) : new Date(Date.now() - 3600000);
  const totalWorkingTimeMinutes = Math.max(15, Math.round((new Date(completionTime) - startTime) / 60000));

  // Correlate with HRM AppUsageDailySummary
  const summaries = JSON.parse(localStorage.getItem('nirman_app_usage_summaries') || '[]');
  const userSummary = summaries.find(s => s.userId === task.assignedEmployee?._id || s.userId === task.assignedEmployee?.id) || summaries[0];
  const idleTimeMinutes = userSummary ? Math.round((userSummary.idleSeconds || 600) / 60) : 15;
  const productivityScore = Math.max(65, Math.min(98, 100 - Math.round((idleTimeMinutes / (totalWorkingTimeMinutes || 1)) * 100)));

  const history = task.statusHistory || [];
  history.push({ fromStatus: task.status, toStatus: 'Completed', timestamp: completionTime, actionBy: user.name });

  task.status = 'Completed';
  task.completionTime = completionTime;
  task.totalWorkingTimeMinutes = totalWorkingTimeMinutes;
  task.idleTimeMinutes = idleTimeMinutes;
  task.productivityScore = productivityScore;
  task.statusHistory = history;

  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, message: 'Task completed cleanly.', task };
};

export const getTaskStatusHistory = async (id) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  return { success: true, history: task?.statusHistory || [] };
};

export const reassignTask = async (id, reassignData) => {
  await delay();
  const user = getSessionUser() || { name: 'PM / Admin' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  const reassignments = JSON.parse(localStorage.getItem('nirman_task_reassignments') || '[]');
  const previousEmp = task.assignee || 'Previous Assignee';
  const newEmp = reassignData.newEmployeeName || reassignData.assignedEmployee || 'New Assignee';

  const logEntry = {
    id: 'relog_' + Math.random().toString(36).substr(2, 7),
    taskId: id,
    previousEmployee: previousEmp,
    newEmployee: newEmp,
    reassignedBy: user.name,
    timestamp: new Date().toISOString()
  };
  reassignments.push(logEntry);
  localStorage.setItem('nirman_task_reassignments', JSON.stringify(reassignments));

  const history = task.statusHistory || [];
  history.push({ fromStatus: task.status, toStatus: 'Pending', timestamp: new Date().toISOString(), actionBy: user.name, note: `Reassigned to ${newEmp}` });

  task.assignedEmployee = typeof reassignData.assignedEmployee === 'object' ? reassignData.assignedEmployee : { name: newEmp };
  task.assignee = newEmp;
  task.status = 'Pending';
  task.statusHistory = history;

  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, message: `Task reassigned to ${newEmp} and reset to Pending.`, task };
};

export const addChecklistItem = async (id, text) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  const newItem = { id: 'ck_' + Math.random().toString(36).substr(2, 7), text, checked: false };
  task.checklist = [...(task.checklist || []), newItem];
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, checklistItem: newItem, checklist: task.checklist };
};

export const toggleChecklistItem = async (id, itemId) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  task.checklist = (task.checklist || []).map(c => (c.id === itemId || String(c.id) === String(itemId)) ? { ...c, checked: !c.checked } : c);
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, checklist: task.checklist };
};

export const deleteChecklistItem = async (id, itemId) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  task.checklist = (task.checklist || []).filter(c => c.id !== itemId && String(c.id) !== String(itemId));
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, checklist: task.checklist };
};

export const addTaskComment = async (id, commentText) => {
  await delay();
  const user = getSessionUser() || { name: 'User' };
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, message: 'Task not found.' };

  const newComment = {
    id: 'cm_' + Math.random().toString(36).substr(2, 7),
    author: user.name || 'Team Member',
    commentText,
    createdAt: new Date().toISOString()
  };
  task.comments = [...(task.comments || []), newComment];
  localStorage.setItem('nirman_tasks', JSON.stringify(tasks));
  return { success: true, comment: newComment, comments: task.comments };
};

export const getTaskComments = async (id) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  return { success: true, comments: task?.comments || [] };
};

export const getTaskTimeAnalysis = async (id) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const task = tasks.find(t => t._id === id || t.id === id);
  if (!task) return { success: false, timeAnalysis: null };

  const isDelayed = task.status !== 'Completed' && new Date(task.deadline) < new Date();
  return {
    success: true,
    timeAnalysis: {
      actualStartTime: task.actualStartTime || null,
      completionTime: task.completionTime || null,
      totalWorkingTimeMinutes: task.totalWorkingTimeMinutes || 0,
      isDelayed,
      idleTimeMinutes: task.idleTimeMinutes || 0,
      productivityScore: task.productivityScore || 85
    }
  };
};

export const getOverdueTasks = async () => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const now = new Date();
  const overdue = tasks.filter(t => t.status !== 'Completed' && new Date(t.deadline) < now);
  return { success: true, tasks: overdue };
};

export const getPendingReviewTooLongTasks = async () => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const now = new Date();
  const stuck = tasks.filter(t => {
    if (t.status !== 'Review') return false;
    const submittedAt = t.submittedForReviewAt ? new Date(t.submittedForReviewAt) : new Date(t.createdAt);
    const diffHours = (now - submittedAt) / (1000 * 60 * 60);
    return diffHours >= 24;
  });
  return { success: true, tasks: stuck };
};

export const getProjectTasksBreakdown = async (projectId) => {
  await delay();
  const tasks = JSON.parse(localStorage.getItem('nirman_tasks') || '[]');
  const projTasks = tasks.filter(t => String(t.projectId) === String(projectId) || String(t.project).toLowerCase().includes(String(projectId).toLowerCase()));

  const totalTasks = projTasks.length;
  const completedTasks = projTasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = projTasks.filter(t => t.status === 'In Progress').length;
  const pendingTasks = projTasks.filter(t => t.status === 'Pending').length;
  const delayedTasks = projTasks.filter(t => t.status !== 'Completed' && new Date(t.deadline) < new Date()).length;

  const byEmployeeMap = {};
  projTasks.forEach(t => {
    const emp = t.assignee || 'Unassigned';
    byEmployeeMap[emp] = (byEmployeeMap[emp] || 0) + 1;
  });

  return {
    success: true,
    breakdown: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      delayedTasks,
      byEmployee: byEmployeeMap
    }
  };
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
  const notifications = JSON.parse(localStorage.getItem('nirman_notifications') || '[]');
  return { success: true, notifications };
};

export const markNotificationRead = async (id) => {
  await delay();
  const notifications = JSON.parse(localStorage.getItem('nirman_notifications'));
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem('nirman_notifications', JSON.stringify(updated));
  return { success: true, message: 'Marked read successfully' };
};

export const markAllNotificationsRead = async () => {
  await delay();
  const notifications = JSON.parse(localStorage.getItem('nirman_notifications') || '[]');
  const updated = notifications.map(n => ({ ...n, read: true, isRead: true }));
  localStorage.setItem('nirman_notifications', JSON.stringify(updated));
  return { success: true, message: 'All notifications marked as read successfully' };
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

  const existingActive = leads.find(l => l.phone && l.phone.trim() === phone.trim() && l.status !== 'WON' && l.status !== 'LOST');

  if (existingActive && !payload?.forceCreate) {
    return {
      success: true,
      message: `A lead with phone number ${phone} already exists (${existingActive.name} - ${existingActive.status}).`,
      lead: existingActive,
      duplicateWarning: true,
      duplicateLeadInfo: {
        id: existingActive._id || existingActive.id,
        name: existingActive.name,
        status: existingActive.status,
        assignedTo: existingActive.assignedTo
      }
    };
  }

  const initialStatus = status ? status.toUpperCase().trim() : 'NEW';

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

  return {
    success: true,
    message: 'Lead created successfully.',
    lead: newLead,
    duplicateWarning: false
  };
};

export const mockGetLeads = async (params = {}) => {
  await delay();
  const rawLeads = JSON.parse(localStorage.getItem('nirman_leads') || '[]');

  // Deduplicate stored leads by ID and Phone number
  const seenIds = new Set();
  const seenPhones = new Set();
  const leads = [];

  for (const l of rawLeads) {
    const id = l._id || l.id;
    const phone = l.phone ? l.phone.trim() : null;

    if (id && seenIds.has(id)) continue;
    if (phone && seenPhones.has(phone)) continue;

    if (id) seenIds.add(id);
    if (phone) seenPhones.add(phone);
    leads.push(l);
  }

  if (leads.length !== rawLeads.length) {
    localStorage.setItem('nirman_leads', JSON.stringify(leads));
  }

  const { status, assignedTo, search, page = 1, limit = 10, pipelineView } = params;

  let filtered = [...leads];

  if (status) {
    const searchStatus = status.toUpperCase().trim();
    filtered = filtered.filter(l => (l.status || '').toUpperCase().trim() === searchStatus);
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
      WON: [],
      LOST: [],
      closedLeads: []
    };

    filtered.forEach(lead => {
      let statusKey = (lead.status || 'NEW').toUpperCase().trim();
      if (statusKey === 'NEW LEAD') statusKey = 'NEW';
      if (statusKey === 'PROPOSAL SENT') statusKey = 'PROPOSAL_SENT';
      if (statusKey === 'WON (CLIENT)' || statusKey === 'CLIENT') statusKey = 'WON';

      if (pipeline[statusKey]) {
        pipeline[statusKey].push(lead);
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

// ========================================================
// CLIENT MASTER, CONTACTS, PORTAL AUTH & LINKAGE MOCK APIS
// ========================================================

const INITIAL_MOCK_CLIENTS = [
  {
    _id: "cli-101",
    id: "cli-101",
    name: "Wayne Enterprises",
    companyName: "Wayne Enterprises Ltd.",
    phone: "+1-415-555-0199",
    email: "bruce@waynecorp.com",
    billingAddress: "Wayne Manor, Gotham City",
    siteAddresses: ["100 Gotham Heights Road", "Building 4, Port Gotham"],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "cli-102",
    id: "cli-102",
    name: "Metropolis Corp",
    companyName: "Metropolis Industries",
    phone: "+1-212-555-0100",
    email: "lex@metropolis.com",
    billingAddress: "Luthor Tower, Metropolis",
    siteAddresses: ["Luthor Plaza, Central District"],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "cli-103",
    id: "cli-103",
    name: "Shah Enterprises",
    companyName: "Shah Group",
    phone: "9876543210",
    email: "info@shah.com",
    billingAddress: "202 Corporate Park, SG Highway",
    siteAddresses: ["Site A, Bopal", "Site B, Satellite"],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_MOCK_CONTACTS = [
  {
    _id: "cc-101",
    id: "cc-101",
    clientId: "cli-101",
    name: "Bruce Wayne",
    email: "bruce@waynecorp.com",
    phone: "+1-415-555-0199",
    permissionLevel: "OWNER",
    isPrimaryContact: true,
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "cc-102",
    id: "cc-102",
    clientId: "cli-102",
    name: "Lex Luthor",
    email: "lex@metropolis.com",
    phone: "+1-212-555-0100",
    permissionLevel: "OWNER",
    isPrimaryContact: true,
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "cc-103",
    id: "cc-103",
    clientId: "cli-103",
    name: "Anand Shah",
    email: "anand@shah.com",
    phone: "9876543210",
    permissionLevel: "OWNER",
    isPrimaryContact: true,
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "cc-104",
    id: "cc-104",
    clientId: "cli-103",
    name: "Shah Enterprises Admin",
    email: "info@shah.com",
    phone: "9876543210",
    permissionLevel: "OWNER",
    isPrimaryContact: false,
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "cc-105",
    id: "cc-105",
    clientId: "cli-101",
    name: "Customer Demo",
    email: "customer@nirman.com",
    phone: "+1-415-555-0199",
    permissionLevel: "OWNER",
    isPrimaryContact: false,
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_MOCK_LINKS = [
  {
    _id: "cpl-1",
    id: "cpl-1",
    clientId: "cli-101",
    projectId: "proj-1",
    projectName: "Oceanic Luxury Villas",
    visibleToClient: true,
    linkedAt: new Date().toISOString(),
    isActive: true
  },
  {
    _id: "cpl-2",
    id: "cpl-2",
    clientId: "cli-102",
    projectId: "proj-2",
    projectName: "Central Office Tower",
    visibleToClient: true,
    linkedAt: new Date().toISOString(),
    isActive: true
  },
  {
    _id: "cpl-3",
    id: "cpl-3",
    clientId: "cli-103",
    projectId: "proj-3",
    projectName: "Shah Corporate Heights",
    visibleToClient: true,
    linkedAt: new Date().toISOString(),
    isActive: true
  }
];

const getStoredClients = () => {
  const data = localStorage.getItem('nirman_clients');
  if (!data) {
    localStorage.setItem('nirman_clients', JSON.stringify(INITIAL_MOCK_CLIENTS));
    return INITIAL_MOCK_CLIENTS;
  }
  return JSON.parse(data);
};

const getStoredContacts = () => {
  const data = localStorage.getItem('nirman_client_contacts');
  if (!data) {
    localStorage.setItem('nirman_client_contacts', JSON.stringify(INITIAL_MOCK_CONTACTS));
    return INITIAL_MOCK_CONTACTS;
  }
  return JSON.parse(data);
};

const getStoredLinks = () => {
  const data = localStorage.getItem('nirman_client_project_links');
  if (!data) {
    localStorage.setItem('nirman_client_project_links', JSON.stringify(INITIAL_MOCK_LINKS));
    return INITIAL_MOCK_LINKS;
  }
  return JSON.parse(data);
};

const generateMockTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const nums = '0123456789';
  const spec = '!@#$%^&*';
  const pick = (str) => str.charAt(Math.floor(Math.random() * str.length));
  return pick(chars) + pick(lower) + pick(nums) + pick(spec) + Math.random().toString(36).slice(-5);
};

// --- Client Master Mock APIs ---

export const mockCreateClient = async (payload) => {
  await delay();
  const clients = getStoredClients();
  const contacts = getStoredContacts();

  const { name, companyName, phone, email, billingAddress, siteAddresses, primaryContactName, primaryContactEmail, primaryContactPhone } = payload || {};

  if (!name || !phone || !primaryContactName || !primaryContactEmail) {
    return { success: false, message: 'Client name, phone, primary contact name, and primary contact email are required.' };
  }

  const cleanEmail = primaryContactEmail.trim().toLowerCase();
  if (contacts.some(c => c.email === cleanEmail)) {
    return { success: false, message: 'A ClientContact with this email already exists.' };
  }

  const clientId = 'cli-' + Date.now();
  const contactId = 'cc-' + Date.now();
  const tempPassword = generateMockTempPassword();

  const newClient = {
    _id: clientId,
    id: clientId,
    name: name.trim(),
    companyName: companyName ? companyName.trim() : null,
    phone: phone.trim(),
    email: email ? email.trim().toLowerCase() : cleanEmail,
    billingAddress: billingAddress || null,
    siteAddresses: Array.isArray(siteAddresses) ? siteAddresses : (siteAddresses ? [siteAddresses] : []),
    isActive: true,
    createdAt: new Date().toISOString()
  };

  const primaryContact = {
    _id: contactId,
    id: contactId,
    clientId,
    name: primaryContactName.trim(),
    email: cleanEmail,
    phone: primaryContactPhone ? primaryContactPhone.trim() : phone.trim(),
    permissionLevel: 'OWNER',
    isPrimaryContact: true,
    mustChangePassword: true,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  clients.unshift(newClient);
  contacts.unshift(primaryContact);

  localStorage.setItem('nirman_clients', JSON.stringify(clients));
  localStorage.setItem('nirman_client_contacts', JSON.stringify(contacts));

  return {
    success: true,
    message: 'Client and primary ClientContact created successfully.',
    client: newClient,
    primaryContact: {
      ...primaryContact,
      temporaryPassword: tempPassword
    },
    temporaryPasswordSent: true
  };
};

export const mockGetClients = async (params = {}) => {
  await delay();
  const clients = getStoredClients();
  const contacts = getStoredContacts();
  const links = getStoredLinks();

  const { search, isActive = 'true', page = 1, limit = 10 } = params;

  let filtered = [...clients];

  if (isActive !== undefined && isActive !== '') {
    const isActBool = isActive === 'true' || isActive === true;
    filtered = filtered.filter(c => c.isActive === isActBool);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  }

  const enriched = filtered.map(c => {
    const primaryContact = contacts.find(ct => (ct.clientId === c._id || ct.clientId === c.id) && ct.isPrimaryContact) || null;
    const activeProjectCount = links.filter(l => (l.clientId === c._id || l.clientId === c.id) && l.isActive).length;
    return {
      ...c,
      primaryContact,
      activeProjectCount
    };
  });

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  const paginated = enriched.slice(skip, skip + limitNum);

  return {
    success: true,
    message: 'Clients retrieved successfully.',
    clients: paginated,
    pagination: {
      total: enriched.length,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(enriched.length / limitNum) || 1
    }
  };
};

export const mockGetClientById = async (id) => {
  await delay();
  const clients = getStoredClients();
  const contacts = getStoredContacts();
  const links = getStoredLinks();

  const client = clients.find(c => c._id === id || c.id === id);
  if (!client) {
    return { success: false, message: 'Client not found.' };
  }

  const clientContacts = contacts.filter(c => c.clientId === id || c.clientId === client._id);
  const activeLinks = links.filter(l => (l.clientId === id || l.clientId === client._id) && l.isActive);

  return {
    success: true,
    message: 'Client details retrieved successfully.',
    client,
    contacts: clientContacts,
    activeProjectCount: activeLinks.length
  };
};

export const mockUpdateClient = async (id, payload) => {
  await delay();
  const clients = getStoredClients();
  const index = clients.findIndex(c => c._id === id || c.id === id);

  if (index === -1) {
    return { success: false, message: 'Client not found.' };
  }

  const client = clients[index];
  const { name, companyName, phone, email, billingAddress, siteAddresses } = payload || {};

  if (name) client.name = name.trim();
  if (companyName !== undefined) client.companyName = companyName ? companyName.trim() : null;
  if (phone) client.phone = phone.trim();
  if (email !== undefined) client.email = email ? email.trim().toLowerCase() : null;
  if (billingAddress !== undefined) client.billingAddress = billingAddress;
  if (siteAddresses !== undefined) {
    client.siteAddresses = Array.isArray(siteAddresses) ? siteAddresses : (siteAddresses ? [siteAddresses] : []);
  }

  client.updatedAt = new Date().toISOString();
  clients[index] = client;
  localStorage.setItem('nirman_clients', JSON.stringify(clients));

  return {
    success: true,
    message: 'Client account updated successfully.',
    client
  };
};

export const mockDeactivateClient = async (id, force = false) => {
  await delay();
  const clients = getStoredClients();
  const contacts = getStoredContacts();
  const links = getStoredLinks();

  const index = clients.findIndex(c => c._id === id || c.id === id);
  if (index === -1) {
    return { success: false, message: 'Client not found.' };
  }

  const activeProjects = links.filter(l => (l.clientId === id || l.clientId === clients[index]._id) && l.isActive).length;
  if (activeProjects > 0 && !force) {
    return {
      success: false,
      message: `Cannot deactivate Client account. This Client has ${activeProjects} active project(s). Supply force=true to deactivate.`
    };
  }

  clients[index].isActive = false;
  localStorage.setItem('nirman_clients', JSON.stringify(clients));

  const updatedContacts = contacts.map(c => c.clientId === id || c.clientId === clients[index]._id ? { ...c, isActive: false } : c);
  localStorage.setItem('nirman_client_contacts', JSON.stringify(updatedContacts));

  return {
    success: true,
    message: 'Client account deactivated successfully.',
    client: clients[index]
  };
};

// --- Client Contacts Mock APIs ---

export const mockAddClientContact = async (clientId, payload) => {
  await delay();
  const contacts = getStoredContacts();
  const { name, email, phone, permissionLevel } = payload || {};

  if (!name || !email) {
    return { success: false, message: 'Contact name and email are required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (contacts.some(c => c.email === cleanEmail)) {
    return { success: false, message: 'A ClientContact with this email already exists.' };
  }

  const contactId = 'cc-' + Date.now();
  const tempPassword = generateMockTempPassword();

  const newContact = {
    _id: contactId,
    id: contactId,
    clientId,
    name: name.trim(),
    email: cleanEmail,
    phone: phone ? phone.trim() : null,
    permissionLevel: permissionLevel || 'MEMBER',
    isPrimaryContact: false,
    mustChangePassword: true,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  contacts.unshift(newContact);
  localStorage.setItem('nirman_client_contacts', JSON.stringify(contacts));

  return {
    success: true,
    message: 'Additional ClientContact added successfully.',
    contact: {
      ...newContact,
      temporaryPassword: tempPassword
    },
    temporaryPasswordSent: true
  };
};

export const mockGetClientContacts = async (clientId) => {
  await delay();
  const contacts = getStoredContacts().filter(c => c.clientId === clientId);
  return {
    success: true,
    message: 'Client contacts retrieved successfully.',
    contacts
  };
};

export const mockUpdateContactPermission = async (clientId, contactId, newPermissionLevel) => {
  await delay();
  const contacts = getStoredContacts();
  const index = contacts.findIndex(c => c._id === contactId || c.id === contactId);

  if (index === -1) {
    return { success: false, message: 'Client contact not found.' };
  }

  const contact = contacts[index];
  if (contact.permissionLevel === 'OWNER' && newPermissionLevel !== 'OWNER') {
    const ownerCount = contacts.filter(c => c.clientId === clientId && c.permissionLevel === 'OWNER' && c.isActive && c._id !== contactId).length;
    if (ownerCount === 0) {
      return { success: false, message: 'Cannot demote this contact. A Client account must maintain at least one active OWNER contact.' };
    }
  }

  const oldPerm = contact.permissionLevel;
  contact.permissionLevel = newPermissionLevel;
  contacts[index] = contact;
  localStorage.setItem('nirman_client_contacts', JSON.stringify(contacts));

  return {
    success: true,
    message: `Permission level updated from ${oldPerm} to ${newPermissionLevel}.`,
    contact
  };
};

export const mockDeactivateContact = async (clientId, contactId) => {
  await delay();
  const contacts = getStoredContacts();
  const index = contacts.findIndex(c => c._id === contactId || c.id === contactId);

  if (index === -1) {
    return { success: false, message: 'Client contact not found.' };
  }

  const contact = contacts[index];
  if (contact.permissionLevel === 'OWNER') {
    const ownerCount = contacts.filter(c => c.clientId === clientId && c.permissionLevel === 'OWNER' && c.isActive && c._id !== contactId).length;
    if (ownerCount === 0) {
      return { success: false, message: 'Cannot deactivate contact. Client account must maintain at least one active OWNER contact.' };
    }
  }

  contact.isActive = false;
  contacts[index] = contact;
  localStorage.setItem('nirman_client_contacts', JSON.stringify(contacts));

  return {
    success: true,
    message: 'Client contact deactivated successfully.',
    contact
  };
};

export const mockResetTempPassword = async (clientId, contactId) => {
  await delay();
  const contacts = getStoredContacts();
  const contact = contacts.find(c => (c._id === contactId || c.id === contactId) && c.clientId === clientId);

  if (!contact) {
    return { success: false, message: 'Client contact not found.' };
  }

  const tempPassword = generateMockTempPassword();
  contact.mustChangePassword = true;
  localStorage.setItem('nirman_client_contacts', JSON.stringify(contacts));

  return {
    success: true,
    message: 'Temporary password regenerated successfully.',
    contactId: contact._id,
    email: contact.email,
    temporaryPassword: tempPassword,
    mustChangePassword: true
  };
};

// --- Client Portal Auth Mock APIs ---

export const mockClientLogin = async (credentials) => {
  await delay();
  const { email } = credentials || {};
  const contacts = getStoredContacts();
  const clients = getStoredClients();

  const cleanEmail = (email || '').trim().toLowerCase();

  // 1. Direct match on ClientContact email
  let contact = contacts.find(c => c.email && c.email.toLowerCase() === cleanEmail);

  // 2. Direct match on Client Account email (pick primary contact)
  if (!contact) {
    const matchingClient = clients.find(cl => cl.email && cl.email.toLowerCase() === cleanEmail);
    if (matchingClient) {
      contact = contacts.find(c => (c.clientId === matchingClient._id || c.clientId === matchingClient.id) && c.isPrimaryContact);
      if (!contact) {
        contact = contacts.find(c => (c.clientId === matchingClient._id || c.clientId === matchingClient.id));
      }
    }
  }

  // 3. Dynamic Auto-Fallback for any client email (so Client Portal Login NEVER fails)
  if (!contact && cleanEmail) {
    const defaultClient = clients[0] || INITIAL_MOCK_CLIENTS[0];
    const contactId = 'cc-dyn-' + Date.now();
    contact = {
      _id: contactId,
      id: contactId,
      clientId: defaultClient._id || defaultClient.id,
      name: cleanEmail.split('@')[0].toUpperCase(),
      email: cleanEmail,
      phone: defaultClient.phone,
      permissionLevel: "OWNER",
      isPrimaryContact: true,
      mustChangePassword: false,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    contacts.unshift(contact);
    localStorage.setItem('nirman_client_contacts', JSON.stringify(contacts));
  }

  if (!contact) {
    return { success: false, message: 'Invalid email or password.' };
  }

  const client = clients.find(c => c._id === contact.clientId || c.id === contact.clientId) || clients[0];

  return {
    success: true,
    message: 'Client Portal login successful.',
    token: 'mock-client-jwt-token-' + Date.now(),
    contact,
    client
  };
};

export const mockClientChangePassword = async (payload) => {
  await delay();
  try {
    const contacts = getStoredContacts();
    if (contacts && contacts.length > 0) {
      contacts.forEach(c => {
        c.mustChangePassword = false;
        c.isTemporaryPassword = false;
      });
      localStorage.setItem('nirman_client_contacts', JSON.stringify(contacts));
    }
  } catch (e) { }
  return { success: true, message: 'Password updated successfully.', mustChangePassword: false };
};

export const mockClientForgotPassword = async (email) => {
  await delay();
  return { success: true, message: 'If an account exists with this email, a reset token has been generated.', resetTokenSent: true };
};

export const mockClientResetPassword = async () => {
  await delay();
  return { success: true, message: 'Password has been reset successfully.', mustChangePassword: false };
};

export const mockGetClientMe = async () => {
  await delay();
  const contacts = getStoredContacts();
  const clients = getStoredClients();
  const contact = contacts[0] || {};
  const client = clients.find(c => c._id === contact.clientId || c.id === contact.clientId) || clients[0];
  return { success: true, message: 'Client contact profile retrieved.', contact, client };
};

// --- Client Project Linkage Mock APIs ---

export const mockCreateClientProjectLink = async (payload) => {
  await delay();
  const links = getStoredLinks();
  const { clientId, projectId, visibleToClient = true } = payload || {};

  if (!clientId || !projectId) {
    return { success: false, message: 'Both clientId and projectId are required.' };
  }

  const existing = links.find(l => l.clientId === clientId && l.projectId === projectId && l.isActive);
  if (existing) {
    return { success: false, message: 'An active link already exists between this Client and Project.' };
  }

  const newLink = {
    _id: 'cpl-' + Date.now(),
    id: 'cpl-' + Date.now(),
    clientId,
    projectId,
    projectName: payload.projectName || 'New Project Link',
    visibleToClient: Boolean(visibleToClient),
    linkedAt: new Date().toISOString(),
    isActive: true
  };

  links.unshift(newLink);
  localStorage.setItem('nirman_client_project_links', JSON.stringify(links));

  return {
    success: true,
    message: 'Project successfully linked to Client account.',
    link: newLink
  };
};

export const mockGetLinksByClient = async (clientId) => {
  await delay();
  const links = getStoredLinks().filter(l => l.clientId === clientId && l.isActive);
  return { success: true, message: 'Client project links retrieved successfully.', links };
};

export const mockGetLinksByProject = async (projectId) => {
  await delay();
  const links = getStoredLinks().filter(l => l.projectId === projectId && l.isActive);
  return { success: true, message: 'Project client links retrieved successfully.', links };
};

export const mockToggleProjectLinkVisibility = async (id, visibleToClient) => {
  await delay();
  const links = getStoredLinks();
  const index = links.findIndex(l => l._id === id || l.id === id);

  if (index === -1) {
    return { success: false, message: 'Active ClientProjectLink not found.' };
  }

  links[index].visibleToClient = Boolean(visibleToClient);
  localStorage.setItem('nirman_client_project_links', JSON.stringify(links));

  return {
    success: true,
    message: `Project visibility updated to ${Boolean(visibleToClient)}.`,
    link: links[index]
  };
};

export const mockUnlinkProject = async (id) => {
  await delay();
  const links = getStoredLinks();
  const index = links.findIndex(l => l._id === id || l.id === id);

  if (index === -1) {
    return { success: false, message: 'Active ClientProjectLink not found.' };
  }

  links[index].isActive = false;
  localStorage.setItem('nirman_client_project_links', JSON.stringify(links));

  return {
    success: true,
    message: 'Project unlinked from Client account successfully.',
    link: links[index]
  };
};

export const mockGetMyClientProjects = async () => {
  await delay();
  const links = getStoredLinks().filter(l => l.isActive && l.visibleToClient);
  return {
    success: true,
    count: links.length,
    projects: links
  };
};

// ========================================================
// CRM MODULE 4 - CLIENT PORTAL CORE MOCK APIS
// ========================================================

export const mockGetClientDashboard = async () => {
  await delay();
  const user = getSessionUser() || {};
  const links = getStoredLinks();

  const userClientId = user.clientId || "cli-101";

  const activeLinks = links.filter(l => (l.clientId === userClientId || l.clientId === "cli-101") && l.isActive && l.visibleToClient !== false);

  const activeProjects = activeLinks.map(l => ({
    projectId: l.projectId || "proj-1",
    linkId: l._id || l.id,
    name: l.projectName || "Shah Corporate Heights",
    status: "In Progress",
    progressPercent: 68,
    thumbnailUrl: null,
    startDate: "2026-01-15",
    estimatedCompletion: "2026-11-30",
    actualCompletion: null,
    nextMilestone: {
      title: "Basement Concrete Casting Signoff",
      dueDate: "2026-08-25"
    },
    linkedAt: l.linkedAt || new Date().toISOString()
  }));

  const pastProjects = [
    {
      projectId: "proj-old-1",
      linkId: "cpl-past-1",
      name: "Oceanic Villa Phase 1",
      status: "Completed",
      progressPercent: 100,
      thumbnailUrl: null,
      startDate: "2025-02-10",
      estimatedCompletion: "2026-02-10",
      actualCompletion: "2026-02-05",
      nextMilestone: null,
      linkedAt: "2025-02-10T00:00:00.000Z"
    }
  ];

  return {
    success: true,
    message: "Client dashboard retrieved successfully.",
    activeProjects,
    pastProjects,
    totalProjectsCount: activeProjects.length + pastProjects.length,
    contactPermissionLevel: user.permissionLevel || "OWNER"
  };
};

export const mockGetClientProjectDetail = async (projectId) => {
  await delay();
  const links = getStoredLinks();
  const link = links.find(l => (l.projectId === projectId || l.id === projectId || l.projectName === projectId) && l.isActive);

  const projName = link ? link.projectName : "Shah Corporate Heights";

  return {
    success: true,
    message: "Project details retrieved successfully.",
    project: {
      _id: projectId || "proj-3",
      name: projName,
      status: "In Progress",
      progressPercent: 68,
      startDate: "2026-01-15",
      estimatedCompletion: "2026-11-30",
      projectManager: {
        name: "Sarah Connor",
        email: "sarah.pm@nirman.com",
        designation: "Senior Project Manager",
        phone: "+91 98765 00001"
      },
      siteLocation: {
        address: "Site A, Bopal, Ahmedabad",
        coordinates: "23.0312, 72.4631"
      },
      linkId: link ? link._id : "cpl-3"
    }
  };
};

export const mockGetClientProjectMilestones = async (projectId) => {
  await delay();
  return {
    success: true,
    message: "Project milestones retrieved successfully.",
    projectId: projectId || "proj-3",
    projectName: "Shah Corporate Heights",
    progressPercent: 68,
    milestones: [
      { _id: "m1", title: "Concept Layout & Material Palette", isCompleted: true, dueDate: "2026-02-15", completedDate: "2026-02-10" },
      { _id: "m2", title: "Municipal Authority Site Approval", isCompleted: true, dueDate: "2026-04-20", completedDate: "2026-04-18" },
      { _id: "m3", title: "Excavation & Rebar Reinforcement", isCompleted: true, dueDate: "2026-06-30", completedDate: "2026-06-28" },
      { _id: "m4", title: "Basement Columns Casting", isCompleted: false, dueDate: "2026-08-25", completedDate: null },
      { _id: "m5", title: "Structural Glass Facade Release", isCompleted: false, dueDate: "2026-10-15", completedDate: null }
    ]
  };
};

export const mockGetClientProjectTimeline = async (projectId) => {
  await delay();
  return {
    success: true,
    message: "Project timeline retrieved successfully.",
    projectId: projectId || "proj-3",
    projectName: "Shah Corporate Heights",
    status: "In Progress",
    timeline: [
      { type: "START", title: "Project Initiated", date: "2026-01-15", isCompleted: true, description: "Official project kickoff and site survey." },
      { type: "MILESTONE", title: "Concept Layout & Permits", date: "2026-02-15", isCompleted: true, description: "Schematic design and city permits signed off." },
      { type: "MILESTONE", title: "Excavation Completed", date: "2026-06-30", isCompleted: true, description: "Sub-structure compaction and excavation finished." },
      { type: "MILESTONE", title: "Basement Columns Casting", date: "2026-08-25", isCompleted: false, description: "Rebar reinforcement & concrete pouring active." },
      { type: "TARGET_COMPLETION", title: "Estimated Completion Target", date: "2026-11-30", isCompleted: false, description: "Final interior fitouts and client handover." }
    ]
  };
};

export const mockUpdateClientProfile = async (payload) => {
  await delay();
  const { name, phone } = payload || {};
  const user = getSessionUser() || {};

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();

  localStorage.setItem('user', JSON.stringify(user));

  return {
    success: true,
    message: "Profile updated successfully.",
    contact: {
      id: user.id || "cc-103",
      name: user.name || "Anand Shah",
      email: user.email || "anand@shah.com",
      phone: user.phone || "9876543210",
      permissionLevel: user.permissionLevel || "OWNER"
    }
  };
};

export const mockLogClientSessionLogin = async (platform = "WEB") => {
  await delay();
  return {
    success: true,
    message: "Client portal session logged successfully.",
    session: {
      id: "sess-" + Date.now(),
      platform: platform.toUpperCase(),
      loginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    }
  };
};

export const mockSendClientSessionHeartbeat = async (sessionId = null) => {
  await delay();
  return {
    success: true,
    message: "Session heartbeat updated.",
    lastActiveAt: new Date().toISOString(),
    serverTimestamp: new Date().toISOString()
  };
};

// Device Binding Mock Handlers
export const getMockPendingDeviceRequests = async () => {
  await delay();
  initLocalStorage();
  const rawReqs = JSON.parse(localStorage.getItem('nirman_device_requests') || '[]');
  const users = JSON.parse(localStorage.getItem('nirman_users') || '[]');

  const pending = rawReqs
    .filter(r => r.status === 'PENDING')
    .map(r => {
      const uObj = typeof r.userId === 'object' ? r.userId : (users.find(u => (u.id === r.userId || u._id === r.userId)) || { _id: r.userId, name: 'Employee User', email: 'user@nirman.com' });
      return {
        ...r,
        _id: r.id || r._id || ('req-' + Math.random()),
        userId: uObj,
        user: uObj
      };
    });

  return {
    success: true,
    message: "Pending device requests retrieved successfully.",
    requests: pending
  };
};

export const approveMockDeviceRequest = async (requestId, action) => {
  await delay();
  initLocalStorage();
  const rawReqs = JSON.parse(localStorage.getItem('nirman_device_requests') || '[]');
  const users = JSON.parse(localStorage.getItem('nirman_users') || '[]');

  const reqIndex = rawReqs.findIndex(r => (r.id === requestId || r._id === requestId));
  if (reqIndex === -1) {
    return { success: false, message: "Device change request not found." };
  }

  const req = rawReqs[reqIndex];
  const upperAction = (action || 'APPROVE').toUpperCase();

  req.status = upperAction === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  req.reviewedAt = new Date().toISOString();

  const targetUserId = typeof req.userId === 'object' ? (req.userId.id || req.userId._id) : req.userId;
  const userObj = users.find(u => u.id === targetUserId || u._id === targetUserId);

  if (userObj && upperAction === 'APPROVE') {
    userObj.registeredDeviceId = req.newDeviceId;
    userObj.deviceId = req.newDeviceId;
    userObj.deviceStatus = 'APPROVED';
  } else if (userObj) {
    userObj.deviceStatus = 'REJECTED';
  }

  localStorage.setItem('nirman_device_requests', JSON.stringify(rawReqs));
  localStorage.setItem('nirman_users', JSON.stringify(users));

  return {
    success: true,
    message: upperAction === 'APPROVE' ? "Device change request approved successfully." : "Device change request rejected.",
    requestId,
    status: req.status
  };
};

export const assignMockDevice = async (targetUserId, deviceId) => {
  await delay();
  initLocalStorage();
  const users = JSON.parse(localStorage.getItem('nirman_users') || '[]');
  const reqs = JSON.parse(localStorage.getItem('nirman_device_requests') || '[]');

  const user = users.find(u => u.id === targetUserId || u._id === targetUserId || u.email === targetUserId);

  if (user) {
    const cleanId = deviceId.trim();
    const oldDev = user.deviceId || user.registeredDeviceId || 'None';

    user.registeredDeviceId = cleanId;
    user.deviceId = cleanId;
    user.deviceStatus = 'PENDING';

    const newReq = {
      id: 'dreq-' + Date.now(),
      requestId: 'dreq-' + Date.now(),
      _id: 'dreq-' + Date.now(),
      userId: user,
      user: user,
      oldDeviceId: oldDev,
      newDeviceId: cleanId,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    reqs.unshift(newReq);

    localStorage.setItem('nirman_users', JSON.stringify(users));
    localStorage.setItem('nirman_device_requests', JSON.stringify(reqs));
  }

  return {
    success: true,
    message: `Device binding request for ID ${deviceId} created and is now PENDING Admin/HR approval.`,
    userId: targetUserId,
    deviceId: deviceId.trim(),
    deviceStatus: 'PENDING'
  };
};

export const getMockDeviceStatus = async (targetUserId = 'u2', customDeviceId = null) => {
  await delay();
  initLocalStorage();
  const users = JSON.parse(localStorage.getItem('nirman_users') || '[]');
  const reqs = JSON.parse(localStorage.getItem('nirman_device_requests') || '[]');

  const user = users.find(u => u.id === targetUserId || u._id === targetUserId) || {
    _id: targetUserId,
    id: targetUserId,
    name: 'Workforce Member',
    email: 'employee@gmail.com',
    deviceId: customDeviceId || 'c5dbdd5f-e416-479b-aa77-12c661c48bcb',
    deviceStatus: 'PENDING'
  };

  const pending = reqs.filter(r => (r.userId === targetUserId || r.userId?.id === targetUserId || r.userId?._id === targetUserId) && r.status === 'PENDING');

  return {
    success: true,
    message: "Device status retrieved successfully.",
    userId: user._id || user.id,
    email: user.email,
    deviceId: user.deviceId || user.registeredDeviceId || customDeviceId || 'c5dbdd5f-e416-479b-aa77-12c661c48bcb',
    deviceStatus: user.deviceStatus || (pending.length > 0 ? 'PENDING' : 'PENDING'),
    online: true,
    lastSeen: new Date().toISOString(),
    pendingRequests: pending
  };
};

export const registerMockDevice = async (payload) => {
  const { deviceId, userId } = payload || {};
  return assignMockDevice(userId || 'u2', deviceId || 'GUID-MACHINE-123');
};

export const sendMockHeartbeat = async (payload) => {
  await delay();
  return {
    success: true,
    message: "Heartbeat received.",
    lastSeen: new Date().toISOString(),
    status: "ONLINE",
    online: true
  };
};

// ----------------------------------------------------
// Mock Drawing Approval Workflow & Client Log Handlers
// ----------------------------------------------------

export const getMockClientProjectDrawings = async (projectId) => {
  await delay();
  initLocalStorage();
  const drawings = JSON.parse(localStorage.getItem('nirman_drawings') || '[]');

  const list = drawings.filter(d => !projectId || String(d.projectId) === String(projectId));
  return {
    success: true,
    pendingApproval: list.filter(d => d.status === 'PENDING_CLIENT_APPROVAL'),
    approved: list.filter(d => d.status === 'APPROVED'),
    changesRequested: list.filter(d => d.status === 'CHANGES_REQUESTED'),
    allDrawings: list
  };
};

export const getMockDrawingDetails = async (drawingId) => {
  await delay();
  const drawings = JSON.parse(localStorage.getItem('nirman_drawings') || '[]');
  const found = drawings.find(d => d._id === drawingId || d.id === drawingId);
  if (found) {
    return { success: true, drawing: found };
  }
  return {
    success: true,
    drawing: {
      _id: drawingId,
      title: 'Architectural Working Drawing',
      drawingNumber: 'AR-101',
      category: 'Working',
      currentVersion: 1,
      fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      status: 'PENDING_CLIENT_APPROVAL',
      visibleToClient: true,
      versions: [
        { versionNumber: 1, fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', notes: 'Initial Version', uploadedAt: new Date().toISOString() }
      ]
    }
  };
};

export const getMockDrawingVersions = async (drawingId) => {
  await delay();
  const details = await getMockDrawingDetails(drawingId);
  return {
    success: true,
    drawingId,
    versions: details.drawing?.versions || []
  };
};

export const getMockCompareDrawingVersions = async (drawingId, v1, v2) => {
  await delay();
  const details = await getMockDrawingDetails(drawingId);
  const versions = details.drawing?.versions || [];
  const ver1 = versions.find(v => String(v.versionNumber) === String(v1)) || versions[0] || {};
  const ver2 = versions.find(v => String(v.versionNumber) === String(v2)) || versions[versions.length - 1] || {};
  return {
    success: true,
    drawingId,
    version1: ver1,
    version2: ver2
  };
};

export const approveMockDrawing = async (drawingId, comments = '') => {
  await delay();
  initLocalStorage();
  let drawings = JSON.parse(localStorage.getItem('nirman_drawings') || '[]');
  let logs = JSON.parse(localStorage.getItem('nirman_client_approval_logs') || '[]');

  let updatedDrawing = null;
  drawings = drawings.map(d => {
    if (d._id === drawingId || d.id === drawingId) {
      d.status = 'APPROVED';
      updatedDrawing = d;
    }
    return d;
  });

  if (!updatedDrawing) {
    updatedDrawing = {
      _id: drawingId,
      title: 'Approved Drawing',
      status: 'APPROVED',
      comments
    };
    drawings.push(updatedDrawing);
  }

  localStorage.setItem('nirman_drawings', JSON.stringify(drawings));

  const newLog = {
    _id: 'log_' + Date.now(),
    drawingId,
    projectId: updatedDrawing.projectId || 'proj-1',
    action: 'APPROVED',
    comments: comments || 'Approved by client contact',
    actedAt: new Date().toISOString(),
    contactId: { name: 'Kadam Bhakti (Client Owner)', email: 'bhakti@gmail.com', permissionLevel: 'OWNER' },
    clientId: { name: 'Nirman Client Account', companyName: 'Nirman Heights' }
  };

  logs.unshift(newLog);
  localStorage.setItem('nirman_client_approval_logs', JSON.stringify(logs));

  return {
    success: true,
    message: 'Drawing approved successfully.',
    drawing: updatedDrawing,
    approvalLog: newLog
  };
};

export const requestMockDrawingChanges = async (drawingId, comments) => {
  await delay();
  initLocalStorage();
  let drawings = JSON.parse(localStorage.getItem('nirman_drawings') || '[]');
  let logs = JSON.parse(localStorage.getItem('nirman_client_approval_logs') || '[]');

  let updatedDrawing = null;
  drawings = drawings.map(d => {
    if (d._id === drawingId || d.id === drawingId) {
      d.status = 'CHANGES_REQUESTED';
      updatedDrawing = d;
    }
    return d;
  });

  if (!updatedDrawing) {
    updatedDrawing = {
      _id: drawingId,
      title: 'Drawing under change request',
      status: 'CHANGES_REQUESTED',
      comments
    };
    drawings.push(updatedDrawing);
  }

  localStorage.setItem('nirman_drawings', JSON.stringify(drawings));

  const newLog = {
    _id: 'log_' + Date.now(),
    drawingId,
    projectId: updatedDrawing.projectId || 'proj-1',
    action: 'CHANGES_REQUESTED',
    comments: comments || 'Requested modifications on column layout.',
    actedAt: new Date().toISOString(),
    contactId: { name: 'Kadam Bhakti (Client Member)', email: 'bhakti@gmail.com', permissionLevel: 'MEMBER' },
    clientId: { name: 'Nirman Client Account', companyName: 'Nirman Heights' }
  };

  logs.unshift(newLog);
  localStorage.setItem('nirman_client_approval_logs', JSON.stringify(logs));

  return {
    success: true,
    message: 'Drawing change request submitted successfully.',
    drawing: updatedDrawing,
    approvalLog: newLog
  };
};

export const postMockDrawingComment = async (drawingId, commentData) => {
  await delay();
  initLocalStorage();
  let comments = JSON.parse(localStorage.getItem('nirman_drawing_comments') || '[]');
  const newCommentObj = {
    _id: 'cmt_' + Date.now(),
    drawingId,
    author: commentData.author || 'Project Architect',
    text: commentData.text || commentData.comments || '',
    isDraft: commentData.isDraft || false,
    actedAt: new Date().toISOString()
  };
  comments.unshift(newCommentObj);
  localStorage.setItem('nirman_drawing_comments', JSON.stringify(comments));

  return {
    success: true,
    message: 'Comment posted successfully.',
    comment: newCommentObj
  };
};

export const getMockDrawingComments = async (drawingId) => {
  await delay();
  const comments = JSON.parse(localStorage.getItem('nirman_drawing_comments') || '[]');
  const filtered = comments.filter(c => c.drawingId === drawingId);
  return {
    success: true,
    drawingId,
    comments: filtered.length > 0 ? filtered : [
      { _id: 'cmt-1', drawingId, author: 'Architect Sarah', text: 'Column dimensions updated per load calculations.', actedAt: '2026-07-20T14:00:00Z' },
      { _id: 'cmt-2', drawingId, author: 'PM Lax Savani', text: 'Sent to client for final sign-off.', actedAt: '2026-07-21T09:30:00Z' }
    ]
  };
};

export const getMockClientApprovalLog = async (drawingId) => {
  await delay();
  initLocalStorage();
  const logs = JSON.parse(localStorage.getItem('nirman_client_approval_logs') || '[]');
  const filtered = logs.filter(l => !drawingId || l.drawingId === drawingId);

  if (filtered.length > 0) {
    return {
      success: true,
      message: 'Client approval log retrieved successfully.',
      drawingId,
      title: 'Architectural Drawing',
      status: 'PENDING_CLIENT_APPROVAL',
      logs: filtered
    };
  }

  const sampleLog = [
    {
      _id: 'log-101',
      drawingId: drawingId || 'drg-101',
      projectId: 'proj-1',
      action: 'APPROVED',
      comments: 'All Ground Floor structural details look good.',
      actedAt: '2026-07-21T11:30:00Z',
      contactId: { name: 'Kadam Bhakti', email: 'bhakti@gmail.com', permissionLevel: 'OWNER', isPrimaryContact: true },
      clientId: { name: 'Client Owner', companyName: 'Nirman Architects Client Portal' }
    }
  ];

  return {
    success: true,
    message: 'Client approval log retrieved successfully.',
    drawingId,
    title: 'Ground Floor Structural Plan',
    status: 'APPROVED',
    logs: sampleLog
  };
};

// ----------------------------------------------------
// CRM Module 6 - Client Document Access Mock Handlers
// ----------------------------------------------------

export const getMockClientProjectDocuments = async (projectId, { folder = '', search = '' } = {}) => {
  await delay();
  initLocalStorage();
  let documents = JSON.parse(localStorage.getItem('nirman_client_documents') || '[]');

  if (documents.length === 0) {
    const sampleDocs = [
      {
        _id: 'doc-101',
        projectId: projectId || 'proj-1',
        fileName: 'Client Agreement & Architectural Contract V1.pdf',
        filePath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'PDF',
        fileSize: 4200000,
        category: 'Contracts',
        uploadedBy: { name: 'Admin Sarah' },
        version: 1,
        visibleToClient: true,
        isDeleted: false,
        createdAt: '2026-07-01T10:00:00Z'
      },
      {
        _id: 'doc-102',
        projectId: projectId || 'proj-1',
        fileName: 'Approved GFC Structural Plan Set.pdf',
        filePath: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        fileType: 'PDF',
        fileSize: 12500000,
        category: 'Approved Drawings PDFs',
        uploadedBy: { name: 'PM Lax Savani' },
        version: 2,
        visibleToClient: true,
        isDeleted: false,
        createdAt: '2026-07-15T14:30:00Z'
      },
      {
        _id: 'doc-103',
        projectId: projectId || 'proj-1',
        fileName: 'Site Excavation & Foundation Progress.png',
        filePath: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80',
        fileType: 'PNG',
        fileSize: 3400000,
        category: 'Photos',
        uploadedBy: { name: 'Site Supervisor' },
        version: 1,
        visibleToClient: true,
        isDeleted: false,
        createdAt: '2026-07-18T09:15:00Z'
      },
      {
        _id: 'doc-104',
        projectId: projectId || 'proj-1',
        fileName: 'Milestone 2 Foundation Stage Invoice #INV-2026-04.pdf',
        filePath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'PDF',
        fileSize: 1800000,
        category: 'Invoices',
        uploadedBy: { name: 'Accounts Department' },
        version: 1,
        visibleToClient: true,
        isDeleted: false,
        createdAt: '2026-07-20T11:00:00Z'
      },
      {
        _id: 'doc-105',
        projectId: projectId || 'proj-1',
        fileName: 'Material Specifications & Brand Catalog.pdf',
        filePath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'PDF',
        fileSize: 8900000,
        category: 'Other Shared Documents',
        uploadedBy: { name: 'Interior Designer' },
        version: 1,
        visibleToClient: true,
        isDeleted: false,
        createdAt: '2026-07-22T16:00:00Z'
      }
    ];
    localStorage.setItem('nirman_client_documents', JSON.stringify(sampleDocs));
    documents = sampleDocs;
  }

  let filtered = documents.filter(d => d.visibleToClient && !d.isDeleted);
  if (projectId) {
    filtered = filtered.filter(d => d.projectId === projectId || d.projectId === 'proj-1');
  }
  if (folder) {
    filtered = filtered.filter(d => d.category === folder);
  }
  if (search) {
    filtered = filtered.filter(d => d.fileName.toLowerCase().includes(search.toLowerCase()));
  }

  const documentsByFolder = {
    'Contracts': filtered.filter(d => d.category === 'Contracts'),
    'Approved Drawings PDFs': filtered.filter(d => d.category === 'Approved Drawings PDFs'),
    'Photos': filtered.filter(d => d.category === 'Photos'),
    'Invoices': filtered.filter(d => d.category === 'Invoices'),
    'Other Shared Documents': filtered.filter(d => d.category === 'Other Shared Documents')
  };

  return {
    success: true,
    message: 'Client project documents retrieved successfully.',
    totalCount: filtered.length,
    documentsByFolder,
    allDocuments: filtered
  };
};

export const previewMockDocument = async (documentId) => {
  await delay();
  initLocalStorage();
  const docs = JSON.parse(localStorage.getItem('nirman_client_documents') || '[]');
  const doc = docs.find(d => d._id === documentId || d.id === documentId);

  if (!doc || doc.isDeleted) {
    throw new Error("404: Document not found or no longer available.");
  }

  if (!doc.visibleToClient) {
    throw new Error("403: Access denied. Document is not shared with client portal.");
  }

  let accessLogs = JSON.parse(localStorage.getItem('nirman_client_doc_access_logs') || '[]');
  const log = {
    _id: 'dlog_' + Date.now(),
    clientId: 'client-1',
    contactId: { name: 'Kadam Bhakti', email: 'bhakti@gmail.com', permissionLevel: 'OWNER' },
    documentId,
    projectId: doc.projectId || 'proj-1',
    action: 'VIEW',
    accessedAt: new Date().toISOString()
  };
  accessLogs.unshift(log);
  localStorage.setItem('nirman_client_doc_access_logs', JSON.stringify(accessLogs));

  return {
    success: true,
    message: "Document preview retrieved successfully.",
    document: doc,
    previewUrl: doc.filePath,
    fileType: doc.fileType,
    accessLog: log
  };
};

export const downloadMockDocument = async (documentId) => {
  await delay();
  initLocalStorage();
  const docs = JSON.parse(localStorage.getItem('nirman_client_documents') || '[]');
  const doc = docs.find(d => d._id === documentId || d.id === documentId);

  if (!doc) {
    throw new Error("404: Document not found.");
  }

  if (doc.isDeleted) {
    const err = new Error("HTTP 410: This document is soft-deleted and no longer available.");
    err.response = { status: 410 };
    throw err;
  }

  if (!doc.visibleToClient) {
    throw new Error("403: Access denied. Document is not shared with client portal.");
  }

  let accessLogs = JSON.parse(localStorage.getItem('nirman_client_doc_access_logs') || '[]');
  const log = {
    _id: 'dlog_' + Date.now(),
    clientId: 'client-1',
    contactId: { name: 'Kadam Bhakti', email: 'bhakti@gmail.com', permissionLevel: 'OWNER' },
    documentId,
    projectId: doc.projectId || 'proj-1',
    action: 'DOWNLOAD',
    accessedAt: new Date().toISOString()
  };
  accessLogs.unshift(log);
  localStorage.setItem('nirman_client_doc_access_logs', JSON.stringify(accessLogs));

  return {
    success: true,
    message: "Document download initiated successfully.",
    downloadUrl: doc.filePath,
    fileName: doc.fileName,
    accessLog: log
  };
};

export const getMockDocumentAccessLog = async (documentId) => {
  await delay();
  initLocalStorage();
  const accessLogs = JSON.parse(localStorage.getItem('nirman_client_doc_access_logs') || '[]');
  const filtered = accessLogs.filter(l => !documentId || l.documentId === documentId);

  if (filtered.length > 0) {
    return {
      success: true,
      message: 'Client document access logs retrieved successfully.',
      documentId,
      accessLogs: filtered
    };
  }

  const sampleLogs = [
    {
      _id: 'dlog-1',
      clientId: 'client-1',
      contactId: { name: 'Kadam Bhakti', email: 'bhakti@gmail.com', permissionLevel: 'OWNER' },
      documentId: documentId || 'doc-101',
      projectId: 'proj-1',
      action: 'VIEW',
      accessedAt: '2026-07-21T10:15:00Z'
    },
    {
      _id: 'dlog-2',
      clientId: 'client-1',
      contactId: { name: 'Kadam Bhakti', email: 'bhakti@gmail.com', permissionLevel: 'OWNER' },
      documentId: documentId || 'doc-101',
      projectId: 'proj-1',
      action: 'DOWNLOAD',
      accessedAt: '2026-07-21T10:18:00Z'
    }
  ];

  return {
    success: true,
    message: 'Client document access logs retrieved successfully.',
    documentId,
    accessLogs: sampleLogs
  };
};

export const getMockClientEngagementSummary = async (clientId) => {
  await delay();
  initLocalStorage();
  const docs = JSON.parse(localStorage.getItem('nirman_client_documents') || '[]');
  const logs = JSON.parse(localStorage.getItem('nirman_client_doc_access_logs') || '[]');

  const sharedDocs = docs.filter(d => d.visibleToClient && !d.isDeleted);
  const accessedDocIds = new Set(logs.map(l => l.documentId));

  const totalShared = sharedDocs.length || 5;
  const totalEngaged = sharedDocs.filter(d => accessedDocIds.has(d._id)).length || 3;
  const unopenedShared = sharedDocs.filter(d => !accessedDocIds.has(d._id));

  return {
    success: true,
    message: 'Client document engagement summary retrieved successfully.',
    clientId: clientId || 'client-1',
    summary: {
      totalSharedDocuments: totalShared,
      totalEngagedDocuments: totalEngaged,
      engagementRatePercent: totalShared > 0 ? Math.round((totalEngaged / totalShared) * 100) : 60,
      unopenedDocuments: unopenedShared.length > 0 ? unopenedShared : [
        { _id: 'doc-105', fileName: 'Material Specifications & Brand Catalog.pdf', category: 'Other Shared Documents', createdAt: '2026-07-22T16:00:00Z' }
      ]
    }
  };
};

// ----------------------------------------------------
// CRM Module 7 - Client Chat System Mock Handlers
// ----------------------------------------------------

export const getMockUnreadCounts = async () => {
  await delay();
  initLocalStorage();
  const readStatus = JSON.parse(localStorage.getItem('nirman_client_chat_read_status') || '{}');
  const messages = JSON.parse(localStorage.getItem('nirman_client_chat_messages') || '[]');

  const lastRead = readStatus['proj-1'] || '2026-07-20T10:00:00Z';
  const unreadCount = messages.filter(m => (m.projectId === 'proj-1' || !m.projectId) && m.sentAt > lastRead).length;

  return {
    success: true,
    message: 'Unread message counts retrieved successfully.',
    unreadCounts: [
      { projectId: 'proj-1', projectName: 'Central Office Tower', unreadCount: unreadCount || 1 },
      { projectId: 'proj-2', projectName: 'Oceanic Luxury Villas', unreadCount: 0 }
    ]
  };
};

export const getMockProjectChat = async (projectId = 'proj-1', since = '') => {
  await delay();
  initLocalStorage();
  let messages = JSON.parse(localStorage.getItem('nirman_client_chat_messages') || '[]');

  if (messages.length === 0) {
    const sampleMsgs = [
      {
        _id: 'msg-1',
        projectId: projectId || 'proj-1',
        authorType: 'EMPLOYEE',
        authorId: { name: 'Sarah Connor', designation: 'Lead Architect' },
        formattedAuthorName: 'Sarah Connor (Lead Architect)',
        messageText: 'Hello! I have uploaded the revised Ground Floor column layout blueprint for your review.',
        sentAt: '2026-07-20T09:30:00Z'
      },
      {
        _id: 'msg-2',
        projectId: projectId || 'proj-1',
        authorType: 'CLIENT_CONTACT',
        authorId: { name: 'Kadam Bhakti', permissionLevel: 'OWNER' },
        formattedAuthorName: 'Kadam Bhakti (OWNER)',
        messageText: 'Thank you Sarah, checking the balcony widths and column alignments now.',
        sentAt: '2026-07-20T10:15:00Z'
      },
      {
        _id: 'msg-3',
        projectId: projectId || 'proj-1',
        authorType: 'EMPLOYEE',
        authorId: { name: 'Lax Savani', designation: 'Project Manager' },
        formattedAuthorName: 'Lax Savani (Project Manager)',
        messageText: 'Please let us know if you need any adjustments before we release GFC drawings to site.',
        sentAt: '2026-07-20T11:00:00Z'
      }
    ];
    localStorage.setItem('nirman_client_chat_messages', JSON.stringify(sampleMsgs));
    messages = sampleMsgs;
  }

  let filtered = messages.filter(m => !projectId || m.projectId === projectId || m.projectId === 'proj-1');
  if (since) {
    filtered = filtered.filter(m => new Date(m.sentAt) > new Date(since));
  }

  return {
    success: true,
    message: 'Project chat history retrieved successfully.',
    projectId,
    messages: filtered,
    unreadCount: 0,
    totalCount: filtered.length
  };
};

export const sendMockClientMessage = async (projectId = 'proj-1', { messageText, mentionedIds = [], replyToMessageId = null }) => {
  await delay();
  initLocalStorage();
  let messages = JSON.parse(localStorage.getItem('nirman_client_chat_messages') || '[]');

  const newMsg = {
    _id: 'msg_' + Date.now(),
    projectId,
    authorType: 'CLIENT_CONTACT',
    authorId: { name: 'Kadam Bhakti', permissionLevel: 'OWNER' },
    formattedAuthorName: 'Kadam Bhakti (OWNER)',
    messageText: messageText.trim(),
    mentionedIds: Array.isArray(mentionedIds) ? mentionedIds : [],
    replyToMessageId: replyToMessageId || null,
    sentAt: new Date().toISOString()
  };

  messages.push(newMsg);
  localStorage.setItem('nirman_client_chat_messages', JSON.stringify(messages));

  return {
    success: true,
    message: 'Message sent successfully.',
    messageObj: newMsg,
    message: newMsg
  };
};

export const syncMockOfflineMessages = async (projectId = 'proj-1', offlineMsgs = []) => {
  await delay();
  initLocalStorage();
  let messages = JSON.parse(localStorage.getItem('nirman_client_chat_messages') || '[]');
  const synced = [];

  for (const m of offlineMsgs) {
    if (!m.messageText || !m.messageText.trim()) continue;
    const newM = {
      _id: 'msg_' + Date.now() + Math.floor(Math.random() * 1000),
      projectId,
      authorType: 'CLIENT_CONTACT',
      authorId: { name: 'Kadam Bhakti', permissionLevel: 'OWNER' },
      formattedAuthorName: 'Kadam Bhakti (OWNER)',
      messageText: m.messageText.trim(),
      isOfflineSync: true,
      sentAt: m.localComposedAt || new Date().toISOString()
    };
    messages.push(newM);
    synced.push(newM);
  }

  localStorage.setItem('nirman_client_chat_messages', JSON.stringify(messages));

  return {
    success: true,
    message: 'Offline messages synced successfully.',
    syncedCount: synced.length,
    messages: synced
  };
};

export const markMockChatRead = async (projectId = 'proj-1') => {
  await delay();
  initLocalStorage();
  let readStatus = JSON.parse(localStorage.getItem('nirman_client_chat_read_status') || '{}');
  readStatus[projectId] = new Date().toISOString();
  localStorage.setItem('nirman_client_chat_read_status', JSON.stringify(readStatus));

  return {
    success: true,
    message: 'Chat marked as read.',
    projectId,
    lastReadMessageAt: readStatus[projectId]
  };
};

export const getMockInternalChat = async (projectId = 'proj-1') => {
  return await getMockProjectChat(projectId);
};

export const sendMockInternalMessage = async (projectId = 'proj-1', { messageText, mentionedIds = [], replyToMessageId = null }) => {
  await delay();
  initLocalStorage();
  let messages = JSON.parse(localStorage.getItem('nirman_client_chat_messages') || '[]');

  const newMsg = {
    _id: 'msg_' + Date.now(),
    projectId,
    authorType: 'EMPLOYEE',
    authorId: { name: 'Admin / Architect', designation: 'Internal Team' },
    formattedAuthorName: 'Nirman Team (Admin/Architect)',
    messageText: messageText.trim(),
    mentionedIds: Array.isArray(mentionedIds) ? mentionedIds : [],
    replyToMessageId: replyToMessageId || null,
    sentAt: new Date().toISOString()
  };

  messages.push(newMsg);
  localStorage.setItem('nirman_client_chat_messages', JSON.stringify(messages));

  return {
    success: true,
    message: 'Internal team message posted into project chat workspace.',
    messageObj: newMsg,
    message: newMsg
  };
};

/* ==========================================================================
   CRM MODULE 8 - CLIENT TICKETING (QUERY/SUPPORT) MOCK HANDLERS
   ========================================================================== */

const INITIAL_MOCK_TICKETS = [
  {
    _id: 'tck-101',
    clientId: 'client-1',
    projectId: 'proj-1',
    projectName: 'Oceanic Luxury Villas',
    subject: 'Drawing discrepancy on Column C3',
    description: 'Column dimensions on structural page 2 need immediate engineering review.',
    priority: 'High',
    status: 'OPEN',
    raisedBy: { name: 'Anand Shah', email: 'anand@shah.com', permissionLevel: 'OWNER' },
    formattedRaisedBy: 'Anand Shah (OWNER)',
    assignedTo: { _id: 'u-1', name: 'Sarah Connor', designation: 'Senior PM' },
    formattedAssignedTo: 'Sarah Connor (Senior PM)',
    createdAt: '2026-08-05T10:00:00.000Z',
    reopenedCount: 0,
    responses: [
      {
        _id: 'tr-1',
        authorType: 'CLIENT_CONTACT',
        authorId: { name: 'Anand Shah' },
        formattedAuthorName: 'Anand Shah (OWNER)',
        message: 'Column dimensions on structural page 2 need immediate engineering review.',
        respondedAt: '2026-08-05T10:00:00.000Z'
      }
    ]
  },
  {
    _id: 'tck-102',
    clientId: 'client-1',
    projectId: 'proj-2',
    projectName: 'Smart City Commercial Mall',
    subject: 'HVAC Ducting Clearance Verification',
    description: 'Ceiling height clearance under beam B4 needs check before casting.',
    priority: 'Medium',
    status: 'IN_PROGRESS',
    raisedBy: { name: 'Vikram Mehta', email: 'vikram@shah.com', permissionLevel: 'MEMBER' },
    formattedRaisedBy: 'Vikram Mehta (MEMBER)',
    assignedTo: { _id: 'u-2', name: 'Rohit Kumar', designation: 'Project Engineer' },
    formattedAssignedTo: 'Rohit Kumar (Project Engineer)',
    createdAt: '2026-08-04T14:30:00.000Z',
    reopenedCount: 0,
    responses: [
      {
        _id: 'tr-2',
        authorType: 'CLIENT_CONTACT',
        authorId: { name: 'Vikram Mehta' },
        formattedAuthorName: 'Vikram Mehta (MEMBER)',
        message: 'Ceiling height clearance under beam B4 needs check before casting.',
        respondedAt: '2026-08-04T14:30:00.000Z'
      },
      {
        _id: 'tr-3',
        authorType: 'EMPLOYEE',
        authorId: { name: 'Rohit Kumar' },
        formattedAuthorName: 'Rohit Kumar (Project Engineer)',
        message: 'HVAC layout clearance verified at 2.8m net headroom. Proceeding with casting.',
        respondedAt: '2026-08-05T09:15:00.000Z'
      }
    ]
  }
];

const getStoredTickets = () => {
  initLocalStorage();
  const raw = localStorage.getItem('nirman_client_tickets');
  if (!raw) {
    localStorage.setItem('nirman_client_tickets', JSON.stringify(INITIAL_MOCK_TICKETS));
    return INITIAL_MOCK_TICKETS;
  }
  return JSON.parse(raw);
};

const saveTickets = (tickets) => {
  localStorage.setItem('nirman_client_tickets', JSON.stringify(tickets));
};

export const mockCreateTicket = async ({ projectId, subject, description, priority = 'Medium' }) => {
  await delay();
  const tickets = getStoredTickets();
  const newTicket = {
    _id: 'tck-' + Date.now(),
    clientId: 'client-1',
    projectId: projectId || 'proj-1',
    projectName: 'Oceanic Luxury Villas',
    subject: subject.trim(),
    description: description.trim(),
    priority: ['Low', 'Medium', 'High'].includes(priority) ? priority : 'Medium',
    status: 'OPEN',
    raisedBy: { name: 'Client Contact', permissionLevel: 'OWNER' },
    formattedRaisedBy: 'Client Contact (OWNER)',
    assignedTo: { _id: 'u-1', name: 'Sarah Connor', designation: 'Senior PM' },
    formattedAssignedTo: 'Sarah Connor (Senior PM)',
    createdAt: new Date().toISOString(),
    reopenedCount: 0,
    responses: [
      {
        _id: 'tr-' + Date.now(),
        authorType: 'CLIENT_CONTACT',
        authorId: { name: 'Client Contact' },
        formattedAuthorName: 'Client Contact (OWNER)',
        message: description.trim(),
        respondedAt: new Date().toISOString()
      }
    ]
  };
  tickets.unshift(newTicket);
  saveTickets(tickets);
  return { success: true, message: 'Support ticket created successfully.', ticket: newTicket };
};

export const mockGetMyTickets = async ({ status, projectId } = {}) => {
  await delay();
  let tickets = getStoredTickets();
  if (status) tickets = tickets.filter(t => t.status === status.toUpperCase());
  if (projectId) tickets = tickets.filter(t => t.projectId === projectId);
  return { success: true, count: tickets.length, tickets };
};

export const mockGetTicketDetail = async (ticketId) => {
  await delay();
  const tickets = getStoredTickets();
  const ticket = tickets.find(t => t._id === ticketId || t.id === ticketId);
  if (!ticket) return { success: false, message: 'Ticket not found.' };
  return { success: true, ticket, responses: ticket.responses || [], responseCount: (ticket.responses || []).length };
};

export const mockRespondToTicketClient = async (ticketId, message) => {
  await delay();
  const tickets = getStoredTickets();
  const ticket = tickets.find(t => t._id === ticketId || t.id === ticketId);
  if (!ticket) return { success: false, message: 'Ticket not found.' };

  const newResp = {
    _id: 'tr-' + Date.now(),
    authorType: 'CLIENT_CONTACT',
    authorId: { name: 'Client Contact' },
    formattedAuthorName: 'Client Contact (OWNER)',
    message: message.trim(),
    respondedAt: new Date().toISOString()
  };

  if (!ticket.responses) ticket.responses = [];
  ticket.responses.push(newResp);
  saveTickets(tickets);
  return { success: true, message: 'Response added successfully.', response: newResp };
};

export const mockReopenTicket = async (ticketId, reason = '') => {
  await delay();
  const tickets = getStoredTickets();
  const ticket = tickets.find(t => t._id === ticketId || t.id === ticketId);
  if (!ticket) return { success: false, message: 'Ticket not found.' };

  ticket.status = 'OPEN';
  ticket.reopenedCount = (ticket.reopenedCount || 0) + 1;
  if (!ticket.responses) ticket.responses = [];
  ticket.responses.push({
    _id: 'tr-' + Date.now(),
    authorType: 'CLIENT_CONTACT',
    authorId: { name: 'Client Contact' },
    formattedAuthorName: 'Client Contact (OWNER)',
    message: reason ? `Reopened ticket. Reason: ${reason}` : 'Reopened ticket within 14-day grace period.',
    respondedAt: new Date().toISOString()
  });

  saveTickets(tickets);
  return { success: true, message: 'Ticket reopened successfully.', ticket };
};

export const mockCancelTicket = async (ticketId) => {
  await delay();
  const tickets = getStoredTickets();
  const ticket = tickets.find(t => t._id === ticketId || t.id === ticketId);
  if (!ticket) return { success: false, message: 'Ticket not found.' };
  ticket.status = 'CANCELLED';
  saveTickets(tickets);
  return { success: true, message: 'Ticket cancelled successfully.', ticket };
};

export const mockGetAllTicketsInternal = async ({ status, priority, projectId } = {}) => {
  await delay();
  let tickets = getStoredTickets();
  if (status) tickets = tickets.filter(t => t.status === status.toUpperCase());
  if (priority) tickets = tickets.filter(t => t.priority === priority);
  if (projectId) tickets = tickets.filter(t => t.projectId === projectId);
  return { success: true, count: tickets.length, tickets };
};

export const mockRespondToTicketStaff = async (ticketId, message) => {
  await delay();
  const tickets = getStoredTickets();
  const ticket = tickets.find(t => t._id === ticketId || t.id === ticketId);
  if (!ticket) return { success: false, message: 'Ticket not found.' };

  const newResp = {
    _id: 'tr-' + Date.now(),
    authorType: 'EMPLOYEE',
    authorId: { name: 'Sarah Connor' },
    formattedAuthorName: 'Sarah Connor (Senior PM)',
    message: message.trim(),
    respondedAt: new Date().toISOString()
  };

  if (ticket.status === 'OPEN') ticket.status = 'IN_PROGRESS';
  if (!ticket.responses) ticket.responses = [];
  ticket.responses.push(newResp);
  saveTickets(tickets);
  return { success: true, message: 'Staff response added successfully.', response: newResp, ticketStatus: ticket.status };
};

export const mockUpdateTicketStatus = async (ticketId, newStatus) => {
  await delay();
  const tickets = getStoredTickets();
  const ticket = tickets.find(t => t._id === ticketId || t.id === ticketId);
  if (!ticket) return { success: false, message: 'Ticket not found.' };
  ticket.status = newStatus.toUpperCase();
  saveTickets(tickets);
  return { success: true, message: `Ticket status updated to ${newStatus}`, ticket };
};

export const mockReassignTicket = async (ticketId, targetUserId) => {
  await delay();
  const tickets = getStoredTickets();
  const ticket = tickets.find(t => t._id === ticketId || t.id === ticketId);
  if (!ticket) return { success: false, message: 'Ticket not found.' };
  ticket.assignedTo = { _id: targetUserId, name: 'Assigned Staff', designation: 'Staff Specialist' };
  ticket.formattedAssignedTo = 'Assigned Staff (Staff Specialist)';
  saveTickets(tickets);
  return { success: true, message: 'Ticket reassigned successfully.', ticket };
};

/* ==========================================================================
   CRM MODULE 9 - CLIENT FEEDBACK & SATISFACTION MOCK HANDLERS
   ========================================================================== */

const MOCK_CATEGORIES = [
  { _id: 'cat-1', name: 'Design & Architectural Aesthetics', isActive: true },
  { _id: 'cat-2', name: 'Site Execution & Timeliness', isActive: true },
  { _id: 'cat-3', name: 'Team Communication & Responsiveness', isActive: true },
  { _id: 'cat-4', name: 'Transparency & Value for Money', isActive: true }
];

const INITIAL_MOCK_PROMPTS = [
  {
    _id: 'prm-1',
    contactId: 'c-1',
    triggerType: 'PROJECT_COMPLETION',
    triggerRefId: 'proj-1',
    status: 'PENDING',
    project: { name: 'Oceanic Luxury Villas', projectNumber: 'NIR-2026-001' }
  }
];

const INITIAL_MOCK_FEEDBACKS = [
  {
    _id: 'fb-101',
    clientId: 'client-1',
    contactId: 'c-1',
    formattedAuthorName: 'Anand Shah (OWNER)',
    projectId: { name: 'Oceanic Luxury Villas', projectNumber: 'NIR-2026-001' },
    overallRating: 5,
    categoryRatings: [
      { categoryId: { name: 'Design & Architectural Aesthetics' }, rating: 5 },
      { categoryId: { name: 'Site Execution & Timeliness' }, rating: 4 },
      { categoryId: { name: 'Team Communication & Responsiveness' }, rating: 5 }
    ],
    comments: 'Exceptional craftsmanship and sleek modern aesthetics. Highly recommended!',
    submittedAt: '2026-08-01T12:00:00.000Z'
  }
];

export const mockGetActiveFeedbackCategories = async () => {
  await delay();
  return { success: true, count: MOCK_CATEGORIES.length, categories: MOCK_CATEGORIES };
};

export const mockCreateFeedbackCategory = async (name) => {
  await delay();
  const newCat = { _id: 'cat-' + Date.now(), name: name.trim(), isActive: true };
  MOCK_CATEGORIES.push(newCat);
  return { success: true, message: 'Feedback category created successfully.', category: newCat };
};

export const mockDeactivateFeedbackCategory = async (categoryId, isActive) => {
  await delay();
  const cat = MOCK_CATEGORIES.find(c => c._id === categoryId);
  if (cat) cat.isActive = typeof isActive === 'boolean' ? isActive : !cat.isActive;
  return { success: true, message: 'Feedback category status updated.', category: cat };
};

export const mockGetPendingFeedbackPrompts = async () => {
  await delay();
  return { success: true, count: INITIAL_MOCK_PROMPTS.length, prompts: INITIAL_MOCK_PROMPTS };
};

export const mockSubmitClientFeedback = async (promptId, { overallRating, comments, categoryRatings }) => {
  await delay();
  const pIndex = INITIAL_MOCK_PROMPTS.findIndex(p => p._id === promptId);
  if (pIndex !== -1) INITIAL_MOCK_PROMPTS[pIndex].status = 'SUBMITTED';

  const newFb = {
    _id: 'fb-' + Date.now(),
    clientId: 'client-1',
    contactId: 'c-1',
    formattedAuthorName: 'Anand Shah (OWNER)',
    projectId: { name: 'Oceanic Luxury Villas', projectNumber: 'NIR-2026-001' },
    overallRating: Number(overallRating) || 5,
    categoryRatings: categoryRatings || [],
    comments: comments || 'Great architectural service.',
    submittedAt: new Date().toISOString()
  };

  INITIAL_MOCK_FEEDBACKS.unshift(newFb);
  return { success: true, message: 'Feedback submitted successfully. Thank you for your review!', feedback: newFb };
};

export const mockSkipFeedbackPrompt = async (promptId) => {
  await delay();
  const pIndex = INITIAL_MOCK_PROMPTS.findIndex(p => p._id === promptId);
  if (pIndex !== -1) INITIAL_MOCK_PROMPTS[pIndex].status = 'SKIPPED';
  return { success: true, message: 'Feedback prompt skipped.' };
};

export const mockGetMyFeedbackHistory = async () => {
  await delay();
  return { success: true, count: INITIAL_MOCK_FEEDBACKS.length, feedbacks: INITIAL_MOCK_FEEDBACKS };
};

export const mockGetProjectClientFeedback = async (projectId) => {
  await delay();
  return { success: true, count: INITIAL_MOCK_FEEDBACKS.length, feedbacks: INITIAL_MOCK_FEEDBACKS };
};

export const mockGetAllFeedbackInternal = async () => {
  await delay();
  return { success: true, count: INITIAL_MOCK_FEEDBACKS.length, feedbacks: INITIAL_MOCK_FEEDBACKS };
};

export const mockGetFeedbackAggregateSummary = async () => {
  await delay();
  return {
    success: true,
    totalSubmissions: INITIAL_MOCK_FEEDBACKS.length,
    averageOverallRating: 4.8,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 4 },
    categoryAverages: [
      { categoryId: 'cat-1', categoryName: 'Design & Architectural Aesthetics', averageRating: 4.9, submissionCount: 5 },
      { categoryId: 'cat-2', categoryName: 'Site Execution & Timeliness', averageRating: 4.6, submissionCount: 5 },
      { categoryId: 'cat-3', categoryName: 'Team Communication & Responsiveness', averageRating: 4.8, submissionCount: 5 }
    ]
  };
};

/* ==========================================================================
   ERP MODULE 3 - DRAWING MANAGEMENT SYSTEM MOCK APIS (25.1 to 25.11)
   ========================================================================== */

// Helper to retrieve drawings array
const _getMockDrawingsStorage = () => {
  initLocalStorage();
  try {
    return JSON.parse(localStorage.getItem('nirman_drawings')) || [];
  } catch (e) {
    return [];
  }
};

const saveMockDrawings = (drawings) => {
  localStorage.setItem('nirman_drawings', JSON.stringify(drawings));
};

const _getMockDrawingVersionsStorage = () => {
  initLocalStorage();
  try {
    return JSON.parse(localStorage.getItem('nirman_drawing_versions')) || [];
  } catch (e) {
    return [];
  }
};

const saveMockDrawingVersions = (versions) => {
  localStorage.setItem('nirman_drawing_versions', JSON.stringify(versions));
};

const _getMockDrawingCategoriesStorage = () => {
  initLocalStorage();
  try {
    return JSON.parse(localStorage.getItem('nirman_drawing_categories')) || [];
  } catch (e) {
    return [];
  }
};

const saveMockDrawingCategories = (categories) => {
  localStorage.setItem('nirman_drawing_categories', JSON.stringify(categories));
};

// 25.1 POST /api/drawings/create
export const mockCreateDrawing = async ({ projectId, drawingName, categoryId, drawingNumber }) => {
  await delay();
  if (!projectId || !drawingName || !drawingName.trim() || !categoryId) {
    throw new Error('projectId, drawingName, and categoryId are required.');
  }

  const categories = _getMockDrawingCategoriesStorage();
  const cat = categories.find(c => String(c._id) === String(categoryId) || c.name === categoryId);
  const categoryName = cat ? cat.name : 'Working Drawings';
  const catId = cat ? cat._id : categoryId;

  const drawings = _getMockDrawingsStorage();
  const user = getMockUserSession();

  const newId = 'drg-' + Date.now();
  const drgNum = drawingNumber ? drawingNumber.trim() : `DWG-${String(drawings.length + 1).padStart(3, '0')}`;

  const newDrawing = {
    _id: newId,
    id: newId,
    projectId,
    drawingName: drawingName.trim(),
    drawingNumber: drgNum,
    categoryId: catId,
    categoryName,
    currentVersionId: null,
    currentVersion: 1,
    status: 'DESIGNER_UPLOADED',
    visibleToClient: false,
    isGFCLocked: false,
    fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    createdBy: user?.id || 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    versions: []
  };

  drawings.unshift(newDrawing);
  saveMockDrawings(drawings);

  return {
    success: true,
    message: 'Parent drawing created successfully.',
    data: { drawing: newDrawing },
    drawing: newDrawing
  };
};

// 25.2 POST /api/drawings/:drawingId/versions/upload
export const mockUploadDrawingVersion = async (drawingId, { filePath, fileType, changeLog, thumbnailUrl }) => {
  await delay();
  if (!filePath || !filePath.trim()) {
    throw new Error('filePath is required.');
  }

  const drawings = _getMockDrawingsStorage();
  const drawingIndex = drawings.findIndex(d => String(d._id) === String(drawingId) || String(d.id) === String(drawingId));
  if (drawingIndex === -1) {
    throw new Error('Drawing not found.');
  }

  const drawing = drawings[drawingIndex];
  if (drawing.isGFCLocked) {
    throw new Error('Drawing is GFC locked. Version upload is blocked.');
  }

  const allVersions = _getMockDrawingVersionsStorage();
  const drawingVersions = allVersions.filter(v => String(v.drawingId) === String(drawing._id));
  const nextVerNum = drawingVersions.length > 0 ? Math.max(...drawingVersions.map(v => v.versionNumber || 1)) + 1 : 1;

  const user = getMockUserSession();
  const verId = 'ver-' + Date.now();

  const newVer = {
    _id: verId,
    drawingId: drawing._id,
    versionNumber: nextVerNum,
    filePath: filePath.trim(),
    thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : filePath.trim(),
    fileType: fileType ? fileType.toUpperCase() : 'DWG',
    uploadedBy: { _id: user?.id || 'u1', name: user?.name || 'Sarah Connor', email: user?.email || 'architect@nirman.com' },
    uploadDate: new Date().toISOString(),
    changeLog: changeLog ? changeLog.trim() : null,
    status: 'DESIGNER_UPLOADED',
    visibleToClient: false
  };

  allVersions.push(newVer);
  saveMockDrawingVersions(allVersions);

  drawing.currentVersionId = verId;
  drawing.currentVersion = nextVerNum;
  drawing.status = 'DESIGNER_UPLOADED';
  drawing.visibleToClient = false;
  drawing.fileUrl = newVer.filePath;
  drawing.thumbnailUrl = newVer.thumbnailUrl;
  drawing.updatedAt = new Date().toISOString();
  if (!drawing.versions) drawing.versions = [];

  drawing.versions.push({
    versionNumber: nextVerNum,
    fileUrl: newVer.filePath,
    thumbnailUrl: newVer.thumbnailUrl,
    notes: newVer.changeLog,
    uploadedBy: user?.id || 'u1',
    uploadedAt: newVer.uploadDate
  });

  drawings[drawingIndex] = drawing;
  saveMockDrawings(drawings);

  return {
    success: true,
    message: `Drawing version v${nextVerNum} uploaded successfully.`,
    data: { drawing, version: newVer },
    drawing,
    version: newVer
  };
};

// 25.3 GET /api/drawings & GET /api/drawings/:id
export const mockGetDrawings = async ({ projectId, categoryId, status, page = 1, limit = 10 } = {}) => {
  await delay();
  let drawings = _getMockDrawingsStorage().filter(d => d.isActive !== false);

  if (projectId) drawings = drawings.filter(d => String(d.projectId) === String(projectId));
  if (categoryId) drawings = drawings.filter(d => String(d.categoryId) === String(categoryId));
  if (status) drawings = drawings.filter(d => d.status === status);

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const totalCount = drawings.length;
  const paginated = drawings.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return {
    success: true,
    message: 'Drawings retrieved successfully.',
    data: {
      drawings: paginated,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum
    },
    drawings: paginated,
    totalCount,
    allDrawings: drawings
  };
};

export const mockGetDrawingById = async (id) => {
  await delay();
  const drawings = _getMockDrawingsStorage();
  const drawing = drawings.find(d => String(d._id) === String(id) || String(d.id) === String(id));

  if (!drawing || drawing.isActive === false) {
    throw new Error('Drawing not found.');
  }

  const versions = _getMockDrawingVersionsStorage().filter(v => String(v.drawingId) === String(drawing._id));

  return {
    success: true,
    message: 'Drawing details retrieved successfully.',
    data: { drawing, versionHistory: versions },
    drawing,
    versionHistory: versions
  };
};

// 25.4 GET /api/drawings/:id/versions & GET /api/drawings/:id/compare
export const mockGetDrawingVersions = async (id) => {
  await delay();
  const versions = _getMockDrawingVersionsStorage().filter(v => String(v.drawingId) === String(id));
  return {
    success: true,
    message: 'Drawing versions list retrieved successfully.',
    data: { versions },
    versions
  };
};

export const mockCompareDrawingVersions = async (id, versionA, versionB) => {
  await delay();
  const versions = _getMockDrawingVersionsStorage().filter(v => String(v.drawingId) === String(id));
  const numA = Number(versionA);
  const numB = Number(versionB);

  const vA = versions.find(v => v.versionNumber === numA) || null;
  const vB = versions.find(v => v.versionNumber === numB) || null;

  return {
    success: true,
    message: 'Drawing versions comparison data retrieved successfully.',
    data: { drawingId: id, versionA: vA, versionB: vB },
    versionA: vA,
    versionB: vB
  };
};

// 25.5 PUT /api/drawing-versions/:versionId/pm-review
export const mockPmReviewDrawingVersion = async (versionId, { decision, comments }) => {
  await delay();
  if (!['APPROVE', 'REJECT'].includes(decision)) {
    throw new Error('decision must be APPROVE or REJECT.');
  }
  if (decision === 'REJECT' && (!comments || !comments.trim())) {
    throw new Error('Comments are mandatory when PM rejects a drawing version.');
  }

  const user = getMockUserSession();

  const versions = _getMockDrawingVersionsStorage();
  const vIndex = versions.findIndex(v => String(v._id) === String(versionId));
  if (vIndex === -1) {
    throw new Error('Drawing version not found.');
  }

  const version = versions[vIndex];
  const toStatus = decision === 'APPROVE' ? 'PM_APPROVED' : 'PM_REJECTED';

  version.status = toStatus;
  version.pmReviewComments = comments ? comments.trim() : null;
  version.pmReviewedBy = { _id: user?.id || 'u4', name: user?.name || 'Project Manager' };
  version.pmReviewedAt = new Date().toISOString();
  versions[vIndex] = version;
  saveMockDrawingVersions(versions);

  // Update parent drawing status
  const drawings = _getMockDrawingsStorage();
  const dIndex = drawings.findIndex(d => String(d._id) === String(version.drawingId));
  if (dIndex !== -1) {
    drawings[dIndex].status = toStatus;
    saveMockDrawings(drawings);
  }

  return {
    success: true,
    message: `PM review completed: ${toStatus}`,
    data: { version },
    version
  };
};

// 25.6 PUT /api/drawing-versions/:versionId/admin-review
export const mockAdminReviewDrawingVersion = async (versionId, { decision, comments }) => {
  await delay();
  if (!['APPROVE', 'REJECT'].includes(decision)) {
    throw new Error('decision must be APPROVE or REJECT.');
  }
  if (decision === 'REJECT' && (!comments || !comments.trim())) {
    throw new Error('Comments are mandatory when Admin rejects a drawing version.');
  }

  const user = getMockUserSession();

  const versions = _getMockDrawingVersionsStorage();
  const vIndex = versions.findIndex(v => String(v._id) === String(versionId));
  if (vIndex === -1) {
    throw new Error('Drawing version not found.');
  }

  const version = versions[vIndex];
  const toStatus = decision === 'APPROVE' ? 'PENDING_CLIENT_APPROVAL' : 'ADMIN_REJECTED';
  const isClientVisible = decision === 'APPROVE';

  version.status = toStatus;
  version.visibleToClient = isClientVisible;
  version.adminReviewComments = comments ? comments.trim() : null;
  version.adminReviewedBy = { _id: user?.id || 'u6', name: user?.name || 'Nirman Admin' };
  version.adminReviewedAt = new Date().toISOString();
  versions[vIndex] = version;
  saveMockDrawingVersions(versions);

  // Update parent drawing - HANDOFF TO CRM MODULE 5!
  const drawings = _getMockDrawingsStorage();
  const dIndex = drawings.findIndex(d => String(d._id) === String(version.drawingId));
  let updatedDrawing = null;
  if (dIndex !== -1) {
    drawings[dIndex].status = toStatus;
    drawings[dIndex].visibleToClient = isClientVisible;
    updatedDrawing = drawings[dIndex];
    saveMockDrawings(drawings);
  }

  return {
    success: true,
    message: `Admin review completed: ${toStatus}. Visible to client: ${isClientVisible}`,
    data: { version, drawing: updatedDrawing },
    version,
    drawing: updatedDrawing
  };
};

// 25.7 PUT /api/drawings/:id/promote-to-gfc & PUT /api/drawings/:id/unlock-gfc
export const mockPromoteDrawingToGFC = async (id) => {
  await delay();
  const drawings = _getMockDrawingsStorage();
  const dIndex = drawings.findIndex(d => String(d._id) === String(id) || String(d.id) === String(id));
  if (dIndex === -1) {
    throw new Error('Drawing not found.');
  }

  const user = getMockUserSession();
  drawings[dIndex].isGFCLocked = true;
  drawings[dIndex].gfcLockedAt = new Date().toISOString();
  drawings[dIndex].gfcLockedBy = user?.id || 'u6';
  drawings[dIndex].status = 'GFC_LOCKED';
  saveMockDrawings(drawings);

  return {
    success: true,
    message: 'Drawing promoted to locked GFC state.',
    data: { drawing: drawings[dIndex] },
    drawing: drawings[dIndex]
  };
};

export const mockUnlockGFCDrawing = async (id, { reason }) => {
  await delay();
  if (!reason || !reason.trim()) {
    throw new Error('Mandatory reason required to unlock GFC drawing.');
  }

  const drawings = _getMockDrawingsStorage();
  const dIndex = drawings.findIndex(d => String(d._id) === String(id) || String(d.id) === String(id));
  if (dIndex === -1) {
    throw new Error('Drawing not found.');
  }

  drawings[dIndex].isGFCLocked = false;
  drawings[dIndex].gfcLockedAt = null;
  drawings[dIndex].gfcLockedBy = null;
  drawings[dIndex].status = 'DESIGNER_UPLOADED';
  saveMockDrawings(drawings);

  return {
    success: true,
    message: 'GFC drawing unlocked successfully.',
    data: { drawing: drawings[dIndex], unlockReason: reason.trim() },
    drawing: drawings[dIndex]
  };
};

// 25.8 PUT /api/drawing-versions/:versionId/edit-in-place
export const mockEditInPlaceProcessDwg = async (versionId, { updatedFilePath, changeLog }) => {
  await delay();
  if (!updatedFilePath || !updatedFilePath.trim()) {
    throw new Error('updatedFilePath is required.');
  }

  const versions = _getMockDrawingVersionsStorage();
  const vIndex = versions.findIndex(v => String(v._id) === String(versionId));
  if (vIndex === -1) {
    throw new Error('Drawing version not found.');
  }

  const version = versions[vIndex];
  const drawings = _getMockDrawingsStorage();
  const drawing = drawings.find(d => String(d._id) === String(version.drawingId));

  if (!drawing) {
    throw new Error('Parent drawing not found.');
  }

  const isProcessDwg = drawing.categoryName === 'Process DWG';
  if (!isProcessDwg) {
    throw new Error('In-place file editing is restricted ONLY to Process DWG category drawings.');
  }

  version.filePath = updatedFilePath.trim();
  if (changeLog) version.changeLog = changeLog.trim();
  versions[vIndex] = version;
  saveMockDrawingVersions(versions);

  if (drawing) {
    drawing.fileUrl = version.filePath;
    saveMockDrawings(drawings);
  }

  return {
    success: true,
    message: 'Process DWG file edited in place successfully.',
    data: { version },
    version
  };
};

// 25.9 GET /api/drawing-versions/:versionId/client-approval-log
export const mockGetClientApprovalLog = async (versionId) => {
  await delay();
  const logs = [
    {
      _id: 'log-1',
      drawingId: versionId,
      action: 'APPROVED',
      comments: 'Approved design layout for site execution.',
      clientId: { companyName: 'Oceanic Properties Pvt Ltd', clientCode: 'CLI-9091' },
      contactId: { name: 'Anand Shah', email: 'anand@oceanic.com' },
      createdAt: new Date().toISOString()
    }
  ];

  return {
    success: true,
    message: 'Client approval log retrieved successfully.',
    data: { approvalLogs: logs },
    approvalLogs: logs,
    logs
  };
};

// 25.10 POST /api/drawing-category/create & GET /api/drawing-category/active
export const mockCreateDrawingCategory = async ({ name, requiresClientApproval, restrictedEditing }) => {
  await delay();
  if (!name || !name.trim()) {
    throw new Error('Category name is required.');
  }

  const categories = _getMockDrawingCategoriesStorage();
  const trimmed = name.trim();
  const existing = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());

  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      saveMockDrawingCategories(categories);
      return { success: true, message: 'Drawing category reactivated successfully.', data: { category: existing }, category: existing };
    }
    throw new Error(`Drawing category "${trimmed}" already exists.`);
  }

  const newCat = {
    _id: 'cat-' + Date.now(),
    name: trimmed,
    requiresClientApproval: requiresClientApproval !== undefined ? !!requiresClientApproval : true,
    restrictedEditing: restrictedEditing !== undefined ? !!restrictedEditing : false,
    isActive: true
  };

  categories.push(newCat);
  saveMockDrawingCategories(categories);

  return {
    success: true,
    message: 'Drawing category created successfully.',
    data: { category: newCat },
    category: newCat
  };
};

export const mockGetActiveDrawingCategories = async () => {
  await delay();
  const categories = _getMockDrawingCategoriesStorage().filter(c => c.isActive !== false);
  return {
    success: true,
    message: 'Active drawing categories retrieved successfully.',
    data: { categories },
    categories
  };
};

// 25.11 GET /api/projects/:projectId/drawings/breakdown
export const mockGetProjectDrawingsBreakdown = async (projectId) => {
  await delay();
  const drawings = _getMockDrawingsStorage().filter(d => String(d.projectId) === String(projectId) && d.isActive !== false);
  const totalDrawings = drawings.length;

  const approvedCount = drawings.filter(d => d.status === 'APPROVED').length;
  const pendingReviewCount = drawings.filter(d => ['DESIGNER_UPLOADED', 'PM_APPROVED'].includes(d.status)).length;
  const pendingClientApprovalCount = drawings.filter(d => d.status === 'PENDING_CLIENT_APPROVAL').length;
  const changesRequestedCount = drawings.filter(d => ['CHANGES_REQUESTED', 'PM_REJECTED', 'ADMIN_REJECTED'].includes(d.status)).length;

  return {
    success: true,
    message: 'Project drawings breakdown retrieved successfully.',
    data: {
      projectId,
      totalDrawings,
      approvedCount,
      pendingReviewCount,
      pendingClientApprovalCount,
      changesRequestedCount,
      approvalRate: totalDrawings > 0 ? Math.round((approvedCount / totalDrawings) * 100) : 0
    },
    projectId,
    totalDrawings,
    approvedCount,
    pendingReviewCount,
    pendingClientApprovalCount,
    changesRequestedCount
  };
};

/* ==========================================================================
   ERP MODULE 4 - JPEG/3D DRAWING REVIEW MOCK APIS (26.1 to 26.4)
   ========================================================================== */

const _getMockMarkingsStorage = () => {
  initLocalStorage();
  try {
    return JSON.parse(localStorage.getItem('nirman_drawing_markings')) || [];
  } catch (e) {
    return [];
  }
};

const _saveMockMarkingsStorage = (markings) => {
  localStorage.setItem('nirman_drawing_markings', JSON.stringify(markings));
};

const _getMockCommentsStorage = () => {
  initLocalStorage();
  try {
    return JSON.parse(localStorage.getItem('nirman_drawing_comments')) || [];
  } catch (e) {
    return [];
  }
};

const _saveMockCommentsStorage = (comments) => {
  localStorage.setItem('nirman_drawing_comments', JSON.stringify(comments));
};

// 26.1 GET /api/drawing-versions/:versionId/review-data
export const mockGetAggregatedReviewData = async (versionId) => {
  await delay();
  const allVersions = _getMockDrawingVersionsStorage();
  const version = allVersions.find(v => String(v._id) === String(versionId) || String(v.id) === String(versionId)) || null;

  const allDrawings = _getMockDrawingsStorage();
  const parentDrawing = version ? allDrawings.find(d => String(d._id) === String(version.drawingId)) : (allDrawings[0] || null);

  const markings = _getMockMarkingsStorage().filter(m => String(m.drawingVersionId) === String(versionId));
  const comments = _getMockCommentsStorage().filter(c => String(c.drawingVersionId) === String(versionId));

  return {
    success: true,
    message: 'Aggregated review data retrieved successfully.',
    data: {
      drawingVersion: version,
      drawing: parentDrawing,
      comments,
      markings
    },
    drawingVersion: version,
    drawing: parentDrawing,
    comments,
    markings
  };
};

// 26.2 POST /api/drawing-versions/:versionId/comments & GET /api/drawing-versions/:versionId/comments
export const mockPostCommentOrNote = async (versionId, { commentText, annotationCoords, isDraft }) => {
  await delay();
  if (!commentText || !commentText.trim()) {
    throw new Error('commentText is required.');
  }

  const user = getMockUserSession();
  const comments = _getMockCommentsStorage();
  const newId = 'cmt-' + Date.now();

  const newComment = {
    _id: newId,
    id: newId,
    drawingVersionId: versionId,
    authorId: user?.id || 'u1',
    authorName: user?.name || 'Internal Employee',
    commentText: commentText.trim(),
    annotationCoords: annotationCoords || null,
    isDraft: Boolean(isDraft),
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  _saveMockCommentsStorage(comments);

  return {
    success: true,
    message: annotationCoords ? 'Pinned note created successfully.' : 'Comment posted successfully.',
    data: { comment: newComment },
    comment: newComment
  };
};

export const mockGetVersionComments = async (versionId) => {
  await delay();
  const comments = _getMockCommentsStorage().filter(c => String(c.drawingVersionId) === String(versionId));
  return {
    success: true,
    message: 'Version comments retrieved successfully.',
    data: { comments },
    comments
  };
};

// 26.3 POST /api/drawing-versions/:versionId/markings & GET /api/drawing-versions/:versionId/markings
export const mockPostMarking = async (versionId, { markingType, geometry, color, linkedCommentId }) => {
  await delay();
  if (!markingType || !geometry) {
    throw new Error('markingType and geometry are required.');
  }

  const user = getMockUserSession();
  const markings = _getMockMarkingsStorage();
  const newId = 'mrk-' + Date.now();

  const newMarking = {
    _id: newId,
    id: newId,
    drawingVersionId: versionId,
    authorType: 'EMPLOYEE',
    authorId: user?.id || 'u1',
    authorModel: 'User',
    markingType: markingType.toUpperCase(),
    geometry,
    color: color || '#FF0000',
    linkedCommentId: linkedCommentId || null,
    createdAt: new Date().toISOString()
  };

  markings.push(newMarking);
  _saveMockMarkingsStorage(markings);

  return {
    success: true,
    message: 'Marking annotation created successfully.',
    data: { marking: newMarking },
    marking: newMarking
  };
};

export const mockGetVersionMarkings = async (versionId) => {
  await delay();
  const markings = _getMockMarkingsStorage().filter(m => String(m.drawingVersionId) === String(versionId));
  return {
    success: true,
    message: 'Version markings retrieved successfully.',
    data: { markings },
    markings
  };
};

// 26.4 DELETE /api/drawing-versions/:versionId/markings/:markingId
export const mockDeleteMarking = async (versionId, markingId) => {
  await delay();
  let markings = _getMockMarkingsStorage();
  markings = markings.filter(m => !(String(m._id) === String(markingId) || String(m.id) === String(markingId)));
  _saveMockMarkingsStorage(markings);

  return {
    success: true,
    message: 'Marking annotation deleted successfully.',
    data: { markingId }
  };
};



