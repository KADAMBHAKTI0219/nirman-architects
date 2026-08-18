import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Calendar, Clock, AlertCircle, 
  Building2, AlertTriangle, FileText, IndianRupee, ChevronRight, MoreHorizontal,
  LayoutGrid, LayoutList, X, CheckCircle2, UserCheck, Trash2, FolderOpen, Pencil
} from 'lucide-react';
import { PageHeader, StatsKpiCard, SearchFilterBar, StatusBadge, BrandLoader } from '../../common';
import { formatCurrency } from '../../../utils/formatters';

export default function ProjectList({
  projects = [],
  loading = false,
  searchQuery = '',
  setSearchQuery,
  statusFilter = 'All',
  setStatusFilter,
  priorityFilter = 'All',
  setPriorityFilter,
  onSelectProject,
  onCreateClick,
  onEditProject,
  onDeleteProject
}) {
  const [viewMode, setViewMode] = useState('cards');
  const [activeKpiModal, setActiveKpiModal] = useState(null); // 'active' | 'delayed' | 'approvals' | 'valuation'

  const canCreate = (() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.role === 'Architect' || u.role === 'SiteEngineer' || u.role === 'Employee') {
          return false;
        }
      }
    } catch (e) {}
    return true;
  })();

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
    return formatCurrency(val);
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
        <div 
          onClick={() => setActiveKpiModal('active')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:border-brand-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group"
          title="Click to view all active projects"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-tint border border-slate-100 text-slate-800 flex items-center justify-center font-medium group-hover:bg-brand-primary transition-colors">
                <Building2 className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <span className="text-xs font-normal text-slate-400 block group-hover:text-slate-600 transition-colors">Active Projects</span>
                <span className="text-2xl font-semibold text-slate-900 block mt-0.5">{activeProjectsCount}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <div className="space-y-1 pt-1">
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full w-full"></div>
            </div>
            <span className="text-[10px] font-normal text-slate-400 block">Click to view active directory</span>
          </div>
        </div>

        {/* Card 2: Delayed Sites */}
        <div 
          onClick={() => setActiveKpiModal('delayed')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group"
          title="Click to view delayed sites and projects"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-medium group-hover:bg-rose-100 transition-colors">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <span className="text-xs font-normal text-slate-400 block group-hover:text-slate-600 transition-colors">Delayed Sites</span>
                <span className="text-2xl font-semibold text-slate-900 block mt-0.5">{delayedSitesCount}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-rose-600 block">Requires Attention</span>
          </div>
        </div>

        {/* Card 3: Pending Drawings */}
        <div 
          onClick={() => setActiveKpiModal('approvals')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group"
          title="Click to view pending sign-offs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-medium group-hover:bg-amber-100 transition-colors">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <span className="text-xs font-normal text-slate-400 block group-hover:text-slate-600 transition-colors">Pending Sign-offs</span>
                <span className="text-2xl font-semibold text-slate-900 block mt-0.5">{totalPendingApprovals}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-amber-600 block">GFC Approvals Queue</span>
          </div>
        </div>

        {/* Card 4: Total Portfolio Valuation */}
        <div 
          onClick={() => setActiveKpiModal('valuation')}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group min-w-0 overflow-hidden"
          title="Click to view portfolio valuation breakdown"
        >
          <div className="flex items-center justify-between min-w-0 gap-2">
            <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-medium group-hover:bg-emerald-100 transition-colors shrink-0">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="text-xs font-normal text-slate-400 block group-hover:text-slate-600 transition-colors truncate">Portfolio Valuation</span>
                <span 
                  className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5 truncate max-w-full tracking-tight"
                  title={formatValuation(totalValuation)}
                >
                  {formatValuation(totalValuation)}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
          </div>
          <div className="pt-1 min-w-0">
            <span className="text-[11px] font-semibold text-emerald-600 block truncate">Total Budget Allocation</span>
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
          {/* Toggle View Buttons */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60 ml-0 md:ml-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. PROJECT CARDS GRID */}
      {loading ? (
        <div className="py-16 text-center bg-white border border-slate-100 rounded-3xl">
          <BrandLoader text="Loading Project Directory..." />
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Name</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Lead</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Start / Target Date</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Time Period</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status / Priority</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredProjects.map((p) => (
                  <tr 
                    key={p._id || p.code || p.id}
                    onClick={() => onSelectProject(p)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-soft text-slate-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {p.code?.substring(0, 3) || 'PRJ'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">{p.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-700 font-semibold">{p.client}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">{p.manager || (p.createdBy?.name) || 'Project Lead'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold">
                      {formatDate(p.startDate)} - {formatDate(p.estimatedCompletion || p.estCompletion || p.targetDate)}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono font-extrabold text-indigo-600">
                      {(() => {
                        const s = p.startDate ? new Date(p.startDate) : null;
                        const e = (p.estimatedCompletion || p.estCompletion || p.targetDate) ? new Date(p.estimatedCompletion || p.estCompletion || p.targetDate) : null;
                        if (!s || !e || isNaN(s.getTime()) || isNaN(e.getTime())) return 'N/A';
                        const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
                        if (diff < 0) return 'Invalid';
                        if (diff === 0) return '1 Day';
                        if (diff < 30) return `${diff} Days`;
                        const m = Math.floor(diff / 30);
                        const r = diff % 30;
                        return r === 0 ? `${m} ${m === 1 ? 'Month' : 'Months'}` : `${m}m ${r}d (${diff}d)`;
                      })()}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-900 font-bold">{formatValuation(Number(p.budget))}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          p.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          p.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {p.priority}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          (p.status || '').includes('Progress') ? 'bg-brand-soft text-slate-800 border border-brand-soft' :
                          (p.status || '').includes('Planning') ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          (p.status || '').includes('Delayed') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {onEditProject && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProject(p);
                            }}
                            className="w-7 h-7 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 inline-flex items-center justify-center transition-all cursor-pointer"
                            title="Edit Project Details"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteProject) onDeleteProject(p._id || p.id || p.code);
                          }}
                          className="w-7 h-7 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center transition-all cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center bg-white">
                      {projects.length === 0 ? (
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mx-auto flex items-center justify-center shadow-3xs">
                            <FolderOpen className="w-7 h-7 text-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900">No Projects Found</h4>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                              There are currently no active or planned projects in the system database.
                            </p>
                          </div>
                          {canCreate && (
                            <div className="pt-2">
                              <button
                                onClick={onCreateClick}
                                className="inline-flex items-center gap-2 px-4.5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-extrabold shadow-2xs transition-all cursor-pointer border border-brand-secondary/40"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Create First Project</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-md mx-auto space-y-3">
                          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                          <h4 className="text-xs font-bold text-slate-800">No projects match your search criteria</h4>
                          <p className="text-xs text-slate-400">
                            Try adjusting your search keyword or clearing status/priority filters.
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('All');
                              setPriorityFilter('All');
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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

              {/* Time Period Duration Badge */}
              {p.startDate && (p.estimatedCompletion || p.estCompletion) && (
                <div className="flex items-center justify-between text-[11px] font-bold bg-indigo-50/70 border border-indigo-100 px-3 py-1.5 rounded-xl text-indigo-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Time Period:</span>
                  </span>
                  <span className="font-mono font-black">
                    {(() => {
                      const s = new Date(p.startDate);
                      const e = new Date(p.estimatedCompletion || p.estCompletion);
                      if (isNaN(s.getTime()) || isNaN(e.getTime())) return '';
                      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
                      if (diff < 0) return 'Invalid';
                      if (diff === 0) return '1 Day';
                      if (diff < 30) return `${diff} Days`;
                      const m = Math.floor(diff / 30);
                      const r = diff % 30;
                      return r === 0 ? `${m} ${m === 1 ? 'Month' : 'Months'}` : `${m}m ${r}d (${diff}d)`;
                    })()}
                  </span>
                </div>
              )}

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
                    {formatCurrency(p.budget)}
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

                  {onEditProject && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(p);
                      }}
                      className="w-7 h-7 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all flex-shrink-0 cursor-pointer"
                      title="Edit Project Details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDeleteProject) onDeleteProject(p._id || p.id || p.code);
                    }}
                    className="w-7 h-7 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 transition-all flex-shrink-0 cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-full py-16 px-6 text-center bg-white border border-slate-100 rounded-3xl shadow-2xs">
              {projects.length === 0 ? (
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 text-slate-400 mx-auto flex items-center justify-center shadow-3xs">
                    <FolderOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">No Projects Found</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                      There are currently no active or planned projects registered in the system database.
                    </p>
                  </div>
                  {canCreate && (
                    <div className="pt-2">
                      <button
                        onClick={onCreateClick}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-black shadow-2xs transition-all cursor-pointer border border-brand-secondary/40"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create First Project</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-md mx-auto space-y-3">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <h3 className="text-sm font-bold text-slate-800">No projects match your search criteria</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try adjusting your search query or clearing selected status and priority filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                      setPriorityFilter('All');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 mt-2"
                  >
                    <span>Clear Search & Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. DYNAMIC KPI STATS MODAL OVERLAY */}
      {(() => {
        if (!activeKpiModal) return null;

        let title = '';
        let subtitle = '';
        let modalItems = [];

        if (activeKpiModal === 'active') {
          title = 'Active Projects Roster';
          subtitle = 'Current active construction & architectural project contracts';
          modalItems = projects.filter(p => p.status !== 'Completed' && p.status !== 'Archived');
        } else if (activeKpiModal === 'delayed') {
          title = 'Delayed Sites & Projects';
          subtitle = 'Projects with milestone flags or schedule delays';
          modalItems = projects.filter(p => p.delayFlag || p.isDelayed || p.status === 'Delayed');
        } else if (activeKpiModal === 'approvals') {
          title = 'Pending Sign-offs & Drawing Reviews';
          subtitle = 'Architectural blueprints awaiting GFC clearance sign-off';
          modalItems = projects.filter(p => p.pendingApprovals > 0 || (Array.isArray(p.drawings) && p.drawings.some(d => d.status?.includes('Pending'))));
        } else if (activeKpiModal === 'valuation') {
          title = 'Portfolio Budget Valuation';
          subtitle = 'Financial budget allocation and contract valuation across projects';
          modalItems = projects;
        }

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {title}
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                      {modalItems.length}
                    </span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
                </div>
                <button
                  onClick={() => setActiveKpiModal(null)}
                  className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Table Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                {modalItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No items available in this category.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[9.5px] font-black tracking-wider">
                          <th className="px-4 py-3">Project & Code</th>
                          <th className="px-4 py-3">Client & Category</th>
                          <th className="px-4 py-3">Budget / Progress</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {modalItems.map((proj, idx) => (
                          <tr 
                            key={proj.id || proj.code || idx}
                            onClick={() => {
                              setActiveKpiModal(null);
                              onSelectProject(proj);
                            }}
                            className="hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <td className="px-4 py-3.5">
                              <span className="font-extrabold text-slate-900 text-xs block">{proj.name || proj.projectName}</span>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{proj.code || `PRJ-${100 + idx}`}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-bold text-slate-700 block">{proj.client || 'Private Client'}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{proj.category || 'Architecture'}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-extrabold text-emerald-700 block">${(Number(proj.budget) || 0).toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400 font-bold">{proj.progress || 0}% Complete</span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <span className={`px-2.5 py-0.5 text-[9.5px] font-bold rounded-md uppercase ${
                                String(proj.status).toLowerCase() === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : proj.delayFlag || proj.status === 'Delayed'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}>
                                {proj.status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Click any row to open full project details</span>
                <button
                  onClick={() => setActiveKpiModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
