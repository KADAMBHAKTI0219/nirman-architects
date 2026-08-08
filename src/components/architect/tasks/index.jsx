import React, { useState, useEffect } from 'react';
import { 
  Search, LayoutGrid, List, Play, Square, Pause, Plus, Clock, 
  AlertTriangle, X, Paperclip, MessageSquare, CheckCircle, RefreshCw 
} from 'lucide-react';
import Card from '../../common/Card';
import { getProjects } from '../../../service/project';
import { getTasks, acceptTask, startTask, submitTaskForReview, completeTask } from '../../../service/task';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetchArchitectTasks();
  }, []);

  const fetchArchitectTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      if (res?.success && Array.isArray(res.tasks) && res.tasks.length > 0) {
        const mapped = res.tasks.map((t, idx) => {
          const projStr = typeof t.projectId === 'object' ? (t.projectId?.projectName || t.projectId?.name) : (t.project || 'General Project');
          return {
            id: t._id ? `TSK-${t._id.slice(-5).toUpperCase()}` : `TSK-${idx + 401}`,
            _id: t._id,
            title: t.taskName || t.title || 'Architectural Task',
            project: projStr || 'General Project',
            priority: t.priority || 'High',
            status: t.status || 'In Progress',
            deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : '2026-12-31',
            estHours: t.estimatedTime || 16,
            loggedHours: t.totalWorkingTimeMinutes ? Math.round(t.totalWorkingTimeMinutes / 60) : 8,
            timerActive: false
          };
        });

        const unique = [];
        const seen = new Set();
        mapped.forEach(item => {
          const key = item._id || item.id;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        });
        setTasks(unique);
      } else {
        const projRes = await getProjects();
        if (projRes?.success && Array.isArray(projRes.projects)) {
          const loadedTasks = [];
          projRes.projects.forEach((proj, pIdx) => {
            const projName = proj.projectName || proj.name || 'Project';
            const milestones = proj.milestones || [];
            milestones.forEach((m, mIdx) => {
              loadedTasks.push({
                id: m._id ? `TSK-${m._id.slice(-5).toUpperCase()}` : `TSK-${pIdx + 1}0${mIdx + 1}`,
                _id: m._id,
                title: m.name || m.title || 'Architectural Task',
                project: projName,
                priority: proj.priority || 'High',
                status: m.isCompleted ? 'Completed' : 'In Progress',
                deadline: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '2026-12-31',
                estHours: 16,
                loggedHours: m.isCompleted ? 16 : 8,
                timerActive: false
              });
            });
          });

          const unique = [];
          const seen = new Set();
          loadedTasks.forEach(item => {
            const key = item._id || item.id;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(item);
            }
          });
          setTasks(unique);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch architect tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.project || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === 'All' || t.project === selectedProject;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    return matchesSearch && matchesProject && matchesPriority;
  });

  const toggleTimer = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, timerActive: !t.timerActive } : t));
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 pb-16 w-full max-w-[1400px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            Architect Design Tasks
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-normal">
            Track architectural CAD drafting assignments, design reviews & timesheet hours
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchTasksFromProjects}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search task title or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-slate-50"
          />
        </div>
      </div>

      {/* TASKS VIEW */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-normal">Loading design tasks from backend...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['To Do', 'In Progress', 'Completed'].map(statusName => (
            <Card key={statusName} title={`${statusName} Tasks`}>
              <div className="space-y-3 pt-2">
                {filteredTasks.filter(t => t.status === statusName || (statusName === 'To Do' && t.status !== 'In Progress' && t.status !== 'Completed')).map((task, idx) => (
                  <div 
                    key={task._id ? `arch-card-${statusName}-${task._id}` : `arch-card-${statusName}-${task.id}-${idx}`}
                    onClick={() => { setSelectedTask(task); setDrawerOpen(true); }}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 cursor-pointer hover:border-brand-secondary transition-all"
                  >
                    <span className="text-[10px] font-semibold text-slate-400 font-mono block">{task.id}</span>
                    <h3 className="text-xs font-semibold text-slate-900 leading-snug">{task.title}</h3>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-normal pt-1 border-t border-slate-200/60">
                      <span>Project: <strong>{task.project}</strong></span>
                      <span>Target: {task.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 p-8 font-normal">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No design tasks found.</p>
        </div>
      )}

      {/* DRAWER MODAL */}
      {selectedTask && drawerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 font-sans text-left">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 uppercase font-semibold">{selectedTask.id}</span>
                <h3 className="text-base font-semibold text-slate-900 mt-0.5">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">&times;</button>
            </div>

            <div className="space-y-3 text-xs font-normal text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-medium block">Project & Deadline</span>
                <span className="text-slate-900 font-semibold block">{selectedTask.project} &bull; {selectedTask.deadline}</span>
              </div>
            </div>

            <button 
              onClick={() => setDrawerOpen(false)}
              className="w-full py-2.5 bg-brand-primary text-slate-900 font-semibold text-xs rounded-xl shadow-2xs cursor-pointer border border-brand-secondary/40"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
