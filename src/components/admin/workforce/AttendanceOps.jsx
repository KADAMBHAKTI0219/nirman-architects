import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Search, Eye, Clock, MapPin, Laptop, ShieldCheck, Smartphone,
  Download, ArrowRight, UserCheck, AlertTriangle, Users, Calendar,
  Filter, CheckCircle2, XCircle, ChevronLeft, ChevronRight, X,
  RotateCcw, SlidersHorizontal, History, User, TrendingUp, Coffee,
  CheckCircle, AlertCircle
} from 'lucide-react';

import PageHeader from '../../common/PageHeader';
import AttendanceCalendar from '../../common/AttendanceCalendar';

const DONUT_COLORS = ['#8FC9FF', '#A2D2FF', '#F87171', '#2484C6'];

export default function AttendanceOps({
  attendanceLogs = [],
  liveAlerts = [],
  onSelectEmployee,
  selectedEmployee: propSelectedEmployee
}) {
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

  // Generate fallback employee attendance list if props are empty or minimal
  const sampleLogs = useMemo(() => {
    if (attendanceLogs && attendanceLogs.length > 0) {
      return attendanceLogs;
    }

    return [
      { id: 'att-1', employeeId: 'u-1', name: 'Bhakti Kadam', role: 'HR Officer', department: 'Operations', timeIn: '09:46 AM', timeOut: '01:11 PM', hours: '1.48 hrs', mode: 'Office', status: 'AUTO_CLOSED', date: selectedDate },
      { id: 'att-2', employeeId: 'u-1', name: 'Bhakti Kadam', role: 'HR Officer', department: 'Operations', timeIn: '09:21 PM', timeOut: '09:44 PM', hours: '0.38 hrs', mode: 'Office', status: 'AUTO_CLOSED', date: selectedDate },
      { id: 'att-3', employeeId: 'u-2', name: 'Lax Savani', role: 'Admin', department: 'Executive', timeIn: '08:50 AM', timeOut: '05:40 PM', hours: '8.83 hrs', mode: 'Office', status: 'Present', date: selectedDate },
      { id: 'att-4', employeeId: 'u-3', name: 'Sarah Connor', role: 'Lead Architect', department: 'Architecture', timeIn: '09:45 AM', timeOut: '06:30 PM', hours: '8.75 hrs', mode: 'Office', status: 'Late', date: selectedDate },
      { id: 'att-5', employeeId: 'u-4', name: 'Alice Smith', role: 'Staff Engineer', department: 'Engineering', timeIn: '09:00 AM', timeOut: '06:00 PM', hours: '9.00 hrs', mode: 'Office', status: 'Present', date: selectedDate },
      { id: 'att-6', employeeId: 'u-5', name: 'Bob Johnson', role: 'Site Engineer', department: 'Construction', timeIn: '08:30 AM', timeOut: '05:00 PM', hours: '8.50 hrs', mode: 'Site', status: 'Present', date: selectedDate },
      { id: 'att-7', employeeId: 'u-6', name: 'Charlie Brown', role: 'Project Manager', department: 'Management', timeIn: '09:10 AM', timeOut: '06:20 PM', hours: '9.16 hrs', mode: 'Office', status: 'Present', date: selectedDate },
      { id: 'att-8', employeeId: 'u-7', name: 'Vikram Singh', role: 'Site Supervisor', department: 'Construction', timeIn: '08:40 AM', timeOut: '05:30 PM', hours: '8.83 hrs', mode: 'Site', status: 'Present', date: selectedDate },
      { id: 'att-9', employeeId: 'u-8', name: 'Priya Sharma', role: 'Interior Designer', department: 'Architecture', timeIn: '09:30 AM', timeOut: '06:15 PM', hours: '8.75 hrs', mode: 'Office', status: 'Late', date: selectedDate },
      { id: 'att-10', employeeId: 'u-9', name: 'Aarav Shah', role: 'Structural Engineer', department: 'Engineering', timeIn: 'N/A', timeOut: 'N/A', hours: '0.00 hrs', mode: 'Office', status: 'Absent', date: selectedDate }
    ];
  }, [attendanceLogs, selectedDate]);

  // Group logs by employee so that 1 employee has 1 consolidated row for the selected date
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
          hours: log.hours || '1.48 hrs',
          punchesCount: 32,
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
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());
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
    const total = groupedEmployeeSummary.length || 148;
    const present = groupedEmployeeSummary.filter(e => e.status === 'Present' || e.status === 'AUTO_CLOSED').length || 132;
    const late = groupedEmployeeSummary.filter(e => e.status === 'Late').length || 6;
    const absent = groupedEmployeeSummary.filter(e => e.status === 'Absent').length || 7;
    const onLeave = groupedEmployeeSummary.filter(e => e.status === 'On Leave').length || 3;
    const officeCount = groupedEmployeeSummary.filter(e => e.mode === 'Office').length || 110;
    const siteCount = groupedEmployeeSummary.filter(e => e.mode === 'Site').length || 38;

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
    { day: 'Mon', office: 105, site: 35 },
    { day: 'Tue', office: 112, site: 36 },
    { day: 'Wed', office: 108, site: 38 },
    { day: 'Thu', office: 110, site: 34 },
    { day: 'Fri', office: 114, site: 37 }
  ];

  const handleOpenInspect = (emp) => {
    setInspectEmployee(emp);
    setInspectDate(emp.date || selectedDate);
    if (onSelectEmployee) {
      onSelectEmployee(emp.logs[0] || emp);
    }
  };

  // Date-wise dynamic punch sessions for inspect modal
  const inspectSessions = useMemo(() => {
    if (!inspectEmployee) return [];

    // Filter logs matching the inspectDate
    const matched = (inspectEmployee.logs || []).filter(l => !inspectDate || l.date === inspectDate || l.clockInTime?.startsWith(inspectDate));

    if (matched.length > 0) {
      return matched.map((m, idx) => ({
        sessionNum: idx + 1,
        date: inspectDate,
        timeIn: m.timeIn || '09:46 AM',
        timeOut: m.timeOut || '11:15 AM',
        mode: m.mode || 'Office',
        status: m.status || 'AUTO_CLOSED',
        duration: m.hours || '1.48 hrs'
      }));
    }

    // Default mock timeline sessions for date selection display
    return [
      { sessionNum: 1, date: inspectDate, timeIn: '09:46 AM', timeOut: '11:15 AM', mode: 'Office', status: 'AUTO_CLOSED', duration: '1.48 hrs' },
      { sessionNum: 2, date: inspectDate, timeIn: '09:21 PM', timeOut: '09:44 PM', mode: 'Office', status: 'AUTO_CLOSED', duration: '0.38 hrs' },
      { sessionNum: 3, date: inspectDate, timeIn: '08:59 PM', timeOut: '09:21 PM', mode: 'Office', status: 'AUTO_CLOSED', duration: '0.36 hrs' },
      { sessionNum: 4, date: inspectDate, timeIn: '06:59 PM', timeOut: '06:59 PM', mode: 'Office', status: 'AUTO_CLOSED', duration: '0.00 hrs' }
    ];
  }, [inspectEmployee, inspectDate]);

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

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">

      {/* 1. TOP PAGE HEADER & EXPORT ACTION */}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 bg-slate-50/80 text-[10px]">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">First Clock-In</th>
                <th className="py-3.5 px-4">Last Clock-Out</th>
                <th className="py-3.5 px-4">Total Hours</th>
                <th className="py-3.5 px-4">Check-In Mode</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Punches</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark font-extrabold text-xs flex items-center justify-center border border-brand-secondary">
                          {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{emp.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {emp.department}
                    </td>

                    {/* First Clock-In */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {emp.firstIn}
                    </td>

                    {/* Last Clock-Out */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 font-bold">
                      {emp.lastOut}
                    </td>

                    {/* Total Hours */}
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {emp.hours}
                    </td>

                    {/* Mode */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        {emp.mode === 'Office' ? <Laptop className="w-3.5 h-3.5 text-slate-400" /> : <Smartphone className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{emp.mode}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusBadge(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>

                    {/* Punches Count Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px]">
                        {emp.punchesCount} {emp.punchesCount === 1 ? 'Punch' : 'Punches'}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenInspect(emp)}
                        className="px-3.5 py-1.5 bg-brand-soft hover:bg-brand-primary text-brand-dark font-extrabold rounded-xl border border-brand-secondary transition-all text-xs flex items-center gap-1.5 ml-auto cursor-pointer shadow-2xs"
                      >
                        <History className="w-3.5 h-3.5 text-brand-dark" />
                        View Timeline
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-slate-400 font-bold">
                    No employee attendance records found for {selectedDate}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <div>
            Showing {filteredEmployees.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === page ? 'bg-brand-primary text-brand-dark font-extrabold shadow-2xs' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">Attendance Present Distribution</h3>
            <span className="text-[11px] text-slate-400 font-bold">{selectedDate}</span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">Office vs Site Check-In Trends</h3>
            <span className="text-[11px] text-slate-400 font-bold">Weekly</span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={11} fontWeight="bold" />
                <Tooltip />
                <Legend />
                <Bar dataKey="office" stackId="a" fill="#BDE0FE" name="Office Laptop" radius={[0, 0, 0, 0]} />
                <Bar dataKey="site" stackId="a" fill="#10B981" name="Site Mobile GPS" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-black border uppercase ${getStatusBadge(inspectEmployee.status)}`}>
                    {inspectEmployee.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Hours</span>
                  <span className="text-sm font-black text-slate-900">{inspectEmployee.hours}</span>
                </div>
              </div>
            </div>

            {/* Date-wise Clock-In & Clock-Out Punch Sessions Timeline List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-2">
                  <History className="w-4 h-4 text-brand-dark" />
                  Check-In & Check-Out Timeline ({inspectSessions.length} {inspectSessions.length === 1 ? 'Entry' : 'Entries'})
                </h4>
                <span className="text-[11px] font-mono font-bold text-slate-500">Date: {inspectDate}</span>
              </div>

              <div className="space-y-3">
                {inspectSessions.map((session, idx) => (
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
                        <span className="font-black text-slate-900 text-sm block mt-0.5">{session.duration || '1.48 hrs'}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {inspectSessions.length === 0 && (
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
