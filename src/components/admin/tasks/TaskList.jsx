import React from 'react';
import {
  Search, Filter, CheckSquare, Clock, AlertTriangle, CheckCircle,
  Plus, Eye, ListFilter, Kanban, TableProperties, BarChart3, Calendar,
  User, Building, RefreshCw, ChevronRight, AlertCircle, ArrowUpRight, Sparkles
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'Pending', label: 'Pending', dotColor: 'bg-slate-400', badgeStyle: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'Accepted', label: 'Accepted', dotColor: 'bg-blue-500', badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'In Progress', label: 'In Progress', dotColor: 'bg-indigo-600 animate-pulse', badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'Review', label: 'Review', dotColor: 'bg-amber-500', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Approved', label: 'Approved', dotColor: 'bg-sky-500', badgeStyle: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'Completed', label: 'Completed', dotColor: 'bg-emerald-500', badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
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
  onStatusChange,
  onCreateTaskClick
}) {
  const [dragOverCol, setDragOverCol] = React.useState(null);

  // Calculate KPIs
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const overdueTasks = tasks.filter(t => t.delayFlag).length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const reviewTasks = tasks.filter(t => t.status === 'Review').length;

  // Filter Tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      (t.id || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesProject = projectFilter === 'All' || t.project === projectFilter;
    const matchesDept = deptFilter === 'All' || t.dept === deptFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesProject && matchesDept && matchesPriority;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16 animate-in fade-in duration-200 w-full">

      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Task Operations Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Roster assignments, workflow status tracking, time analysis, and sign-offs
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center gap-1 shadow-3xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'kanban' ? 'bg-brand-primary text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-brand-primary text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              title="Table View"
            >
              <TableProperties className="w-4 h-4" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'reports' ? 'bg-brand-primary text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              title="Analytics View"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </div>

          <button
            onClick={onCreateTaskClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold rounded-2xl text-xs transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* 3. FILTERING & SEARCH CONTROL STRIP */}
      {viewMode !== 'reports' && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">

          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks by title, assignee, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
            >
              <option value="All">All Projects</option>
              <option value="Central Office Tower">Central Office Tower</option>
              <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
              <option value="Smart City Mall">Smart City Mall</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
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
              className="px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
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

      {/* 4. KANBAN BOARD VIEW (FLUID RESPONSIVE GRID + REAL-TIME DRAG & DROP) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 w-full items-start">
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter(t => t.status === col.id);
            const isHoveredOver = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCol !== col.id) setDragOverCol(col.id);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (dragOverCol === col.id) setDragOverCol(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  alert("Task status updates are view-only in Admin Panel. Workflow status is updated by assigned team members & PMs.");
                }}
                className={`w-full p-3.5 rounded-3xl flex flex-col min-h-[480px] border transition-all duration-200 ${isHoveredOver
                  ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-400/30 scale-[1.01] shadow-md'
                  : 'bg-slate-50/90 border-slate-200/80 shadow-3xs'
                  }`}
              >

                {/* Column Header */}
                <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-slate-200/70 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></span>
                    <span className="font-extrabold text-slate-900 text-xs tracking-tight">
                      {col.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${col.badgeStyle}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-none">
                  {columnTasks.map((t) => {
                    const isCritical = t.priority === 'Critical';
                    const isHigh = t.priority === 'High';

                    return (
                      <div
                        key={t._id ? `col-${col.id}-${t._id}` : `col-${col.id}-${t.id}-${Math.random()}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', t.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onClick={() => onSelectTask(t)}
                        className={`bg-white p-3.5 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col justify-between gap-3 shadow-3xs hover:shadow-md hover:border-indigo-400 hover:-translate-y-0.5 ${t.delayFlag ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200/90'
                          }`}
                      >
                        <div className="space-y-2">
                          {/* Project Tag & Priority Badge */}
                          <div className="flex justify-between items-center gap-2">
                            <span className="px-2 py-0.5 bg-brand-soft text-brand-dark rounded-md text-[8px] font-black uppercase tracking-wider truncate max-w-[110px] border border-brand-secondary/30">
                              {t.project}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              isHigh ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                              {t.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-extrabold text-slate-900 leading-snug hover:text-indigo-600 transition-colors line-clamp-2">
                            {t.title}
                          </h4>

                          {/* Task ID */}
                          <span className="text-[9px] font-mono font-extrabold text-slate-400 block">
                            {t.id}
                          </span>
                        </div>

                        {/* Assignee & Time Footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4.5 h-4.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[7px] font-black uppercase shadow-3xs">
                              {(t.assignee || 'User').split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-bold text-slate-700 truncate max-w-[130px]">{t.assignee}</span>
                          </div>

                          <div className="flex items-center gap-1 font-mono font-bold text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{t.estTime || '8'}h</span>
                            {t.delayFlag && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Overdue Alert"></span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="py-10 text-center bg-white/60 border border-dashed border-slate-200/90 rounded-2xl">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                        {isHoveredOver ? 'Drop Here' : 'No tasks in stage'}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80">
                  <th className="px-5 py-3.5">Task ID</th>
                  <th className="px-5 py-3.5">Task Details</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Assignee</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Workflow Stage</th>
                  <th className="px-5 py-3.5">Est. Hours</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredTasks.map((t, idx) => (
                  <tr key={t._id ? `tbl-${t._id}` : `tbl-${t.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono font-extrabold text-slate-500">{t.id}</td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-extrabold text-slate-900 block hover:text-indigo-600 cursor-pointer" onClick={() => onSelectTask(t)}>
                          {t.title}
                        </span>
                        {t.delayFlag && (
                          <span className="text-[9px] font-bold text-rose-600 block mt-0.5 uppercase tracking-wider">
                            ⚠️ Overdue Risk Alert
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-800">{t.project}</td>
                    <td className="px-5 py-4 font-bold text-slate-700">{t.assignee}</td>
                    <td className="px-5 py-4 text-slate-500">{t.dept || 'Engineering'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${t.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        t.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-brand-primary text-slate-900 rounded-full shadow-3xs">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{t.estTime || '8'} hrs</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onSelectTask(t)}
                        className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 text-xs font-extrabold rounded-xl transition-all shadow-3xs cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ANALYTICS / REPORTS VIEW */}
      {viewMode === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Departmental Task Breakdown</h3>
            <div className="space-y-3 pt-2">
              {[
                { dept: 'Architecture', pct: 45, count: '8 Tasks' },
                { dept: 'Engineering', pct: 70, count: '14 Tasks' },
                { dept: 'Procurement', pct: 30, count: '5 Tasks' },
                { dept: 'Quality Control', pct: 85, count: '12 Tasks' }
              ].map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{d.dept}</span>
                    <span className="font-mono text-slate-500">{d.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${d.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Priority Risk Index</h3>
            <div className="grid grid-cols-2 gap-3 text-center pt-2">
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <span className="text-2xl font-black text-rose-700">1</span>
                <span className="text-[10px] font-extrabold text-rose-900 uppercase block mt-1">Critical Overdue</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-2xl font-black text-amber-700">2</span>
                <span className="text-[10px] font-extrabold text-amber-900 uppercase block mt-1">High Priority Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
