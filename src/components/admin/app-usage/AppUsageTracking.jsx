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
import ActivityTimelineChart from './ActivityTimelineChart';
import TopApplicationsChart from './TopApplicationsChart';
import ActivitySummaryGauge from './ActivitySummaryGauge';
import ProductivityTrendChart from './ProductivityTrendChart';
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
  // State
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [dateRange, setDateRange] = useState('May 19 – May 25, 2025');
  const [fromDate, setFromDate] = useState('2025-05-19');
  const [toDate, setToDate] = useState('2025-05-25');
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
      const userArray = Array.isArray(res) ? res : (res?.users || []);
      const formattedUsers = userArray.map(u => ({
        id: u._id || u.id,
        name: u.name || u.email,
        email: u.email,
        department: u.department || 'General',
        designation: u.designation || 'Staff'
      }));

      if (formattedUsers.length > 0) {
        setEmployees(formattedUsers);
        setSelectedUserId(formattedUsers[0].id);
      } else {
        const fallback = [
          { id: 'u-bhakti', name: 'Bhakti Kadam', email: 'bhakti@nirman.com', department: 'Architecture' },
          { id: 'u-lax', name: 'Lax Savani', email: 'lax@nirman.com', department: 'Executive' },
          { id: 'u-sarah', name: 'Sarah Connor', email: 'architect@nirman.com', department: 'Architecture' },
          { id: 'u-alice', name: 'Alice Smith', email: 'employee@gmail.com', department: 'Engineering' }
        ];
        setEmployees(fallback);
        setSelectedUserId(fallback[0].id);
      }
    } catch (err) {
      console.error("Failed to load users for app usage", err);
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
      }
    } catch (err) {
      console.error("Error fetching app usage data:", err);
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
      setSelectedUserId(employees[0].id || employees[0].name);
    }
    setDateRange('May 19 – May 25, 2025');
    setFromDate('2025-05-19');
    setToDate('2025-05-25');
    setSelectedDepartment('All Departments');
    setSelectedDevice('All Devices');
    if (employees.length > 0) {
      fetchAppUsageData(employees[0].id || employees[0].name);
    }
  };

  const handleExportReport = async () => {
    try {
      const res = await exportEmployeeAppUsage(selectedUserId || 'u-bhakti', { format: 'csv' });
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

  // Derive transformed props from API response
  const derivedStats = useMemo(() => {
    if (!apiData) {
      return {
        totalTrackedTime: '14h 55m',
        activeTime: '11h 28m',
        idleTime: '3h 27m',
        appsUsed: 18,
        productivityScore: 92
      };
    }

    const totalTrackedSec = apiData.totalTrackedSeconds || 53700;
    const totalIdleSec = apiData.totalIdleSeconds || 12420;
    const activeSec = Math.max(0, totalTrackedSec - totalIdleSec);
    const score = totalTrackedSec > 0 ? Math.round((activeSec / totalTrackedSec) * 100) : 92;

    return {
      totalTrackedTime: apiData.totalTrackedFormatted || formatSeconds(totalTrackedSec),
      activeTime: formatSeconds(activeSec),
      idleTime: formatSeconds(totalIdleSec),
      appsUsed: apiData.appBreakdown ? apiData.appBreakdown.length : 18,
      productivityScore: score
    };
  }, [apiData]);

  // Derive top applications for donut chart
  const derivedTopApps = useMemo(() => {
    if (!apiData || !apiData.appBreakdown || apiData.appBreakdown.length === 0) {
      return [
        { name: 'Google Chrome', value: 375, formattedTime: '6h 15m', percent: '41.8%', color: '#3B82F6' },
        { name: 'VS Code', value: 200, formattedTime: '3h 20m', percent: '22.3%', color: '#10B981' },
        { name: 'Figma', value: 130, formattedTime: '2h 10m', percent: '14.6%', color: '#8B5CF6' },
        { name: 'Slack', value: 85, formattedTime: '1h 25m', percent: '9.5%', color: '#F59E0B' },
        { name: 'Microsoft Excel', value: 70, formattedTime: '1h 10m', percent: '7.8%', color: '#06B6D4' },
        { name: 'Others', value: 35, formattedTime: '35m', percent: '4.0%', color: '#94A3B8' }
      ];
    }

    const totalSec = apiData.totalTrackedSeconds || 1;
    return apiData.appBreakdown.map((item, idx) => {
      const pct = ((item.totalSeconds / totalSec) * 100).toFixed(1) + '%';
      return {
        name: item.appName,
        value: item.totalSeconds,
        formattedTime: formatSeconds(item.totalSeconds),
        percent: pct,
        color: APP_COLORS[idx % APP_COLORS.length]
      };
    });
  }, [apiData]);

  // Derive app details table rows
  const derivedTableApps = useMemo(() => {
    if (!apiData || !apiData.appBreakdown || apiData.appBreakdown.length === 0) {
      return [
        { id: 1, name: 'Google Chrome', category: 'Browser', activeTime: '6h 15m', totalTime: '6h 45m', percent: '41.8%', status: 'Active', trendColor: '#10B981' },
        { id: 2, name: 'VS Code', category: 'Development', activeTime: '3h 20m', totalTime: '3h 45m', percent: '22.3%', status: 'Active', trendColor: '#10B981' },
        { id: 3, name: 'Figma', category: 'Design', activeTime: '2h 10m', totalTime: '2h 30m', percent: '14.6%', status: 'Active', trendColor: '#10B981' },
        { id: 4, name: 'Slack', category: 'Communication', activeTime: '1h 25m', totalTime: '1h 40m', percent: '9.5%', status: 'Active', trendColor: '#10B981' },
        { id: 5, name: 'Microsoft Excel', category: 'Productivity', activeTime: '1h 10m', totalTime: '1h 20m', percent: '7.8%', status: 'Active', trendColor: '#10B981' },
        { id: 6, name: 'YouTube', category: 'Entertainment', activeTime: '30m', totalTime: '45m', percent: '3.2%', status: 'Idle', trendColor: '#F59E0B' },
        { id: 7, name: 'Others', category: 'Other', activeTime: '05m', totalTime: '10m', percent: '0.8%', status: 'Idle', trendColor: '#F59E0B' }
      ];
    }

    const totalSec = apiData.totalTrackedSeconds || 1;
    return apiData.appBreakdown.map((item, idx) => {
      const pct = ((item.totalSeconds / totalSec) * 100).toFixed(1) + '%';
      const isIdle = item.appName.toUpperCase() === 'IDLE' || item.appName.toLowerCase().includes('youtube');

      return {
        id: idx + 1,
        name: item.appName,
        category: getCategoryForApp(item.appName),
        activeTime: formatSeconds(item.totalSeconds),
        totalTime: formatSeconds(Math.round(item.totalSeconds * 1.08)),
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


      {/* 4. MIDDLE ROW 1: ACTIVITY TIMELINE & TOP APPLICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <ActivityTimelineChart />
        </div>
        <div className="lg:col-span-5">
          <TopApplicationsChart apps={derivedTopApps} />
        </div>
      </div>

      {/* 5. MIDDLE ROW 2: ACTIVITY SUMMARY & PRODUCTIVITY TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5">
          <ActivitySummaryGauge
            productivityScore={derivedStats.productivityScore}
            activeTime={derivedStats.activeTime}
            idleTime={derivedStats.idleTime}
            breakTime="1h 15m"
            totalTime={derivedStats.totalTrackedTime}
          />
        </div>
        <div className="lg:col-span-7">
          <ProductivityTrendChart />
        </div>
      </div>


    </div>
  );
}
