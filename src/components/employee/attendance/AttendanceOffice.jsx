import React, { useState, useEffect } from 'react';
import { Laptop, Clock, ArrowRight, ShieldCheck, Power, AlertCircle, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';
import Card from '../../common/Card';
import { getMyAttendance } from '../../../service/hrm/attendance';
import { parseIndexedObjectToArray } from '../../../service/hrm/leave';
import { registerDevice, getDeviceStatus, sendDeviceHeartbeat } from '../../../service/hrm/device';

export default function AttendanceOffice() {
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Device Binding State
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: 'c5dbdd5f-e416-479b-aa77-12c661c48bcb',
    status: 'APPROVED',
    online: true,
    lastSeen: new Date().toLocaleTimeString()
  });

  const fetchOfficeLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyAttendance();
      const rawLogs = parseIndexedObjectToArray(response.logs || response.data || response);
      if (rawLogs) {
        const mappedLogs = [];
        rawLogs.forEach(log => {
          if (log.clockInTime || log.loginTime || log.createdAt) {
            mappedLogs.push({
              id: (log._id || log.id) + '_in',
              time: log.clockInTime || log.loginTime || log.createdAt,
              type: 'CLOCK_IN',
              deviceId: log.deviceId || 'N/A',
              source: log.isOfflineEntry ? 'OFFLINE_SYNC' : 'SYSTEM_BOOT'
            });
          }
          if (log.clockOutTime || log.logoutTime) {
            mappedLogs.push({
              id: (log._id || log.id) + '_out',
              time: log.clockOutTime || log.logoutTime,
              type: 'CLOCK_OUT',
              deviceId: log.deviceId || 'N/A',
              source: log.autoClosed ? 'HEARTBEAT_TIMEOUT' : 'SYSTEM_SHUTDOWN'
            });
          }
        });
        mappedLogs.sort((a, b) => new Date(b.time) - new Date(a.time));
        setSessionLogs(mappedLogs);
      }
    } catch (err) {
      console.error("Failed to load personal office logs:", err);
      setError("Could not retrieve laptop session logs.");
    } finally {
      setLoading(false);
    }
  };

  // Device Binding & Heartbeat logic
  const initDeviceBinding = async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = user.id || user._id || 'u2';
    const deviceId = 'c5dbdd5f-e416-479b-aa77-12c661c48bcb'; // Machine GUID

    try {
      // 1. Auto Register Device
      const regRes = await registerDevice({ deviceId, userId });
      
      // 2. Fetch Device Status
      const statusRes = await getDeviceStatus(userId);
      if (statusRes?.success) {
        setDeviceInfo({
          deviceId: statusRes.deviceId || deviceId,
          status: statusRes.deviceStatus || 'APPROVED',
          online: statusRes.online !== undefined ? statusRes.online : true,
          lastSeen: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      console.warn("Device binding initialization notice:", err);
    }
  };

  useEffect(() => {
    fetchOfficeLogs();
    initDeviceBinding();

    // 30-Second Desktop Agent Heartbeat Ping
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const userId = user.id || user._id || 'u2';

    const heartbeatTimer = setInterval(async () => {
      try {
        const hbRes = await sendDeviceHeartbeat({
          deviceId: 'c5dbdd5f-e416-479b-aa77-12c661c48bcb',
          clientTime: new Date().toISOString(),
          userId
        });
        if (hbRes?.success) {
          setDeviceInfo(prev => ({
            ...prev,
            online: true,
            lastSeen: new Date().toLocaleTimeString()
          }));
        }
      } catch (err) {
        console.warn("Heartbeat ping warning:", err);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(heartbeatTimer);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Laptop connection details & Device Binding Status Widget */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Device Sync card */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Workstation Device Binding</span>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl shrink-0">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <strong className="text-slate-900 text-xs font-black block">Windows 11 Corporate Laptop</strong>
              <span className="text-[11px] text-slate-500 block font-mono">GUID: {deviceInfo.deviceId}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              deviceInfo.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              Binding: {deviceInfo.status}
            </span>

            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              <span>30s Agent Ping Active (Last: {deviceInfo.lastSeen})</span>
            </div>
          </div>
        </div>

        {/* Auto rules description */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">Auto Check-in Triggers & SLA</span>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Attendance starts automatically when your registered workstation boots up (`SYSTEM_BOOT`). 
            The 30-second Desktop Agent heartbeat maintains your active status. Logging off or shutting down (`SYSTEM_SHUTDOWN`) registers your punch-out automatically.
          </p>
        </div>

      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Sessions Table log */}
      <Card title="Corporate Laptop Session Timeline" subtitle="Verified boot up registries synced with office attendance routers">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 font-bold text-xs text-slate-400">Loading timeline logs...</div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3">Session Date</th>
                  <th className="px-4 py-3">Device Binding ID</th>
                  <th className="px-4 py-3">Log Event Type</th>
                  <th className="px-4 py-3">Punch Time</th>
                  <th className="px-4 py-3">Registry Source</th>
                  <th className="px-4 py-3 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {sessionLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-400 font-semibold">No laptop logs synced yet.</td>
                  </tr>
                ) : (
                  sessionLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {new Date(log.time).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] truncate max-w-[150px]" title={log.deviceId}>
                        {log.deviceId}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          log.type === 'CLOCK_IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-bold">
                        {new Date(log.time).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-bold">
                        {log.source}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-705 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Auto Verified
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

    </div>
  );
}
