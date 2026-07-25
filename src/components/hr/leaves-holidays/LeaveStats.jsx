import React from 'react';

export default function LeaveStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-405 uppercase block">Leave Balance</span>
        <strong className="text-base font-black text-slate-800 block mt-0.5">15 Days</strong>
      </div>
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-405 uppercase block">Pending Requests</span>
        <strong className="text-base font-black text-amber-500 block mt-0.5">2 Open</strong>
      </div>
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-405 uppercase block">Approved (Month)</span>
        <strong className="text-base font-black text-emerald-600 block mt-0.5">3 Approved</strong>
      </div>
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-405 uppercase block">Off Today</span>
        <strong className="text-base font-black text-rose-500 block mt-0.5">1 Staff</strong>
      </div>
      <div className="premium-stat-box p-4 text-center">
        <span className="text-[9px] font-bold text-slate-405 uppercase block">Holidays (Month)</span>
        <strong className="text-base font-black text-slate-700 block mt-0.5">1 Day</strong>
      </div>
    </div>
  );
}
