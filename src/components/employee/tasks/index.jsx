import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Clock, CheckSquare, Plus, Paperclip, MessageSquare, 
  ChevronRight, Calendar, AlertCircle, X, ShieldAlert, BarChart2, RefreshCw
} from 'lucide-react';
import Card from '../../common/Card';
import { SearchFilterBar, StatusBadge } from '../../common';
import { 
  getTasks, acceptTask, startTask, submitTaskForReview, completeTask, 
  addTaskComment 
} from '../../../service/task';
import { getProjects } from '../../../service/project';

export default function EmployeeTasks() {
  const [viewMode, setViewMode] = useState('list'); // list, kanban
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');

  const lanes = ['Pending', 'Accepted', 'In Progress', 'Review', 'Completed'];

  useEffect(() => {
    fetchEmployeeTasks();
  }, []);

  const fetchEmployeeTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      if (res?.success && Array.isArray(res.tasks) && res.tasks.length > 0) {
        const mapped = res.tasks.map((t, idx) => {
          const projStr = typeof t.projectId === 'object' ? (t.projectId?.projectName || t.projectId?.name) : (t.project || 'General Project');
          const assigneeStr = typeof t.assignedEmployee === 'object' 
            ? (t.assignedEmployee?.name || t.assignedEmployee?.fullName || t.assignedEmployee?.email) 
            : (t.assignee || (typeof t.assignedTo === 'object' ? (t.assignedTo?.name || t.assignedTo?.fullName) : t.assignedTo) || 'Assigned Staff');

          return {
            id: t._id ? `TSK-${t._id.slice(-5).toUpperCase()}` : `TSK-${idx + 401}`,
            _id: t._id,
            title: t.taskName || t.title || 'Assigned Deliverable',
            project: projStr || 'General Project',
            assignee: assigneeStr,
            priority: t.priority || 'Medium',
            status: t.status || 'Pending',
            deadline: t.deadline ? new Date(t.deadline).toISOString().split('T')[0] : '2026-12-31',
            estTime: t.estimatedTime || 16,
            actualTime: t.totalWorkingTimeMinutes ? Math.round(t.totalWorkingTimeMinutes / 60) : 8,
            commentsCount: (t.comments || []).length,
            attachmentsCount: (t.attachments || []).length,
            description: t.description || 'Assigned project deliverable and CAD requirement specifications.',
            checklist: t.checklist || [],
            comments: t.comments || []
          };
        });

        // Deduplicate
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
        // Fallback to project milestones assigned to user/team
        const projRes = await getProjects();
        if (projRes?.success && Array.isArray(projRes.projects)) {
          const loadedTasks = [];
          projRes.projects.forEach((proj, pIdx) => {
            const projName = proj.projectName || proj.name || 'Project';
            (proj.milestones || []).forEach((m, mIdx) => {
              loadedTasks.push({
                id: m._id ? `TSK-${m._id.slice(-5).toUpperCase()}` : `TSK-${pIdx + 1}0${mIdx + 1}`,
                _id: m._id,
                title: m.name || m.title || 'Project Milestone Deliverable',
                project: projName,
                assignee: m.assignedTo?.name || m.assignedTo || 'My Team',
                priority: proj.priority || 'Medium',
                status: m.isCompleted ? 'Completed' : 'In Progress',
                deadline: m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '2026-12-31',
                estTime: 16,
                actualTime: m.isCompleted ? 16 : 8,
                commentsCount: 1,
                attachmentsCount: 0,
                description: `Milestone deliverable task for project: ${projName}`,
                checklist: [{ text: "Verify architectural drawing requirements", checked: m.isCompleted }],
                comments: []
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
      console.warn("Notice fetching employee tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.project || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTaskCheckboxToggle = (taskId, idx) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId || t._id === taskId) {
        const updatedChecklist = (t.checklist || []).map((c, i) => i === idx ? { ...c, checked: !c.checked } : c);
        return { ...t, checklist: updatedChecklist };
      }
      return t;
    }));
    if (selectedTask && (selectedTask.id === taskId || selectedTask._id === taskId)) {
      setSelectedTask(prev => {
        const updatedChecklist = (prev.checklist || []).map((c, i) => i === idx ? { ...c, checked: !c.checked } : c);
        return { ...prev, checklist: updatedChecklist };
      });
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const targetTask = tasks.find(t => (t._id && t._id === taskId) || t.id === taskId);
    if (targetTask && targetTask._id) {
      try {
        if (newStatus === 'Accepted') await acceptTask(targetTask._id);
        else if (newStatus === 'In Progress') await startTask(targetTask._id);
        else if (newStatus === 'Review') await submitTaskForReview(targetTask._id);
        else if (newStatus === 'Completed') await completeTask(targetTask._id);
      } catch (err) {
        console.warn("Backend status update notice:", err);
      }
    }

    setTasks(prev => prev.map(t => {
      const isMatch = (t._id && targetTask?._id) ? (t._id === targetTask._id) : (t.id === taskId);
      return isMatch ? { ...t, status: newStatus } : t;
    }));

    if (selectedTask && ((selectedTask._id && targetTask?._id && selectedTask._id === targetTask._id) || selectedTask.id === taskId)) {
      setSelectedTask(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedTask) return;

    const userObj = (() => {
      try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
    })();
    const userName = userObj.name || userObj.fullName || 'My Account';

    if (selectedTask._id) {
      try {
        await addTaskComment(selectedTask._id, commentInput.trim());
      } catch (e) { }
    }

    const newComment = {
      author: `${userName} (You)`,
      text: commentInput.trim(),
      date: "Just now"
    };

    setTasks(prev => prev.map(t => {
      if ((t._id && t._id === selectedTask._id) || t.id === selectedTask.id) {
        return {
          ...t,
          commentsCount: (t.commentsCount || 0) + 1,
          comments: [...(t.comments || []), newComment]
        };
      }
      return t;
    }));

    setSelectedTask(prev => ({
      ...prev,
      commentsCount: (prev.commentsCount || 0) + 1,
      comments: [...(prev.comments || []), newComment]
    }));

    setCommentInput('');
  };

  const handleLogHours = async () => {
    if (!selectedTask) return;
    const hrsInput = await window.prompt("Enter working hours to log on timesheet:", "2", "Log Working Hours");
    const hrs = parseFloat(hrsInput);
    if (!isNaN(hrs) && hrs > 0) {
      setTasks(prev => prev.map(t => 
        (t.id === selectedTask.id || (t._id && t._id === selectedTask._id)) ? { ...t, actualTime: (t.actualTime || 0) + hrs } : t
      ));
      setSelectedTask(prev => ({ ...prev, actualTime: (prev.actualTime || 0) + hrs }));
      alert(`Logged ${hrs} hours on timesheet successfully!`);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200 w-full max-w-[1400px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Employee Task Operations & Workspace
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Track assigned deliverables, update workflow stages, and submit timesheet hours
          </p>
        </div>
        <button 
          onClick={fetchEmployeeTasks}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          title="Refresh Tasks"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Header controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search my assigned tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-slate-50 text-slate-900"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-brand-primary border-brand-primary text-slate-900 shadow-3xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all border cursor-pointer ${
              viewMode === 'kanban' 
                ? 'bg-brand-primary border-brand-primary text-slate-900 shadow-3xs' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Kanban View
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-semibold">Loading assigned tasks from backend...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 p-8 font-normal">
          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No tasks assigned to your roster match the query.</p>
        </div>
      ) : viewMode === 'list' ? (
        /* TABLE / LIST VIEW */
        <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/80">
                  <th className="px-5 py-3.5">Task ID</th>
                  <th className="px-5 py-3.5">Deliverable Title</th>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Workflow Stage</th>
                  <th className="px-5 py-3.5">Deadline</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredTasks.map((t, idx) => (
                  <tr key={t._id ? `emp-tbl-${t._id}` : `emp-tbl-${t.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-600">{t.id}</td>
                    <td className="px-5 py-4">
                      <div>
                        <span 
                          onClick={() => setSelectedTask(t)}
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
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px]">
                      {t.deadline}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTask(t)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto transition-all cursor-pointer border border-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View & Log</span>
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
        <div className="w-full overflow-x-auto pb-6 pt-1 custom-horizontal-scrollbar">
          <div className="flex gap-4.5 items-start min-w-max">
            {lanes.map(lane => {
              const laneTasks = filteredTasks.filter(t => t.status === lane);
              return (
                <div key={lane} className="w-[300px] min-w-[280px] max-w-[320px] flex-shrink-0 p-4 rounded-3xl flex flex-col min-h-[580px] max-h-[calc(100vh-250px)] bg-slate-50/90 border border-slate-200/90 shadow-2xs">
                  <div className="flex justify-between items-center px-1 mb-3 pb-2.5 border-b border-slate-200/80">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{lane}</h3>
                    <span className="px-2.5 py-0.5 bg-white text-slate-700 text-[10px] font-mono font-black rounded-full border border-slate-200">
                      {laneTasks.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto pt-1 pb-2 px-0.5 space-y-3 custom-scrollbar">
                    {laneTasks.map((t, idx) => (
                      <div 
                        key={t._id ? `emp-card-${lane}-${t._id}` : `emp-card-${lane}-${t.id}-${idx}`}
                        onClick={() => setSelectedTask(t)}
                        className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[10px] font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 uppercase tracking-wider">
                              {t.id}
                            </span>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                              {t.priority}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                            {t.title}
                          </h4>

                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                t.status === 'Completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${t.status === 'Completed' ? 100 : (t.status === 'Review' ? 80 : (t.status === 'In Progress' ? 45 : 15))}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-semibold">
                          <span className="font-bold text-slate-700 truncate min-w-0 flex-1 text-xs">{t.project}</span>
                          <div className="flex items-center gap-1 font-mono font-extrabold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg flex-shrink-0 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{t.estTime || 16}h</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {laneTasks.length === 0 && (
                      <div className="py-14 text-center text-slate-400 bg-white/70 rounded-2xl border border-dashed border-slate-200/90 flex flex-col items-center justify-center space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">No tasks in stage</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* TASK DETAIL & WORKSPACE MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-left border border-slate-100 animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-mono font-bold">{selectedTask.id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-700">
                    {selectedTask.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedTask.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedTask(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Project Workspace</span>
                <span className="text-slate-900 font-bold block mt-0.5">{selectedTask.project}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Deadline Date</span>
                <span className="text-slate-900 font-bold font-mono block mt-0.5">{selectedTask.deadline}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Update Workflow Status</span>
                <span className="text-xs font-bold text-slate-900">{selectedTask.status}</span>
              </div>
              <select
                value={selectedTask.status}
                onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 cursor-pointer shadow-2xs"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Deliverable Description</span>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal">
                {selectedTask.description}
              </div>
            </div>

            {/* Checklist */}
            {selectedTask.checklist && selectedTask.checklist.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Task Checklist Items</span>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  {selectedTask.checklist.map((item, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => handleTaskCheckboxToggle(selectedTask.id, i)}
                        className="rounded text-brand-primary focus:ring-brand-primary/20 w-4 h-4 cursor-pointer"
                      />
                      <span className={item.checked ? 'line-through text-slate-400' : ''}>{item.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Task Discussion & Comments</span>
              <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                {(selectedTask.comments || []).map((c, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-0.5">
                      <span>{c.author}</span>
                      <span>{c.date}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{c.text || c.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Post comment update..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-slate-900 font-bold rounded-xl text-xs shadow-2xs cursor-pointer border border-brand-secondary/40"
                >
                  Post
                </button>
              </form>
            </div>

            {/* Log Hours Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleLogHours}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Log Working Hours ({selectedTask.actualTime || 0}h logged)</span>
              </button>
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
