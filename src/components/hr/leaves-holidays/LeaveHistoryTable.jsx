import React, { useState } from 'react';
import { Search, Filter, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Card from '../../common/Card';

export default function LeaveHistoryTable({
  leaveRequests = []
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = leaveRequests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (req.role && req.role.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card title="Employee Leave Registry" subtitle="Historical records of approved, rejected, and pending leaves logs">
      <div className="space-y-4">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search leave records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-xs font-semibold bg-slate-50 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-xs text-left table-auto">
            <thead>
              <tr className="border-b border-slate-200/90 bg-slate-50/80">
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Category</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested Duration</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Application Reason</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-all">
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs shrink-0">
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="text-slate-900 font-bold block">{req.name}</strong>
                        <span className="text-[10px] text-slate-400 font-semibold">{req.role || 'Staff Member'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <span className="font-extrabold text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-lg text-[10px] uppercase">
                      {req.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-bold align-middle">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.dates}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 italic font-medium align-middle max-w-xs truncate">
                    "{req.reason}"
                  </td>
                  <td className="px-4 py-3.5 text-right align-middle">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border leading-none inline-flex items-center gap-1 ${
                      req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {req.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {req.status === 'Rejected' && <XCircle className="w-3 h-3 text-rose-600" />}
                      {req.status === 'Pending' && <Clock className="w-3 h-3 text-amber-600" />}
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                    No leave records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </Card>
  );
}
