import React, { useState, useEffect } from 'react';
import { 
  Search, LayoutGrid, List, Play, Square, Pause, Plus, Clock, 
  AlertTriangle, X, Paperclip, MessageSquare, CheckCircle 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_TASKS = [
  { id: "TSK-301", title: "Draft First Floor Plan Column Layouts", project: "Central Office Tower", priority: "High", status: "In Progress", deadline: "2026-07-25", estHours: 16, loggedHours: 6.5, timerActive: false },
  { id: "TSK-302", title: "HVAC Duct Sizing & Layout Drafts", project: "Smart City Mall", priority: "Critical", status: "To Do", deadline: "2026-07-20", estHours: 24, loggedHours: 0, timerActive: false },
  { id: "TSK-303", title: "Lobby Interior Rendering & Material Scheme", project: "Oceanic Luxury Villas", priority: "Medium", status: "Review", deadline: "2026-07-30", estHours: 20, loggedHours: 18.2, timerActive: false },
  { id: "TSK-304", title: "Landscape Layout Plan Rev B", project: "Oceanic Luxury Villas", priority: "Low", status: "Completed", deadline: "2026-08-05", estHours: 8, loggedHours: 8, timerActive: false }
];

export default function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtered tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === 'All' || t.project === selectedProject;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    return matchesSearch && matchesProject && matchesPriority;
  });

  // Unique projects list for filters
  const projectsList = Array.from(new Set(tasks.map(t => t.project)));

  // Timer actions
  const handleToggleTimer = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextActive = !t.timerActive;
        if (nextActive) {
          // Pause other active timers
          return { ...t, timerActive: true, status: 'In Progress' };
        } else {
          return { ...t, timerActive: false };
        }
      }
      return { ...t, timerActive: false };
    }));
  };

  const handleUpdateStatus = (id, newStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. FILTER & VIEW TOGGLE BAR */}
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
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Projects</option>
            {projectsList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* View toggler */}
        <div className="flex border border-slate-205 rounded-xl overflow-hidden text-xs">
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-2 transition-all ${
              viewMode === 'kanban' ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-400 hover:text-slate-600'
            }`}
            title="Kanban Board View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-all ${
              viewMode === 'list' ? 'bg-slate-100 text-slate-800' : 'bg-white text-slate-400 hover:text-slate-600'
            }`}
            title="List Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Tasks View panel */}
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['To Do', 'In Progress', 'Review', 'Completed'].map(col => {
                const columnTasks = filteredTasks.filter(t => t.status === col);
                return (
                  <div key={col} className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 space-y-3 min-h-[400px]">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 flex-shrink-0">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{col}</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded font-black text-slate-500">
                        {columnTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {columnTasks.map(task => {
                        const progress = task.estHours > 0 ? Math.round((task.loggedHours / task.estHours) * 100) : 0;
                        return (
                          <div 
                            key={task.id}
                            className={`bg-white p-4 rounded-2xl border transition-all hover:shadow-xs flex flex-col justify-between min-h-[140px] cursor-pointer ${
                              selectedTask?.id === task.id ? 'border-[#2484C6] shadow-3xs' : 'border-slate-150'
                            }`}
                            onClick={() => {
                              setSelectedTask(task);
                              setDrawerOpen(true);
                            }}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <span className="text-[8px] bg-blue-50 border border-blue-100 text-[#2484C6] px-1.5 py-0.5 rounded font-black uppercase">
                                  {task.project}
                                </span>
                                <span className={`text-[8px] px-1.5 py-0.5 rounded border font-black uppercase ${
                                  task.priority === 'Critical' || task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                  'bg-slate-50 text-slate-550 border-slate-100'
                                }`}>{task.priority}</span>
                              </div>

                              <strong className="text-slate-805 block text-xs font-black leading-snug">{task.title}</strong>
                            </div>

                            <div className="mt-4 pt-3.5 border-t border-slate-50 space-y-2">
                              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                                <span>Progress: {progress}%</span>
                                <span>{task.loggedHours}/{task.estHours} hrs</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#2484C6] h-full" style={{ width: `${progress}%` }}></div>
                              </div>

                              <div className="flex justify-between items-center pt-2">
                                <span className="text-[9px] text-slate-400 font-semibold">Due: {task.deadline}</span>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTimer(task.id);
                                  }}
                                  className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-[9px] font-black uppercase ${
                                    task.timerActive 
                                      ? 'bg-amber-500 border-amber-600 text-white animate-pulse' 
                                      : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
                                  }`}
                                  title={task.timerActive ? "Pause Timer" : "Start Timer"}
                                >
                                  {task.timerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                  {task.timerActive ? 'Logging' : 'Track'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // LIST VIEW TABLE
            <Card className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Task Details</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Est Hours</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                    <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTasks.map(task => {
                    const progress = task.estHours > 0 ? Math.round((task.loggedHours / task.estHours) * 100) : 0;
                    return (
                      <tr 
                        key={task.id} 
                        onClick={() => {
                          setSelectedTask(task);
                          setDrawerOpen(true);
                        }}
                        className={`hover:bg-slate-50/40 cursor-pointer ${
                          selectedTask?.id === task.id ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3 align-middle">
                          <strong className="text-slate-805 block">{task.title}</strong>
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{task.id}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-bold align-middle">{task.project}</td>
                        <td className="px-4 py-3 text-slate-500 font-semibold align-middle">{task.estHours} hrs</td>
                        <td className="px-4 py-3 align-middle w-24">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold">{progress}%</span>
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#2484C6] h-full" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-450 align-middle">{task.deadline}</td>
                        <td className="px-4 py-3 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleTimer(task.id)}
                            className={`p-1.5 rounded-xl border text-xs font-black transition-all ${
                              task.timerActive 
                                ? 'bg-amber-500 border-amber-600 text-white' 
                                : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {task.timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}

        </div>

        {/* RIGHT DRAWER: DETAILED COCKPIT DRAWER */}
        {drawerOpen && selectedTask && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedTask.id}</span>
                <strong className="text-slate-805 block text-xs mt-1">{selectedTask.title}</strong>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-550">
              
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                <span className="text-[8px] text-slate-405 block uppercase">Task Metadata</span>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <span className="text-slate-400 font-semibold block">Project</span>
                    <strong className="text-slate-700">{selectedTask.project}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Priority</span>
                    <strong className="text-rose-600">{selectedTask.priority}</strong>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1.5">Action Status</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white font-semibold text-slate-700"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Comments mock list */}
              <div className="space-y-2.5">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Design Discussion</span>
                <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto">
                  <div className="text-[10px] space-y-0.5">
                    <strong className="text-slate-700 block">Sarah Connor (PM)</strong>
                    <p className="text-slate-500">Please align rebar specifications before finalizing details.</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl bg-white text-[10px]"
                  />
                  <button 
                    onClick={() => alert("Comment posted!")}
                    className="px-3 py-1.5 bg-brand-primary text-slate-905 rounded-xl text-[10px]"
                  >
                    Post
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
