import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Clock } from 'lucide-react';
import { getActiveProjectCategories, updateProject } from '../../../service/project';
import { getUsersList } from '../../../service/auth';
import { getClients } from '../../../service/crm/client';
import { getDepartments, parseDepartments } from '../../../service/departments';
import { useToast } from '../../../context/ToastContext';
import { FieldError } from '../../../utils/validation';
import CalendarDatePicker from '../../common/CalendarDatePicker';
import CustomSelect from '../../common/CustomSelect';

const DEFAULT_DEPTS = [
  'Architecture & Design',
  'Interior Design',
  'Structural Engineering',
  '3D Visualization & Modeling',
  'Site Engineering & Execution',
  'Project Management',
  'Billing & Quantity Surveying',
  'HR & Administration',
  'Accounts & Finance',
  'Client Relations & CRM'
];

export default function EditProjectModal({
  isOpen,
  onClose,
  project,
  onUpdateProject
}) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [clients, setClients] = useState([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPTS);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    projectName: '',
    clientId: '',
    client: '',
    clientInformation: '',
    location: '',
    address: '',
    category: '',
    projectCategoryId: null,
    department: '',
    priority: 'Medium',
    status: 'Planning',
    startDate: '',
    estCompletion: '',
    estimatedCompletion: '',
    budget: '',
    manager: '',
    projectManagerId: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        code: project.code || '',
        name: project.projectName || project.name || '',
        projectName: project.projectName || project.name || '',
        clientId: project.clientId || (typeof project.clientInformation === 'object' ? project.clientInformation._id : ''),
        client: typeof project.clientInformation === 'string' ? project.clientInformation : (project.client || ''),
        clientInformation: typeof project.clientInformation === 'string' ? project.clientInformation : (project.client || ''),
        location: project.address || project.location || '',
        address: project.address || project.location || '',
        category: (project.projectCategoryId && typeof project.projectCategoryId === 'object') ? project.projectCategoryId.name : (project.category || ''),
        projectCategoryId: (project.projectCategoryId && typeof project.projectCategoryId === 'object') ? project.projectCategoryId._id : (project.projectCategoryId || null),
        department: project.department || '',
        priority: project.priority || 'Medium',
        status: project.status || 'Planning',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        estCompletion: project.estimatedCompletion ? new Date(project.estimatedCompletion).toISOString().split('T')[0] : (project.estCompletion || ''),
        estimatedCompletion: project.estimatedCompletion ? new Date(project.estimatedCompletion).toISOString().split('T')[0] : (project.estimatedCompletion || ''),
        budget: project.budget !== undefined ? String(project.budget) : '',
        manager: project.manager || '',
        projectManagerId: project.projectManagerId || ''
      });
    }
    setErrors({});
  }, [project, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen]);

  const loadFormData = async () => {
    try {
      const [catRes, userRes, clientRes, deptRes] = await Promise.all([
        getActiveProjectCategories().catch(() => null),
        getUsersList().catch(() => null),
        getClients({ limit: 100 }).catch(() => null),
        getDepartments().catch(() => null)
      ]);

      if (catRes?.success) {
        setCategories(catRes.categories || []);
      }
      if (userRes) {
        const uList = Array.isArray(userRes) ? userRes : (userRes.users || userRes.data || []);
        setUsersList(uList);
      }
      if (clientRes?.success || Array.isArray(clientRes?.clients)) {
        setClients(clientRes.clients || clientRes || []);
      }

      const cleanDepts = parseDepartments(deptRes);
      if (cleanDepts && cleanDepts.length > 0) {
        setDepartments(cleanDepts);
      }
    } catch (err) {
      console.warn("Failed to load select options for edit project modal", err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrs = {};
    if (!(formData.name || formData.projectName)?.trim()) newErrs.name = 'Project name is required.';

    if (Object.keys(newErrs).length > 0) {
      setErrors(newErrs);
      showToast("Please fill out all required fields", "error");
      return;
    }

    const projectId = project._id || project.id;
    if (!projectId) {
      showToast("Project ID is missing", "error");
      return;
    }

    setErrors({});
    setSubmitting(true);

    const payload = {
      code: formData.code,
      projectName: formData.name || formData.projectName,
      name: formData.name || formData.projectName,
      clientInformation: formData.client || formData.clientInformation || '',
      clientId: formData.clientId || null,
      address: formData.location || formData.address || '',
      budget: parseFloat(formData.budget) || 0,
      status: formData.status || 'Planning',
      priority: formData.priority || 'Medium',
      projectCategoryId: formData.projectCategoryId || null,
      category: formData.category,
      department: formData.department || '',
      startDate: formData.startDate || null,
      estimatedCompletion: formData.estCompletion || formData.estimatedCompletion || null,
      projectManagerId: formData.projectManagerId || null,
      manager: formData.manager || ''
    };

    try {
      const res = await updateProject(projectId, payload);
      const updatedObj = res?.project || res?.data || { ...project, ...payload };
      if (onUpdateProject) {
        onUpdateProject({ ...project, ...updatedObj });
      }
      showToast("Project updated successfully by ID!", "success");
      onClose();
    } catch (err) {
      showToast("Failed to update project: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Edit Project Details</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono font-normal">
              Project ID: {project._id || project.id} &bull; Code: {project.code || 'PRJ'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer shrink-0"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form noValidate onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[480px] space-y-4 text-xs font-semibold">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Project Code
              </label>
              <input 
                type="text" 
                value={formData.code || ''}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="PRJ-101"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Project Name <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <input 
                type="text" 
                value={formData.name || formData.projectName || ''}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value, projectName: e.target.value});
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Project Name..."
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white font-medium ${
                  errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                }`}
              />
              <FieldError error={errors.name} id="edit-prj-name" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label="Client"
                searchable
                value={formData.clientId || ''}
                onChange={(selectedId) => {
                  const cObj = clients.find(c => String(c._id || c.id || c.clientId) === String(selectedId));
                  const clientName = cObj ? cObj.name : '';
                  setFormData({
                    ...formData,
                    clientId: selectedId,
                    client: clientName,
                    clientInformation: clientName
                  });
                }}
                placeholder="Select Client..."
                options={clients.map((c) => ({
                  value: c._id || c.id || c.clientId,
                  label: c.name || 'Client',
                  subtext: c.companyName ? `(${c.companyName})` : ''
                }))}
              />
            </div>

            <div>
              <CustomSelect
                label="Department"
                value={formData.department || ''}
                onChange={(val) => setFormData({ ...formData, department: val })}
                placeholder="Select Department..."
                options={departments.map(dept => ({
                  value: dept,
                  label: dept
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Location Address</label>
              <input 
                type="text" 
                value={formData.location || formData.address || ''}
                onChange={(e) => setFormData({...formData, location: e.target.value, address: e.target.value})}
                placeholder="Site Address..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>

            <div>
              <CustomSelect
                label="Category Type"
                value={formData.category || ''}
                onChange={(val) => {
                  const sel = categories.find(c => c.name === val);
                  setFormData({
                    ...formData, 
                    category: val,
                    projectCategoryId: sel ? sel._id : null
                  });
                }}
                placeholder="Select Category..."
                options={[
                  ...categories.map(cat => ({ value: cat.name, label: cat.name })),
                  { value: 'Commercial', label: 'Commercial' },
                  { value: 'Residential', label: 'Residential' },
                  { value: 'Industrial', label: 'Industrial' },
                  { value: 'Institutional', label: 'Institutional' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Valuation Budget (₹)</label>
              <input 
                type="text" 
                value={formData.budget || ''}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                placeholder="1500000"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>

            <div>
              <CustomSelect
                label="Project Manager"
                searchable
                value={formData.projectManagerId || formData.manager || ''}
                onChange={(uId) => {
                  const uObj = usersList.find(u => String(u._id || u.id) === String(uId));
                  const uName = uObj ? (uObj.name || uObj.email) : uId;
                  setFormData({
                    ...formData,
                    projectManagerId: uId,
                    manager: uName
                  });
                }}
                placeholder="Select Project Manager..."
                options={usersList.map((u) => ({
                  value: u._id || u.id,
                  label: u.name || u.email || 'Staff',
                  subtext: typeof u.role === 'object' ? (u.role?.roleName || u.role?.name) : (u.role || 'Staff')
                }))}
              />
            </div>
          </div>

          {/* Status & Priority Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label="Status"
                value={formData.status || 'Planning'}
                onChange={(val) => setFormData({ ...formData, status: val })}
                placeholder="Select Status..."
                options={[
                  { value: 'New', label: 'New' },
                  { value: 'Planning', label: 'Planning' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'On Hold', label: 'On Hold' },
                  { value: 'Approval Pending', label: 'Approval Pending' },
                  { value: 'Site Work', label: 'Site Work' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Archived', label: 'Archived' }
                ]}
              />
            </div>

            <div>
              <CustomSelect
                label="Priority"
                value={formData.priority || 'Medium'}
                onChange={(val) => setFormData({ ...formData, priority: val })}
                placeholder="Select Priority..."
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CalendarDatePicker
              label="Start Date"
              value={formData.startDate || ''}
              onChange={(val) => setFormData({ ...formData, startDate: val })}
              placeholder="dd-mm-yyyy"
            />
            <CalendarDatePicker
              label="Est Completion Date"
              value={formData.estCompletion || formData.estimatedCompletion || ''}
              onChange={(val) => setFormData({ ...formData, estCompletion: val, estimatedCompletion: val })}
              placeholder="dd-mm-yyyy"
            />
          </div>

          {/* Project Time Period Duration Banner */}
          {formData.startDate && (formData.estCompletion || formData.estimatedCompletion) && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Estimated Contract Time Period:</span>
              </div>
              <span className="px-3 py-1 bg-white border border-indigo-200 rounded-xl text-indigo-700 font-black font-mono shadow-3xs">
                {(() => {
                  const s = new Date(formData.startDate);
                  const e = new Date(formData.estCompletion || formData.estimatedCompletion);
                  if (isNaN(s.getTime()) || isNaN(e.getTime())) return '';
                  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
                  if (diff < 0) return 'Invalid Range';
                  if (diff === 0) return '1 Day (Same Day)';
                  if (diff < 30) return `${diff} Days`;
                  const m = Math.floor(diff / 30);
                  const r = diff % 30;
                  return r === 0 ? `${m} ${m === 1 ? 'Month' : 'Months'} (${diff} Days)` : `${m} ${m === 1 ? 'Month' : 'Months'}, ${r} Days (${diff} Days)`;
                })()}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Updating Project...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
