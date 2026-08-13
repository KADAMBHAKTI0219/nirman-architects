import React from 'react';
import { 
  Search, Filter, Plus, Calendar, Clock, AlertCircle, 
  Building2, AlertTriangle, FileText, DollarSign, ChevronRight, MoreHorizontal 
} from 'lucide-react';
import { PageHeader, StatsKpiCard, SearchFilterBar, StatusBadge } from '../../common';

export default function ProjectList({
  projects,
  loading = false,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onSelectProject,
  onCreateClick
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toISOString().split('T')[0];
    } catch (e) {
      return dateStr;
    }
  };

  // Calculate summary metrics dynamically from backend projects
  const activeProjectsCount = projects.filter(p => p.status !== 'Completed' && p.status !== 'Archived').length;
  const delayedSitesCount = projects.filter(p => p.delayFlag || p.isDelayed || p.status === 'Delayed').length;
  const totalPendingApprovals = projects.reduce((acc, p) => acc + (p.pendingApprovals || (Array.isArray(p.drawings) ? p.drawings.filter(d => d.status?.includes('Pending') || d.status === 'DESIGNER_UPLOADED').length : 0)), 0);
  const totalValuation = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);

  const formatValuation = (val) => {
    if (!val || isNaN(val) || val === 0) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  // Filter project cards
  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || p.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT */}
      <PageHeader
        title="Projects Control Center"
        subtitle="Full lifecycle project management, budgets, design sign-off, and client project linkages"
        actions={(() => {
          try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const u = JSON.parse(userStr);
              if (u.role === 'Architect' || u.role === 'SiteEngineer' || u.role === 'Employee') {
                return null;
              }
            }
          } catch (e) {}
          return (
            <button
              onClick={onCreateClick}
              className="flex items-center justify-center gap-2 px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer border border-brand-secondary/40"
            >
              <span>+ Create Project</span>
            </button>
          );
        })()}
      />

      {/* 1. TOP 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Projects */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-tint border border-slate-100 text-slate-800 flex items-center justify-center font-medium">
                <Building2 className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-xs font-normal text-slate-400 block">Active Projects</span>
                <span className="text-2xl font-semibold text-slate-900 block mt-0.5">{activeProjectsCount}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1 pt-1">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full w-full"></div>
            </div>
            <span className="text-[10px] font-normal text-slate-400 block">Active Directory Sync</span>
          </div>
        </div>

        {/* Card 2: Delayed Sites */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-medium">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <span className="text-xs font-normal text-slate-400 block">Delayed Sites</span>
                <span className="text-2xl font-semibold text-slate-900 block mt-0.5">{delayedSitesCount}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-rose-600 block">Requires Attention</span>
          </div>
        </div>

        {/* Card 3: Pending Drawings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-medium">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-normal text-slate-400 block">Pending Sign-offs</span>
                <span className="text-2xl font-semibold text-slate-900 block mt-0.5">{totalPendingApprovals}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-amber-600 block">GFC Approvals Queue</span>
          </div>
        </div>

        {/* Card 4: Total Portfolio Valuation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-medium">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-normal text-slate-400 block">Portfolio Valuation</span>
                <span className="text-2xl font-semibold text-slate-900 block mt-0.5">{formatValuation(totalValuation)}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-emerald-600 block">Total Budget Allocation</span>
          </div>
        </div>

      </div>

      {/* 2. SEARCH & FILTERING CONTROL BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Search input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project code, name, or client..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-slate-50/50 font-normal"
          />
        </div>

        {/* Right: Dropdowns filter group */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-700 bg-white font-normal cursor-pointer"
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
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-700 bg-white font-normal cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>

      </div>

      {/* 3. PROJECT CARDS GRID */}
      {loading ? (
        <div className="py-16 text-center bg-white border border-slate-100 rounded-3xl space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-normal text-slate-500">Loading project directory from backend server...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <div 
              key={p._id || p.code || p.id} 
              onClick={() => onSelectProject(p)}
              className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              {/* Top Row: Code & Badges */}
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{p.code}</span>
                
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                    p.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                    p.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                  }`}>
                    {p.priority}
                  </span>

                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                    (p.status || '').includes('Progress') ? 'bg-brand-soft text-slate-800 border border-brand-soft' :
                    (p.status || '').includes('Planning') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    (p.status || '').includes('Delayed') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>

              {/* Project Name & Client Subtitle */}
              <div className="space-y-0.5">
                <h3 className="text-base font-semibold text-slate-900 leading-snug hover:text-slate-700 transition-colors truncate">
                  {p.name}
                </h3>
                <p className="text-xs font-normal text-slate-500 truncate">
                  {p.client}
                </p>
              </div>

              {/* Project Lead Card */}
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-brand-primary text-slate-900 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                  {p.manager ? p.manager.split(' ').map(n=>n[0]).join('').toUpperCase() : 'PM'}
                </div>
                <div>
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider block">
                    PROJECT LEAD
                  </span>
                  <span className="text-xs font-medium text-slate-800 block">
                    {p.manager || (p.createdBy?.name) || 'Project Manager'}
                  </span>
                </div>
              </div>

              {/* Dates Row (Start Date & Est Deadline) */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider block">
                    START DATE
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-normal text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(p.startDate)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider block">
                    EST DEADLINE
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-normal text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(p.estimatedCompletion || p.estCompletion)}</span>
                  </div>
                </div>
              </div>

              {/* Metrics Row (Pending Actions & Budget Valuation) */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider block">
                    PENDING ACTIONS
                  </span>
                  <span className="font-normal text-slate-800 block mt-1">
                    {p.pendingApprovals || 0} Approvals / {p.pendingTasks || 0} Tasks
                  </span>
                </div>

                <div>
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider block">
                    BUDGET VALUATION
                  </span>
                  <span className="font-normal text-slate-800 block mt-1">
                    ${((p.budget || 0) / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>

              {/* Delay Warning Box (if flagged) */}
              {p.delayFlag && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-normal">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="leading-snug text-[11px]">{p.delayReason || 'Schedule delayed'}</p>
                </div>
              )}

              {/* Bottom Progress Bar & Dots Menu */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-normal text-slate-500 text-[11px]">Overall Progress</span>
                  <span className="font-medium text-slate-900 text-[11px]">{p.progress || 0}%</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        p.delayFlag ? 'bg-rose-500' : 'bg-brand-primary'
                      }`}
                      style={{ width: `${p.progress || 0}%` }}
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
              <h4 className="text-xs font-medium text-slate-800">No projects found in database.</h4>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
