import React, { useState, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { getActiveProjectCategories, createProjectCategory } from '../../../service/project';
import { getUsersList } from '../../../service/auth';

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  newProject,
  setNewProject
}) {
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [showAddCatInput, setShowAddCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCategoriesAndUsers();
    }
  }, [isOpen]);

  const loadCategoriesAndUsers = async () => {
    try {
      const [catRes, userRes] = await Promise.all([
        getActiveProjectCategories().catch(() => null),
        getUsersList().catch(() => null)
      ]);
      if (catRes?.success) {
        setCategories(catRes.categories || []);
      }
      if (userRes) {
        const uList = Array.isArray(userRes) ? userRes : (userRes.users || userRes.data || []);
        setUsersList(uList);
      }
    } catch (err) {
      console.warn("Failed to load project categories or users", err);
    }
  };

  const handleCreateNewCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      const res = await createProjectCategory({ name: newCatName.trim() });
      if (res?.success) {
        await loadCategories();
        setNewProject({ ...newProject, category: res.category.name, projectCategoryId: res.category._id });
        setNewCatName('');
        setShowAddCatInput(false);
      }
    } catch (err) {
      alert("Failed to create category");
    } finally {
      setCatLoading(false);
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
            <span className="text-[10px] text-slate-400 block mt-0.5 font-normal">ERP Module 1: Assign project details, category & estimated completion timeline</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto max-h-[460px] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Project Code</label>
              <input 
                type="text" 
                required 
                value={newProject.code || ''}
                onChange={(e) => setNewProject({...newProject, code: e.target.value})}
                placeholder="PRJ-CP-104"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Project Name *</label>
              <input 
                type="text" 
                required 
                value={newProject.name || newProject.projectName || ''}
                onChange={(e) => setNewProject({...newProject, name: e.target.value, projectName: e.target.value})}
                placeholder="Tower Phase 2"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Client Info / Corporation</label>
              <input 
                type="text" 
                value={newProject.client || newProject.clientInformation || ''}
                onChange={(e) => setNewProject({...newProject, client: e.target.value, clientInformation: e.target.value})}
                placeholder="NexGen Ltd. (+91 98765 00000)"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Physical Location Address</label>
              <input 
                type="text" 
                value={newProject.location || newProject.address || ''}
                onChange={(e) => setNewProject({...newProject, location: e.target.value, address: e.target.value})}
                placeholder="Sector 62, Noida"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <select 
                  value={newProject.category || ''}
                  onChange={(e) => {
                    const sel = categories.find(c => c.name === e.target.value);
                    setNewProject({
                      ...newProject, 
                      category: e.target.value,
                      projectCategoryId: sel ? sel._id : null
                    });
                  }}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
                >
                  <option value="">Select Category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Institutional">Institutional</option>
                </select>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Priority Weight</label>
              <select 
                value={newProject.priority || 'Medium'}
                onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Valuation Budget ($/₹)</label>
              <input 
                type="number" 
                required 
                value={newProject.budget || ''}
                onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                placeholder="1200000"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Lead Manager *</label>
              <select
                value={newProject.manager || ''}
                onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium cursor-pointer"
              >
                <option value="">Select Lead Manager...</option>
                {usersList.map((u, idx) => {
                  const name = u.name || u.email || 'Manager';
                  const role = u.designation || u.department || u.role || 'Project Manager';
                  return (
                    <option key={u._id || u.id || idx} value={name}>
                      {name} ({role})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Start Date</label>
              <input 
                type="date" 
                required 
                value={newProject.startDate || ''}
                onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Est Completion Date</label>
              <input 
                type="date" 
                required 
                value={newProject.estCompletion || newProject.estimatedCompletion || ''}
                onChange={(e) => setNewProject({...newProject, estCompletion: e.target.value, estimatedCompletion: e.target.value})}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-medium"
              />
            </div>
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
              className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-semibold shadow-2xs transition-all border border-brand-secondary/30"
            >
              Register Contract
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
