import React, { useState } from 'react';
import { 
  Users, CheckCircle, Search, AlertTriangle, Eye, X, BookOpen, Clock, ChevronRight, Phone, Mail
} from 'lucide-react';
import Card from '../../common/Card';
import { motion } from 'framer-motion';

const INITIAL_TEAM = [
  { id: "EMP-101", name: "Sarah Connor", role: "Lead Architect", dept: "Architecture", availability: "Available", workload: 80, tasks: 2, phone: "+91 98765 10001", email: "sarah@nirman.com", schedule: { Mon: "Office", Tue: "Office", Wed: "Office", Thu: "Office", Fri: "Office" } },
  { id: "EMP-102", name: "Alice Smith", role: "Jr Architect", dept: "Architecture", availability: "Available", workload: 90, tasks: 1, phone: "+91 98765 10002", email: "alice@nirman.com", schedule: { Mon: "Office", Tue: "Office", Wed: "Office", Thu: "Office", Fri: "Office" } },
  { id: "EMP-103", name: "Bob Johnson", role: "Site Engineer", dept: "Engineering", availability: "On Site", workload: 100, tasks: 1, phone: "+91 98765 10003", email: "bob@nirman.com", schedule: { Mon: "Site A", Tue: "Site A", Wed: "Site A", Thu: "Site A", Fri: "Site A" } },
  { id: "EMP-104", name: "Charlie Brown", role: "Drafter", dept: "Architecture", availability: "On Leave", workload: 0, tasks: 0, phone: "+91 98765 10004", email: "charlie@nirman.com", schedule: { Mon: "Leave", Tue: "Office", Wed: "Office", Thu: "Office", Fri: "Office" } },
  { id: "EMP-105", name: "Frank Castle", role: "Site Inspector", dept: "Engineering", availability: "On Site", workload: 70, tasks: 2, phone: "+91 98765 10005", email: "frank@nirman.com", schedule: { Mon: "Site B", Tue: "Site B", Wed: "Site B", Thu: "Site B", Fri: "Site B" } }
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
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800">
      
      {/* 1. TOP BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-sky-50 border border-sky-200 text-sky-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <strong className="text-slate-900 text-base block font-extrabold">Team Roster & Site Shift Allocation</strong>
            <span className="text-xs text-slate-400 block font-semibold">Track staff locations, active workloads, and weekly site calendars</span>
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap items-center">
          <div className="relative w-52">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search team member..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-xs font-semibold bg-slate-50 text-slate-900"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white font-extrabold text-slate-700"
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
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Details</th>
                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Workload</th>
                    {days.map(d => (
                      <th key={d} className="px-3 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{d}</th>
                    ))}
                    <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map(emp => {
                    const isSelected = selectedMember?.id === emp.id;

                    return (
                      <tr 
                        key={emp.id}
                        onClick={() => {
                          setSelectedMember(emp);
                          setDrawerOpen(true);
                        }}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${isSelected ? 'bg-sky-50/60' : ''}`}
                      >
                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                              {emp.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <strong className="text-slate-900 font-extrabold text-xs block">{emp.name}</strong>
                              <span className="text-[11px] text-slate-400 block font-semibold">{emp.role} &bull; {emp.dept}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <div className="flex items-center gap-2.5">
                            <strong className="text-xs font-black text-slate-800 min-w-[32px]">{emp.workload}%</strong>
                            <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                              <div 
                                className={`h-full rounded-full ${
                                  emp.workload >= 90 ? 'bg-rose-500' : 
                                  emp.workload >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} 
                                style={{ width: `${emp.workload}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        {days.map(d => {
                          const shift = emp.schedule[d];
                          return (
                            <td key={d} className="px-2 py-4 text-center align-middle">
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-md border block text-center leading-none ${
                                shift === 'Leave' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                shift.includes('Site') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-indigo-50 text-indigo-700 border-indigo-200'
                              }`}>
                                {shift}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-5 py-4 align-middle text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(emp);
                              setDrawerOpen(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Drawer */}
        {drawerOpen && selectedMember && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 font-black text-sm flex items-center justify-center border border-sky-200 shadow-2xs">
                  {selectedMember.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <strong className="text-slate-900 text-sm block font-extrabold">{selectedMember.name}</strong>
                  <span className="text-[11px] text-slate-400 font-bold block">{selectedMember.role}</span>
                </div>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Availability Status</span>
                  <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                    selectedMember.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    selectedMember.availability === 'On Site' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {selectedMember.availability}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Active Workload</span>
                  <strong className="text-slate-900 font-black">{selectedMember.workload}% Capacity</strong>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Contact Information</span>
                <div className="flex items-center gap-2 text-slate-600 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedMember.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedMember.email}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert(`Initiated message to ${selectedMember.name}`)}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Message</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
