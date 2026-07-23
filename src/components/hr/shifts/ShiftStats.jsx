import React from 'react';

export default function ShiftStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Assigned</span>
        <strong className="text-base font-black text-slate-800 block mt-0.5">24 Staff</strong>
      </div>
      <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Open Shifts</span>
        <strong className="text-base font-black text-[#2484C6] block mt-0.5">2 shifts</strong>
      </div>
      <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Coverage Gaps</span>
        <strong className="text-base font-black text-rose-500 block mt-0.5">1 Alert</strong>
      </div>
      <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Overtime Alerts</span>
        <strong className="text-base font-black text-amber-500 block mt-0.5">1 Staff</strong>
      </div>
      <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Swap Requests</span>
        <strong className="text-base font-black text-slate-700 block mt-0.5">1 Request</strong>
      </div>
    </div>
  );
}
