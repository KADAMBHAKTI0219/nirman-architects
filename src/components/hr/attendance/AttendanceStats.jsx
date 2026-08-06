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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      <div className="premium-stat-box p-3.5 text-center flex flex-col justify-between min-h-[88px]">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">Total Staff</span>
        <strong className="text-lg font-black text-slate-800 block mt-1">{totalUsers} Staff</strong>
      </div>
      <div className="premium-stat-box p-3.5 text-center flex flex-col justify-between min-h-[88px]">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">Online Today</span>
        <strong className="text-lg font-black text-emerald-600 block mt-1">{onlineCount} Online</strong>
      </div>
      <div className="premium-stat-box p-3.5 text-center flex flex-col justify-between min-h-[88px]">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">Offline Staff</span>
        <strong className="text-lg font-black text-slate-600 block mt-1">{offlineCount} Offline</strong>
      </div>
      <div className="premium-stat-box p-3.5 text-center flex flex-col justify-between min-h-[88px]">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">Pending Corrections</span>
        <strong className="text-lg font-black text-amber-600 block mt-1">{pendingCorrections} Pending</strong>
      </div>
      <div className="premium-stat-box p-3.5 text-center flex flex-col justify-between min-h-[88px]">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block truncate">Security Alerts</span>
        <strong className="text-lg font-black text-rose-600 block mt-1">{securityAlerts} Alerts</strong>
      </div>
    </div>
  );
}
