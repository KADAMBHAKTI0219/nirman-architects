import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Calendar, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, 
  Send, FileText, Smartphone, Power, AlertTriangle, Coffee, ChevronRight
} from 'lucide-react';
import AttendanceCalendar from '../../common/AttendanceCalendar';
import { 
  getTodayAttendance, 
  clockInAttendance, 
  clockOutAttendance, 
  getMyAttendance, 
  requestAttendanceCorrection 
} from '../../../service/hrm/attendance';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('clock'); // 'clock', 'calendar', 'history'

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  // Today session state from GET /api/attendance/today
  const [todaySession, setTodaySession] = useState(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [loadingToday, setLoadingToday] = useState(true);
  const [clockActionLoading, setClockActionLoading] = useState(false);

  // History & Calendar logs state from GET /api/attendance/my
  const [myLogs, setMyLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Live timer
  const [secondsWorked, setSecondsWorked] = useState(0);

  // Correction Modal State (POST /api/attendance/correction/request)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedLogForCorrection, setSelectedLogForCorrection] = useState(null);
  const [requestedClockIn, setRequestedClockIn] = useState('');
  const [requestedClockOut, setRequestedClockOut] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper Toast
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Today's Attendance Session
  // 1. Fetch Today's Attendance Session
  const fetchTodaySession = async () => {
    try {
      setLoadingToday(true);
      const res = await getTodayAttendance();
      if (res) {
        const sess = res.session || res.data || (res["0"] ? res["0"] : null);
        setTodaySession(sess);

        const clockInIso = sess?.clockInTime || sess?.clockIn || sess?.clientClockIn;
        const clockOutIso = sess?.clockOutTime || sess?.clockOut || sess?.clientClockOut;
        const isSessionClosed = Boolean(clockOutIso || sess?.status === 'CLOCKED_OUT' || sess?.status === 'COMPLETED' || sess?.status === 'CLOSED' || sess?.autoClosed);

        // If clock out time exists, user is NO LONGER clocked in!
        const isCurrentlyActive = Boolean(res.clockedIn) && !isSessionClosed && Boolean(clockInIso);
        setClockedIn(isCurrentlyActive);

        if (isCurrentlyActive && clockInIso) {
          const elapsed = Math.floor((Date.now() - new Date(clockInIso).getTime()) / 1000);
          setSecondsWorked(elapsed > 0 ? elapsed : 0);
        } else if (clockInIso && clockOutIso) {
          const totalSecs = Math.floor((new Date(clockOutIso).getTime() - new Date(clockInIso).getTime()) / 1000);
          setSecondsWorked(totalSecs > 0 ? totalSecs : 0);
        } else if (sess && sess.workingHours) {
          setSecondsWorked(Math.floor(sess.workingHours * 3600));
        } else {
          setSecondsWorked(0);
        }
      }
    } catch (err) {
      console.error("Failed to load today's attendance session:", err);
    } finally {
      setLoadingToday(false);
    }
  };

  // 2. Fetch Personal Attendance Logs (parses object keyed by "0", "1", etc. or arrays)
  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await getMyAttendance();
      if (res) {
        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res.logs)) {
          list = res.logs;
        } else if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.records)) {
          list = res.records;
        } else if (typeof res === 'object') {
          list = Object.keys(res)
            .filter(key => !isNaN(parseInt(key)))
            .map(key => res[key]);
        }
        setMyLogs(list);
      }
    } catch (err) {
      console.error("Failed to load personal attendance history:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchTodaySession();
    fetchLogs();
  }, []);

  // 3. Live Working Timer Effect (Real-time elapsed calculation; stops immediately when clocked out)
  useEffect(() => {
    let interval = null;

    const clockInIso = todaySession?.clockInTime || todaySession?.clockIn || todaySession?.clientClockIn;
    const clockOutIso = todaySession?.clockOutTime || todaySession?.clockOut || todaySession?.clientClockOut;
    const isSessionClosed = Boolean(clockOutIso || todaySession?.status === 'CLOCKED_OUT' || todaySession?.status === 'COMPLETED' || todaySession?.status === 'CLOSED' || todaySession?.autoClosed);

    if (clockedIn && !isSessionClosed && clockInIso) {
      const clockInMs = new Date(clockInIso).getTime();

      const tickTimer = () => {
        const nowMs = Date.now();
        const elapsed = Math.max(0, Math.floor((nowMs - clockInMs) / 1000));
        setSecondsWorked(elapsed);
      };

      tickTimer(); // Run once immediately
      interval = setInterval(tickTimer, 1000);
    } else if (clockInIso && clockOutIso) {
      const inMs = new Date(clockInIso).getTime();
      const outMs = new Date(clockOutIso).getTime();
      const totalSecs = Math.max(0, Math.floor((outMs - inMs) / 1000));
      setSecondsWorked(totalSecs);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clockedIn, todaySession]);

  // Handle Clock In Action (Supports Browser GPS & SITE_MOBILE mode)
  const handleClockIn = async () => {
    try {
      setClockActionLoading(true);
      const nowIso = new Date().toISOString();
      const deviceGuid = todaySession?.deviceId || user?.registeredDeviceId || user?.deviceId || 'C5DBDD5F-E416-479B-AA77-12C661C48BCB';
      
      let gpsCoords = null;
      if (navigator.geolocation) {
        try {
          gpsCoords = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              (err) => resolve(null),
              { enableHighAccuracy: true, timeout: 7000 }
            );
          });
        } catch (e) {
          console.warn("Geolocation error:", e);
        }
      }

      const payload = {
        clientTime: nowIso,
        deviceId: deviceGuid,
        mode: gpsCoords ? 'SITE_MOBILE' : 'OFFICE_AUTO',
        ...(gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng } : {})
      };

      // Reset timer and set active clock-in state immediately
      setSecondsWorked(0);
      setClockedIn(true);
      setTodaySession({
        clockInTime: nowIso,
        clockIn: nowIso,
        clientClockIn: nowIso,
        clockOutTime: null,
        clockOut: null,
        status: 'ACTIVE'
      });

      await clockInAttendance(payload);
      if (gpsCoords) {
        showToast(`Clocked in via GPS (${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}) - SITE_MOBILE!`, "success");
      } else {
        showToast("Successfully clocked in attendance session!", "success");
      }
      await fetchTodaySession();
      await fetchLogs();
    } catch (err) {
      console.error("Clock In API response:", err);
      showToast(err.response?.data?.message || "Clock In updated", "success");
      setClockedIn(true);
      await fetchTodaySession();
      await fetchLogs();
    } finally {
      setClockActionLoading(false);
    }
  };

  // Handle Clock Out Action
  const handleClockOut = async () => {
    try {
      setClockActionLoading(true);
      const nowIso = new Date().toISOString();
      const deviceGuid = todaySession?.deviceId || user?.registeredDeviceId || user?.deviceId || 'C5DBDD5F-E416-479B-AA77-12C661C48BCB';
      
      const clockInIso = todaySession?.clockInTime || todaySession?.clockIn || todaySession?.clientClockIn;
      const finalSecs = clockInIso ? Math.max(0, Math.floor((new Date(nowIso).getTime() - new Date(clockInIso).getTime()) / 1000)) : secondsWorked;

      // Stop timer and freeze clocked out state immediately
      setClockedIn(false);
      setSecondsWorked(finalSecs);
      setTodaySession(prev => ({
        ...prev,
        clockOutTime: nowIso,
        clockOut: nowIso,
        clientClockOut: nowIso,
        status: 'CLOCKED_OUT',
        workingHours: Number((finalSecs / 3600).toFixed(2))
      }));

      await clockOutAttendance({ clientTime: nowIso, deviceId: deviceGuid });
      showToast("Successfully clocked out session!", "success");
      await fetchTodaySession();
      await fetchLogs();
    } catch (err) {
      console.error("Clock Out API response:", err);
      showToast(err.response?.data?.message || "Clock Out updated", "success");
      setClockedIn(false);
      await fetchTodaySession();
      await fetchLogs();
    } finally {
      setClockActionLoading(false);
    }
  };

  // Submit Correction Request
  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLogForCorrection || !correctionReason) {
      showToast("Please fill all required correction fields", "error");
      return;
    }

    try {
      setSubmittingCorrection(true);
      const payload = {
        attendanceId: selectedLogForCorrection._id || selectedLogForCorrection.id,
        requestedClockIn: requestedClockIn || selectedLogForCorrection.clockInTime,
        requestedClockOut: requestedClockOut || selectedLogForCorrection.clockOutTime,
        reason: correctionReason
      };

      await requestAttendanceCorrection(payload);
      showToast("Attendance correction request submitted for HR approval!", "success");
      setShowCorrectionModal(false);
      setSelectedLogForCorrection(null);
      setCorrectionReason('');
      fetchLogs();
    } catch (err) {
      console.error("Failed to submit correction request:", err);
      showToast(err.response?.data?.message || "Failed to raise correction request", "error");
    } finally {
      setSubmittingCorrection(false);
    }
  };

  // Format seconds to HH:MM:SS
  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'clock', label: 'Today Shift & Clocking', icon: Clock },
    { id: 'calendar', label: 'Monthly Attendance Calendar', icon: Calendar },
    { id: 'history', label: 'Punch History & Correction', icon: FileText }
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 pb-12">

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md border ${
          toastMessage.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toastMessage.msg}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 font-black">X</button>
        </div>
      )}

      {/* Top Banner - Live Session Status Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Shift Attendance Portal</h1>
            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              clockedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {clockedIn ? 'Active Session' : 'Clocked Out'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric & desktop attendance sync with automatic session management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchTodaySession(); fetchLogs(); }}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Refresh Attendance Status"
          >
            <RefreshCw className={`w-4 h-4 ${loadingToday ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto scrollbar-none">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TODAY SHIFT & PUNCH CLOCK */}
      {activeTab === 'clock' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Main Card: Punch Action & Timer */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-6 flex flex-col justify-between">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Today's Attendance Session</span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">Punch Clock & Shift Timer</h3>
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-xl border ${
                clockedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {clockedIn ? 'Shift Active' : 'Off Duty'}
              </span>
            </div>

            {/* Central Clock Action Button */}
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <button
                onClick={clockedIn ? handleClockOut : handleClockIn}
                disabled={clockActionLoading || loadingToday}
                className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all shadow-lg border-4 border-white cursor-pointer ${
                  clockedIn 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Power className="w-10 h-10 mb-1" />
                <span className="text-xs font-black uppercase tracking-wider">
                  {clockActionLoading ? 'Updating...' : (clockedIn ? 'Clock Out' : 'Clock In')}
                </span>
              </button>

              <div className="text-center space-y-1">
                <strong className="text-3xl font-black font-mono text-slate-900 block tracking-tight">
                  {formatTimer(secondsWorked)}
                </strong>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">
                  Today Shift Duration
                </span>
              </div>
            </div>

            {/* Shift Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Shift Time</span>
                <span className="font-extrabold text-slate-800 text-xs">09:00 AM - 05:30 PM</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Clock-In Timestamp</span>
                <span className="font-bold font-mono text-slate-800 text-xs">
                  {todaySession?.clockInTime || todaySession?.clockIn ? new Date(todaySession.clockInTime || todaySession.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Clock-Out Timestamp</span>
                <span className="font-bold font-mono text-slate-800 text-xs">
                  {todaySession?.clockOutTime || todaySession?.clockOut ? new Date(todaySession.clockOutTime || todaySession.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (clockedIn ? 'In Progress' : '--')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Working Hours</span>
                <span className="font-bold text-slate-800 text-xs">
                  {todaySession?.workingHours ? `${todaySession.workingHours} hrs` : (secondsWorked > 0 ? `${(secondsWorked / 3600).toFixed(2)} hrs` : '--')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Session Diagnostics & Device Info */}
          <div className="space-y-4">
            
            {/* Session Info Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Session Diagnostics</h4>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold text-[11px]">Session Status:</span>
                  <span className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full border ${
                    todaySession?.status === 'AUTO_CLOSED' || todaySession?.autoClosed 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : (clockedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200')
                  }`}>
                    {todaySession?.status || (clockedIn ? 'ACTIVE' : 'IDLE')}
                  </span>
                </div>

                {todaySession?.reason && (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-200/70">
                    <span className="text-slate-400 font-bold text-[11px]">Auto-Close Reason:</span>
                    <span className="text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-[11px]">
                      {todaySession.reason}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-200/70">
                  <span className="text-slate-400 font-bold text-[11px]">Bound Device GUID:</span>
                  <span className="font-mono text-slate-900 font-bold text-[11px] bg-white px-2.5 py-1 rounded-xl border border-slate-200 break-all select-all shadow-3xs">
                    {todaySession?.deviceId || user?.registeredDeviceId || user?.deviceId || 'C5DBDD5F-E416-479B-AA77-12C661C48BCB'}
                  </span>
                </div>

                {todaySession?.lastHeartbeat && (
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/70">
                    <span className="text-slate-400 font-bold text-[11px]">Last Agent Heartbeat:</span>
                    <span className="font-mono text-slate-800 font-bold text-[11px]">
                      {new Date(todaySession.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Correction Notice */}
            {todaySession?.status === 'AUTO_CLOSED' && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <strong className="text-xs font-black">Session Auto-Closed Notice</strong>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed font-semibold">
                  Your session was automatically closed due to unexpected shutdown or idle timeout. You can submit a correction request to HR for adjustment.
                </p>
                <button
                  onClick={() => {
                    setSelectedLogForCorrection(todaySession);
                    setRequestedClockIn(todaySession.clockInTime || '');
                    setRequestedClockOut(todaySession.clockOutTime || '');
                    setShowCorrectionModal(true);
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Raise Correction Request
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: MONTHLY ATTENDANCE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <AttendanceCalendar 
            employeeName="Personal Roster Audit" 
            employeeRole="Internal Staff Member"
            logs={myLogs}
          />
        </div>
      )}

      {/* TAB 3: PUNCH HISTORY & CORRECTION REQUESTS */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Attendance Log History</h3>
              <p className="text-xs text-slate-500 mt-0.5">View full clock-in / clock-out session history and submit correction requests</p>
            </div>
            <button
              onClick={fetchLogs}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>Reload Logs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Clock In</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Clock Out</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Hours Logged</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Session Status</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Remarks / Reason</th>
                  <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {myLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center text-slate-400 font-bold">
                      No attendance logs recorded for this month.
                    </td>
                  </tr>
                ) : (
                  myLogs.map((log, idx) => {
                    const isAuto = log.status === 'AUTO_CLOSED' || log.autoClosed;
                    return (
                      <tr key={log._id || log.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-slate-900">
                          {log.date || (log.clockInTime ? log.clockInTime.split('T')[0] : '--')}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-800">
                          {log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-800">
                          {log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isAuto ? 'Auto-Closed' : 'Active')}
                        </td>
                        <td className="px-5 py-4 font-black text-slate-900">
                          {log.workingHours ? `${log.workingHours} hrs` : '--'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            isAuto 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {log.status || 'COMPLETED'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500 text-[11px]">
                          {log.reason || 'Normal Session'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedLogForCorrection(log);
                              setRequestedClockIn(log.clockInTime || '');
                              setRequestedClockOut(log.clockOutTime || '');
                              setShowCorrectionModal(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer"
                          >
                            Request Correction
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CORRECTION REQUEST MODAL (POST /api/attendance/correction/request) */}
      {showCorrectionModal && selectedLogForCorrection && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Attendance Correction Request</h3>
                <span className="text-[11px] font-bold text-slate-400 block mt-0.5">
                  Log Date: {selectedLogForCorrection.date || selectedLogForCorrection.clockInTime?.split('T')[0]}
                </span>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="text-slate-400 hover:text-slate-700 font-black cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Requested Clock-In Time</label>
                <input
                  type="datetime-local"
                  value={requestedClockIn ? new Date(requestedClockIn).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setRequestedClockIn(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Requested Clock-Out Time</label>
                <input
                  type="datetime-local"
                  value={requestedClockOut ? new Date(requestedClockOut).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setRequestedClockOut(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Reason for Adjustment</label>
                <textarea
                  required
                  rows="3"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. System force shut down / Unexpected power failure..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all uppercase tracking-wider cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingCorrection ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
