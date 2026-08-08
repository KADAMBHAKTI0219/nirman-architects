import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, AlertCircle, Download, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AttendanceCalendar from './AttendanceCalendar';
import AttendanceDetailDrawer from './AttendanceDetailDrawer';
import AttendanceOps from '../../admin/workforce/AttendanceOps';

export default function Attendance({ defaultTab = 'overview' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab); // overview, daily, monthly, exceptions

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabs = [
    { id: 'overview', label: 'Attendance Command' },
    { id: 'daily', label: 'Daily Punch Logs' },
    { id: 'monthly', label: 'Monthly Rota Calendar' },
    { id: 'exceptions', label: 'Late & Exceptions' }
  ];


  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. SINGLE TOP PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT & ADMIN DASHBOARD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Biometric Attendance & Geofence Logs
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Monitor real-time gate check-ins, GPS geofence radius boundaries & employee punch logs
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-6 pb-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === 'overview') navigate('/hr/attendance/overview');
              else if (t.id === 'daily') navigate('/hr/attendance/daily');
              else if (t.id === 'monthly') navigate('/hr/attendance/monthly');
              else if (t.id === 'exceptions') navigate('/hr/attendance/exceptions');
            }}
            className={`pb-2 text-xs font-bold tracking-wide transition-all relative cursor-pointer ${
              activeTab === t.id
                ? 'text-slate-900 font-black'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            {t.label}
            {activeTab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE ATTENDANCE VIEW */}
      {/* RENDER ACTIVE ATTENDANCE VIEW - ALL 100% DYNAMIC VIA ATTENDANCE OPS */}
      {(activeTab === 'overview' || activeTab === 'daily' || activeTab === 'exceptions') && (
        <AttendanceOps hideHeader={true} />
      )}

      {activeTab === 'monthly' && (
        <AttendanceCalendar />
      )}

    </div>
  );
}
