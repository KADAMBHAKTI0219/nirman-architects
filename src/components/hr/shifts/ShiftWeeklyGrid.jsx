import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import Card from '../../common/Card';

export default function ShiftWeeklyGrid({
  rosterData,
  onSelectCell
}) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const getShiftBadgeStyle = (shiftName) => {
    switch (shiftName) {
      case 'Morning':
        return 'bg-blue-50 border-blue-200 text-blue-650';
      case 'Evening':
        return 'bg-indigo-50 border-indigo-200 text-indigo-650';
      case 'Night':
        return 'bg-slate-50 border-slate-200 text-slate-650';
      case 'Leave':
        return 'bg-rose-50 border-rose-200 text-rose-650';
      default:
        return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <Card title="Weekly Shift Roster Grid" subtitle="Assigned morning, evening, and night shifts with coverage alerts">
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-xs text-left table-auto">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
              {days.map(d => (
                <th key={d} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rosterData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40">
                <td className="px-4 py-3.5 align-middle">
                  <div>
                    <strong className="text-slate-805 block">{row.name}</strong>
                    <span className="text-[9px] text-slate-405 block font-semibold">{row.role}</span>
                  </div>
                </td>
                {days.map(d => {
                  const shift = row.schedule[d];
                  const hasConflict = row.conflicts?.[d];
                  return (
                    <td 
                      key={d} 
                      className="px-2 py-3 text-center align-middle"
                      onClick={() => onSelectCell(row.name, d, shift, row.role)}
                    >
                      <div className={`p-2 rounded-xl border font-bold text-[10px] select-none cursor-pointer flex flex-col items-center justify-center gap-1 ${getShiftBadgeStyle(shift)}`}>
                        <span className="leading-none">{shift}</span>
                        {hasConflict && (
                          <span className="text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-1 rounded flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Conflict
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
