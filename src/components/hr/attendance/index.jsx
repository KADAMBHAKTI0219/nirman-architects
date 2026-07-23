import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import AttendanceStats from './AttendanceStats';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceLogsTable from './AttendanceLogsTable';
import AttendanceDetailDrawer from './AttendanceDetailDrawer';
import { getAllAttendance, getHRDashboardWidgets } from '../../../services/attendance.api';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, daily, monthly, exceptions
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Stats widgets state
  const [widgets, setWidgets] = useState({
    totalUsers: 0,
    onlineCount: 0,
    offlineCount: 0,
    pendingCorrections: 0,
    securityAlerts: 0
  });

  // Filter state (default to today's date in YYYY-MM-DD format)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Company Attendance logs filtered by date
      const logsRes = await getAllAttendance(selectedDate);
      if (logsRes.success && logsRes.logs) {
        const rawLogs = logsRes.logs;
        const mappedLogs = rawLogs.map(log => ({
          id: log.id || log._id,
          employeeId: log.userEmail?.split('@')[0].toUpperCase() || 'EMP',
          name: log.employeeName || log.userEmail?.split('@')[0] || 'User',
          dept: log.projectName || 'Main Office',
          shift: log.mode === 'OFFICE_AUTO' ? 'Office Auto Shift' : 'Site Mobile Shift',
          checkIn: log.type === 'CLOCK_IN' ? new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          checkOut: log.type === 'CLOCK_OUT' ? new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          hours: log.type === 'CLOCK_IN' ? 'Active' : 'Completed',
          status: log.isOffline ? 'Offline' : (log.autoClosed ? 'Auto-Closed' : 'Present'),
          location: log.mode === 'OFFICE_AUTO' ? 'Office' : 'Site',
          manager: log.projectName || 'HR Manager',
          notes: `Source: ${log.source}${log.isOffline ? ' (Offline)' : ''}${log.autoClosed ? ' (Auto Closed)' : ''}`
        }));
        setLogs(mappedLogs);
        if (mappedLogs.length > 0) {
          setSelectedLog(mappedLogs[0]);
          setDrawerOpen(true);
        } else {
          setSelectedLog(null);
          setDrawerOpen(false);
        }
      }

      // 2. Fetch HR Dashboard widgets metrics
      const widgetsRes = await getHRDashboardWidgets();
      if (widgetsRes.success && widgetsRes.data) {
        setWidgets({
          totalUsers: widgetsRes.data.totalUsers || 0,
          onlineCount: widgetsRes.data.onlineCount || 0,
          offlineCount: widgetsRes.data.offlineCount || 0,
          pendingCorrections: widgetsRes.data.pendingCorrections || 0,
          securityAlerts: widgetsRes.data.securityAlerts || 0
        });
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Failed to retrieve attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  const handleExport = (type) => {
    alert(`Exporting attendance logs for ${selectedDate} as ${type}... Success.`);
  };

  const tabs = [
    { id: 'overview', label: 'Attendance Overview' },
    { id: 'daily', label: 'Daily Punch Logs' },
    { id: 'monthly', label: 'Monthly Summaries' },
    { id: 'exceptions', label: 'Late & Exceptions' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP BAR FILTERS & EXPORTS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#2484C6] rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">Biometric Attendance Portal</strong>
            <span className="text-[10px] text-slate-400 block font-bold">Monitor gate check-ins, geofences, and boot-up registries</span>
          </div>
        </div>

        <div className="flex gap-2.5 items-center flex-wrap">
          <div className="flex items-center gap-2 border border-slate-205 rounded-xl px-3 py-1.5 bg-white">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs focus:outline-none bg-transparent font-semibold text-slate-700 cursor-pointer"
            />
          </div>

          <button
            onClick={() => handleExport('Excel')}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm"
          >
            Export Logs
          </button>
        </div>

      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. SUMMARY CARDS */}
      <AttendanceStats widgets={widgets} />

      {/* Tabs navigation panel */}
      <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none gap-2 pb-1 bg-slate-50/20 p-2 rounded-2xl">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
              activeTab === t.id
                ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE ATTENDANCE VIEW */}
      {activeTab === 'overview' && (
        <AttendanceCalendar logs={logs} />
      )}

      {/* 3. DAILY LOGS TABLE & RIGHT PANEL DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Table container */}
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          {loading ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center font-bold text-xs text-slate-400">
              Loading dynamic logs from backend...
            </div>
          ) : (
            <AttendanceLogsTable 
              logs={logs}
              selectedLog={selectedLog}
              onSelectLog={(log) => {
                setSelectedLog(log);
                setDrawerOpen(true);
              }}
            />
          )}
        </div>

        {/* Right Slide-over drawer */}
        {drawerOpen && selectedLog && (
          <AttendanceDetailDrawer 
            selectedLog={selectedLog}
            onClose={() => setDrawerOpen(false)}
          />
        )}

      </div>

    </div>
  );
}
