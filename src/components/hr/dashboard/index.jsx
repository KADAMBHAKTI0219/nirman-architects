import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Calendar, AlertTriangle, FileText, CheckCircle2, Clock, 
  Check, X, Cake, ShieldCheck, IndianRupee, Award, RefreshCw, UserPlus, Plus 
} from 'lucide-react';
import Card from '../../common/Card';
import { getAllAttendanceList } from '../../../service/hrm/attendance';
import { getPendingLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from '../../../service/hrm/leave';
import { getUsersList } from '../../../service/auth';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function HRDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [widgetsData, setWidgetsData] = useState({
    totalUsers: 0,
    onlineCount: 0,
    offlineCount: 0,
    pendingCorrections: 0,
    securityAlerts: 0
  });
  
  // 1. Dynamic Leave Approval Queue state
  const [leaveQueue, setLeaveQueue] = useState([]);

  const loadHRData = async () => {
    try {
      setLoading(true);
      setApiError('');
      
      const response = await getAllAttendanceList().catch(() => null);
      const logs = response?.logs || (Array.isArray(response) ? response : []);
      setAttendanceData(logs);

      const usersRes = await getUsersList().catch(() => null);
      const uList = usersRes?.users || (Array.isArray(usersRes) ? usersRes : []);
      setWidgetsData({
        totalUsers: uList.length,
        onlineCount: logs.filter(l => l.status === 'PRESENT' || l.clockInTime).length,
        offlineCount: Math.max(0, uList.length - logs.length),
        pendingCorrections: 0,
        securityAlerts: 0
      });

      const pendingLeaves = await getPendingLeaveRequests().catch(() => null);
      if (pendingLeaves?.requests && Array.isArray(pendingLeaves.requests)) {
        const formatted = pendingLeaves.requests.map(r => ({
          id: r._id || r.id,
          name: r.employeeName || r.userId?.name || 'Employee',
          dept: r.department || r.userId?.department || 'Architecture',
          type: r.leaveTypeName || r.code || 'Leave',
          dates: `${r.fromDate || r.startDate || ''} - ${r.toDate || r.endDate || ''}`,
          days: 1,
          reason: r.reason || 'Leave request'
        }));
        setLeaveQueue(formatted);
      }
    } catch (err) {
      console.error(err);
      setApiError('Notice updating real-time attendance feed.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadHRData();
  }, []);

  // 2. Attendance Exceptions state
  const [exceptions, setExceptions] = useState([
    { id: 1, name: "John Wick", reason: "Late Check-in Exception", date: "2026-07-22", time: "11:05 AM" }
  ]);

  // 3. Shift Swap requests state
  const [swapRequests, setSwapRequests] = useState([
    { id: 1, employee: "Alice Smith", requested: "Shift A -> Shift B", date: "2026-07-24" }
  ]);

  const handleApproveLeave = async (id) => {
    await approveLeaveRequest(id);
    setLeaveQueue(prev => prev.filter(req => req.id !== id));
    loadHRData();
  };

  const handleRejectLeave = async (id) => {
    await rejectLeaveRequest(id, "Rejected by HR");
    setLeaveQueue(prev => prev.filter(req => req.id !== id));
    loadHRData();
  };

  const handleNotifyException = (name) => {
    alert(`Reminder notification dispatched to ${name}.`);
  };

  const handleApproveSwap = (id) => {
    setSwapRequests(prev => prev.filter(r => r.id !== id));
    alert("Shift swap approved!");
  };

  // Recharts Data
  const attendanceTrendData = [
    { day: 'Mon', rate: 95 },
    { day: 'Tue', rate: 97 },
    { day: 'Wed', rate: 92 },
    { day: 'Thu', rate: 94 },
    { day: 'Fri', rate: 96 }
  ];

  const deptStrengthData = [
    { name: 'Architecture', count: 12 },
    { name: 'Engineering', count: 8 },
    { name: 'Project Mgmt', count: 6 },
    { name: 'HR & Admin', count: 2 }
  ];

  const radarKPIs = [
    { subject: 'Milestones', rate: 88, fullMark: 100 },
    { subject: 'Attendance', rate: 94, fullMark: 100 },
    { subject: 'Documents', rate: 80, fullMark: 100 },
    { subject: 'Shift Cover', rate: 90, fullMark: 100 },
    { subject: 'Audits', rate: 85, fullMark: 100 }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Clock className="w-8 h-8 text-[#2484C6] animate-spin-slow" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading HRM metrics...</span>
      </div>
    );
  }

  const totalEmployees = widgetsData.totalUsers !== undefined ? widgetsData.totalUsers : 28;
  const presentToday = widgetsData.onlineCount !== undefined ? widgetsData.onlineCount : 24;
  const onLeave = widgetsData.offlineCount !== undefined ? widgetsData.offlineCount : 2;
  const corrections = widgetsData.pendingCorrections !== undefined ? widgetsData.pendingCorrections : 2;
  const alerts = widgetsData.securityAlerts !== undefined ? widgetsData.securityAlerts : 0;

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. TOP PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT & ADMIN DASHBOARD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            HR & Workforce Command Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Real-time employee attendance, leave approvals, payroll readiness, shift rotas & performance scorecards
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/hr/employees')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-slate-500" />
            <span>Employee Roster</span>
          </button>
          <button
            onClick={() => navigate('/hr/payroll-data')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer border border-brand-secondary/40"
          >
            <IndianRupee className="w-4 h-4 text-slate-900 stroke-[2.5]" />
            <span>Process Payroll</span>
          </button>
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-bold">
          {apiError}
        </div>
      )}
      
      {/* ================= ZONE 1: TOP SECTION (KPIs) ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-3.5">
        
        <div 
          onClick={() => navigate('/hr/employees')}
          className="premium-stat-box p-3.5 flex flex-col justify-between min-h-[88px] cursor-pointer hover:border-indigo-400 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 group"
          title="Click to view complete employee roster"
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate group-hover:text-indigo-600 transition-colors" title="Total Employees">Total Employees</span>
          <div className="flex items-center justify-between mt-2">
            <strong className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{totalEmployees}</strong>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs group-hover:scale-125 transition-transform"></span>
          </div>
        </div>

        <div className="premium-stat-box p-3.5 flex flex-col justify-between min-h-[88px]">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate" title="Present Today">Present Today</span>
          <div className="flex items-center justify-between mt-2">
            <strong className="text-lg font-black text-emerald-600">{presentToday}</strong>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs"></span>
          </div>
        </div>

        <div className="premium-stat-box p-3.5 flex flex-col justify-between min-h-[88px]">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate" title="On Leave (Offline)">On Leave</span>
          <div className="flex items-center justify-between mt-2">
            <strong className="text-lg font-black text-rose-500">{onLeave}</strong>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs"></span>
          </div>
        </div>

        <div className="premium-stat-box p-3.5 flex flex-col justify-between min-h-[88px]">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate" title="Late Arrivals">Late Arrivals</span>
          <div className="flex items-center justify-between mt-2">
            <strong className="text-lg font-black text-amber-500">2</strong>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></span>
          </div>
        </div>

        <div className="premium-stat-box p-3.5 flex flex-col justify-between min-h-[88px]">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate" title="New Joiners">New Joiners</span>
          <div className="flex items-center justify-between mt-2">
            <strong className="text-lg font-black text-slate-700">3</strong>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-2xs"></span>
          </div>
        </div>

        <div className="premium-stat-box p-3.5 flex flex-col justify-between min-h-[88px]">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate" title="Pending Corrections">Pending Corrections</span>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <strong className="text-lg font-black text-amber-600">{corrections}</strong>
              <span className="text-[10px] font-bold text-slate-400">Reqs</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs"></span>
          </div>
        </div>

        <div className="premium-stat-box p-3.5 flex flex-col justify-between min-h-[88px]">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate" title="Payroll Ready">Payroll Ready</span>
          <div className="flex items-center justify-between mt-2">
            <strong className="text-sm font-extrabold text-indigo-600">June</strong>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-2xs"></span>
          </div>
        </div>

        <div className="premium-stat-box p-3.5 flex flex-col justify-between min-h-[88px]">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate" title="Security Alerts">Security Alerts</span>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1">
              <strong className="text-lg font-black text-[#2484C6]">{alerts}</strong>
              <span className="text-[10px] font-bold text-slate-400">Alerts</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2484C6] shadow-2xs"></span>
          </div>
        </div>
      </div>

      {/* ================= ZONE 2: MIDDLE SECTION (OPERATIONAL SUMMARIES) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance trend Table */}
        <Card title="Attendance Rates Trend" subtitle="Daily attendance rates logged during the week">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-2">Day</th>
                  <th className="px-4 py-2">Present Rate (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceTrendData.map((row) => (
                  <tr key={row.day} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{row.day}</td>
                    <td className="px-4 py-2.5 font-semibold text-blue-600">{row.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Department-wise Strength Table */}
        <Card title="Department-wise Strength" subtitle="Staff distribution counts across teams">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-2">Department</th>
                  <th className="px-4 py-2">Staff Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptStrengthData.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-600">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Performance KPI Overviews Table */}
        <Card title="Performance KPI Ratios" subtitle="Aggregated staff operational metrics averages">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Rate (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {radarKPIs.map((row) => (
                  <tr key={row.subject} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{row.subject}</td>
                    <td className="px-4 py-2.5 font-semibold text-indigo-600">{row.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* ================= ZONE 3: BOTTOM SECTION (OPERATIONAL WORKSPACE TABLES) ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Side: Leave approval queue & Exceptions */}
        <div className="space-y-6">
          
          {/* Leave approvals queue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Leave Approval Queue</span>
              <span className="text-[9px] text-slate-450 block font-semibold">Active staff requests pending sign-off</span>
            </div>

            <div className="space-y-3">
              {leaveQueue.map(req => (
                <div key={req.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs flex-wrap gap-2">
                  <div>
                    <strong className="text-slate-805 block">{req.name} &bull; {req.type} Leave</strong>
                    <span className="text-[9px] text-slate-450 block font-bold">{req.dept} &bull; {req.dates} ({req.days} days)</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleRejectLeave(req.id)}
                      className="p-1.5 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleApproveLeave(req.id)}
                      className="px-2.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-lg text-[9px] font-black uppercase shadow-3xs flex items-center gap-0.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                  </div>
                </div>
              ))}
              {leaveQueue.length === 0 && (
                <div className="text-center text-slate-400 text-[10px] font-black py-4 uppercase">
                  All requests processed.
                </div>
              )}
            </div>
          </div>

          {/* Attendance exceptions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Attendance Exceptions Log</span>
              <span className="text-[9px] text-slate-450 block font-semibold">Missed gates or delay check-ins</span>
            </div>

            <div className="space-y-3">
              {exceptions.map(exc => (
                <div key={exc.id} className="p-3 bg-rose-50/30 border border-rose-100 rounded-xl flex items-center justify-between text-xs flex-wrap gap-2">
                  <div>
                    <strong className="text-slate-805 block">{exc.name} &bull; {exc.reason}</strong>
                    <span className="text-[9px] text-slate-405 block font-bold">{exc.date} | Logged: {exc.time}</span>
                  </div>
                  <button 
                    onClick={() => handleNotifyException(exc.name)}
                    className="px-2.5 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-[9px] font-black uppercase shadow-3xs"
                  >
                    Notify Staff
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Swap requests, reminders, joiners */}
        <div className="space-y-6">
          
          {/* Shift Swap Requests */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Shift Swap Requests</span>
              <span className="text-[9px] text-slate-450 block font-semibold">Staff substitution requests</span>
            </div>

            <div className="space-y-3">
              {swapRequests.map(req => (
                <div key={req.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-slate-805 block">{req.employee}</strong>
                    <span className="text-[9px] text-slate-450 block font-bold">Request: {req.requested} | Date: {req.date}</span>
                  </div>
                  <button 
                    onClick={() => handleApproveSwap(req.id)}
                    className="px-2.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-lg text-[9px] font-black uppercase shadow-3xs flex items-center gap-0.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </div>
              ))}
              {swapRequests.length === 0 && (
                <div className="text-center text-slate-400 text-[10px] font-black py-4 uppercase">
                  No swap requests.
                </div>
              )}
            </div>
          </div>

          {/* Employee Reminders & Birthdays */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reminders & Milestones</span>
              <span className="text-[9px] text-slate-455 block font-semibold">Staff celebrations in the next 30 days</span>
            </div>

            <div className="space-y-3">
              {[
                { name: "Alice Smith", event: "Work Anniversary (2 Years)", date: "July 28" },
                { name: "Sarah Connor", event: "Birthday Celebration", date: "August 02" }
              ].map((milestone, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Cake className="w-4 h-4 text-indigo-500" />
                    <div>
                      <strong className="text-slate-805 block">{milestone.name}</strong>
                      <span className="text-[9px] text-slate-450 block font-bold">{milestone.event}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-550 font-bold">{milestone.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
