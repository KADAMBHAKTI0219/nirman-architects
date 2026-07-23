import React, { useState, useEffect } from 'react';
import { Laptop, Clock, ArrowRight, ShieldCheck, Power, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../../common/Card';
import { getMyAttendance, clockOfficeEvent } from '../../../services/attendance.api';

export default function AttendanceOffice() {
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOfficeLogs = async () => {
    setLoading(true);
    try {
      const response = await getMyAttendance();
      if (response.success && response.logs) {
        // Filter for OFFICE_AUTO logs
        const officeLogs = response.logs.filter(l => l.mode === 'OFFICE_AUTO');
        setSessionLogs(officeLogs);
      }
    } catch (err) {
      console.error("Failed to load personal office logs:", err);
      setError("Could not retrieve laptop session logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeLogs();
  }, []);

  // Simulate Windows OS Login/Boot or Logoff/Shutdown event pings
  const handleSimulateWindowsEvent = async (type, source) => {
    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const userId = user ? user.id : null;
    const deviceId = user ? user.registeredDeviceId || 'c5dbdd5f-e416-479b-aa77-12c661c48bcb' : 'c5dbdd5f-e416-479b-aa77-12c661c48bcb';

    if (!userId) {
      alert("Session expired. Please log in again.");
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const response = await clockOfficeEvent(userId, deviceId, type, source, new Date().toISOString());
      alert(response.message || `Windows simulated ${type} logged successfully via ${source}.`);
      fetchOfficeLogs();
    } catch (err) {
      console.error("Simulation event failed:", err);
      setError(err.message || "Simulation request failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Laptop connection details */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs grid grid-cols-1 md:grid-cols-3 gap-6">
        
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
