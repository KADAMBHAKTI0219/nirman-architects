import React from 'react';

export default function AttendanceStats({ widgets }) {
  const { totalUsers, onlineCount, offlineCount, pendingCorrections, securityAlerts } = widgets || {
    totalUsers: 0,
    onlineCount: 0,
    offlineCount: 0,
    pendingCorrections: 0,
    securityAlerts: 0
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Staff</span>
        <strong className="text-base font-black text-slate-800 block mt-0.5">{totalUsers} Staff</strong>
      </div>
      <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Online Today</span>
        <strong className="text-base font-black text-emerald-600 block mt-0.5">{onlineCount} Online</strong>
      </div>
      <div className="bg-slate-50/30 p-4 rounded-2xl border border-slate-105 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Offline Staff</span>
        <strong className="text-base font-black text-slate-500 block mt-0.5">{offlineCount} Offline</strong>
      </div>
      <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Corrections</span>
        <strong className="text-base font-black text-amber-500 block mt-0.5">{pendingCorrections} Pending</strong>
      </div>
      <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Security Alerts</span>
        <strong className="text-base font-black text-rose-500 block mt-0.5">{securityAlerts} Alerts</strong>
      </div>
    </div>
  );
}
