import React, { useState, useEffect } from 'react';
import { 
  Search, LayoutGrid, List, Plus, Clock, AlertTriangle, Check, Eye, X, 
  User, CheckSquare, Layers, Award, ChevronRight, MessageSquare, RefreshCw,
  Building2, Calendar, FileText
} from 'lucide-react';
import Card from '../../common/Card';
import { 
  getTasks, createTask, approveTask, completeTask, 
  acceptTask, rejectTask, startTask, submitTaskForReview, reassignTask
} from '../../../service/task';
import { getProjects } from '../../../service/project';
import TaskCreateModal from '../../admin/tasks/TaskCreateModal';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const [groupMode, setGroupMode] = useState('status'); // status, employee
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchPMTasks();
  }, []);

  const fetchPMTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      if (res?.success && Array.isArray(res.tasks) && res.tasks.length > 0) {
        const mapped = res.tasks.map((t, idx) => {
          const projStr = typeof t.projectId === 'object' ? (t.projectId?.projectName || t.projectId?.name) : (t.project || 'General Project');
          const assigneeStr = typeof t.assignedEmployee === 'object' 
            ? (t.assignedEmployee?.name || t.assignedEmployee?.fullName || t.assignedEmployee?.email) 
            : (t.assignee || (typeof t.assignedTo === 'object' ? (t.assignedTo?.name || t.assignedTo?.fullName) : t.assignedTo) || 'Assigned Staff');
          const deptStr = typeof t.departmentId === 'object' ? t.departmentId?.name : (t.dept || 'Architecture');

          return {
            id: t._id ? `TSK-${t._id.slice(-5).toUpperCase()}` : `TSK-${idx + 401}`,
            _id: t._id,
            title: t.taskName || t.title || 'Untitled Task',
            project: projStr || 'General Project',
            assignee: assigneeStr || 'Assigned Staff',
            role: t.assignedEmployee?.designation || t.assignedEmployee?.role || 'Staff',
            dept: deptStr || 'Architecture',
            dueDate: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : '2026-12-31',
            deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : '2026-12-31',
            priority: t.priority || 'Medium',
            status: t.status || 'Pending',
            estTime: t.estimatedTime || 16,
            actualTime: t.totalWorkingTimeMinutes ? Math.round(t.totalWorkingTimeMinutes / 60) : 8,
            progress: t.status === 'Completed' ? 100 : (t.status === 'Review' || t.status === 'Approved' ? 80 : 40),
            delayFlag: t.isDelayed || false,
            description: t.description || 'Task assignment deliverable.',
            comments: t.comments ? t.comments.length : 0
          };
        });

        // Deduplicate tasks by _id / id
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
        if (unique.length > 0) setSelectedTask(unique[0]);
      } else {
        const projRes = await getProjects();
        if (projRes?.success && Array.isArray(projRes.projects)) {
          const loadedTasks = [];
          projRes.projects.forEach((proj, pIdx) => {
            const projName = proj.projectName || proj.name || 'Project';
            (proj.milestones || []).forEach((m, mIdx) => {
              loadedTasks.push({
                id: m._id ? `TSK-${m._id.slice(-5).toUpperCase()}` : `TSK-${pIdx + 1}0${mIdx + 1}`,
                _id: m._id,
                title: m.name || m.title || 'Task Target',
                project: projName,
                assignee: m.assignedTo?.name || m.assignedTo || 'Project Team',
                role: 'Team Member',
                dept: 'Architecture',
                dueDate: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '2026-12-31',
                deadline: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '2026-12-31',
                priority: proj.priority || 'Medium',
                status: m.isCompleted ? 'Completed' : 'In Progress',
                estTime: 16,
                actualTime: m.isCompleted ? 16 : 8,
                progress: m.isCompleted ? 100 : (m.progressPercentage || 50),
                delayFlag: proj.isDelayed || false,
                description: `Milestone deliverable for project: ${projName}`,
                comments: 1
              });
            });
          });

          // Deduplicate fallback tasks
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
          if (unique.length > 0) setSelectedTask(unique[0]);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch PM tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTaskSubmit = async (formData) => {
    const newId = `TSK-${Math.floor(10000 + Math.random() * 89999)}`;
    const newPMTask = {
      id: newId,
      title: formData.title || 'New Task',
      project: formData.project || 'General Project',
      assignee: formData.assignee || 'Assigned Staff',
      role: 'Staff',
      dept: formData.dept || 'Architecture',
      dueDate: formData.deadline || '2026-12-31',
      priority: formData.priority || 'Medium',
      status: 'Pending',
      estTime: parseFloat(formData.estTime) || 16,
      actualTime: 0,
      description: formData.description || 'Newly registered task by Project Manager.',
      isOverdue: false,
      comments: 0
    };

    setTasks(prev => {
      const exists = prev.some(t => t.title === newPMTask.title && t.project === newPMTask.project);
      return exists ? prev : [newPMTask, ...prev];
    });
    setIsCreateModalOpen(false);
    setSelectedTask(newPMTask);

    try {
      const res = await createTask({
        projectId: formData.projectId || formData.project,
        taskName: formData.title,
        description: formData.description,
        priority: formData.priority || 'Medium',
        departmentId: formData.departmentId || null,
        assignedEmployee: formData.assignedEmployee || formData.assignee,
        estimatedTime: parseFloat(formData.estTime) || 16,
        deadline: formData.deadline
      });

      if (res?.success) {
        fetchPMTasks();
      }
    } catch (err) {
      console.warn("Backend notice PM task creation:", err);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.project || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.assignee || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const handleUpdateStatus = async (id, newStatus) => {
    const targetTask = tasks.find(t => (t._id && t._id === id) || t.id === id);
    if (targetTask && targetTask._id) {
      try {
        if (newStatus === 'Accepted') await acceptTask(targetTask._id);
        else if (newStatus === 'In Progress') await startTask(targetTask._id);
        else if (newStatus === 'Review') await submitTaskForReview(targetTask._id);
        else if (newStatus === 'Approved') await approveTask(targetTask._id);
        else if (newStatus === 'Completed') await completeTask(targetTask._id);
      } catch (err) {
        console.warn("Backend status update notice:", err);
      }
    }

    setTasks(prev => prev.map(t => {
      const isMatch = (t._id && targetTask?._id) ? (t._id === targetTask._id) : (t.id === id);
      return isMatch ? { ...t, status: newStatus } : t;
    }));

    if (selectedTask && ((selectedTask._id && targetTask?._id && selectedTask._id === targetTask._id) || selectedTask.id === id)) {
      setSelectedTask(prev => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 pb-16 w-full max-w-[1400px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            PM Task Command & Workflow Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-normal">
            Assign deliverables, verify status transitions (Pending &rarr; Accepted &rarr; Review &rarr; Approved) & track overdues
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 border border-brand-secondary/40"
          >
            <Plus className="w-4 h-4" />
            Create PM Task
          </button>

          <button 
            onClick={fetchPMTasks}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* FILTER BAR & VIEW TOGGLE */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task title, project, assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-slate-50"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* VIEW SWITCHER */}
          <div className="p-1 bg-slate-100 rounded-xl border border-slate-200/80 flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban View</span>
            </button>
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-normal">Loading PM task workflows from backend...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 p-8 font-normal">
          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No project manager tasks match query.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80">
                  <th className="px-5 py-3.5">Task ID</th>
                  <th className="px-5 py-3.5">Task Title</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Assigned Staff</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Workflow Status</th>
                  <th className="px-5 py-3.5">Target Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredTasks.map((t, idx) => (
                  <tr key={t._id ? `pm-tbl-${t._id}` : `pm-tbl-${t.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-500">{t.id}</td>
                    <td className="px-5 py-4">
                      <div>
                        <span 
                          onClick={() => { setSelectedTask(t); setDrawerOpen(true); }}
                          className="font-bold text-slate-900 block hover:text-indigo-600 cursor-pointer"
                        >
                          {t.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal line-clamp-1">
                          {t.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-brand-soft text-slate-900 font-bold rounded-lg text-[10px] uppercase border border-brand-secondary/30">
                        {t.project}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black uppercase">
                          {(t.assignee || 'User').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{t.assignee}</span>
                          <span className="text-[9px] text-slate-400 font-medium">{t.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        t.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                        t.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateStatus(t.id, e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px]">
                      {t.dueDate}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => { setSelectedTask(t); setDrawerOpen(true); }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto transition-all cursor-pointer border border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { key: 'Pending', label: 'Pending Tasks', color: 'bg-amber-500', bg: 'bg-amber-50/30', border: 'border-amber-200/60' },
            { key: 'In Progress', label: 'In Progress', color: 'bg-indigo-500', bg: 'bg-indigo-50/30', border: 'border-indigo-200/60' },
            { key: 'Review', label: 'Review Stage', color: 'bg-purple-500', bg: 'bg-purple-50/30', border: 'border-purple-200/60' },
            { key: 'Completed', label: 'Completed', color: 'bg-emerald-500', bg: 'bg-emerald-50/30', border: 'border-emerald-200/60' }
          ].map(statusCol => {
            const colTasks = filteredTasks.filter(t => 
              t.status === statusCol.key || 
              (statusCol.key === 'Pending' && !['In Progress', 'Review', 'Completed', 'Approved'].includes(t.status))
            );

            return (
              <div key={statusCol.key} className="bg-slate-50/70 p-4 rounded-3xl border border-slate-200/80 space-y-3.5 min-h-[520px] flex flex-col">
                
                {/* Column Header */}
                <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${statusCol.color}`} />
                    <h3 className="text-xs font-black text-slate-900 tracking-tight uppercase">{statusCol.label}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-white text-slate-700 text-[10px] font-black rounded-full border border-slate-200 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {colTasks.map((t, idx) => {
                    const isCritical = t.priority === 'Critical';
                    const isHigh = t.priority === 'High';

                    return (
                      <div 
                        key={t._id ? `pm-card-${statusCol.key}-${t._id}` : `pm-card-${statusCol.key}-${t.id}-${idx}`}
                        onClick={() => { setSelectedTask(t); setDrawerOpen(true); }}
                        className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-brand-secondary transition-all cursor-pointer space-y-3 hover:-translate-y-0.5 group"
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 bg-brand-soft text-slate-900 font-extrabold rounded-md text-[9px] uppercase border border-brand-secondary/30 truncate max-w-[120px]">
                            {t.project}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            isHigh ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase block w-fit mb-1">
                            {t.id}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                            {t.title}
                          </h4>
                        </div>

                        {/* Assignee & Footer Info */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-black uppercase shrink-0">
                              {(t.assignee || 'U').split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-bold text-slate-800 truncate max-w-[90px]">{t.assignee}</span>
                          </div>

                          <div className="flex items-center gap-1 font-mono font-bold text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{t.dueDate}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="py-12 text-center text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200 p-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">No tasks in stage</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* FULL TASK DETAILS DRAWER / MODAL */}
      {selectedTask && drawerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 font-sans text-left border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-mono font-bold">{selectedTask.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    selectedTask.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                    selectedTask.priority === 'High' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedTask.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTask.title}</h3>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Task Property Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Project</span>
                </div>
                <span className="text-slate-900 font-bold block">{selectedTask.project}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Assigned Employee</span>
                </div>
                <span className="text-slate-900 font-bold block">{selectedTask.assignee} ({selectedTask.role})</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Deadline Date</span>
                </div>
                <span className="text-slate-900 font-bold block font-mono">{selectedTask.dueDate}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Est Time</span>
                </div>
                <span className="text-slate-900 font-bold block">{selectedTask.estTime || 16} Hours</span>
              </div>
            </div>

            {/* Workflow Status Selector */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Workflow Stage</span>
                <span className="text-xs font-bold text-slate-900">{selectedTask.status}</span>
              </div>
              <select
                value={selectedTask.status}
                onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer shadow-2xs"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Task Description */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Task Description & Requirements</span>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 font-normal leading-relaxed">
                {selectedTask.description || 'Detailed project management deliverable specs.'}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button 
                onClick={() => setDrawerOpen(false)}
                className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-bold text-xs rounded-xl shadow-2xs cursor-pointer border border-brand-secondary/40 transition-all w-full"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE TASK MODAL FOR PM */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTaskSubmit}
      />

    </div>
  );
}
