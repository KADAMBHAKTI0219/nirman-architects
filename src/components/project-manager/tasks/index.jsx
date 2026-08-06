import React, { useState } from 'react';
import { 
  Search, LayoutGrid, List, Plus, Clock, AlertTriangle, Check, Eye, X, 
  User, CheckSquare, Layers, Award, ChevronRight, MessageSquare 
} from 'lucide-react';
import Card from '../../common/Card';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_TASKS = [
  { id: "TSK-101", title: "Detail the staircase treads & balustrades blueprints", project: "Central Office Tower", assignee: "Sarah Connor", role: "Lead Architect", dueDate: "2026-07-25", priority: "High", status: "In Progress", isOverdue: false, comments: 2 },
  { id: "TSK-102", title: "HVAC Duct Sizing & Layout Drafts", project: "Smart City Mall", assignee: "Alice Smith", role: "Jr Architect", dueDate: "2026-07-20", priority: "High", status: "Review", isOverdue: true, comments: 1 },
  { id: "TSK-103", title: "Soil Mechanics Foundation Report Verification", project: "Oceanic Luxury Villas", assignee: "Bob Johnson", role: "Site Engineer", dueDate: "2026-07-15", priority: "Medium", status: "Completed", isOverdue: false, comments: 4 },
  { id: "TSK-104", title: "Facade Mockup Rendering revisions", project: "Central Office Tower", assignee: "Sarah Connor", role: "Lead Architect", dueDate: "2026-07-30", priority: "Low", status: "To Do", isOverdue: false, comments: 0 }
];

export default function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [groupMode, setGroupMode] = useState('status'); // status, employee
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedTask, setSelectedTask] = useState(INITIAL_TASKS[0]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  // Extract unique employees for employee-wise grouping
  const employeesList = Array.from(new Set(tasks.map(t => t.assignee || 'Unassigned')));

  const handleUpdateStatus = (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleAddTask = async () => {
    const title = await window.prompt("Enter Task Title:", "", "Create New Project Task");
    if (!title) return;
    const project = await window.prompt("Enter Project Name:", "Oceanic Luxury Villas", "Create New Project Task");
    if (!project) return;
    const assignee = await window.prompt("Enter Assignee Name (e.g. Sarah Connor, Alice Smith):", "Sarah Connor", "Create New Project Task");
    if (title && project && assignee) {
      const newTask = {
        id: `TSK-${100 + tasks.length + 1}`,
        title,
        project,
        assignee,
        role: "Team Staff",
        dueDate: new Date().toISOString().split('T')[0],
        priority: "Medium",
        status: "To Do",
        isOverdue: false,
        comments: 0
      };
      setTasks(prev => [...prev, newTask]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800">
      
      {/* 0. TOP PAGE HEADER MATCHING DRAWING VAULT MANAGEMENT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Project Tasks & Workload Command
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Track task assignments, milestone deadlines, overdue flags, and department workloads
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleAddTask}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer border border-brand-secondary/40"
          >
            <Plus className="w-4 h-4 text-slate-900 stroke-[2.5]" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* 1. TOP FILTERS & TOGGLES */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex gap-3 flex-wrap items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks or projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-xs font-semibold bg-slate-50 text-slate-800"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white font-bold text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Grouping switcher */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden text-xs font-extrabold p-1 bg-slate-100/70">
            <button
              onClick={() => setGroupMode('status')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                groupMode === 'status' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              By Kanban Status
            </button>
            <button
              onClick={() => setGroupMode('employee')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                groupMode === 'employee' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              By Employee
            </button>
          </div>
        </div>

        <button
          onClick={handleAddTask}
          className="px-4.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>

      </div>

      {/* 2. MAIN LAYOUT AND RIGHT SIDE DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Tasks Container */}
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          
          {groupMode === 'status' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['To Do', 'In Progress', 'Review', 'Completed'].map(col => {
                const columnTasks = filteredTasks.filter(t => t.status === col);
                return (
                  <div key={col} className="bg-slate-50/70 p-4 rounded-3xl border border-slate-200/80 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{col}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-black">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 min-h-[400px]">
                      {columnTasks.map(task => {
                        const isSelected = selectedTask?.id === task.id;

                        return (
                          <motion.div 
                            key={task.id}
                            whileHover={{ y: -2 }}
                            onClick={() => {
                              setSelectedTask(task);
                              setDrawerOpen(true);
                            }}
                            className={`bg-white p-3.5 rounded-2xl border transition-all cursor-pointer shadow-3xs flex flex-col gap-2.5 ${
                              isSelected ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xs' : 'border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold uppercase truncate max-w-[140px]">
                                {task.project}
                              </span>
                              <span className={`text-[8px] px-2 py-0.5 rounded border font-black uppercase ${
                                task.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>{task.priority}</span>
                            </div>

                            <strong className="text-slate-900 block text-xs font-black leading-snug">{task.title}</strong>

                            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                              <span className="font-extrabold text-slate-800">{task.assignee || 'Unassigned'}</span>
                              <span className="font-semibold text-slate-400">{task.dueDate}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // EMPLOYEE-WISE DATA LAYOUT
            <div className="space-y-4">
              {employeesList.map(empName => {
                const empTasks = filteredTasks.filter(t => (t.assignee || 'Unassigned') === empName);
                const completedTasks = empTasks.filter(t => t.status === 'Completed').length;
                const progressPct = empTasks.length > 0 ? Math.round((completedTasks / empTasks.length) * 100) : 0;

                return (
                  <div key={empName} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
                    {/* Employee Profile Header & Progress */}
                    <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center font-black text-sky-800 text-xs shadow-2xs">
                          {empName.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <strong className="text-slate-900 block text-sm font-extrabold">{empName}</strong>
                          <span className="text-[11px] text-slate-400 font-bold block">Assigned Workload Catalog</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Tasks Progress</span>
                          <strong className="text-xs font-black text-slate-800 block mt-0.5">{completedTasks} / {empTasks.length} Completed</strong>
                        </div>
                        <div className="w-28 bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressPct}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Employee Tasks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {empTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => {
                            setSelectedTask(task);
                            setDrawerOpen(true);
                          }}
                          className={`p-3.5 rounded-2xl border bg-slate-50/50 cursor-pointer hover:bg-white transition-all flex flex-col justify-between min-h-[110px] ${
                            selectedTask?.id === task.id ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-black uppercase">
                              {task.project}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                              task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              task.status === 'Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>{task.status}</span>
                          </div>

                          <strong className="text-slate-900 block text-xs font-black leading-snug mt-2">{task.title}</strong>

                          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-3">
                            <span className="font-semibold">Due: {task.dueDate}</span>
                            {task.isOverdue && (
                              <span className="text-[9px] font-black text-rose-700 flex items-center gap-0.5 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                <AlertTriangle className="w-3 h-3" /> Overdue
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {empTasks.length === 0 && (
                        <div className="col-span-3 text-center text-slate-400 py-4 font-bold uppercase text-[10px]">
                          No tasks assigned to this employee.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right slide drawer - Task details */}
        {drawerOpen && selectedTask && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Task Inspector</span>
                <strong className="text-slate-900 block text-sm font-black mt-0.5">{selectedTask.id}</strong>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <span className="text-[10px] font-black text-slate-400 block uppercase">Project Name</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{selectedTask.project}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 block uppercase">Assignee & Target Deadline</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{selectedTask.assignee || 'Unassigned'} &bull; {selectedTask.dueDate}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Task Details</span>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {selectedTask.title}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block mb-1.5">Update Task Status</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white font-extrabold text-slate-800"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
