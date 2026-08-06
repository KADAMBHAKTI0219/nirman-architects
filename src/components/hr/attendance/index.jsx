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

  const exceptionsList = [
    { id: 'exc-1', name: "John Wick", role: "Project Manager", dept: "Management", reason: "Late Check-in Exception", date: "2026-08-06", time: "10:15 AM", status: "Unverified" },
    { id: 'exc-2', name: "Priya Sharma", role: "Interior Designer", dept: "Architecture", reason: "GPS Location Mismatch", date: "2026-08-06", time: "09:45 AM", status: "Pending Review" },
    { id: 'exc-3', name: "Charlie Brown", role: "Drafter", dept: "Architecture", reason: "Missed Evening Punch-out", date: "2026-08-05", time: "06:30 PM", status: "Resolved" }
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
      {(activeTab === 'overview' || activeTab === 'daily') && (
        <AttendanceOps hideHeader={true} />
      )}

      {activeTab === 'monthly' && (
        <AttendanceCalendar />
      )}

      {activeTab === 'exceptions' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Late & Biometric Exception Registry</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Employees with delayed punch-ins or unverified gate check-ins</p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
              {exceptionsList.filter(e => e.status !== 'Resolved').length} Unresolved Exceptions
            </span>
          </div>

          <div className="space-y-3">
            {exceptionsList.map(exc => (
              <div key={exc.id} className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl flex items-center justify-between text-xs flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${exc.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 font-bold block">{exc.name} &bull; {exc.role} ({exc.dept})</strong>
                    <span className="text-[11px] text-slate-500 block font-medium mt-0.5">
                      Issue: <span className="font-bold text-slate-700">{exc.reason}</span> | Date: {exc.date} at {exc.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    exc.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {exc.status}
                  </span>
                  {exc.status !== 'Resolved' && (
                    <button 
                      onClick={() => alert(`Reminder notification sent to ${exc.name} for ${exc.reason}`)}
                      className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-extrabold shadow-3xs cursor-pointer"
                    >
                      Notify Staff
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
