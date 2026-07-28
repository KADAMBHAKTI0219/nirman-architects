import React, { useState, useEffect, useRef } from 'react';
import AttendanceCheckIn from './AttendanceCheckIn';
import AttendanceOffice from './AttendanceOffice';
import AttendanceSite from './AttendanceSite';
import AttendanceReports from './AttendanceReports';
import { getMyAttendance } from '../../../service/attendance';
import { ShieldCheck, Info, MapPin } from 'lucide-react';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('biometric'); // biometric, office, site, reports

  // State shared with sub-components
  const [isCheckedIn, setIsCheckedIn] = useState(() => localStorage.getItem('isCheckedIn') === 'true');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [secondsWorked, setSecondsWorked] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const coordsRef = useRef({ lat: 23.0225, lng: 72.5714 }); // Default fallback coordinates

  // 1. Fetch current checked-in status and active shift duration from API on mount
  useEffect(() => {
    const fetchSessionStatus = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser) return;

        const myLogsRes = await getMyAttendance();
        const rawLogs = myLogsRes.logs || myLogsRes.data || (Array.isArray(myLogsRes) ? myLogsRes : []);
        if (rawLogs && rawLogs.length > 0) {
          const latest = rawLogs[0];
          const online = !latest.clockOutTime; // Open session has no clockOutTime
          setIsCheckedIn(online);
          localStorage.setItem('isCheckedIn', online ? 'true' : 'false');
          
          if (online) {
            const elapsed = Math.floor((Date.now() - new Date(latest.clockInTime).getTime()) / 1000);
            setSecondsWorked(elapsed > 0 ? elapsed : 0);
          } else {
            setSecondsWorked(0);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic attendance status:", err);
      }
    };
    fetchSessionStatus();
  }, []);

  // Request browser geolocation permission and display coords
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          coordsRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        },
        (err) => console.warn("GPS lookup denied:", err.message)
      );
    }
  }, []);

  // 3. Active Shift Timer
  useEffect(() => {
    let interval = null;
    if (isCheckedIn && !isOnBreak) {
      interval = setInterval(() => {
        setSecondsWorked(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, isOnBreak]);

  // 4. Activity Heartbeat
  useEffect(() => {
    if (!isCheckedIn) return;

    const savedUser = localStorage.getItem('user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const deviceId = user ? user.registeredDeviceId || user.deviceId || 'c5dbdd5f-e416-479b-aa77-12c661c48bcb' : 'c5dbdd5f-e416-479b-aa77-12c661c48bcb';

    let lastActivity = Date.now();
    const handleActivity = () => {
      lastActivity = Date.now();
      if (isOnBreak) {
        setIsOnBreak(false);
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      const isIdle = (Date.now() - lastActivity) > 300000;
      if (isIdle) {
        setIsOnBreak(true);
      }
    }, 120000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, [isCheckedIn, isOnBreak]);

  const subTabs = [
    { id: 'biometric', label: 'Fingerprint Check-In' },
    { id: 'office', label: 'Office Auto-Logs' },
    { id: 'site', label: 'Site GPS Mapping' },
    { id: 'reports', label: 'Personal Reports' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Auto Logging Banner Overlay */}
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-3xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-slate-805 text-xs block">Frictionless Silent Attendance Mode Active</strong>
            <span className="text-[9px] text-slate-400 block font-bold">
              Automatically logs boot/login (`CLOCK_IN`) & checkout (`CLOCK_OUT`) using GPS bounds when laptop opens/closes.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {coordsRef.current.lat && (
            <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-xl shadow-4xs">
              <MapPin className="w-3 h-3 text-emerald-500" />
              <span>{coordsRef.current.lat.toFixed(4)}, {coordsRef.current.lng.toFixed(4)}</span>
            </div>
          )}
          <span className={`w-2.5 h-2.5 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-350'}`}></span>
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
            {isCheckedIn ? 'Auto Active' : 'Offline'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-3xs">
          <Info className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-2 flex-wrap gap-4 bg-slate-50/20 p-2 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 border ${
                activeTab === tab.id
                  ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                  : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render Active Sub-Module */}
      <div className="space-y-6">
        {activeTab === 'biometric' && (
          <AttendanceCheckIn 
            isCheckedIn={isCheckedIn}
            isOnBreak={isOnBreak}
            secondsWorked={secondsWorked}
            onCheckInToggle={() => {}}
            onBreakToggle={() => setIsOnBreak(p => !p)}
            selfieCaptured={true}
            onCaptureSelfie={() => {}}
            loading={loading}
          />
        )}

        {activeTab === 'office' && <AttendanceOffice />}

        {activeTab === 'site' && <AttendanceSite />}

        {activeTab === 'reports' && <AttendanceReports />}
      </div>

    </div>
  );
}
