/**
 * NIRMAN ARCHITECTS - Desktop Attendance Agent (Windows)
 * 
 * Instructions:
 * 1. Install dependencies: npm install axios
 * 2. Run: node desktop-agent.js
 * 
 * To automate on Windows logon:
 * Add this script to Windows Task Scheduler triggered "On workstation unlock" or "At log on".
 */

const axios = require('axios');
const readline = require('readline');

// Config parameters
const BACKEND_URL = 'https://nirman-architects.onrender.com/api';
let USER_TOKEN = ''; 
let DEVICE_ID = 'c5dbdd5f-e416-479b-aa77-12c661c48bcb'; // Windows MachineGuid

// Read login credentials to fetch JWT token
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("====================================================");
console.log("  Nirman Architects - Desktop Attendance Agent V1.0 ");
console.log("====================================================");

const authenticate = () => {
  rl.question('Enter corporate email: ', (email) => {
    rl.question('Enter password: ', async (password) => {
      try {
        console.log("\nAuthenticating with Render backend...");
        const response = await axios.post(`${BACKEND_URL}/login`, { email, password });
        if (response.data?.success && response.data?.token) {
          USER_TOKEN = response.data.token;
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
        authenticate();
      }
    });
  });
};

authenticate();

async function startAgent() {
  console.log("\n[BOOT] Triggering Auto Windows Logon Clock-In...");
  await sendClockEvent('CLOCK_IN', 'SYSTEM_BOOT');

  // Activity & Heartbeat Loop
  let lastActivityTime = Date.now();
  
  // Simulated activity tracking (listening to stdin or mouse/keyboard pings)
  console.log("\n[MONITOR] Tracking desktop keyboard & mouse heartbeat... (Press Ctrl+C to simulate Shutdown Logoff)");
  
  // Heartbeat loop every 2 minutes
  const intervalId = setInterval(async () => {
    // Check if idle threshold reached (e.g. 5 minutes)
    const isIdle = (Date.now() - lastActivityTime) > 300000;
    
    if (!isIdle) {
      console.log(`[HEARTBEAT] Pinged at: ${new Date().toLocaleTimeString()} (Active state: OK)`);
      try {
        await axios.post(`${BACKEND_URL}/attendance/heartbeat`, 
          { deviceId: DEVICE_ID }, 
          { headers: { Authorization: `Bearer ${USER_TOKEN}` } }
        );
      } catch (err) {
        console.error("[HEARTBEAT ERROR]", err.response?.data?.message || err.message);
      }
    } else {
      console.log(`[HEARTBEAT] Skipped at: ${new Date().toLocaleTimeString()} (Idle state detected)`);
    }
  }, 120000);

  // Catch OS Shutdown or termination pings to send CLOCK_OUT
  const handleShutdown = async () => {
    console.log("\n\n[SHUTDOWN] OS Shutdown / Logoff detected. Sending Auto Clock-Out...");
    clearInterval(intervalId);
    await sendClockEvent('CLOCK_OUT', 'SYSTEM_SHUTDOWN');
    process.exit(0);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
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
    console.log(`[EVENT SYNC] ${type} logged via ${source} -> ${response.data.message}`);
  } catch (err) {
    console.error(`[EVENT ERROR] Failed to send ${type}:`, err.response?.data?.message || err.message);
  }
}
