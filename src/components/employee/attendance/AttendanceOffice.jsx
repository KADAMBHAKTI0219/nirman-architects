import React, { useState, useEffect } from 'react';
import { Laptop, Clock, ArrowRight, ShieldCheck, Power, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../../common/Card';
import { registerDevice, getDeviceStatus } from '../../../service/auth';
import { getMyAttendance, postAttendanceEvent } from '../../../service/attendance';

export default function AttendanceOffice() {
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputDeviceId, setInputDeviceId] = useState('');
  const [deviceStatusInfo, setDeviceStatusInfo] = useState(null);

  const fetchOfficeLogs = async () => {
    setLoading(true);
    try {
      const response = await getMyAttendance();
      const rawLogs = response.logs || response.data || (Array.isArray(response) ? response : []);
      if (rawLogs) {
        const mappedLogs = [];
        rawLogs.forEach(log => {
          // Add CLOCK_IN event
          mappedLogs.push({
            id: (log._id || log.id) + '_in',
            time: log.clockInTime,
            type: 'CLOCK_IN',
            deviceId: log.deviceId || 'N/A',
            source: log.isOfflineEntry ? 'OFFLINE_SYNC' : 'SYSTEM_BOOT'
          });
          // Add CLOCK_OUT event if present
          if (log.clockOutTime) {
            mappedLogs.push({
              id: (log._id || log.id) + '_out',
              time: log.clockOutTime,
              type: 'CLOCK_OUT',
              deviceId: log.deviceId || 'N/A',
              source: log.autoClosed ? 'HEARTBEAT_TIMEOUT' : 'SYSTEM_SHUTDOWN'
            });
          }
        });
        // Sort by time descending
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

  const fetchDeviceStatus = async () => {
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const userId = user ? user.id : null;
    if (!userId) return;

    try {
      const res = await getDeviceStatus(userId);
      if (res.success && res.data) {
        setDeviceStatusInfo(res.data);
        setInputDeviceId(res.data.deviceId || '');
        
        // Update user metadata in localStorage to keep it sync'd
        const updated = { 
          ...user, 
          deviceId: res.data.deviceId, 
          registeredDeviceId: res.data.deviceId,
          deviceStatus: res.data.deviceStatus
        };
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Failed to fetch device status:", err);
    }
  };

  useEffect(() => {
    fetchOfficeLogs();
    fetchDeviceStatus();
  }, []);

  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    if (!inputDeviceId.trim()) return;
    
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const userId = user ? user.id : null;

    setActionLoading(true);
    setError('');
    try {
      const res = await registerDevice(userId, inputDeviceId.trim());
      if (res.success) {
        alert(res.message || 'Device registration details submitted.');
        fetchDeviceStatus();
      } else {
        setError(res.message || 'Failed to register device.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to register device.');
    } finally {
      setActionLoading(false);
    }
  };

  // Simulate Windows OS Login/Boot or Logoff/Shutdown event pings
  const handleSimulateWindowsEvent = async (type, source) => {
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const userId = user ? user.id : null;
    const deviceId = user ? user.registeredDeviceId || user.deviceId || 'c5dbdd5f-e416-479b-aa77-12c661c48bcb' : 'c5dbdd5f-e416-479b-aa77-12c661c48bcb';

    if (!userId) {
      alert("Session expired. Please log in again.");
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const response = await postAttendanceEvent({
        type: type.toLowerCase(),
        deviceId,
        clientTime: new Date().toISOString()
      });
      alert(response.message || `Windows simulated ${type} logged successfully via ${source}.`);
      fetchOfficeLogs();
      // Fetch device status and attendance status again to update UI
      fetchDeviceStatus();
    } catch (err) {
      console.error("Simulation event failed:", err);
      setError(err.response?.data?.message || err.message || "Simulation request failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Laptop connection details */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Device Sync card */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Device Sync Status</span>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-tint border border-brand-primary text-slate-805 rounded-2xl">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <strong className="text-slate-805 text-xs block">Corporate laptop</strong>
              <span className="text-[9px] text-slate-400 block font-bold">OS: Windows 11 &bull; Auto binding active</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg w-max">
            <Power className="w-3 h-3 text-emerald-500 animate-pulse" />
            Auto-Gate Link Enabled
          </div>
        </div>

        {/* Auto rules description */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Auto Check-in triggers</span>
          <p className="text-[10px] text-slate-550 leading-relaxed font-semibold">
            Attendance starts automatically when your laptop boots up and logs in to Windows (`SYSTEM_BOOT`).
            Logging off or shutting down Windows (`SYSTEM_SHUTDOWN`) triggers auto check-out logs immediately.
          </p>
        </div>

        {/* Windows OS Simulation Controls */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Simulate Laptop events</span>
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={() => handleSimulateWindowsEvent('CLOCK_IN', 'SYSTEM_BOOT')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase transition-all shadow-3xs text-center"
            >
              Simulate PC Boot (Clock-In)
            </button>
            <button
              onClick={() => handleSimulateWindowsEvent('CLOCK_OUT', 'SYSTEM_SHUTDOWN')}
              disabled={actionLoading}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-705 border border-rose-200 rounded-xl text-[10px] font-black uppercase transition-all shadow-3xs text-center"
            >
              Simulate PC Shutdown (Clock-Out)
            </button>
          </div>
        </div>

        {/* Device Registration & Sync Form */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Device Binding Request</span>
          <form onSubmit={handleRegisterDevice} className="space-y-2">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Target Machine GUID / Device ID</label>
              <div className="flex gap-1.5">
                <input 
                  type="text" 
                  required
                  value={inputDeviceId}
                  onChange={(e) => setInputDeviceId(e.target.value)}
                  placeholder="e.g. 7FA24F44-8F0B-42F8-AD82-F482E1BC6D37"
                  className="flex-1 px-2.5 py-1.5 text-[10px] border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary font-semibold text-slate-755 min-w-0"
                />
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-2.5 py-1.5 bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-slate-905 text-[10px] font-black uppercase rounded-xl transition-all shadow-3xs flex-shrink-0"
                >
                  {actionLoading ? 'Sync...' : 'Bind'}
                </button>
              </div>
            </div>
            
            {deviceStatusInfo && (
              <div className="flex flex-col gap-1 text-[9px] pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-400">Status:</span>
                  <span className={`font-black uppercase px-1.5 py-0.5 rounded text-[8px] tracking-wider border ${
                    deviceStatusInfo.deviceStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {deviceStatusInfo.deviceStatus || 'APPROVED'}
                  </span>
                </div>
                {deviceStatusInfo.pendingRequests && deviceStatusInfo.pendingRequests.length > 0 && (
                  <span className="text-amber-600 font-bold animate-pulse text-[8px]">
                    &#9888; Change Request Pending Approval
                  </span>
                )}
              </div>
            )}
          </form>
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
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Session Date</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Device Binding ID</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Log Event Type</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">PUNCH TIME</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Registry Source</th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sessionLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-400 font-semibold">No laptop logs synced yet. Use the simulation panel to trigger one!</td>
                  </tr>
                ) : (
                  sessionLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-805">
                        {new Date(log.time).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold truncate max-w-[150px]" title={log.deviceId}>
                        {log.deviceId}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          log.type === 'CLOCK_IN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold">
                        {new Date(log.time).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3.5 text-slate-705 font-black">
                        {log.source}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
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
