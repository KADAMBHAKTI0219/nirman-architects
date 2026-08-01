import React from 'react';
import { 
  Search, Filter, CheckSquare, Clock, AlertTriangle, CheckCircle, 
  Plus, Eye, ListFilter, Kanban, TableProperties, BarChart3, Calendar
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'Pending', label: 'Pending', dotColor: 'bg-slate-400' },
  { id: 'Accepted', label: 'Accepted', dotColor: 'bg-blue-400' },
  { id: 'In Progress', label: 'In Progress', dotColor: 'bg-indigo-500 animate-pulse' },
  { id: 'Review', label: 'Review', dotColor: 'bg-amber-500' },
  { id: 'Approved', label: 'Approved', dotColor: 'bg-sky-400' },
  { id: 'Completed', label: 'Completed', dotColor: 'bg-emerald-500' }
];

export default function TaskList({
  tasks,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  projectFilter,
  setProjectFilter,
  deptFilter,
  setDeptFilter,
  priorityFilter,
  setPriorityFilter,
  onSelectTask,
  onCreateTaskClick
}) {
  
  // Calculate KPIs
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const overdueTasks = tasks.filter(t => t.delayFlag).length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const reviewTasks = tasks.filter(t => t.status === 'Review').length;

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'All' || t.project === projectFilter;
    const matchesDept = deptFilter === 'All' || t.dept === deptFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesProject && matchesDept && matchesPriority;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Task Operations Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Roster assignments, workflow status tracking, time analysis, and sign-offs
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="bg-white p-1 rounded-xl border border-slate-100 flex items-center gap-1 shadow-3xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban' ? 'bg-brand-tint text-slate-900' : 'text-slate-400 hover:text-slate-650'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-brand-tint text-slate-900' : 'text-slate-400 hover:text-slate-650'
              }`}
              title="Table view"
            >
              <TableProperties className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('reports')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'reports' ? 'bg-brand-tint text-slate-900' : 'text-slate-400 hover:text-slate-650'
              }`}
              title="Task Analytics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onCreateTaskClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 font-black rounded-xl text-xs transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, color: 'text-slate-700' },
          { label: 'Pending', value: pendingTasks, icon: Clock, color: 'text-slate-400' },
          { label: 'In Progress', value: inProgressTasks, icon: Kanban, color: 'text-indigo-650' },
          { label: 'Review Queue', value: reviewTasks, icon: ListFilter, color: 'text-amber-500' },
          { label: 'Overdue At-Risk', value: overdueTasks, icon: AlertTriangle, color: 'text-rose-600' },
          { label: 'Completed', value: completedTasks, icon: CheckCircle, color: 'text-emerald-600' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-100/90 shadow-3xs flex flex-col justify-between h-20">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{kpi.label}</span>
              <div className="flex justify-between items-end">
                <span className="text-lg font-black text-slate-800 leading-none">{kpi.value}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtering Row */}
      {viewMode !== 'reports' && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[220px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search tasks by title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
            >
              <option value="All">All Projects</option>
              <option value="Central Office Tower">Central Office Tower</option>
              <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
              <option value="Smart City Mall">Smart City Mall</option>
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
            >
              <option value="All">All Departments</option>
              <option value="Architecture">Architecture</option>
              <option value="Engineering">Engineering</option>
              <option value="Procurement">Procurement</option>
              <option value="Quality Control">Quality Control</option>
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
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      )}

      {/* -------------------- KANBAN VIEW PANEL -------------------- */}
      {viewMode === 'kanban' && (
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin">
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="w-72 flex-shrink-0 bg-[#F8FAFC]/80 p-3 rounded-2xl flex flex-col h-[500px] border border-slate-100/50">
                
                {/* Column header */}
                <div className="flex justify-between items-center mb-3.5 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                    <span className="font-bold text-slate-700 text-xs tracking-tight">
                      {col.label}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column cards container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {columnTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`bg-white p-4 rounded-xl border border-slate-150 shadow-2xs hover:shadow-md hover:border-brand-primary/45 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 ${
                        t.delayFlag ? 'border-rose-100 bg-rose-50/5' : ''
                      }`}
                    >
                      <div>
                        {/* Tags row */}
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2 py-0.5 bg-[#E5F0FA] text-[#2484C6] rounded-md text-[8px] font-black uppercase tracking-wider truncate max-w-[150px]">
                            {t.project}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 ${
                            t.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            t.priority === 'High' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-550 border border-slate-100'
                          }`}>{t.priority}</span>
                        </div>
                        
                        {/* Task Title */}
                        <h4 className="text-[11px] font-bold text-slate-800 leading-snug mt-2 line-clamp-2">{t.title}</h4>
                        <span className="text-[9px] font-black text-slate-400 block mt-1">{t.id}</span>
                      </div>

                      {/* Details row info */}
                      <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[9px] text-slate-500 font-bold">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-brand-tint border border-white flex items-center justify-center text-[7px] font-black uppercase">
                            {t.assignee.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <span className="text-[9px] text-slate-650 font-bold">{t.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{t.estTime}h</span>
                          {t.delayFlag && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                        </div>
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="py-8 text-center bg-white/40 border border-dashed border-slate-200 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">No tasks in stage</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* -------------------- TABLE VIEW PANEL -------------------- */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Task Details</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Workflow Stage</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3.5 font-black text-slate-500 uppercase">{t.id}</td>
                    <td className="px-4 py-3.5">
                      <div>
                        <span className="font-bold text-slate-800 block">{t.title}</span>
                        {t.delayFlag && <span className="text-[9px] font-bold text-rose-600 block mt-0.5 uppercase tracking-wider">Overdue Risk Alert</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-550 font-bold">{t.project}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">{t.assignee}</td>
                    <td className="px-4 py-3.5 text-slate-450 font-semibold">{t.dept}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        t.priority === 'Critical' ? 'bg-rose-50 text-rose-600' :
                        t.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                      }`}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-brand-tint text-brand-dark rounded-full">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-500">{t.deadline}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => onSelectTask(t)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-705 text-[10px] font-bold rounded-lg transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
