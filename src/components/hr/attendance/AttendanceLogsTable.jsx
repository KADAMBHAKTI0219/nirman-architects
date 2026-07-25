import React, { useState } from 'react';
import { Search, MapPin, ChevronRight } from 'lucide-react';

export default function AttendanceLogsTable({
  logs,
  selectedLog,
  onSelectLog
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || log.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4">
      
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search staff logs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
          />
        </div>
        
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
        >
          <option value="All">All Departments</option>
          <option value="Architecture">Architecture</option>
          <option value="Engineering">Engineering</option>
        </select>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Name</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Shift</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-In</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-Out</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged hours</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map(log => (
                <tr 
                  key={log.id} 
                  className={`hover:bg-slate-50/40 cursor-pointer ${selectedLog?.id === log.id ? 'bg-slate-50' : ''}`}
                  onClick={() => onSelectLog(log)}
                >
                  <td className="px-4 py-3.5 align-middle">
                    <strong className="text-slate-805 block">{log.name}</strong>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{log.dept}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{log.shift}</td>
                  <td className="px-4 py-3.5 text-slate-700 font-bold align-middle">{log.checkIn}</td>
                  <td className="px-4 py-3.5 text-slate-700 font-bold align-middle">{log.checkOut}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{log.hours}</td>
                  <td className="px-4 py-3.5 align-middle">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {log.location}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      log.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      log.status === 'Late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>{log.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right align-middle">
                    <button
                      onClick={() => onSelectLog(log)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-slate-550" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
