import React, { useState } from 'react';
import { 
  Search, LayoutGrid, List, Plus, Clock, AlertTriangle, Check, Eye, X, 
  User, CheckSquare, Layers, Award 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_TASKS = [
  { id: "TSK-101", title: "Detail the staircase treads & balustrades blueprints", project: "Central Office Tower", assignee: "Sarah Connor", role: "Lead Architect", dueDate: "2026-07-25", priority: "High", status: "In Progress", isOverdue: false, comments: 2 },
  { id: "TSK-102", title: "HVAC Duct Sizing & Layout Drafts", project: "Smart City Mall", assignee: "Alice Smith", role: "Jr Architect", dueDate: "2026-07-20", priority: "High", status: "Review", isOverdue: true, comments: 1 },
  { id: "TSK-103", title: "Soil Mechanics Foundation Report Verification", project: "Bob Johnson", role: "Site Engineer", dueDate: "2026-07-15", priority: "Medium", status: "Completed", isOverdue: false, comments: 4 },
  { id: "TSK-104", title: "Facade Mockup Rendering revisions", project: "Central Office Tower", assignee: "Sarah Connor", role: "Lead Architect", dueDate: "2026-07-30", priority: "Low", status: "To Do", isOverdue: false, comments: 0 }
];

export default function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [groupMode, setGroupMode] = useState('employee'); // status, employee
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
    alert(`Task status updated to: ${newStatus}`);
  };

  const handleAddTask = () => {
    const title = prompt("Enter Task Title:");
    const project = prompt("Enter Project Name:");
    const assignee = prompt("Enter Assignee Name (e.g. Sarah Connor, Alice Smith, Bob Johnson):");
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
      alert("New task registered successfully!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP FILTERS & TOGGLES */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex gap-3 flex-wrap items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Grouping switcher */}
          <div className="flex border border-slate-205 rounded-xl overflow-hidden text-xs">
            <button
              onClick={() => setGroupMode('status')}
              className={`px-3 py-2 font-bold transition-all flex items-center gap-1 ${
                groupMode === 'status' ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-450 hover:text-slate-655'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              By Status
            </button>
            <button
              onClick={() => setGroupMode('employee')}
              className={`px-3 py-2 font-bold transition-all flex items-center gap-1 ${
                groupMode === 'employee' ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-450 hover:text-slate-655'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              By Employee
            </button>
          </div>
        </div>

        <button
          onClick={handleAddTask}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Task
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
                  <div key={col} className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 flex-shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{col}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded font-black text-slate-500">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-0.5 scrollbar-none">
                      {columnTasks.map(task => (
                        <div 
                          key={task.id}
                          onClick={() => {
                            setSelectedTask(task);
                            setDrawerOpen(true);
                          }}
                          className={`bg-white p-3 rounded-2xl border transition-all cursor-pointer hover:shadow-xs flex flex-col gap-2 ${
                            selectedTask?.id === task.id ? 'border-[#2484C6] shadow-3xs' : 'border-slate-150'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] bg-slate-50 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">
                              {task.project}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black uppercase ${
                              task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>{task.priority}</span>
                          </div>

                          <strong className="text-slate-805 block text-xs font-black leading-snug">{task.title}</strong>

                          <div className="flex justify-between items-center text-[10px] text-slate-405 pt-2 border-t border-slate-50">
                            <span className="font-bold">{task.assignee || 'Unassigned'}</span>
                            <span className="font-semibold">{task.dueDate}</span>
                          </div>
                        </div>
                      ))}
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
                  <div key={empName} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                    {/* Employee Profile Header & Progress */}
                    <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-50 pb-3 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center font-bold text-slate-805 text-xs">
                          {empName.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <strong className="text-slate-805 block text-sm">{empName}</strong>
                          <span className="text-[10px] text-slate-400 font-bold block">Assigned Workload Catalog</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">Tasks Progress</span>
                          <strong className="text-xs font-black text-slate-700 block mt-0.5">{completedTasks} / {empTasks.length} Completed</strong>
                        </div>
                        <div className="w-24 bg-slate-105 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${progressPct}%` }}></div>
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
                          className={`p-3.5 rounded-2xl border bg-slate-50/20 cursor-pointer hover:bg-slate-50 transition-all flex flex-col justify-between min-h-[110px] ${
                            selectedTask?.id === task.id ? 'border-[#2484C6] shadow-3xs' : 'border-slate-150'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] bg-white border border-slate-205 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">
                              {task.project}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                              task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              task.status === 'Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-blue-50 text-[#2484C6] border-blue-100'
                            }`}>{task.status}</span>
                          </div>

                          <strong className="text-slate-805 block text-[11px] font-black leading-snug mt-2">{task.title}</strong>

                          <div className="flex justify-between items-center text-[10px] text-slate-405 pt-2 border-t border-slate-50 mt-3">
                            <span className="font-semibold">Due: {task.dueDate}</span>
                            {task.isOverdue && (
                              <span className="text-[8px] font-black text-rose-600 flex items-center gap-0.5 bg-rose-50 px-1 py-0.5 rounded">
                                <AlertTriangle className="w-2.5 h-2.5" /> Overdue
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
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Task Details</span>
                <strong className="text-slate-805 block text-xs mt-1">{selectedTask.id}</strong>
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
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Project Name</span>
                <span className="font-bold text-slate-700 block mt-0.5">{selectedTask.project}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Assignee & Deadline</span>
                <span className="font-bold text-slate-700 block mt-0.5">{selectedTask.assignee || 'Unassigned'} &bull; {selectedTask.dueDate}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[8px] text-slate-405 block uppercase">Task Description</span>
                <p className="text-[10px] font-semibold text-slate-700">
                  {selectedTask.title}
                </p>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-455 uppercase block mb-1">Status Action</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
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
