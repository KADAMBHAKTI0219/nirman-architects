/**
 * NIRMAN ARCHITECTS - Desktop Attendance & Workstation App Usage Agent (Windows)
 * 
 * Location: src/service/desktop-agent.js
 * 
 * Instructions:
 * 1. Install dependencies: npm install axios
 * 2. Run: node src/service/desktop-agent.js
 * 
 * Features:
 * - Auto Clock-In / Clock-Out on System Boot & Shutdown.
 * - Workstation Active Application & Idle Monitoring (5-second polling).
 * - 5-Minute Batch Sync to /api/app-usage/sync with offline fallback buffer.
 */

const axios = require('axios');
const readline = require('readline');
const { exec } = require('child_process');

// Config parameters
const BACKEND_URL = 'https://nirman-architects.onrender.com/api';
let USER_TOKEN = ''; 
let DEVICE_ID = 'c5dbdd5f-e416-479b-aa77-12c661c48bcb'; // Windows MachineGuid
let CURRENT_USER_ID = null;
let CURRENT_ATTENDANCE_ID = null;

// Tracking state
let appUsageBuffer = {}; // { 'AutoCAD': { secondsActive: 300, windowTitle: 'Project_Design.dwg' } }
let offlineBatchQueue = [];
let pollIntervalSeconds = 5;
let syncIntervalMinutes = 5;
let captureWindowTitle = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("====================================================");
console.log("  Nirman Architects - Desktop Agent & App Tracker V2.0 ");
console.log("====================================================");

const authenticate = () => {
  rl.question('Enter corporate email: ', (email) => {
    rl.question('Enter password: ', async (password) => {
      try {
        console.log("\nAuthenticating with backend server...");
        const response = await axios.post(`${BACKEND_URL}/login`, { email, password });
        if (response.data?.success && response.data?.token) {
          USER_TOKEN = response.data.token;
          CURRENT_USER_ID = response.data.user?.id || response.data.user?._id;
          DEVICE_ID = response.data.user?.registeredDeviceId || DEVICE_ID;
          console.log(`\n[SUCCESS] Authentication complete! Logged in as: ${response.data.user.name}`);
          console.log(`[DEVICE] Registered primary device GUID: ${DEVICE_ID}`);
          rl.close();
          startAgent();
        } else {
          console.log("\n[ERROR] Login failed: Invalid credentials.");
          authenticate();
        }
      } catch (err) {
        console.error("\n[ERROR] Connection failed:", err.response?.data?.message || err.message);
        console.log("[INFO] Proceeding in offline agent simulation mode...");
        rl.close();
        startAgent();
      }
    });
  });
};

authenticate();

async function fetchRemoteConfig() {
  try {
    const res = await axios.get(`${BACKEND_URL}/app-usage/config`, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    if (res.data?.success && res.data?.data) {
      pollIntervalSeconds = res.data.data.pollIntervalSeconds || 5;
      syncIntervalMinutes = res.data.data.syncIntervalMinutes || 5;
      captureWindowTitle = !!res.data.data.captureWindowTitle;
      console.log(`[CONFIG SYNC] Poll: ${pollIntervalSeconds}s | Sync: ${syncIntervalMinutes}m | Title Capture: ${captureWindowTitle}`);
    }
  } catch (err) {
    console.warn("[CONFIG WARN] Could not fetch remote config, using defaults.");
  }
}

async function startAgent() {
  await fetchRemoteConfig();
  
  console.log("\n[BOOT] Triggering Auto Windows Logon Clock-In...");
  await sendClockEvent('CLOCK_IN', 'SYSTEM_BOOT');

  // Start 5-second polling loop for active windows / applications
  startAppPollingLoop();

  // Start 5-minute batch sync loop to flush metrics to backend
  startAppSyncLoop();

  // Heartbeat loop every 2 minutes
  let lastActivityTime = Date.now();
  const heartbeatId = setInterval(async () => {
    const isIdle = (Date.now() - lastActivityTime) > 300000;
    if (!isIdle) {
      console.log(`[HEARTBEAT] Pinged at: ${new Date().toLocaleTimeString()}`);
      try {
        await axios.post(`${BACKEND_URL}/attendance/heartbeat`, 
          { deviceId: DEVICE_ID }, 
          { headers: { Authorization: `Bearer ${USER_TOKEN}` } }
        );
      } catch (err) {
        console.error("[HEARTBEAT ERROR]", err.response?.data?.message || err.message);
      }
    }
  }, 120000);

  // Catch OS Shutdown or termination pings to send CLOCK_OUT
  const handleShutdown = async () => {
    console.log("\n\n[SHUTDOWN] OS Shutdown / Logoff detected. Flushing final app batch & sending Auto Clock-Out...");
    clearInterval(heartbeatId);
    await flushAppUsageBatch(true);
    await sendClockEvent('CLOCK_OUT', 'SYSTEM_SHUTDOWN');
    process.exit(0);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

function getActiveWindowProcess() {
  return new Promise((resolve) => {
    const psCommand = `powershell -NoProfile -Command "$code = '[DllImport(\\"user32.dll\\")] public static extern IntPtr GetForegroundWindow(); [DllImport(\\"user32.dll\\")] public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);'; Add-Type -MemberDefinition $code -Name Win32 -Namespace Native; $hwnd = [Native.Win32]::GetForegroundWindow(); $pidOut = 0; [Native.Win32]::GetWindowThreadProcessId($hwnd, [ref]$pidOut); if ($pidOut -gt 0) { $proc = Get-Process -Id $pidOut -ErrorAction SilentlyContinue; if ($proc) { Write-Output ($proc.ProcessName + '|' + $proc.MainWindowTitle) } }"`;
    
    exec(psCommand, { timeout: 3000 }, (err, stdout) => {
      if (err || !stdout.trim()) {
        resolve({ appName: 'Workstation Idle', windowTitle: '' });
        return;
      }
      const parts = stdout.trim().split('|');
      const processName = parts[0] || 'Unknown';
      const windowTitle = parts[1] || '';
      
      let cleanAppName = processName;
      if (processName.toLowerCase().includes('chrome')) cleanAppName = 'Google Chrome';
      else if (processName.toLowerCase().includes('code')) cleanAppName = 'Visual Studio Code';
      else if (processName.toLowerCase().includes('acad') || processName.toLowerCase().includes('autocad')) cleanAppName = 'AutoCAD';
      else if (processName.toLowerCase().includes('revit')) cleanAppName = 'Autodesk Revit';
      else if (processName.toLowerCase().includes('slack')) cleanAppName = 'Slack';
      else if (processName.toLowerCase().includes('devenv')) cleanAppName = 'Visual Studio';
      else if (processName.toLowerCase().includes('excel')) cleanAppName = 'Microsoft Excel';

      resolve({ appName: cleanAppName, windowTitle: captureWindowTitle ? windowTitle : '' });
    });
  });
}

function startAppPollingLoop() {
  console.log(`[APP TRACKER] Polling active desktop window every ${pollIntervalSeconds}s...`);
  setInterval(async () => {
    try {
      const activeInfo = await getActiveWindowProcess();
      const name = activeInfo.appName || 'Idle';
      
      if (!appUsageBuffer[name]) {
        appUsageBuffer[name] = { secondsActive: 0, windowTitle: activeInfo.windowTitle };
      }
      appUsageBuffer[name].secondsActive += pollIntervalSeconds;
      if (activeInfo.windowTitle) {
        appUsageBuffer[name].windowTitle = activeInfo.windowTitle;
      }
    } catch (e) {
      // Fallback
    }
  }, pollIntervalSeconds * 1000);
}

function startAppSyncLoop() {
  console.log(`[APP TRACKER] Batch sync scheduler initialized for every ${syncIntervalMinutes}m.`);
  setInterval(async () => {
    await flushAppUsageBatch(false);
  }, syncIntervalMinutes * 60 * 1000);
}

async function flushAppUsageBatch(isFinal = false) {
  const currentBuffer = { ...appUsageBuffer };
  appUsageBuffer = {}; // Reset buffer

  const appUsage = Object.entries(currentBuffer).map(([appName, data]) => ({
    appName,
    secondsActive: data.secondsActive,
    windowTitle: data.windowTitle || null
  })).filter(item => item.secondsActive > 0);

  if (appUsage.length === 0) return;

  const payload = {
    userId: CURRENT_USER_ID,
    attendanceId: CURRENT_ATTENDANCE_ID || 'att_session_auto',
    appUsage,
    isOfflineSync: false
  };

  console.log(`\n[SYNC BATCH] Flushing 5-minute desktop application batch (${appUsage.length} apps tracked)...`);

  try {
    const res = await axios.post(`${BACKEND_URL}/app-usage/sync`, payload, {
      headers: { Authorization: `Bearer ${USER_TOKEN}` }
    });
    console.log(`[SYNC SUCCESS] Backend Response: ${res.data?.message || 'Synced successfully.'}`);

    if (offlineBatchQueue.length > 0) {
      console.log(`[OFFLINE SYNC] Flushing ${offlineBatchQueue.length} queued offline batches...`);
      while (offlineBatchQueue.length > 0) {
        const queued = offlineBatchQueue.shift();
        queued.isOfflineSync = true;
        await axios.post(`${BACKEND_URL}/app-usage/sync`, queued, {
          headers: { Authorization: `Bearer ${USER_TOKEN}` }
        }).catch(err => console.error("[OFFLINE SYNC ERR]", err.message));
      }
    }
  } catch (err) {
    console.error(`[SYNC FAILED] ${err.response?.data?.message || err.message}`);
    payload.isOfflineSync = true;
    offlineBatchQueue.push(payload);
    console.log(`[OFFLINE QUEUE] Saved batch to offline queue (Total queued: ${offlineBatchQueue.length})`);
  }
}

async function sendClockEvent(type, source) {
  try {
    const response = await axios.post(`${BACKEND_URL}/attendance/office/event`, 
      {
        deviceId: DEVICE_ID,
        type,
        source,
        time: new Date().toISOString()
      },
      { headers: { Authorization: `Bearer ${USER_TOKEN}` } }
    );
    if (response.data?.attendanceId) {
      CURRENT_ATTENDANCE_ID = response.data.attendanceId;
    }
    console.log(`[EVENT SYNC] ${type} logged via ${source} -> ${response.data?.message || 'OK'}`);
  } catch (err) {
    console.error(`[EVENT ERROR] Failed to send ${type}:`, err.response?.data?.message || err.message);
    CURRENT_ATTENDANCE_ID = CURRENT_ATTENDANCE_ID || 'att_session_auto';
  }
}
