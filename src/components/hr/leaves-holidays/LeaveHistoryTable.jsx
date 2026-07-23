import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Card from '../../common/Card';

export default function LeaveHistoryTable({
  leaveRequests
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = leaveRequests.filter(req => 
    req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card title="Employee Leave Registry" subtitle="Historical records of approved, rejected, and pending leaves logs">
      <div className="space-y-4">
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search leave records..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Name</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Leave Type</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Requested Dates</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/40">
                  <td className="px-4 py-3.5 align-middle">
                    <div>
                      <strong className="text-slate-850 block">{req.name}</strong>
                      <span className="text-[9px] text-slate-400 block font-semibold">{req.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{req.type}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{req.dates}</td>
                  <td className="px-4 py-3.5 text-slate-450 italic font-semibold align-middle">"{req.reason}"</td>
                  <td className="px-4 py-3.5 text-right align-middle">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-none ${
                      req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{req.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Card>
  );
}
