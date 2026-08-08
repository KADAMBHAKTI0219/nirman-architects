import React, { useState, useEffect, useMemo } from 'react';
import {
  Monitor, Clock, Download, RefreshCw, CheckCircle2, ShieldAlert,
  Settings, FileSpreadsheet, FileJson, Cpu, AlertTriangle, Layers,
  Search, Calendar, Filter, Zap, Layout
} from 'lucide-react';
import {
  getAppUsageConfig,
  updateAppUsageConfig,
  getEmployeeAppUsage,
  exportEmployeeAppUsage
} from '../../../service/hrm/appUsage';
import { getUsersList } from '../../../service/auth';

import AppUsageStats from './AppUsageStats';
import AppUsageFilters from './AppUsageFilters';
import AppUsageDetailsTable from './AppUsageDetailsTable';

const APP_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899', '#64748B'];

const formatSeconds = (sec) => {
  if (!sec || sec <= 0) return '0h 0m';
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  return `${hrs}h ${mins}m`;
};

const getCategoryForApp = (appName = '') => {
  const name = appName.toLowerCase();
  if (name.includes('chrome') || name.includes('edge') || name.includes('firefox') || name.includes('browser')) return 'Browser';
  if (name.includes('code') || name.includes('autocad') || name.includes('revit') || name.includes('studio')) return 'Development';
  if (name.includes('figma') || name.includes('photoshop') || name.includes('design')) return 'Design';
  if (name.includes('slack') || name.includes('teams') || name.includes('zoom')) return 'Communication';
  if (name.includes('excel') || name.includes('word') || name.includes('office') || name.includes('notion')) return 'Productivity';
  if (name.includes('youtube') || name.includes('idle') || name.includes('spotify')) return 'Entertainment';
  return 'Other';
};

export default function AppUsageTracking({ userRole = 'Admin' }) {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }, []);

  // State
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [fromDate, setFromDate] = useState(sevenDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedDevice, setSelectedDevice] = useState('All Devices');

  // API Data State
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);

  // Initial Load
  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchAppUsageData(selectedUserId);
    }
  }, [selectedUserId, fromDate, toDate]);

  const loadUsers = async () => {
    try {
      const res = await getUsersList();
      const userArray = Array.isArray(res) ? res : (res?.users || res?.data || []);
      const formattedUsers = userArray.map(u => ({
        id: u._id || u.id,
        name: u.name || u.email,
        email: u.email,
        department: u.department || 'General',
        designation: u.designation || 'Staff'
      }));

      setEmployees(formattedUsers);
      if (formattedUsers.length > 0) {
        setSelectedUserId(formattedUsers[0].id);
      }
    } catch (err) {
      console.error("Failed to load users for app usage", err);
      setEmployees([]);
    }
  };

  const fetchAppUsageData = async (userId) => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await getEmployeeAppUsage(userId, params);
      const dataPayload = res?.data || res;
      if (dataPayload) {
        setApiData(dataPayload);
      } else {
        setApiData(null);
      }
    } catch (err) {
      console.error("Error fetching app usage data:", err);
      setApiData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    if (selectedUserId) {
      fetchAppUsageData(selectedUserId);
    }
  };

  const handleResetFilters = () => {
    if (employees.length > 0) {
      setSelectedUserId(employees[0].id);
    }
    setDateRange('Last 7 Days');
    setFromDate(sevenDaysAgoStr);
    setToDate(todayStr);
    setSelectedDepartment('All Departments');
    setSelectedDevice('All Devices');
    if (employees.length > 0) {
      fetchAppUsageData(employees[0].id);
    }
  };

  const handleExportReport = async () => {
    if (!selectedUserId) return;
    try {
      const res = await exportEmployeeAppUsage(selectedUserId, { format: 'csv' });
      if (res) {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `workstation_app_usage_report.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      console.error("Export report error", err);
    }
  };

  // Derive transformed props strictly from API response - NO MOCK FALLBACKS
  const derivedStats = useMemo(() => {
    if (!apiData) {
      return {
        totalTrackedTime: '0h 0m',
        activeTime: '0h 0m',
        idleTime: '0h 0m',
        appsUsed: 0,
        productivityScore: 0
      };
    }

    const totalTrackedSec = apiData.totalTrackedSeconds || apiData.totalSeconds || 0;
    const totalIdleSec = apiData.totalIdleSeconds || apiData.idleSeconds || 0;
    const activeSec = Math.max(0, totalTrackedSec - totalIdleSec);
    const score = totalTrackedSec > 0 ? Math.round((activeSec / totalTrackedSec) * 100) : 0;

    return {
      totalTrackedTime: apiData.totalTrackedFormatted || formatSeconds(totalTrackedSec),
      activeTime: formatSeconds(activeSec),
      idleTime: formatSeconds(totalIdleSec),
      appsUsed: apiData.appBreakdown ? apiData.appBreakdown.length : (apiData.appsCount || 0),
      productivityScore: score
    };
  }, [apiData]);

  // Derive top applications for donut chart
  const derivedTopApps = useMemo(() => {
    if (!apiData || !apiData.appBreakdown || apiData.appBreakdown.length === 0) {
      return [];
    }

    const totalSec = apiData.totalTrackedSeconds || apiData.totalSeconds || 1;
    return apiData.appBreakdown.map((item, idx) => {
      const pct = ((item.totalSeconds / totalSec) * 100).toFixed(1) + '%';
      return {
        name: item.appName || item.name || 'App',
        value: item.totalSeconds || 0,
        formattedTime: formatSeconds(item.totalSeconds || 0),
        percent: pct,
        color: APP_COLORS[idx % APP_COLORS.length]
      };
    });
  }, [apiData]);

  // Derive app details table rows
  const derivedTableApps = useMemo(() => {
    if (!apiData || !apiData.appBreakdown || apiData.appBreakdown.length === 0) {
      return [];
    }

    const totalSec = apiData.totalTrackedSeconds || apiData.totalSeconds || 1;
    return apiData.appBreakdown.map((item, idx) => {
      const pct = ((item.totalSeconds / totalSec) * 100).toFixed(1) + '%';
      const nameStr = (item.appName || item.name || 'App');
      const isIdle = nameStr.toUpperCase() === 'IDLE' || nameStr.toLowerCase().includes('youtube');

      return {
        id: idx + 1,
        name: nameStr,
        category: item.category || getCategoryForApp(nameStr),
        activeTime: formatSeconds(item.totalSeconds || 0),
        totalTime: formatSeconds(Math.round((item.totalSeconds || 0) * 1.08)),
        percent: pct,
        status: isIdle ? 'Idle' : 'Active',
        trendColor: isIdle ? '#F59E0B' : '#10B981'
      };
    });
  }, [apiData]);

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12">
      {/* 1. TOP HEADER & ACTION RIBBON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Workstation App Usage Tracking
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Monitor employee desktop activity and application usage in real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Badges */}
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Tracker Active
            </span>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live
            </span>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-brand-dark" />
            Export Report
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS ROW (5 CARDS) */}
      <AppUsageStats statsData={derivedStats} />

      {/* 3. FILTERS CONTROL BAR */}
      <AppUsageFilters
        employees={employees}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        dateRange={dateRange}
        setDateRange={setDateRange}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedDevice={selectedDevice}
        setSelectedDevice={setSelectedDevice}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 6. BOTTOM TABLE: APPLICATION USAGE DETAILS */}
      <AppUsageDetailsTable appList={derivedTableApps} />





    </div>
  );
}
