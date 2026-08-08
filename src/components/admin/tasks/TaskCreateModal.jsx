import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { getProjects } from '../../../service/project';
import { getUsersList } from '../../../service/auth';

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
    dependencies: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadProjectsAndUsers();
    }
  }, [isOpen]);

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
        dependencies: formData.dependencies
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
        dependencies: ''
      });
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
                <option value="Critical">Critical</option>
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

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Dependencies (Optional)</label>
            <input 
              type="text" 
              value={formData.dependencies}
              onChange={(e) => handleChange('dependencies', e.target.value)}
              placeholder="e.g. Foundation GFC Release"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-white font-semibold"
            />
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
