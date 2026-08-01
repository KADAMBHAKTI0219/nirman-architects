import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Users, UserCheck, Calendar, AlertTriangle, FileText, CheckCircle2, Clock, 
  Check, X, Cake, ShieldCheck, DollarSign, Award, RefreshCw 
} from 'lucide-react';
import Card from '../../common/Card';
import { 
  getAllAttendance, 
  getHRDashboardWidgets, 
  getPendingLeaveRequests, 
  approveLeaveRequest, 
  rejectLeaveRequest 
} from '../../../service/mockApi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function HRDashboard() {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [widgetsData, setWidgetsData] = useState({
    totalUsers: 6,
    onlineCount: 2,
    offlineCount: 4,
    pendingCorrections: 0,
    securityAlerts: 0
  });
  
  // 1. Dynamic Leave Approval Queue state
  const [leaveQueue, setLeaveQueue] = useState([]);

  const loadHRData = async () => {
    try {
      setLoading(true);
      setApiError('');
      
      const response = await getAllAttendance();
      if (response.success && Array.isArray(response.data)) {
        setAttendanceData(response.data);
      }

      const widgetsResponse = await getHRDashboardWidgets();
      if (widgetsResponse.success) {
        setWidgetsData(widgetsResponse);
      }

      const pendingLeaves = await getPendingLeaveRequests();
      if (pendingLeaves.success && Array.isArray(pendingLeaves.requests)) {
        const formatted = pendingLeaves.requests.map(r => ({
          id: r.id,
          name: r.employeeName || 'Employee',
          dept: r.department || 'Architecture',
          type: r.leaveTypeName || r.code || 'Leave',
          dates: `${r.fromDate} - ${r.toDate}`,
          days: 1,
          reason: r.reason
        }));
        setLeaveQueue(formatted);
      }
    } catch (err) {
      console.error(err);
      setApiError('Unable to load real-time attendance feed.');
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {apiError && (
        <div className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl text-xs font-bold">
          {apiError}
        </div>
      )}
      
      {/* ================= ZONE 1: TOP SECTION (KPIs) ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        
        <div className="premium-stat-box p-4 flex flex-col justify-between h-20">
          <span className="text-[9px] font-black text-slate-405 uppercase tracking-wider block">Total Employees</span>
          <div className="flex items-center justify-between">
            <strong className="text-base font-black text-slate-800">{totalEmployees}</strong>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
        </div>

        <div className="premium-stat-box p-4 flex flex-col justify-between h-20">
          <span className="text-[9px] font-black text-slate-405 uppercase tracking-wider block">Present Today</span>
          <div className="flex items-center justify-between">
            <strong className="text-base font-black text-emerald-600">{presentToday}</strong>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        <div className="premium-stat-box p-4 flex flex-col justify-between h-20">
          <span className="text-[9px] font-black text-slate-405 uppercase tracking-wider block">On Leave (Offline)</span>
          <div className="flex items-center justify-between">
            <strong className="text-base font-black text-rose-500">{onLeave}</strong>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
        </div>

        <div className="premium-stat-box p-4 flex flex-col justify-between h-20">
          <span className="text-[9px] font-black text-slate-405 uppercase tracking-wider block">Late Arrivals</span>
          <div className="flex items-center justify-between">
            <strong className="text-base font-black text-amber-500">2</strong>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
        </div>

        <div className="premium-stat-box p-4 flex flex-col justify-between h-20">
          <span className="text-[9px] font-black text-slate-405 uppercase tracking-wider block">New Joiners</span>
          <div className="flex items-center justify-between">
            <strong className="text-base font-black text-slate-700">3</strong>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
        </div>

        <div className="premium-stat-box p-4 flex flex-col justify-between h-20">
          <span className="text-[9px] font-black text-slate-405 uppercase tracking-wider block">Pending Corrections</span>
          <div className="flex items-center justify-between">
            <strong className="text-base font-black text-amber-600">{corrections} Requests</strong>
            <span className="w-2 h-2 rounded-full bg-amber-650"></span>
          </div>
        </div>

        <div className="premium-stat-box p-4 flex flex-col justify-between h-20">
          <span className="text-[9px] font-black text-slate-405 uppercase tracking-wider block">Payroll Ready</span>
          <div className="flex items-center justify-between">
            <strong className="text-base font-black text-slate-700">June</strong>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
        </div>

        <div className="premium-stat-box p-4 flex flex-col justify-between h-20">
          <span className="text-[9px] font-black text-slate-405 tracking-wider uppercase block">Security Alerts</span>
          <div className="flex items-center justify-between">
            <strong className="text-base font-black text-[#2484C6]">{alerts} Alerts</strong>
            <span className="w-2 h-2 rounded-full bg-[#2484C6]"></span>
          </div>
        </div>
      </div>

      {/* ================= ZONE 2: MIDDLE SECTION (OPERATIONAL GRAPHS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance trend (Line Chart) */}
        <Card title="Attendance Rates Trend" subtitle="Daily attendance rates logged during the week">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="105%">
              <LineChart data={attendanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={3} name="Present (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department-wise Strength (Bar Chart) */}
        <Card title="Department-wise Strength" subtitle="Staff distribution counts across teams">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="105%">
              <BarChart data={deptStrengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="count" fill="#8FC9FF" radius={[4, 4, 0, 0]} name="Staff Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Performance KPI Overviews (Radar Chart) */}
        <Card title="Performance KPI Ratios" subtitle="Aggregated staff operational metrics averages">
          <div className="h-56 flex justify-center items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarKPIs}>
                  <PolarGrid stroke="#F1F5F9" />
                  <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} stroke="#CBD5E1" />
                  <Radar name="Performance" dataKey="rate" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
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
