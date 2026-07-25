import React, { useState } from 'react';
import { 
  Users, CheckCircle, Search, AlertTriangle, Eye, X, BookOpen, Clock 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_TEAM = [
  { id: "EMP-101", name: "Sarah Connor", role: "Lead Architect", dept: "Architecture", availability: "Available", workload: 80, tasks: 2, schedule: { Mon: "Office", Tue: "Office", Wed: "Office", Thu: "Office", Fri: "Office" } },
  { id: "EMP-102", name: "Alice Smith", role: "Jr Architect", dept: "Architecture", availability: "Available", workload: 90, tasks: 1, schedule: { Mon: "Office", Tue: "Office", Wed: "Office", Thu: "Office", Fri: "Office" } },
  { id: "EMP-103", name: "Bob Johnson", role: "Site Engineer", dept: "Engineering", availability: "On Site", workload: 100, tasks: 1, schedule: { Mon: "Site A", Tue: "Site A", Wed: "Site A", Thu: "Site A", Fri: "Site A" } },
  { id: "EMP-104", name: "Charlie Brown", role: "Drafter", dept: "Architecture", availability: "On Leave", workload: 0, tasks: 0, schedule: { Mon: "Leave", Tue: "Office", Wed: "Office", Thu: "Office", Fri: "Office" } },
  { id: "EMP-105", name: "Frank Castle", role: "Site Inspector", dept: "Engineering", availability: "On Site", workload: 70, tasks: 2, schedule: { Mon: "Site B", Tue: "Site B", Wed: "Site B", Thu: "Site B", Fri: "Site B" } }
];

export default function Team() {
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedMember, setSelectedMember] = useState(INITIAL_TEAM[0]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const filtered = team.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || t.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#2484C6] rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">Team Roster Allocation</strong>
            <span className="text-[10px] text-slate-405 block font-bold">Track staff locations, active workloads, and availability calendars</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search team..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.value)}
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
      </div>

      {/* 2. WEEKLY ALLOCATION GRID & DETAILS SIDE DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Weekly Grid */}
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'} space-y-4`}>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee details</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Workload</th>
                    {days.map(d => (
                      <th key={d} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{d}</th>
                    ))}
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(emp => (
                    <tr 
                      key={emp.id}
                      onClick={() => {
                        setSelectedMember(emp);
                        setDrawerOpen(true);
                      }}
                      className={`hover:bg-slate-50/40 cursor-pointer ${selectedMember?.id === emp.id ? 'bg-slate-50' : ''}`}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <strong className="text-slate-805 block">{emp.name}</strong>
                          <span className="text-[9px] text-slate-405 block font-semibold">{emp.role}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{emp.workload}%</span>
                          <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${emp.workload > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${emp.workload}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      {days.map(d => {
                        const shift = emp.schedule[d];
                        return (
                          <td key={d} className="px-2 py-3 text-center align-middle">
                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded border block text-center leading-none ${
                              shift === 'Leave' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              shift.includes('Site') ? 'bg-indigo-50 text-indigo-650 border-indigo-100' :
                              'bg-blue-50 text-[#2484C6] border-blue-100'
                            }`}>{shift}</span>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3.5 text-right align-middle" onClick={(e)=>e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedMember(emp);
                            setDrawerOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-550" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right drawer - employee stats */}
        {drawerOpen && selectedMember && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Workload Analysis</span>
                <strong className="text-slate-805 block text-xs mt-1">{selectedMember.name}</strong>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-550 font-bold">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Department & Role</span>
                <span className="font-bold text-slate-700 block mt-0.5">{selectedMember.dept} &bull; {selectedMember.role}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Availability status</span>
                <span className={`text-[9px] px-2 py-0.5 rounded border inline-block mt-1 font-black uppercase ${
                  selectedMember.availability === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  selectedMember.availability === 'On Site' ? 'bg-indigo-50 text-indigo-605 border-indigo-100' :
                  'bg-rose-50 text-rose-600 border-rose-100'
                }`}>{selectedMember.availability}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Active Task Count</span>
                <span className="font-black text-[#2484C6] block mt-0.5">{selectedMember.tasks} active tasks assigned</span>
              </div>

              {selectedMember.workload > 85 && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-650 flex items-center gap-1.5 leading-normal">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Roster Conflict Warning: Workload exceeds 85%! Avoid allocating further tasks.</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
