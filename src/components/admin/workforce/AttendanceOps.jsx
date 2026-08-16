import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Eye, Clock, MapPin, Laptop, ShieldCheck, Smartphone,
  Download, ArrowRight, UserCheck, AlertTriangle, Users, Calendar,
  Filter, CheckCircle2, XCircle, ChevronLeft, ChevronRight, ChevronDown, X,
  RotateCcw, SlidersHorizontal, History, User, TrendingUp, Coffee,
  CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';

import PageHeader from '../../common/PageHeader';
import AttendanceCalendar from '../../common/AttendanceCalendar';
import StatusBadge from '../../common/StatusBadge';
import StatsKpiCard from '../../common/StatsKpiCard';
import Pagination from '../../common/Pagination';
import useSEO from '../../../hooks/useSEO';
import { getAllAttendanceList } from '../../../service/hrm/attendance';
import { parseIndexedObjectToArray } from '../../../service/hrm/leave';

const DONUT_COLORS = ['#8FC9FF', '#A2D2FF', '#F87171', '#2484C6'];

export default function AttendanceOps({
  attendanceLogs = [],
  liveAlerts = [],
  onSelectEmployee,
  selectedEmployee: propSelectedEmployee,
  hideHeader = false
}) {
  const [apiLogs, setApiLogs] = useState([]);
  const [loadingApi, setLoadingApi] = useState(false);

  // Navigation & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All | Present | Late | Absent | On Leave
  const [modeFilter, setModeFilter] = useState('All'); // All | Office | Site
  const [departmentFilter, setDepartmentFilter] = useState('All');
  // Current-Year Month & Date-Only Calendar Filter states
  const todaySystemDateObj = useMemo(() => new Date(), []);
  const currentYear = todaySystemDateObj.getFullYear(); // Locked to Current Year (2026)
  const todaySystemDateStr = useMemo(() => {
    const y = todaySystemDateObj.getFullYear();
    const m = String(todaySystemDateObj.getMonth() + 1).padStart(2, '0');
    const d = String(todaySystemDateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [todaySystemDateObj]);

  const [selectedDate, setSelectedDate] = useState(todaySystemDateStr);
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [showMonthView, setShowMonthView] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(todaySystemDateObj.getMonth()); // 0-11

  const monthNames = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  const monthShortNames = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);

  const calendarGridDays = useMemo(() => {
    const totalDays = new Date(currentYear, pickerMonth + 1, 0).getDate();
    const firstDayIdx = new Date(currentYear, pickerMonth, 1).getDay(); // 0 = Sun
    const adjustedFirstDayIdx = firstDayIdx === 0 ? 6 : firstDayIdx - 1; // Mon=0...Sun=6

    const daysArr = [];
    for (let i = 0; i < adjustedFirstDayIdx; i++) {
      daysArr.push(null);
    }
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isFuture = dateStr > todaySystemDateStr;
      const isToday = dateStr === todaySystemDateStr;
      const isSelected = dateStr === selectedDate;
      daysArr.push({ day, dateStr, isFuture, isToday, isSelected });
    }
    return daysArr;
  }, [currentYear, pickerMonth, todaySystemDateStr, selectedDate]);

  const formattedSelectedDateLabel = useMemo(() => {
    if (!selectedDate) return 'Select Date';
    const [y, m, d] = selectedDate.split('-');
    const mIdx = parseInt(m, 10) - 1;
    const monthStr = monthShortNames[mIdx] || '';
    if (selectedDate === todaySystemDateStr) {
      return `Today (${d} ${monthStr} ${y})`;
    }
    return `${d} ${monthStr} ${y}`;
  }, [selectedDate, todaySystemDateStr, monthShortNames]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Punch Timeline Inspection Modal
  const [inspectEmployee, setInspectEmployee] = useState(null);
  const [inspectDate, setInspectDate] = useState(new Date().toISOString().split('T')[0]);

  const formatBackendTime = (timeVal) => {
    if (!timeVal) return null;
    const d = new Date(timeVal);
    if (isNaN(d.getTime())) return typeof timeVal === 'string' ? timeVal : null;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const toYMD = (dateVal) => {
    if (!dateVal) return new Date().toISOString().split('T')[0];
    if (typeof dateVal === 'string') {
      const trimmed = dateVal.trim();
      const parts = trimmed.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
        if (parts[2].length === 4) return `${parts[2]}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
      }
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchRealAttendance = async () => {
      setLoadingApi(true);
      try {
        const res = await getAllAttendanceList();
        const list = parseIndexedObjectToArray(res);
        if (list && list.length > 0) {
          const mapped = list.map((log, idx) => {
            const emp = typeof log.userId === 'object' ? log.userId : {};
            const isSite = (log.deviceId || '').toLowerCase().includes('gps') || (log.deviceId || '').toLowerCase().includes('mobile');
            
            const timeInStr = formatBackendTime(log.clockInTime) || formatBackendTime(log.clientClockIn) || 'N/A';
            const timeOutStr = formatBackendTime(log.clockOutTime) || formatBackendTime(log.clientClockOut) || (log.clockInTime ? 'In Progress' : 'N/A');
            
            let hoursStr = '0.00 hrs';
            if (typeof log.workingHours === 'number') {
              hoursStr = `${log.workingHours.toFixed(2)} hrs`;
            } else if (log.workingHours) {
              hoursStr = `${log.workingHours} hrs`;
            } else if (log.clockInTime && log.clockOutTime) {
              const diffMs = new Date(log.clockOutTime) - new Date(log.clockInTime);
              hoursStr = `${(diffMs / 3600000).toFixed(2)} hrs`;
            }

            const logDate = log.clockInTime ? toYMD(log.clockInTime) : toYMD(log.date || log.createdAt || selectedDate);

            return {
              id: log._id || log.id || `att-${idx}`,
              employeeId: emp._id || emp.id || `u-${idx}`,
              name: emp.name || log.name || emp.fullName || 'Staff Member',
              role: emp.designation || emp.role || 'Staff Member',
              department: emp.department || 'Operations',
              timeIn: timeInStr,
              timeOut: timeOutStr,
              hours: hoursStr,
              mode: isSite ? 'Site' : 'Office',
              status: log.status || (log.clockInTime ? 'Present' : 'Absent'),
              date: logDate,
              clockInTime: log.clockInTime,
              clockOutTime: log.clockOutTime
            };
          });

          // Show all logs directly from backend
          setApiLogs(mapped);
        } else {
          setApiLogs([]);
        }
      } catch (err) {
        console.warn("Notice fetching real attendance list:", err);
        setApiLogs([]);
      } finally {
        setLoadingApi(false);
      }
    };
    fetchRealAttendance();
    const pollInterval = setInterval(() => {
      fetchRealAttendance();
    }, 20000);

    return () => clearInterval(pollInterval);
  }, []);

  // Employee attendance list from real backend logs
  const sampleLogs = useMemo(() => {
    if (attendanceLogs && attendanceLogs.length > 0) {
      return attendanceLogs;
    }
    if (apiLogs && apiLogs.length > 0) {
      return apiLogs;
    }
    return [];
  }, [attendanceLogs, apiLogs]);

  // Group logs by employee so that 1 employee has 1 consolidated row with all logs
  const groupedEmployeeSummary = useMemo(() => {
    const map = new Map();

    sampleLogs.forEach(log => {
      const empKey = log.employeeId || log.userId || log.email || log.name;
      if (!map.has(empKey)) {
        map.set(empKey, {
          id: empKey,
          employeeId: log.employeeId || log.userId || empKey,
          name: log.name || log.employeeName || 'Staff Member',
          role: log.role || log.designation || 'Staff',
          department: log.department || 'Operations',
          status: log.status || 'Present',
          mode: log.mode || 'Office',
          date: log.date || selectedDate,
          firstIn: log.timeIn || 'N/A',
          lastOut: log.timeOut || 'In Progress',
          hours: log.hours || '0.00 hrs',
          punchesCount: 1,
          logs: [log]
        });
      } else {
        const existing = map.get(empKey);
        existing.punchesCount += 1;
        existing.logs.push(log);
        if (log.timeOut && log.timeOut !== 'N/A') {
          existing.lastOut = log.timeOut;
        }
      }
    });

    return Array.from(map.values());
  }, [sampleLogs, selectedDate]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return groupedEmployeeSummary.filter(emp => {
      const matchesSearch = (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
      const matchesMode = modeFilter === 'All' || emp.mode === modeFilter;
      const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesMode && matchesDept;
    });
  }, [groupedEmployeeSummary, searchQuery, statusFilter, modeFilter, departmentFilter]);

  // Paginated list (limit 10 per page)
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = groupedEmployeeSummary.length;
    const present = groupedEmployeeSummary.filter(e => e.status === 'Present' || e.status === 'AUTO_CLOSED').length;
    const late = groupedEmployeeSummary.filter(e => e.status === 'Late').length;
    const absent = groupedEmployeeSummary.filter(e => e.status === 'Absent').length;
    const onLeave = groupedEmployeeSummary.filter(e => e.status === 'On Leave').length;
    const officeCount = groupedEmployeeSummary.filter(e => e.mode === 'Office').length;
    const siteCount = groupedEmployeeSummary.filter(e => e.mode === 'Site').length;

    return { total, present, late, absent, onLeave, officeCount, siteCount };
  }, [groupedEmployeeSummary]);

  // Charts Data
  const donutData = [
    { name: 'Present / Auto-Closed', value: metrics.present },
    { name: 'Late Arrival', value: metrics.late },
    { name: 'Absent', value: metrics.absent },
    { name: 'On Leave', value: metrics.onLeave }
  ];

  const trendData = [
    { day: 'Mon', office: metrics.officeCount, site: metrics.siteCount },
    { day: 'Tue', office: metrics.officeCount, site: metrics.siteCount },
    { day: 'Wed', office: metrics.officeCount, site: metrics.siteCount },
    { day: 'Thu', office: metrics.officeCount, site: metrics.siteCount },
    { day: 'Fri', office: metrics.officeCount, site: metrics.siteCount }
  ];

  const handleOpenInspect = (emp) => {
    setInspectEmployee(emp);
    const validInspectDate = toYMD(selectedDate || emp.date || new Date());
    setInspectDate(validInspectDate);
    if (onSelectEmployee) {
      onSelectEmployee(emp.logs?.[0] || emp);
    }
  };

  // Modal Punch Sessions state for inspect modal
  const [modalSessions, setModalSessions] = useState([]);
  const [loadingModalSessions, setLoadingModalSessions] = useState(false);

  useEffect(() => {
    if (!inspectEmployee) return;

    const fetchSessionsForModal = async () => {
      setLoadingModalSessions(true);
      try {
        const empId = inspectEmployee.employeeId || inspectEmployee.id || inspectEmployee._id;
        const empName = (inspectEmployee.name || '').toLowerCase();

        const res = await getAllAttendanceList({ userId: empId });
        const list = parseIndexedObjectToArray(res);
        if (list && list.length > 0) {
          // Filter logs matching the inspected employee
          const userLogs = list.filter(log => {
            const u = (typeof log.userId === 'object' && log.userId) ? log.userId : ((typeof log.employeeId === 'object' && log.employeeId) ? log.employeeId : {});
            const uid = u._id || u.id || log.userId || log.employeeId;
            const uname = (u.name || log.name || '').toLowerCase();

            return uid === empId || (empName && (uname.includes(empName) || empName.includes(uname)));
          });

          const formatted = userLogs.map((log, idx) => {
            const rawIn = log.clockInTime || log.clockIn || log.clientClockIn;
            const rawOut = log.clockOutTime || log.clockOut || log.clientClockOut;
            const timeInStr = formatBackendTime(rawIn) || 'N/A';
            const timeOutStr = formatBackendTime(rawOut) || (rawIn ? 'In Progress' : 'N/A');
            
            let hoursStr = '0.00 hrs';
            if (typeof log.workingHours === 'number') {
              hoursStr = `${log.workingHours.toFixed(2)} hrs`;
            } else if (log.workingHours) {
              hoursStr = `${log.workingHours} hrs`;
            } else if (rawIn && rawOut) {
              const diffMs = new Date(rawOut) - new Date(rawIn);
              hoursStr = `${(diffMs / 3600000).toFixed(2)} hrs`;
            }
            const isSite = (log.deviceId || '').toLowerCase().includes('gps') || (log.deviceId || '').toLowerCase().includes('mobile');
            const logDate = toYMD(log.date || rawIn || log.createdAt);

            return {
              sessionNum: idx + 1,
              date: logDate,
              timeIn: timeInStr,
              timeOut: timeOutStr,
              mode: isSite ? 'Site' : 'Office',
              status: log.status || 'PRESENT',
              duration: hoursStr,
              clockInTime: rawIn
            };
          });

          // Strict match by inspectDate chosen by user in date picker
          const dateMatched = formatted.filter(l => l.date === inspectDate);
          setModalSessions(dateMatched);
        } else if (inspectEmployee.logs && inspectEmployee.logs.length > 0) {
          const formatted = inspectEmployee.logs.map((m, idx) => ({
            sessionNum: idx + 1,
            date: toYMD(m.date) || m.date,
            timeIn: m.timeIn || 'N/A',
            timeOut: m.timeOut || 'N/A',
            mode: m.mode || 'Office',
            status: m.status || 'PRESENT',
            duration: m.hours || '0.00 hrs'
          }));
          const dateMatched = formatted.filter(l => l.date === inspectDate);
          setModalSessions(dateMatched);
        } else {
          setModalSessions([]);
        }
      } catch (err) {
        console.warn("Notice fetching modal punch sessions:", err);
        setModalSessions([]);
      } finally {
        setLoadingModalSessions(false);
      }
    };

    fetchSessionsForModal();
  }, [inspectEmployee, inspectDate]);

  // Compute calculated inspect metrics
  const inspectTotalHours = useMemo(() => {
    if (modalSessions.length === 0) return '0.00 hrs';
    let total = 0;
    modalSessions.forEach(s => {
      const h = parseFloat(s.duration);
      if (!isNaN(h)) total += h;
    });
    return total > 0 ? `${total.toFixed(2)} hrs` : (inspectEmployee?.hours || '0.00 hrs');
  }, [modalSessions, inspectEmployee]);

  const inspectStatus = useMemo(() => {
    if (modalSessions.length > 0) {
      return modalSessions[0].status || 'Present';
    }
    return inspectEmployee?.status || 'Absent';
  }, [modalSessions, inspectEmployee]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
      case 'AUTO_CLOSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Late':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Absent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'On Leave':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  useSEO({
    title: 'Attendance Operations & Punch Summary',
    description: 'Monitor real-time biometric staff attendance, office/site punches, and daily working hours for Nirman Architects.',
    keywords: 'Attendance Ops, Biometric Attendance, Staff Punch Logs, Workstation Tracker, Nirman Architects'
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">

      {/* 1. TOP PAGE HEADER & EXPORT ACTION */}
      {!hideHeader && (
        <PageHeader
          title="Attendance Operations & Summary"
          subtitle="Monitor daily employee attendance summary, punches, biometric validation & date-wise punch timelines"
          actions={
            <button
              onClick={() => alert(`Exporting Attendance Data for ${selectedDate}...`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer border border-brand-soft"
            >
              <Download className="w-4 h-4 text-brand-dark" />
              Export Attendance Report
            </button>
          }
        />
      )}

      {/* 2. TOP STAT CARDS (CLEAN & UN-CLUSTERED RESPONSIVE GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total Scheduled */}
        <div 
          onClick={() => { setStatusFilter('All'); setModeFilter('All'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
            statusFilter === 'All' && modeFilter === 'All'
              ? 'bg-white border-brand-secondary ring-2 ring-brand-primary/60 shadow-xs scale-[1.01]'
              : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Total Scheduled</span>
            <div className="w-8 h-8 rounded-xl bg-brand-soft text-[#3B82F6] flex items-center justify-center border border-brand-primary/40">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{metrics.total} Staff</div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% Assigned</span>
            </div>
          </div>
        </div>

        {/* Card 2: Present / Auto-Closed */}
        <div 
          onClick={() => { setStatusFilter('Present'); setModeFilter('All'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
            statusFilter === 'Present' && modeFilter === 'All'
              ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xs scale-[1.01]'
              : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Present / Auto-Closed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{metrics.present} Staff</div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{metrics.total > 0 ? Math.round((metrics.present / metrics.total) * 100) : 0}% Attendance Rate</span>
            </div>
          </div>
        </div>

        {/* Card 3: Late Arrivals */}
        <div 
          onClick={() => { setStatusFilter('Late'); setModeFilter('All'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
            statusFilter === 'Late' && modeFilter === 'All'
              ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-500/40 shadow-xs scale-[1.01]'
              : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Late Arrivals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{metrics.late} Staff</div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-600 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{metrics.late > 0 ? `${metrics.late} Late Logged` : 'Grace period applied'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Absent / Leave */}
        <div 
          onClick={() => { 
            setModeFilter('All'); 
            setStatusFilter(prev => prev === 'Absent' ? 'On Leave' : (prev === 'On Leave' ? 'All' : 'Absent')); 
            setCurrentPage(1); 
          }}
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
            (statusFilter === 'Absent' || statusFilter === 'On Leave') && modeFilter === 'All'
              ? 'bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/40 shadow-xs scale-[1.01]'
              : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Absent / Leave</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{metrics.absent + metrics.onLeave} Staff</div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500 font-bold">
              <span>{metrics.absent} Absent · {metrics.onLeave} On Leave</span>
            </div>
          </div>
        </div>

        {/* Card 5: Check-In Mode */}
        <div 
          onClick={() => { 
            setStatusFilter('All');
            setModeFilter(prev => prev === 'Office' ? 'Site' : (prev === 'Site' ? 'All' : 'Office'));
            setCurrentPage(1); 
          }}
          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${
            modeFilter !== 'All' && statusFilter === 'All'
              ? 'bg-brand-soft/40 border-brand-secondary ring-2 ring-brand-primary/60 shadow-xs scale-[1.01]'
              : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Check-In Mode</span>
            <div className="w-8 h-8 rounded-xl bg-brand-soft text-[#3B82F6] flex items-center justify-center border border-brand-primary/40">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{metrics.officeCount} / {metrics.siteCount}</div>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500 font-bold">
              <span>{metrics.officeCount} Laptop vs {metrics.siteCount} Mobile</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CLEAN RESPONSIVE FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee, role, department..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary bg-slate-50/50"
            />
          </div>

          {/* Current-Year Month & Date-Only Calendar Filter Component */}
          <div className="lg:col-span-3 relative">
            <button
              type="button"
              onClick={() => setShowDatePopover(prev => !prev)}
              className="w-full flex items-center justify-between gap-2 bg-slate-50/80 px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary cursor-pointer transition-all hover:bg-slate-100/60"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span className="text-xs font-bold text-slate-500 shrink-0">Date:</span>
                <span className="text-xs font-black text-slate-900">{formattedSelectedDateLabel}</span>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showDatePopover ? 'rotate-90 text-[#3B82F6]' : ''}`} />
            </button>

            {/* Popover Card (Ultra-Compact Zero-Scroll Design) */}
            {showDatePopover && (
              <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-white rounded-2xl p-3.5 shadow-2xl border border-slate-200/90 space-y-2.5 animate-in fade-in duration-150 text-left">
                
                {/* Popover Header with Clickable Month Name & Current Year */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowMonthView(prev => !prev)}
                    className="flex items-center gap-1.5 px-2 py-0.5 hover:bg-slate-100 rounded-lg transition-all cursor-pointer text-xs font-black text-slate-900 group"
                    title="Click to select month"
                  >
                    <span>{monthNames[pickerMonth]}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono font-bold text-[10px] rounded-md border border-slate-200">
                      {currentYear}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#3B82F6] transition-transform ${showMonthView ? 'rotate-180 text-[#3B82F6]' : ''}`} />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pickerMonth === 0}
                      onClick={() => setPickerMonth(prev => Math.max(0, prev - 1))}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={pickerMonth === 11}
                      onClick={() => setPickerMonth(prev => Math.min(11, prev + 1))}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
                      title="Next Month"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* CONDITIONAL VIEW: 1. MONTH SELECTOR GRID */}
                {showMonthView ? (
                  <div className="py-1 space-y-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">
                      Select Month ({currentYear})
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {monthShortNames.map((mName, idx) => (
                        <button
                          key={mName}
                          type="button"
                          onClick={() => {
                            setPickerMonth(idx);
                            setShowMonthView(false);
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center ${
                            pickerMonth === idx
                              ? 'bg-brand-secondary text-slate-900 border border-brand-secondary/60 shadow-3xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          {mName}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* CONDITIONAL VIEW: 2. CALENDAR DAYS GRID (Compact Zero-Scroll View) */
                  <div className="space-y-2">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Days Selection Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {calendarGridDays.map((item, idx) => {
                        if (!item) {
                          return <div key={`empty-${idx}`} className="w-7 h-7" />;
                        }
                        return (
                          <button
                            key={item.dateStr}
                            type="button"
                            disabled={item.isFuture}
                            onClick={() => {
                              setSelectedDate(item.dateStr);
                              setCurrentPage(1);
                              setShowDatePopover(false);
                            }}
                            className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer relative flex items-center justify-center ${
                              item.isSelected
                                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-slate-900 shadow-xs border border-brand-secondary/60 font-black'
                                : item.isToday
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-black'
                                : item.isFuture
                                ? 'opacity-30 cursor-not-allowed text-slate-400'
                                : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            {item.day}
                            {item.isToday && !item.isSelected && (
                              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer: Quick Action [ Today ] Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(todaySystemDateStr);
                      setPickerMonth(todaySystemDateObj.getMonth());
                      setShowMonthView(false);
                      setCurrentPage(1);
                      setShowDatePopover(false);
                    }}
                    className="px-2.5 py-1 bg-gradient-to-r from-brand-primary/40 to-brand-secondary/40 hover:from-brand-primary hover:to-brand-secondary text-slate-900 font-black text-[11px] rounded-lg border border-brand-secondary/50 cursor-pointer transition-all shadow-3xs"
                  >
                    Today ({todaySystemDateStr.split('-').reverse().join('-')})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDatePopover(false);
                      setShowMonthView(false);
                    }}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer px-1.5 py-0.5"
                  >
                    Close
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="AUTO_CLOSED">Auto Closed</option>
              <option value="Late">Late Arrival</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div className="lg:col-span-2">
            <select
              value={modeFilter}
              onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 cursor-pointer"
            >
              <option value="All">All Modes</option>
              <option value="Office">Office Laptop</option>
              <option value="Site">Site Mobile GPS</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setModeFilter('All');
                setDepartmentFilter('All');
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setCurrentPage(1);
              }}
              title="Reset All Filters"
              className="p-2.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center w-full font-bold text-xs"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
            </button>
          </div>

        </div>
      </div>

      {/* 4. MAIN DAILY EMPLOYEE ATTENDANCE SUMMARY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-brand-dark" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-snug">Daily Employee Attendance</h3>
              <p className="text-xs text-slate-500">Date: <strong className="text-slate-800 font-mono">{selectedDate}</strong></p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            Showing {filteredEmployees.length} unique employees
          </span>
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200/90 bg-slate-50/80 text-[10px]">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">First Clock-In</th>
                <th className="py-3.5 px-4">Last Clock-Out</th>
                <th className="py-3.5 px-4">Total Hours</th>
                <th className="py-3.5 px-4">Check-In Mode</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 font-normal text-slate-700">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map(emp => (
                  <tr 
                    key={emp.id} 
                    onClick={() => handleOpenInspect(emp)}
                    className="hover:bg-brand-soft/50 cursor-pointer transition-colors"
                  >
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark font-semibold text-xs flex items-center justify-center border border-brand-secondary/60 shrink-0">
                          {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{emp.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {emp.department}
                    </td>

                    {/* First Clock-In */}
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {emp.firstIn}
                    </td>

                    {/* Last Clock-Out */}
                    <td className="py-3.5 px-4 font-medium text-slate-500">
                      {emp.lastOut}
                    </td>

                    {/* Total Hours */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {emp.hours}
                    </td>

                    {/* Mode */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        {emp.mode === 'Office' ? <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                        <span>{emp.mode}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.status} size="sm" />
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenInspect(emp)}
                        className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-semibold rounded-xl border border-brand-secondary/30 transition-all text-xs inline-flex items-center gap-1.5 ml-auto cursor-pointer shadow-2xs"
                      >
                        <History className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                        <span>View Timeline</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400 font-medium">
                    No employee attendance records found for {selectedDate}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Integrated Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* 5. SUMMARY ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">Attendance Present Distribution</h3>
            <span className="text-[11px] text-slate-400 font-bold">{selectedDate}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donutData.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                    <td className="px-4 py-2.5 font-semibold text-blue-600">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">Office vs Site Check-In Trends</h3>
            <span className="text-[11px] text-slate-400 font-bold">Weekly</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-2">Day</th>
                  <th className="px-4 py-2">Office Laptop</th>
                  <th className="px-4 py-2">Site Mobile GPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trendData.map((row) => (
                  <tr key={row.day} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{row.day}</td>
                    <td className="px-4 py-2.5 font-semibold text-blue-600">{row.office}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-600">{row.site}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. INSPECT EMPLOYEE PUNCH TIMELINE MODAL (WITH DATE PICKER FILTER) */}
      {inspectEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 text-left border border-slate-100">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand-dark font-black text-base flex items-center justify-center border border-brand-secondary shadow-xs">
                  {inspectEmployee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Employee Punch History</span>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{inspectEmployee.name}</h2>
                  <span className="text-xs text-slate-500 font-medium">{inspectEmployee.role} • {inspectEmployee.department}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectEmployee(null)}
                className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-700 transition-all cursor-pointer font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Date Picker Bar & Today Status Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-dark" />
                <span className="text-xs font-bold text-slate-700">Inspect Date:</span>
                <input
                  type="date"
                  value={inspectDate}
                  onChange={(e) => setInspectDate(e.target.value)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 cursor-pointer shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-black border uppercase ${getStatusBadge(inspectStatus)}`}>
                    {inspectStatus}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Hours</span>
                  <span className="text-sm font-black text-slate-900">{inspectTotalHours}</span>
                </div>
              </div>
            </div>

            {/* Date-wise Clock-In & Clock-Out Punch Sessions Timeline List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-dark" />
                  Check-In & Check-Out Timeline ({modalSessions.length} {modalSessions.length === 1 ? 'Entry' : 'Entries'})
                </h4>
                <span className="text-[11px] font-mono font-bold text-slate-500">Date: {inspectDate}</span>
              </div>

              <div className="space-y-3">
                {loadingModalSessions ? (
                  <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50 rounded-2xl border border-slate-200">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-1" />
                    Loading punch sessions for {inspectDate}...
                  </div>
                ) : modalSessions.map((session, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 hover:bg-slate-50 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-brand-dark bg-brand-soft border border-brand-secondary px-2.5 py-0.5 rounded-lg text-[10px]">
                        Punch Session #{session.sessionNum || idx + 1}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono font-bold">
                        {session.date || inspectDate}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Clock In</span>
                        <span className="font-mono font-extrabold text-emerald-600 text-sm block mt-0.5">{session.timeIn}</span>
                        <span className="text-[10px] text-slate-400 font-medium">via {session.mode || 'Office Laptop'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Clock Out</span>
                        <span className="font-mono font-extrabold text-slate-800 text-sm block mt-0.5">{session.timeOut}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{session.status || 'AUTO_CLOSED'}</span>
                      </div>

                      <div className="sm:col-span-1 col-span-2">
                        <span className="text-slate-400 text-[10px] font-bold uppercase block">Session Duration</span>
                        <span className="font-black text-slate-900 text-sm block mt-0.5">{session.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {!loadingModalSessions && modalSessions.length === 0 && (
                  <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No punch sessions recorded for {inspectEmployee.name} on {inspectDate}.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectEmployee(null)}
                className="px-6 py-2.5 bg-brand-soft hover:bg-brand-primary text-brand-dark font-extrabold rounded-xl transition-all text-xs cursor-pointer shadow-2xs"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
