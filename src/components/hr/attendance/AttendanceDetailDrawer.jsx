import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function AttendanceDetailDrawer({
  selectedLog,
  onClose
}) {
  if (!selectedLog) return null;

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
      <div className="flex justify-between items-start border-b border-slate-50 pb-3">
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Roster Punch details</span>
          <strong className="text-slate-805 block text-xs mt-1">{selectedLog.name}</strong>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-100 text-slate-405 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4 text-xs text-slate-550">
        <div>
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Department & Manager</span>
          <span className="font-bold text-slate-700 block mt-0.5">{selectedLog.dept} &bull; Supervisor {selectedLog.manager}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Check-In details</span>
          <span className="font-bold text-slate-700 block mt-0.5">{selectedLog.checkIn} ({selectedLog.notes})</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 block uppercase font-bold text-rose-500">Missing punch checks</span>
          {selectedLog.checkOut === 'Active' ? (
            <span className="text-[10px] text-rose-600 font-bold block flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Checked-out punch is missing!
            </span>
          ) : (
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Punch sessions completed</span>
          )}
        </div>
      </div>
    </div>
  );
}
