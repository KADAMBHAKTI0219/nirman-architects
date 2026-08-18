import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Plus, Trash2, Link, FileText, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { getProjects } from '../../../service/project';
import { getUsersList } from '../../../service/auth';
import { getTasks } from '../../../service/task';
import { getDepartments, parseDepartments, getCleanDepartmentName } from '../../../service/departments';
import { useToast } from '../../../context/ToastContext';
import { FieldError } from '../../../utils/validation';
import CalendarDatePicker from '../../common/CalendarDatePicker';
import CustomSelect from '../../common/CustomSelect';

export default function TaskCreateModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [projectsList, setProjectsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([
    'Architecture',
    'Engineering',
    'Procurement',
    'Quality Control'
  ]);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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
  const [attachmentError, setAttachmentError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProjectsUsersAndDepts();
      setFieldErrors({});
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

  const extractUserDepartment = (user) => {
    if (!user) return '';
    if (typeof user.department === 'string') return getCleanDepartmentName(user.department) || user.department;
    if (user.department?.name) return getCleanDepartmentName(user.department.name) || user.department.name;
    if (user.departmentId?.name) return getCleanDepartmentName(user.departmentId.name) || user.departmentId.name;
    if (typeof user.departmentName === 'string') return getCleanDepartmentName(user.departmentName) || user.departmentName;
    if (typeof user.dept === 'string') return getCleanDepartmentName(user.dept) || user.dept;
    
    // Role fallback mapping if department isn't explicit
    const r = (typeof user.role === 'string' ? user.role : (user.role?.roleName || '')).toLowerCase();
    if (r.includes('arch')) return 'Architecture';
    if (r.includes('eng') || r.includes('struct')) return 'Engineering';
    if (r.includes('procure') || r.includes('purchase')) return 'Procurement';
    if (r.includes('qual') || r.includes('qc') || r.includes('qa')) return 'Quality Control';
    if (r.includes('design')) return 'Architecture & Design';
    if (r.includes('pm') || r.includes('project')) return 'Project Management';
    return '';
  };

  const findMatchingDepartment = (userDeptStr, availableDepts) => {
    if (!userDeptStr) return '';
    const cleanStr = getCleanDepartmentName(userDeptStr) || userDeptStr;
    const lowerUserDept = cleanStr.toLowerCase();

    // Direct match
    const exact = availableDepts.find(d => d.toLowerCase() === lowerUserDept);
    if (exact) return exact;

    // Partial match
    const partial = availableDepts.find(d => d.toLowerCase().includes(lowerUserDept) || lowerUserDept.includes(d.toLowerCase()));
    if (partial) return partial;

    return cleanStr;
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
    if (e && e.preventDefault) e.preventDefault();
    const val = newAttachmentUrl.trim();
    if (!val) {
      setAttachmentError('Please enter an attachment URL.');
      return;
    }
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i;
    if (!urlPattern.test(val)) {
      setAttachmentError('Please enter a valid URL (e.g. https://domain.com/blueprint.pdf).');
      return;
    }
    const formattedUrl = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
    setAttachments(prev => [...prev, formattedUrl]);
    setNewAttachmentUrl('');
    setAttachmentError('');
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleDependency = (taskId) => {
    setSelectedDependencies(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const loadProjectsUsersAndDepts = async () => {
    setLoadingData(true);
    try {
      const [projRes, userRes, deptRes] = await Promise.allSettled([
        getProjects(),
        getUsersList(),
        getDepartments()
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

      if (loadedUsers.length === 0) {
        const teamMap = new Map();
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          if (u._id || u.id || u.name || u.email) {
            const uid = u._id || u.id || 'curr-user';
            teamMap.set(uid, {
              _id: uid,
              name: typeof u.name === 'string' ? u.name : (typeof u.fullName === 'string' ? u.fullName : (typeof u.email === 'string' ? u.email : 'Project Manager')),
              role: typeof u.role === 'string' ? u.role : (u.role?.roleName || 'Project Manager'),
              department: u.department || u.dept || 'Architecture'
            });
          }
        } catch (e) { }

        // Default roster fallback covering Site Engineer, HR, Architect, PM, Employee
        const defaultRoster = [
          { _id: 'usr-se-1', name: 'Bob Johnson', role: 'Site Engineer', department: 'Engineering' },
          { _id: 'usr-hr-1', name: 'HR Personnel', role: 'HR Manager', department: 'Human Resources' },
          { _id: 'usr-ar-1', name: 'Alice Smith', role: 'Architect', department: 'Architecture' },
          { _id: 'usr-pm-1', name: 'Sarah Connor', role: 'Project Manager', department: 'Management' },
          { _id: 'usr-em-1', name: 'Charlie Brown', role: 'Employee', department: 'Architecture' }
        ];

        defaultRoster.forEach(user => {
          if (!teamMap.has(user._id)) {
            teamMap.set(user._id, user);
          }
        });

        loadedProjs.forEach(p => {
          (p.teamAssignments || []).forEach(ta => {
            if (ta.userId) {
              const uid = typeof ta.userId === 'object' ? (ta.userId._id || ta.userId.id) : ta.userId;
              const uname = typeof ta.userId === 'object' ? (ta.userId.name || ta.userId.fullName || ta.userId.email) : 'Team Member';
              const urole = ta.projectRole || 'Architect';
              const udept = typeof ta.userId === 'object' ? (ta.userId.department || ta.userId.dept) : 'Architecture';
              if (uid && !teamMap.has(uid)) {
                teamMap.set(uid, { _id: uid, name: uname, role: urole, department: udept });
              }
            }
          });
        });

        loadedUsers = Array.from(teamMap.values());
      }

      setUsersList(loadedUsers);

      // Load Backend Departments dynamically
      let loadedDepts = ['Architecture', 'Engineering', 'Procurement', 'Quality Control'];
      if (deptRes.status === 'fulfilled' && deptRes.value) {
        const parsed = parseDepartments(deptRes.value);
        if (parsed.length > 0) {
          loadedDepts = parsed;
        }
      }
      setDepartmentsList(loadedDepts);

      const firstProjId = loadedProjs[0] ? (loadedProjs[0]._id || loadedProjs[0].id) : '';
      const firstUser = loadedUsers[0];
      const firstUserId = firstUser ? (firstUser._id || firstUser.id) : '';

      let initialDept = loadedDepts[0] || 'Architecture';
      if (firstUser) {
        const extractedDept = extractUserDepartment(firstUser);
        const matched = findMatchingDepartment(extractedDept, loadedDepts);
        if (matched) initialDept = matched;
      }

      setFormData(prev => ({
        ...prev,
        projectId: prev.projectId || firstProjId,
        assignedEmployee: prev.assignedEmployee || firstUserId,
        dept: prev.dept || initialDept
      }));
    } catch (err) {
      console.warn("Notice loading modal options:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUserSelectChange = (selectedUserId) => {
    const selectedUser = usersList.find(u => (u._id === selectedUserId || u.id === selectedUserId));
    let nextDept = formData.dept;

    if (selectedUser) {
      const extracted = extractUserDepartment(selectedUser);
      const matched = findMatchingDepartment(extracted, departmentsList);
      if (matched) {
        nextDept = matched;
      } else if (extracted) {
        if (!departmentsList.includes(extracted)) {
          setDepartmentsList(prev => [...prev, extracted]);
        }
        nextDept = extracted;
      }
    }

    setFormData(prev => ({
      ...prev,
      assignedEmployee: selectedUserId,
      dept: nextDept
    }));

    if (fieldErrors.assignedEmployee) {
      setFieldErrors(prev => ({ ...prev, assignedEmployee: null }));
    }
  };

  const { showToast } = useToast();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFieldErrors({ title: "Task title is required." });
      showToast("Please enter a task title.", "error");
      return;
    }
    setFieldErrors({});
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
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer shrink-0"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form noValidate onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[520px] space-y-4 text-xs font-medium text-slate-800">
          
          {loadingData && (
            <div className="py-2 flex items-center gap-2 text-indigo-600 text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching latest database records...</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Task Title <span className="text-rose-500 font-bold ml-0.5">*</span>
            </label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Detailed Architectural Floor Plan & Structural Rebar"
              className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-2 text-slate-900 bg-white font-semibold ${
                fieldErrors.title ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : 'border-slate-200 focus:ring-brand-primary/30'
              }`}
            />
            {fieldErrors.title && (
              <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label="Select Project"
                required
                value={formData.projectId}
                onChange={(val) => handleChange('projectId', val)}
                placeholder="Select project..."
                error={fieldErrors.projectId}
                options={projectsList.map(p => ({
                  value: p._id || p.id,
                  label: p.projectName || p.name || 'Project'
                }))}
              />
            </div>

            <div>
              <CustomSelect
                label="Assign Employee"
                required
                searchable
                value={formData.assignedEmployee}
                onChange={(val) => handleUserSelectChange(val)}
                placeholder="Select assigned employee..."
                error={fieldErrors.assignedEmployee}
                options={usersList
                  .filter(u => {
                    if (!u) return false;
                    const roleStr = String(
                      typeof u.role === 'string'
                        ? u.role
                        : (u.role?.roleName || u.roleCode || u.userType || '')
                    ).toLowerCase().trim();

                    if (
                      roleStr.includes('super admin') ||
                      roleStr.includes('super_admin') ||
                      roleStr === 'super_admin'
                    ) {
                      return false;
                    }

                    return true;
                  })
                  .map(u => {
                    const nameStr = typeof u.name === 'string' ? u.name : (typeof u.fullName === 'string' ? u.fullName : (typeof u.email === 'string' ? u.email : 'Employee'));
                    const roleStr = typeof u.role === 'string' ? u.role : (u.role?.roleName || u.roleCode || 'Staff');
                    return {
                      value: u._id || u.id,
                      label: nameStr,
                      subtext: roleStr
                    };
                  })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label="Department (Auto-selected)"
                value={formData.dept}
                onChange={(val) => handleChange('dept', val)}
                options={departmentsList.map(dept => ({
                  value: dept,
                  label: dept
                }))}
              />
            </div>
            <div>
              <CustomSelect
                label="Priority"
                value={formData.priority}
                onChange={(val) => handleChange('priority', val)}
                options={[
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Est Time (Hours) <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              <input 
                type="number" 
                value={formData.estTime}
                onChange={(e) => handleChange('estTime', e.target.value)}
                placeholder="16"
                className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-2 text-slate-900 bg-white font-semibold ${
                  fieldErrors.estTime ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-brand-primary/30'
                }`}
              />
              {fieldErrors.estTime && (
                <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.estTime}
                </p>
              )}
            </div>
            <div>
              <CalendarDatePicker
                label="Deadline Date"
                required
                value={formData.deadline}
                onChange={(val) => handleChange('deadline', val)}
                placeholder="dd-mm-yyyy"
                error={fieldErrors.deadline}
                disablePast={true}
              />
              <FieldError error={fieldErrors.deadline} id="task-deadline" />
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
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#BDE0FE] to-[#8FC9FF] text-slate-900 border border-[#8FC9FF]/70 rounded-lg text-xs font-black shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 transition-all hover:brightness-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Checklist Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Attachments URLs & File Upload builder */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Attachments (Files / URLs)</label>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2.5">
              {attachments.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {attachments.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-700">
                      <span className="truncate flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{url}</span>
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAttachment(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    value={newAttachmentUrl}
                    onChange={(e) => {
                      setNewAttachmentUrl(e.target.value);
                      if (attachmentError) setAttachmentError('');
                    }}
                    placeholder="e.g. https://domain.com/blueprint.pdf"
                    className={`flex-1 px-3 py-1.5 border rounded-lg text-[11px] font-semibold bg-white text-slate-900 ${
                      attachmentError ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20 bg-rose-50/20' : 'border-slate-250'
                    }`}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddAttachment}
                    className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add URL
                  </button>
                </div>

                {/* File Upload Attachment Trigger */}
                <div className="shrink-0">
                  <input
                    type="file"
                    id="task-attachment-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                        const fileLabel = `${file.name} (${sizeMB} MB)`;
                        setAttachments(prev => [...prev, fileLabel]);
                        showToast(`File "${file.name}" attached successfully!`, 'success', 'File Attached', true);
                      }
                    }}
                  />
                  <label
                    htmlFor="task-attachment-upload"
                    className="px-3 py-1.5 bg-[#BDE0FE] hover:bg-[#8FC9FF] text-slate-900 border border-[#8FC9FF] rounded-lg text-[10px] font-extrabold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </label>
                </div>
              </div>

              {attachmentError && (
                <p className="text-[10px] text-rose-500 font-bold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {attachmentError}
                </p>
              )}
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
              className="px-5 py-2 bg-gradient-to-r from-[#BDE0FE] to-[#8FC9FF] text-slate-900 rounded-xl text-xs font-extrabold shadow-2xs border border-[#8FC9FF]/60 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                  <span>Registering Task...</span>
                </>
              ) : (
                <span>Register Task</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
