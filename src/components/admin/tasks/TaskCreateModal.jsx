import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Plus, Trash2, Link, FileText, CheckCircle2 } from 'lucide-react';
import { getProjects } from '../../../service/project';
import { getUsersList } from '../../../service/auth';
import { getTasks } from '../../../service/task';

export default function TaskCreateModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    assignedEmployee: '',
    dept: 'Architecture',
    priority: 'Medium',
    deadline: '',
    estTime: '16',
    description: '',
    dependencies: '',
    actualStartTime: '',
    completionTime: '',
    totalWorkingTimeMinutes: '',
    idleTimeMinutes: '',
    productivityScore: ''
  });

  const [projectTasks, setProjectTasks] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [selectedDependencies, setSelectedDependencies] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProjectsAndUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && formData.projectId) {
      fetchProjectTasks(formData.projectId);
    } else {
      setProjectTasks([]);
      setSelectedDependencies([]);
    }
  }, [isOpen, formData.projectId]);

  const fetchProjectTasks = async (projId) => {
    try {
      const res = await getTasks({ projectId: projId });
      if (res?.success && Array.isArray(res.tasks)) {
        setProjectTasks(res.tasks);
      } else {
        setProjectTasks([]);
      }
    } catch (e) {
      console.warn("Error fetching tasks for dependsOn selection:", e);
    }
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (!newChecklistItemText.trim()) return;
    setChecklistItems(prev => [...prev, { text: newChecklistItemText.trim(), isCompleted: false, id: Date.now() }]);
    setNewChecklistItemText('');
  };

  const handleRemoveChecklistItem = (indexToRemove) => {
    setChecklistItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddAttachment = (e) => {
    e.preventDefault();
    if (!newAttachmentUrl.trim()) return;
    setAttachments(prev => [...prev, newAttachmentUrl.trim()]);
    setNewAttachmentUrl('');
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleDependency = (taskId) => {
    setSelectedDependencies(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const loadProjectsAndUsers = async () => {
    setLoadingData(true);
    try {
      const [projRes, userRes] = await Promise.allSettled([
        getProjects(),
        getUsersList()
      ]);

      let loadedProjs = [];
      if (projRes.status === 'fulfilled' && projRes.value?.success && Array.isArray(projRes.value.projects)) {
        loadedProjs = projRes.value.projects;
      }
      setProjectsList(loadedProjs);

      let loadedUsers = [];
      if (userRes.status === 'fulfilled' && userRes.value?.success && Array.isArray(userRes.value.users)) {
        loadedUsers = userRes.value.users;
      }

      // If getUsersList returned 403 or empty, extract team members from projects + logged-in user
      if (loadedUsers.length === 0) {
        const teamMap = new Map();

        // 1. Current logged in user
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          if (u._id || u.id || u.name || u.email) {
            const uid = u._id || u.id || 'curr-user';
            teamMap.set(uid, {
              _id: uid,
              name: typeof u.name === 'string' ? u.name : (typeof u.fullName === 'string' ? u.fullName : (typeof u.email === 'string' ? u.email : 'Project Manager')),
              role: typeof u.role === 'string' ? u.role : (u.role?.roleName || 'Project Manager')
            });
          }
        } catch (e) { }

        // 2. Extracted team members from projects
        loadedProjs.forEach(p => {
          (p.teamAssignments || []).forEach(ta => {
            if (ta.userId) {
              const uid = typeof ta.userId === 'object' ? (ta.userId._id || ta.userId.id) : ta.userId;
              const uname = typeof ta.userId === 'object' ? (ta.userId.name || ta.userId.fullName || ta.userId.email) : 'Team Member';
              const urole = ta.projectRole || 'Architect';
              if (uid && !teamMap.has(uid)) {
                teamMap.set(uid, { _id: uid, name: uname, role: urole });
              }
            }
          });
        });

        loadedUsers = Array.from(teamMap.values());
      }

      setUsersList(loadedUsers);

      const firstProjId = loadedProjs[0] ? (loadedProjs[0]._id || loadedProjs[0].id) : '';
      const firstUserId = loadedUsers[0] ? (loadedUsers[0]._id || loadedUsers[0].id) : '';

      setFormData(prev => ({
        ...prev,
        projectId: prev.projectId || firstProjId,
        assignedEmployee: prev.assignedEmployee || firstUserId
      }));
    } catch (err) {
      console.warn("Notice loading modal options:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }
    setSubmitting(true);
    try {
      const selectedProj = projectsList.find(p => (p._id || p.id) === formData.projectId) || projectsList[0];
      const selectedUser = usersList.find(u => (u._id || u.id) === formData.assignedEmployee) || usersList[0];

      const userDisplayStr = typeof selectedUser?.name === 'string' ? selectedUser.name : (typeof selectedUser?.fullName === 'string' ? selectedUser.fullName : (selectedUser?.email || 'Staff'));
      const projDisplayStr = selectedProj ? (selectedProj.projectName || selectedProj.name || 'Project') : 'Project';

      const payload = {
        title: formData.title.trim(),
        projectId: formData.projectId || selectedProj?._id || selectedProj?.id,
        project: projDisplayStr,
        assignedEmployee: formData.assignedEmployee || selectedUser?._id || selectedUser?.id,
        assignee: userDisplayStr,
        dept: formData.dept,
        priority: formData.priority,
        deadline: formData.deadline || '2026-12-31',
        estTime: formData.estTime || '16',
        description: formData.description,
        dependsOn: selectedDependencies,
        checklist: checklistItems.map(item => ({ text: item.text, isCompleted: item.isCompleted })),
        attachments: attachments,
        actualStartTime: formData.actualStartTime || null,
        completionTime: formData.completionTime || null,
        totalWorkingTimeMinutes: formData.totalWorkingTimeMinutes ? parseInt(formData.totalWorkingTimeMinutes, 10) : null,
        idleTimeMinutes: formData.idleTimeMinutes ? parseInt(formData.idleTimeMinutes, 10) : null,
        productivityScore: formData.productivityScore ? parseInt(formData.productivityScore, 10) : null
      };

      await onSubmit(payload);
      
      // Reset Form
      setFormData({
        title: '',
        projectId: projectsList[0] ? (projectsList[0]._id || projectsList[0].id) : '',
        assignedEmployee: usersList[0] ? (usersList[0]._id || usersList[0].id) : '',
        dept: 'Architecture',
        priority: 'Medium',
        deadline: '',
        estTime: '16',
        description: '',
        dependencies: '',
        actualStartTime: '',
        completionTime: '',
        totalWorkingTimeMinutes: '',
        idleTimeMinutes: '',
        productivityScore: ''
      });
      setChecklistItems([]);
      setSelectedDependencies([]);
      setAttachments([]);
      setNewChecklistItemText('');
      setNewAttachmentUrl('');
    } catch (err) {
      console.warn("Notice during task submit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[99999] p-4 font-sans text-left">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Register New Task</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-semibold">Assign project requirements & employee deadlines</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[520px] space-y-4 text-xs font-medium text-slate-800">
          
          {loadingData && (
            <div className="py-2 flex items-center gap-2 text-indigo-600 text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching latest database records...</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Task Title *</label>
            <input 
              type="text" 
              required 
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Detailed Architectural Floor Plan & Structural Rebar"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Project *</label>
              <select 
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold cursor-pointer"
                required
              >
                {projectsList.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.projectName || p.name || 'Project'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Assign Employee *</label>
              <select 
                value={formData.assignedEmployee}
                onChange={(e) => handleChange('assignedEmployee', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold cursor-pointer"
                required
              >
                {usersList.map(u => {
                  const nameStr = typeof u.name === 'string' ? u.name : (typeof u.fullName === 'string' ? u.fullName : (typeof u.email === 'string' ? u.email : 'Employee'));
                  const roleStr = typeof u.role === 'string' ? u.role : (u.role?.roleName || 'Staff');
                  return (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {nameStr} ({roleStr})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department</label>
              <select 
                value={formData.dept}
                onChange={(e) => handleChange('dept', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold cursor-pointer"
              >
                <option value="Architecture">Architecture</option>
                <option value="Engineering">Engineering</option>
                <option value="Procurement">Procurement</option>
                <option value="Quality Control">Quality Control</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold cursor-pointer"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Est Time (Hours)</label>
              <input 
                type="number" 
                required 
                value={formData.estTime}
                onChange={(e) => handleChange('estTime', e.target.value)}
                placeholder="16"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Deadline Date *</label>
              <input 
                type="date" 
                required 
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold cursor-pointer"
              />
            </div>
          </div>

          {/* Depends On multi-select */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Depends On Tasks (Select dependencies)</label>
            <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 space-y-2">
              {selectedDependencies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedDependencies.map(depId => {
                    const matched = projectTasks.find(t => (t._id === depId || t.id === depId));
                    const label = matched ? (matched.taskName || matched.title) : depId;
                    return (
                      <span key={depId} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                        {label}
                        <button type="button" onClick={() => toggleDependency(depId)} className="hover:text-indigo-950 font-black cursor-pointer">×</button>
                      </span>
                    );
                  })}
                </div>
              )}
              {projectTasks.length > 0 ? (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      toggleDependency(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-250 rounded-lg bg-white text-slate-800 font-semibold"
                >
                  <option value="">Select dependency task...</option>
                  {projectTasks.map(t => {
                    const taskId = t._id || t.id;
                    const isSelected = selectedDependencies.includes(taskId);
                    return (
                      <option key={taskId} value={taskId} disabled={isSelected}>
                        {isSelected ? '✓ ' : ''}{t.taskName || t.title}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <span className="text-[10px] text-slate-400 italic block">No other tasks registered in this project.</span>
              )}
            </div>
          </div>

          {/* Dynamic Checklist builder */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Checklist Items</label>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
              {checklistItems.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {checklistItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-800">
                      <span className="truncate">{item.text}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveChecklistItem(idx)}
                        className="text-slate-405 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newChecklistItemText}
                  onChange={(e) => setNewChecklistItemText(e.target.value)}
                  placeholder="e.g. Conduct soil test signature verification"
                  className="flex-1 px-3 py-1.5 border border-slate-250 rounded-lg text-[11px] font-semibold bg-white text-slate-900"
                />
                <button 
                  type="button" 
                  onClick={handleAddChecklistItem}
                  className="px-3 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Attachments URLs builder */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Attachments (Urls / Labels)</label>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
              {attachments.length > 0 && (
                <div className="space-y-1.5">
                  {attachments.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-650">
                      <span className="truncate flex items-center gap-1"><Link className="w-3 h-3 text-indigo-500" /> {url}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-slate-405 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={newAttachmentUrl}
                  onChange={(e) => setNewAttachmentUrl(e.target.value)}
                  placeholder="e.g. https://domain.com/blueprint.pdf"
                  className="flex-1 px-3 py-1.5 border border-slate-250 rounded-lg text-[11px] font-semibold bg-white text-slate-900"
                />
                <button 
                  type="button" 
                  onClick={handleAddAttachment}
                  className="px-3 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Performance & Time Log Attributes */}
          <div className="border-t border-slate-200/60 pt-3.5 space-y-3">
            <span className="text-[10px] font-bold text-indigo-650 uppercase tracking-wider block">Performance Log & Time Stamping (Optional)</span>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Work Started At</label>
                <input 
                  type="datetime-local" 
                  value={formData.actualStartTime}
                  onChange={(e) => handleChange('actualStartTime', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Work Completed At</label>
                <input 
                  type="datetime-local" 
                  value={formData.completionTime}
                  onChange={(e) => handleChange('completionTime', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block mb-1">Working (Mins)</label>
                <input 
                  type="number" 
                  value={formData.totalWorkingTimeMinutes}
                  onChange={(e) => handleChange('totalWorkingTimeMinutes', e.target.value)}
                  placeholder="e.g. 480"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block mb-1">Idle Time (Mins)</label>
                <input 
                  type="number" 
                  value={formData.idleTimeMinutes}
                  onChange={(e) => handleChange('idleTimeMinutes', e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-550 uppercase tracking-wider block mb-1">Productivity Score (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={formData.productivityScore}
                  onChange={(e) => handleChange('productivityScore', e.target.value)}
                  placeholder="e.g. 95"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Task Description</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe staircase balustrades, concrete reinforcement guidelines..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-semibold shadow-2xs border border-brand-secondary/40 transition-all cursor-pointer"
            >
              {submitting ? 'Registering Task...' : 'Register Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
