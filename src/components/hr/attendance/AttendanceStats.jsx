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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Staff</span>
        <strong className="text-base font-black text-slate-800 block mt-0.5">{totalUsers} Staff</strong>
      </div>
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Online Today</span>
        <strong className="text-base font-black text-emerald-650 block mt-0.5">{onlineCount} Online</strong>
      </div>
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Offline Staff</span>
        <strong className="text-base font-black text-slate-505 block mt-0.5">{offlineCount} Offline</strong>
      </div>
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Corrections</span>
        <strong className="text-base font-black text-amber-600 block mt-0.5">{pendingCorrections} Pending</strong>
      </div>
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Security Alerts</span>
        <strong className="text-base font-black text-rose-600 block mt-0.5">{securityAlerts} Alerts</strong>
      </div>
    </div>
  );
}
