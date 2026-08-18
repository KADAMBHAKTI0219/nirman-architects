import React, { useState, useEffect } from 'react';
import { X, Plus, Building, RefreshCw } from 'lucide-react';
import { getActiveProjectCategories, createProjectCategory } from '../../../service/project';
import { getUsersList } from '../../../service/auth';
import { getClients } from '../../../service/crm/client';
import { getDepartments, getCleanDepartmentName, parseDepartments } from '../../../service/departments';
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

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  newProject,
  setNewProject
}) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [clients, setClients] = useState([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPTS);
  const [showAddCatInput, setShowAddCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadFormData();
    setErrors({});
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
      console.warn("Failed to load project categories, users, clients, or departments", err);
    }
  };

  const handleCreateNewCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast("Please enter a category name.", "error");
      return;
    }
    setCatLoading(true);
    try {
      const res = await createProjectCategory({ name: newCatName.trim() });
      if (res?.success) {
        setCategories(prev => [...prev, res.category]);
        setNewProject({ ...newProject, category: res.category.name, projectCategoryId: res.category._id });
        setNewCatName('');
        setShowAddCatInput(false);
        showToast(`Category '${res.category.name}' created successfully.`, "success");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to create category", "error");
    } finally {
      setCatLoading(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newErrs = {};
    if (!newProject.code?.trim()) newErrs.code = 'Project code is required.';
    if (!(newProject.name || newProject.projectName)?.trim()) newErrs.name = 'Project name is required.';
    if (!newProject.clientId) newErrs.clientId = 'Please select a client.';

    if (Object.keys(newErrs).length > 0) {
      setErrors(newErrs);
      showToast("Please fill out all required fields marked with *", "error");
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      if (onSubmit) await onSubmit(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Register New Project</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">Assign project details, category & estimated completion timeline</span>
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
        <form noValidate onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[460px] space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Project Code <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <input 
                type="text" 
                value={newProject.code || ''}
                onChange={(e) => {
                  setNewProject({...newProject, code: e.target.value});
                  if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
                }}
                placeholder="PRJ-CP-104"
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white font-medium ${
                  errors.code ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                }`}
              />
              <FieldError error={errors.code} id="prj-code" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Project Name <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <input 
                type="text" 
                value={newProject.name || newProject.projectName || ''}
                onChange={(e) => {
                  setNewProject({...newProject, name: e.target.value, projectName: e.target.value});
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Tower Phase 2"
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white font-medium ${
                  errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                }`}
              />
              <FieldError error={errors.name} id="prj-name" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <CustomSelect
                label="Client"
                required
                searchable
                value={newProject.clientId || ''}
                onChange={(selectedId) => {
                  const cObj = clients.find(c => String(c._id || c.id || c.clientId) === String(selectedId));
                  const clientName = cObj ? cObj.name : '';
                  let addressVal = '';

                  if (cObj) {
                    if (Array.isArray(cObj.siteAddresses) && cObj.siteAddresses.length > 0) {
                      addressVal = cObj.siteAddresses[0];
                    } else if (cObj.siteAddress) {
                      addressVal = cObj.siteAddress;
                    } else if (cObj.billingAddress) {
                      addressVal = cObj.billingAddress;
                    } else if (cObj.address) {
                      addressVal = cObj.address;
                    }
                  }

                  if (errors.clientId) setErrors(prev => ({ ...prev, clientId: '' }));

                  setNewProject({
                    ...newProject,
                    clientId: selectedId,
                    client: clientName,
                    clientInformation: clientName,
                    location: addressVal,
                    address: addressVal
                  });
                }}
                placeholder="Select Client *"
                error={errors.clientId}
                options={clients.map((c) => {
                  const cId = c._id || c.id || c.clientId;
                  const title = c.name || 'Client';
                  const meta = [c.companyName ? `(${c.companyName})` : '', c.email || ''].filter(Boolean).join(' • ');
                  return {
                    value: cId,
                    label: title,
                    subtext: meta
                  };
                })}
              />
            </div>

            <div>
              <CustomSelect
                label="Department"
                value={newProject.department || ''}
                onChange={(val) => setNewProject({ ...newProject, department: val })}
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
                value={newProject.location || newProject.address || ''}
                onChange={(e) => setNewProject({...newProject, location: e.target.value, address: e.target.value})}
                placeholder="Sector 62, Noida"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Category Type</label>
                <button
                  type="button"
                  onClick={() => setShowAddCatInput(!showAddCatInput)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Cat</span>
                </button>
              </div>

              {showAddCatInput ? (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Category Name..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-indigo-200 rounded-xl bg-indigo-50/40"
                  />
                  <button
                    type="button"
                    onClick={handleCreateNewCategory}
                    disabled={catLoading}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <CustomSelect
                  value={newProject.category || ''}
                  onChange={(val) => {
                    const sel = categories.find(c => c.name === val);
                    setNewProject({
                      ...newProject, 
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
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Valuation Budget (₹)</label>
              <input 
                type="text" 
                required 
                value={newProject.budget || ''}
                onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                placeholder="1500000"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>

            <div>
              <CustomSelect
                label="Project Manager"
                required
                searchable
                value={newProject.projectManagerId || newProject.manager || ''}
                onChange={(uId) => {
                  const uObj = usersList.find(u => String(u._id || u.id) === String(uId));
                  const uName = uObj ? (uObj.name || uObj.email) : uId;
                  setNewProject({
                    ...newProject,
                    projectManagerId: uId,
                    manager: uName
                  });
                }}
                placeholder="Select Project Manager..."
                options={usersList.map((u) => {
                  const uId = u._id || u.id;
                  const name = u.name || u.email || 'Staff';
                  const rawRole = typeof u.role === 'object' ? (u.role?.roleName || u.role?.name) : (u.role || u.designation || 'Staff');
                  return {
                    value: uId,
                    label: name,
                    subtext: rawRole
                  };
                })}
              />
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <CalendarDatePicker
              label="Start Date"
              value={newProject.startDate || ''}
              onChange={(val) => setNewProject({ ...newProject, startDate: val })}
              placeholder="dd-mm-yyyy"
              disablePast={true}
            />
            <CalendarDatePicker
              label="Est Completion Date"
              value={newProject.estCompletion || newProject.estimatedCompletion || ''}
              onChange={(val) => setNewProject({ ...newProject, estCompletion: val, estimatedCompletion: val })}
              placeholder="dd-mm-yyyy"
              disablePast={true}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-[#BDE0FE] to-[#8FC9FF] text-slate-900 rounded-xl text-xs font-black shadow-2xs transition-all border border-[#8FC9FF]/60 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                  <span>Registering Contract...</span>
                </>
              ) : (
                <span>Register Contract</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
