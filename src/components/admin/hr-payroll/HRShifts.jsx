import React from 'react';
import { Clock, RefreshCw, Check, X, ShieldAlert, AlertCircle } from 'lucide-react';
import Card from '../../common/Card';

export default function HRShifts({
  shiftList,
  swapRequests,
  onApproveSwap,
  onRejectSwap
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Shift list configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shiftList.map(shift => (
          <div key={shift.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <strong className="text-slate-805 text-xs block">{shift.name}</strong>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="space-y-2 text-xs text-slate-550">
              <div className="flex justify-between font-bold">
                <span>Timings</span>
                <span className="text-slate-700">{shift.start} - {shift.end}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Late Buffer</span>
                <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">{shift.buffer} mins</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Active Staff</span>
                <span className="text-slate-700 font-extrabold">{shift.staffCount} Assigned</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Rota Grid & Swap Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Rota Schedule Timeline (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="border-b border-slate-50 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Weekly Rota Planner</span>
            <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Shift roster distribution by department groups</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mon</th>
                  <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tue</th>
                  <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Wed</th>
                  <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Thu</th>
                  <th className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest font-extrabold text-[#2484C6]">Fri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                {[
                  { dept: "Architecture", m: "Shift A", tu: "Shift A", w: "Shift A", th: "Shift A", f: "Shift A" },
                  { dept: "Engineering", m: "Shift A", tu: "Shift A", w: "Shift B", th: "Shift A", f: "Shift A" },
                  { dept: "Project Mgmt", m: "Shift B", tu: "Shift B", w: "Shift B", th: "Shift B", f: "Shift B" }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40">
                    <td className="px-3 py-3 text-slate-500 font-bold align-middle">{row.dept}</td>
                    <td className="px-3 py-3 align-middle"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">{row.m}</span></td>
                    <td className="px-3 py-3 align-middle"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">{row.tu}</span></td>
                    <td className="px-3 py-3 align-middle"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">{row.w}</span></td>
                    <td className="px-3 py-3 align-middle"><span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">{row.th}</span></td>
                    <td className="px-3 py-3 align-middle"><span className="px-1.5 py-0.5 bg-brand-tint border border-brand-primary text-slate-900 rounded text-[9px]">{row.f}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Swap requests (1/3 width) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="border-b border-slate-50 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Roster Swap Requests</span>
            <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Shift substitutions requiring approval</span>
          </div>

          <div className="space-y-3">
            {swapRequests.map(req => (
              <div key={req.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-2">
                <div className="flex justify-between text-[8px] text-slate-405 font-bold uppercase border-b border-slate-100 pb-1">
                  <span>Swap Shift</span>
                  <span>{req.date}</span>
                </div>
                <div>
                  <strong className="text-slate-805 block">{req.employeeName}</strong>
                  <span className="text-[9px] text-slate-400 block font-semibold mt-0.5">Requesting: {req.currentShift} &rarr; {req.requestedShift}</span>
                </div>
                <div className="flex gap-1.5 justify-end">
                  <button 
                    onClick={() => onRejectSwap(req.id)}
                    className="p-1 border border-slate-205 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => onApproveSwap(req.id)}
                    className="px-2.5 py-1 bg-brand-primary hover:bg-brand-secondary text-slate-905 text-[9px] font-black uppercase rounded-lg shadow-3xs transition-all flex items-center gap-0.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </div>
              </div>
            ))}

            {swapRequests.length === 0 && (
              <div className="py-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                No shift swap requests.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
