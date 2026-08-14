import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, Eye, Clock, MapPin, Laptop, ShieldCheck, Smartphone,
  Download, ArrowRight, UserCheck, AlertTriangle, Users, Calendar,
  Filter, CheckCircle2, XCircle, ChevronLeft, ChevronRight, X,
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

      {/* 2. TOP STAT CARDS (5 METRIC CARDS MATCHING APP-USAGE STYLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-xs">Total Scheduled</span>
            <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand-dark flex items-center justify-center font-semibold border border-brand-secondary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-800">{metrics.total} Staff</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% Assigned</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-xs">Present / Auto-Closed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-800">{metrics.present} Staff</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>92% Attendance Rate</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-xs">Late Arrivals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-800">{metrics.late} Staff</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Grace period applied</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-xs">Absent / Leave</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100/80 text-rose-600 flex items-center justify-center border border-rose-200">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-800">{metrics.absent + metrics.onLeave} Staff</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>{metrics.absent} Absent · {metrics.onLeave} On Leave</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold text-xs">Check-In Mode</span>
            <div className="w-8 h-8 rounded-xl bg-brand-soft text-brand-dark flex items-center justify-center font-semibold border border-brand-secondary">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-bold text-slate-800">{metrics.officeCount} / {metrics.siteCount}</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 font-medium">
              <span>Laptop vs Mobile GPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTERS BAR WITH DATE SELECTOR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search employee by name, role, department..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary bg-slate-50/50"
            />
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl">
            <Calendar className="w-4 h-4 text-brand-dark" />
            <span className="text-xs font-bold text-slate-600">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
              className="px-2 py-1 border-none text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="AUTO_CLOSED">Auto Closed</option>
            <option value="Late">Late Arrival</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
          </select>

          {/* Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary cursor-pointer"
          >
            <option value="All">All Modes</option>
            <option value="Office">Office Laptop</option>
            <option value="Site">Site Mobile GPS</option>
          </select>
        </div>

        {/* Reset Filters */}
        <button
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('All');
            setModeFilter('All');
            setDepartmentFilter('All');
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Reset Filters
        </button>
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
