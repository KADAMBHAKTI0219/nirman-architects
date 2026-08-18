import React, { useState } from 'react';
import {
  Search, Filter, CheckSquare, Clock, AlertTriangle, CheckCircle,
  Plus, Eye, ListFilter, Kanban, TableProperties, BarChart3, Calendar,
  User, Building, RefreshCw, ChevronRight, AlertCircle, ArrowUpRight, Sparkles, Trash2, LayoutGrid
} from 'lucide-react';
import Pagination from '../../common/Pagination';
import BrandLoader from '../../common/BrandLoader';
import CustomSelect from '../../common/CustomSelect';
import { handleKanbanAutoScroll } from '../../../utils/kanbanAutoScroll';

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
  loading = false,
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
  onCreateTaskClick,
  onDeleteTask
}) {
  const [dragOverCol, setDragOverCol] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const roleCode = user.roleCode || (user.role && typeof user.role === 'object' ? user.role.roleCode : user.role) || '';
  const canManageTasks = ['ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(String(roleCode).toUpperCase());

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
    <div className="space-y-6 font-sans text-slate-800 pb-16 animate-in fade-in duration-200 w-full max-w-full overflow-x-hidden">

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
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${viewMode === 'cards' || viewMode === 'kanban' ? 'bg-brand-primary text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cards</span>
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

          {canManageTasks && (
            <button
              onClick={onCreateTaskClick}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold rounded-2xl text-xs transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{totalTasks}</span>
          </div>
          <div className="p-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200/60">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending</span>
            <span className="text-xl font-black text-slate-800 font-mono mt-0.5 block">{pendingTasks}</span>
          </div>
          <div className="p-2 bg-slate-100 text-slate-600 rounded-xl border border-slate-200/60">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">In Progress</span>
            <span className="text-xl font-black text-indigo-700 font-mono mt-0.5 block">{inProgressTasks}</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">In Review</span>
            <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">{reviewTasks}</span>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Overdue</span>
            <span className="text-xl font-black text-rose-700 font-mono mt-0.5 block">{overdueTasks}</span>
          </div>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-3xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{completedTasks}</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle className="w-4 h-4" />
          </div>
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
            <div className="min-w-[150px]">
              <CustomSelect
                value={projectFilter}
                onChange={(val) => setProjectFilter(val)}
                variant="filter"
                placeholder="All Projects"
                options={[
                  { value: 'All', label: 'All Projects' },
                  ...Array.from(new Set((tasks || []).map(t => t.project || t.projectName).filter(Boolean))).map(pName => ({ value: pName, label: pName }))
                ]}
              />
            </div>

            <div className="min-w-[160px]">
              <CustomSelect
                value={deptFilter}
                onChange={(val) => setDeptFilter(val)}
                variant="filter"
                placeholder="All Departments"
                options={[
                  { value: 'All', label: 'All Departments' },
                  ...Array.from(new Set((tasks || []).map(t => t.dept || t.departmentName).filter(Boolean))).map(dName => ({ value: dName, label: dName }))
                ]}
              />
            </div>

            <div className="min-w-[140px]">
              <CustomSelect
                value={priorityFilter}
                onChange={(val) => setPriorityFilter(val)}
                variant="filter"
                placeholder="All Priorities"
                options={[
                  { value: 'All', label: 'All Priorities' },
                  { value: 'Critical', label: 'Critical' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' }
                ]}
              />
            </div>
          </div>

        </div>
      )}

      {/* 4. CARDS GRID VIEW */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-3xs my-4">
          <BrandLoader text="Loading Project Tasks..." />
        </div>
      ) : (
        <>
          {(viewMode === 'cards' || viewMode === 'kanban' || !viewMode) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5 pt-1 pb-6">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-3xs">
              <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-800">No tasks found</h3>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter parameters.</p>
            </div>
          ) : (
            filteredTasks.map((t) => {
              const isCritical = t.priority === 'Critical';
              const isHigh = t.priority === 'High';
              const isMedium = t.priority === 'Medium';

              return (
                <div
                  key={t._id ? `card-${t._id}` : `card-${t.id}`}
                  onClick={() => onSelectTask(t)}
                  className={`bg-white p-4.5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3.5 shadow-2xs hover:shadow-md hover:border-indigo-400 group ${t.delayFlag ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200/90'
                    }`}
                >
                  <div className="space-y-3">
                    {/* Project Tag & Priority & Status Badge */}
                    <div className="flex justify-between items-center gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider truncate max-w-[140px] border border-slate-200/80 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-colors">
                        {t.project || t.projectName || 'General'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          isHigh ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            isMedium ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                          {t.priority || 'Medium'}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[9px] font-bold uppercase">
                          {t.status || 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Task Title */}
                    <h4 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {t.title || t.taskName}
                    </h4>

                    {/* Task ID */}
                    <span className="text-[10px] font-mono font-extrabold text-slate-400 block tracking-wider">
                      {t.id || t._id}
                    </span>

                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${t.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                        style={{ width: `${t.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Assignee & Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-3xs flex-shrink-0">
                        {(t.assignee || t.assignedEmployee?.name || 'User').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-slate-700 truncate min-w-0 flex-1 text-xs">{t.assignee || t.assignedEmployee?.name || 'Assigned Staff'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteTask) onDeleteTask(t._id || t.id);
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-all shadow-3xs cursor-pointer"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1 font-mono font-extrabold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{t.estTime || '8'}h</span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
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
                {filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((t, idx) => (
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectTask(t)}
                          className=" p-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 text-xs font-extrabold rounded-xl transition-all shadow-3xs cursor-pointer "
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteTask) onDeleteTask(t._id || t.id);
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl transition-all shadow-3xs cursor-pointer"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Integrated Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTasks.length}
            itemsPerPage={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
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
      </>
      )}

    </div>
  );
}
