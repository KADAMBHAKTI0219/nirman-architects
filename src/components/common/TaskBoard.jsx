import React, { useState } from 'react';
import { Calendar, User, Clock, AlertTriangle, ArrowRight, ArrowLeft, Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'Pending', label: 'Pending', color: 'border-t-amber-400 bg-amber-50/10' },
  { id: 'Accepted', label: 'Accepted', color: 'border-t-sky-400 bg-sky-50/10' },
  { id: 'In Progress', label: 'In Progress', color: 'border-t-blue-500 bg-blue-50/10' },
  { id: 'Review', label: 'Review', color: 'border-t-purple-400 bg-purple-50/10' },
  { id: 'Approved', label: 'Approved', color: 'border-t-emerald-400 bg-emerald-50/10' },
  { id: 'Completed', label: 'Completed', color: 'border-t-slate-400 bg-slate-50/10' }
];

export default function TaskBoard({ initialTasks = [], onAddTask }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterProject, setFilterProject] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProject, setNewProject] = useState('Central Office Tower');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');

  const projects = Array.from(new Set(tasks.map(t => t.project)));

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleAddNewTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTitle,
      project: newProject,
      assignee: newAssignee || 'Unassigned',
      dueDate: newDueDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      priority: newPriority,
      status: 'Pending',
      isOverdue: false
    };

    setTasks([newTask, ...tasks]);
    if (onAddTask) onAddTask(newTask);
    
    // Reset form
    setNewTitle('');
    setNewAssignee('');
    setNewDueDate('');
    setNewPriority('Medium');
    setShowAddForm(false);
  };

  const filteredTasks = tasks.filter(t => filterProject === 'all' || t.project === filterProject);

  return (
    <div className="space-y-6">
      {/* Filters and Add Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-500">Project Filter:</label>
          <select 
            value={filterProject} 
            onChange={(e) => setFilterProject(e.target.value)}
            className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          >
            <option value="all">All Projects</option>
            {projects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Task Add Form Overlay */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-xl transition-all duration-300">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Create New Task</h4>
          <form onSubmit={handleAddNewTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 block mb-1">Task Title *</label>
              <input 
                type="text" 
                required 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Draft First Floor Column Details"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-brand-primary bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Project</label>
              <select 
                value={newProject} 
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="Central Office Tower">Central Office Tower</option>
                <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
                <option value="Smart City Mall">Smart City Mall</option>
                <option value="Metro Station Phase 3">Metro Station Phase 3</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Assignee</label>
              <input 
                type="text" 
                value={newAssignee} 
                onChange={(e) => setNewAssignee(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Due Date</label>
              <input 
                type="date" 
                value={newDueDate} 
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Priority</label>
              <select 
                value={newPriority} 
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-brand-primary text-slate-900 rounded-xl text-xs font-bold hover:bg-brand-secondary"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className={`rounded-2xl border border-slate-100 p-4 flex flex-col h-[500px] border-t-4 ${col.color} shadow-sm`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100/50">
                <span className="text-sm font-bold text-slate-700">{col.label}</span>
                <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200/50 text-slate-600 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs hover:shadow-md cursor-pointer hover:border-slate-200 transition-all duration-200 relative group"
                  >
                    {task.isOverdue && (
                      <span className="absolute top-2 right-2 text-rose-500" title="Overdue Task!">
                        <AlertTriangle className="w-4 h-4 fill-rose-50" />
                      </span>
                    )}
                    <h5 className="text-xs font-bold text-slate-900 line-clamp-2 pr-4">{task.title}</h5>
                    <span className="text-[10px] text-slate-400 block mt-1">{task.project}</span>
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignee}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                        task.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {task.priority}
                      </span>
                      
                      {/* Interactive column mover */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        {col.id !== 'Pending' && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const prevIdx = COLUMNS.findIndex(c => c.id === col.id) - 1;
                              handleStatusChange(task.id, COLUMNS[prevIdx].id);
                            }}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600"
                            title="Move back"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {col.id !== 'Completed' && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const nextIdx = COLUMNS.findIndex(c => c.id === col.id) + 1;
                              handleStatusChange(task.id, COLUMNS[nextIdx].id);
                            }}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600"
                            title="Move forward"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">{selectedTask.project}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTask.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Workflow Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <select 
                      value={selectedTask.status} 
                      onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                      className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
                    >
                      {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Priority</span>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-bold uppercase mt-1 ${
                    selectedTask.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                    selectedTask.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Assigned Staff</span>
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-1 mt-1">
                    <User className="w-4 h-4 text-slate-400" />
                    {selectedTask.assignee}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Due Date</span>
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {selectedTask.dueDate}
                  </span>
                </div>
              </div>

              {selectedTask.isOverdue && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-semibold">
                  <Clock className="w-4 h-4" />
                  This task has passed its due date and is flagged as OVERDUE.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-300"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
