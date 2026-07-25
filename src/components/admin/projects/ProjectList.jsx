import React from 'react';
import { Search, Filter, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function ProjectList({
  projects,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onSelectProject,
  onCreateClick
}) {
  
  // Calculate summary metrics
  const totalValuation = projects.reduce((acc, p) => acc + p.budget, 0);
  const delayedSitesCount = projects.filter(p => p.delayFlag).length;
  const totalPendingApprovals = projects.reduce((acc, p) => acc + p.pendingApprovals, 0);

  // Filter project cards
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Roster Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Projects Control Center</h2>
          <p className="text-xs text-slate-400">Full lifecycle project management, budgets, design sign-off, and delays</p>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 font-black rounded-xl text-xs transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* KPI Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Database Contracts</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-xl font-black text-slate-805">{projects.length} Projects</span>
            <span className="text-[10px] text-slate-400 font-semibold">100% Sync</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delayed At-Risk Sites</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-xl font-black text-rose-600">{delayedSitesCount} Sites</span>
            <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded-full">Requires Attention</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Drawing Signoffs</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-xl font-black text-slate-805">{totalPendingApprovals} Drawings</span>
            <span className="text-[10px] text-slate-450 font-bold">Workflow</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative Valuation</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-xl font-black text-[#2484C6]">${(totalValuation / 1000000).toFixed(2)}M</span>
            <span className="text-[10px] text-slate-400 font-semibold">Budget Limit</span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search projects by name, code, or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Planning">Planning</option>
            <option value="Delayed / At Risk">Delayed / At Risk</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>
      </div>

      {/* Grid containing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p) => (
          <div 
            key={p.code} 
            onClick={() => onSelectProject(p)}
            className={`bg-white rounded-3xl border p-5 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-brand-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
              p.delayFlag ? 'border-rose-100 bg-rose-50/5 animate-pulse-subtle' : 'border-slate-100/90'
            }`}
          >
            {/* 1. Header Badges */}
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.code}</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  p.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                  p.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                }`}>
                  {p.priority}
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  p.status.includes('Progress') ? 'bg-indigo-50 text-indigo-600' :
                  p.status.includes('Planning') ? 'bg-sky-50 text-sky-600' :
                  p.status.includes('Delayed') ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {p.status}
                </span>
              </div>
            </div>

            {/* 2. Title & Client */}
            <div>
              <h3 className="text-sm font-black text-slate-805 block hover:text-brand-primary leading-tight truncate">{p.name}</h3>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{p.client}</span>
            </div>

            {/* 3. Project Manager (Sarah Connor Above details grid) */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100/60 rounded-2xl self-start">
              <div className="w-6 h-6 rounded-full bg-brand-primary text-slate-905 border border-white flex items-center justify-center text-[8px] font-black shadow-xs uppercase flex-shrink-0">
                {p.manager.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Project Lead</span>
                <span className="text-[10px] font-black text-slate-700 mt-0.5 block leading-none">{p.manager}</span>
              </div>
            </div>

            {/* 4. Details Grid */}
            <div className="grid grid-cols-2 gap-y-2 pt-1 text-[10px]">
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">Start Date</span>
                <span className="font-semibold text-slate-650 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-400" /> {p.startDate}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">Est Deadline</span>
                <span className="font-semibold text-slate-650 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" /> {p.estCompletion}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">Pending Actions</span>
                <span className="font-extrabold text-slate-700 block mt-0.5">
                  {p.pendingApprovals} Approvals / {p.pendingTasks} Tasks
                </span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">Budget Valuation</span>
                <span className="font-extrabold text-slate-800 block mt-0.5">
                  ${(p.budget / 1000).toFixed(0)}k
                </span>
              </div>
            </div>

            {/* 5. Delay risk warning if flagged */}
            {p.delayFlag && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-rose-705 leading-normal">{p.delayReason}</p>
              </div>
            )}

            {/* 6. Milestone Progress (At last, above footer) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-50">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span>Milestone Progress</span>
                <span className="font-extrabold text-slate-705">{p.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    p.delayFlag ? 'bg-rose-450' : 'bg-brand-primary'
                  }`}
                  style={{ width: `${p.progress}%` }}
                ></div>
              </div>
            </div>

            {/* 7. Footer: Manage Project link */}
            <div className="pt-1 flex items-center justify-end">
              <span className="text-[10px] font-black text-brand-dark hover:underline flex items-center gap-0.5">
                Manage Project &rarr;
              </span>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-3xl">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-black text-slate-805">No projects found matching filter criteria.</h4>
          </div>
        )}
      </div>
    </div>
  );
}
