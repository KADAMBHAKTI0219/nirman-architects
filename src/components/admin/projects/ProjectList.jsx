import React from 'react';
import { 
  Search, Filter, Plus, Calendar, Clock, AlertCircle, 
  Building2, AlertTriangle, FileText, DollarSign, ChevronRight, MoreHorizontal 
} from 'lucide-react';

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
  const activeProjectsCount = projects.filter(p => p.status !== 'Completed').length;
  const delayedSitesCount = projects.filter(p => p.delayFlag).length;
  const totalPendingApprovals = projects.reduce((acc, p) => acc + p.pendingApprovals, 0);
  const totalValuation = projects.reduce((acc, p) => acc + p.budget, 0);

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
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Projects Control Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Full lifecycle project management, budgets, design sign-off, and delays
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            Create Project
          </button>
        </div>
      </div>

      {/* 1. TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5F0FA] text-[#2484C6] flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5 text-[#2484C6]" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">Active Projects</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">{activeProjectsCount}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1 pt-1">
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#2484C6] rounded-full w-full"></div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 block">100% Synced</span>
          </div>
        </div>

        {/* Card 2: Delayed Sites */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">Delayed Sites</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">{delayedSitesCount}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="pt-1">
            <span className="text-[11px] font-extrabold text-rose-600 block">Requires Attention</span>
          </div>
        </div>

        {/* Card 3: Pending Drawings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5F0FA] text-[#2484C6] flex items-center justify-center font-bold">
                <FileText className="w-5 h-5 text-[#2484C6]" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">Pending Drawings</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">{totalPendingApprovals}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-400 block">In Workflow</span>
          </div>
        </div>

        {/* Card 4: Cumulative Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100/90 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">Cumulative Valuation</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">${(totalValuation / 1000000).toFixed(2)}M</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1 pt-1">
            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-4/5"></div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 block">Budget Limit: $6.20M</span>
          </div>
        </div>

      </div>

      {/* 2. SEARCH & FILTER RIBBON */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search projects by name, code, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800"
          />
        </div>

        {/* Filters Right Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            Filters
          </button>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"
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
            className="px-3.5 py-2 text-xs font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>

      </div>

      {/* 3. PROJECT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p) => (
          <div 
            key={p.code} 
            onClick={() => onSelectProject(p)}
            className="bg-white rounded-3xl border border-slate-100/90 p-5 shadow-2xs space-y-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            {/* Top Row: Code & Badges */}
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{p.code}</span>
              
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  p.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                  p.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                }`}>
                  {p.priority}
                </span>

                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  p.status.includes('Progress') ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  p.status.includes('Planning') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  p.status.includes('Delayed') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {p.status}
                </span>
              </div>
            </div>

            {/* Project Name & Client Subtitle */}
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-slate-900 leading-snug hover:text-indigo-600 transition-colors truncate">
                {p.name}
              </h3>
              <p className="text-xs font-semibold text-slate-400 truncate">
                {p.client}
              </p>
            </div>

            {/* Project Lead Card */}
            <div className="flex items-center gap-3 p-2.5 bg-slate-50/70 rounded-2xl border border-slate-100/80">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                {p.manager ? p.manager.split(' ').map(n=>n[0]).join('').toUpperCase() : 'PM'}
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  PROJECT LEAD
                </span>
                <span className="text-xs font-extrabold text-slate-800 block">
                  {p.manager}
                </span>
              </div>
            </div>

            {/* Dates Row (Start Date & Est Deadline) */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  START DATE
                </span>
                <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.startDate}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  EST DEADLINE
                </span>
                <div className="flex items-center gap-1.5 mt-1 font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.estCompletion}</span>
                </div>
              </div>
            </div>

            {/* Metrics Row (Pending Actions & Budget Valuation) */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  PENDING ACTIONS
                </span>
                <span className="font-extrabold text-slate-800 block mt-1">
                  {p.pendingApprovals} Approvals / {p.pendingTasks} Tasks
                </span>
              </div>

              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  BUDGET VALUATION
                </span>
                <span className="font-extrabold text-slate-800 block mt-1">
                  ${(p.budget / 1000).toFixed(0)}k
                </span>
              </div>
            </div>

            {/* Delay Warning Box (if flagged) */}
            {p.delayFlag && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="leading-snug text-[11px]">{p.delayReason}</p>
              </div>
            )}

            {/* Bottom Progress Bar & Dots Menu */}
            <div className="pt-2 space-y-2 border-t border-slate-100/80">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-500 text-[11px]">Overall Progress</span>
                <span className="font-extrabold text-slate-900 text-[11px]">{p.progress}%</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.delayFlag ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(p);
                  }}
                  className="w-7 h-7 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all flex-shrink-0 cursor-pointer"
                  title="Project details"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-3xl">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-xs font-black text-slate-800">No projects found matching filter criteria.</h4>
          </div>
        )}
      </div>

    </div>
  );
}

