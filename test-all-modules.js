// Setup minimal browser-like environment for Node execution FIRST before imports
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
}

global.localStorage = new LocalStorageMock();
if (typeof window === 'undefined') {
  global.window = { location: { href: '' } };
}

async function runSuite() {
  const {
    login,
    getUsers,
    applyLeave,
    getMyLeaves,
    getPendingLeaveRequests,
    createLeaveType,
    getActiveLeaveTypes,
    getAttendanceStatus,
    clockOffice,
    registerDevice,
    getDeviceStatus,
    getNotifications,
    saveSiteLocation,
    getSiteLocations
  } = await import('./src/mockApi.js');

  console.log("=================================================");
  console.log("  Nirman Architects - Automated Module Testing   ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function assert(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ✗ ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Auth Module Tests
  await assert('Auth: User Login', async () => {
    const res = await login('admin@nirman.com', 'Password123!');
    if (!res.success || !res.token) throw new Error("Login failed");
  });

  await assert('User Management: Get Users List', async () => {
    const res = await getUsers();
    if (!res.success || !Array.isArray(res.users)) throw new Error("Fetch users failed");
  });

  // 2. Leave Module Tests
  await assert('Leave: Get Active Leave Types', async () => {
    const res = await getActiveLeaveTypes();
    if (!res.success || !Array.isArray(res.leaveTypes)) throw new Error("Fetch leave types failed");
  });

  await assert('Leave: Create New Dynamic Leave Type', async () => {
    const res = await createLeaveType({ name: 'Study Leave', code: 'STUDY', defaultQuota: 10 });
    if (!res.success || !res.leaveType) throw new Error("Create leave type failed");
  });

  await assert('Leave: Apply for Leave', async () => {
    const res = await applyLeave({ leaveTypeId: 'leave-sick', fromDate: '2026-09-01', toDate: '2026-09-02', reason: 'Medical' });
    if (!res.success || !res.request) throw new Error("Apply leave failed");
  });

  await assert('Leave: Get Own Leave Balances', async () => {
    const res = await getMyLeaves(2026);
    if (!res.success || !Array.isArray(res.balances)) throw new Error("Fetch my leaves failed");
  });

  await assert('Leave: Get Pending Requests Queue', async () => {
    const res = await getPendingLeaveRequests();
    if (!res.success || !Array.isArray(res.requests)) throw new Error("Fetch pending requests failed");
  });

  // 3. Attendance Module Tests
  await assert('Attendance: Office Clock-In Event', async () => {
    const res = await clockOffice('u1', 'dev-1', 'CLOCK_IN', 'SYSTEM_BOOT');
    if (!res.success || !res.log) throw new Error("Clock in failed");
  });

  await assert('Attendance: Get Today Status', async () => {
    const res = await getAttendanceStatus('u1');
    if (!res.success) throw new Error("Get attendance status failed");
  });

  // 4. Device Binding Module Tests
  await assert('Device: Register Device ID', async () => {
    const res = await registerDevice('u1', 'GUID-12345-67890');
    if (!res.success || !res.data) throw new Error("Device registration failed");
  });

  await assert('Device: Get Device Status', async () => {
    const res = await getDeviceStatus('u1');
    if (!res.success) throw new Error("Get device status failed");
  });

  // 5. Site Geofence Module Tests
  await assert('Site: Configure Geo-Fence Location', async () => {
    const res = await saveSiteLocation('proj-101', 23.0225, 72.5714, 150);
    if (!res.success || !res.location) throw new Error("Save site location failed");
  });

  await assert('Site: Fetch All Geo-Fences', async () => {
    const res = await getSiteLocations();
    if (!res.success || !Array.isArray(res.locations)) throw new Error("Get site locations failed");
  });

  // 6. Notifications Module Tests
  await assert('Notifications: Fetch Alerts', async () => {
    const res = await getNotifications();
    if (!res.success || !Array.isArray(res.notifications)) throw new Error("Fetch notifications failed");
  });

  console.log(`\n=================================================`);
  console.log(`  Test Execution Summary: ${passed} Passed, ${failed} Failed `);
  console.log(`=================================================`);

  if (failed > 0) process.exit(1);
}

runSuite();
