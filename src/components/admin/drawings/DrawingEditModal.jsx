import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, AlertCircle } from 'lucide-react';
import { updateDrawing, getActiveDrawingCategories } from '../../../service/drawing';
import { getProjects } from '../../../service/project';
import { useToast } from '../../../context/ToastContext';

export default function DrawingEditModal({
  isOpen,
  onClose,
  drawing,
  onSuccess
}) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    drawingName: '',
    category: '',
    project: '',
    status: 'DESIGNER_UPLOADED',
    visibleToClient: false
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen && drawing) {
      setFieldErrors({});
      const dName = drawing.drawingName || drawing.name || drawing.title || '';
      const dCategory = drawing.category || drawing.categoryName || '';
      const dProject = drawing.project || (drawing.projectId?.name || drawing.projectId?.projectName || '');
      const dStatus = drawing.status || 'DESIGNER_UPLOADED';
      const dVisible = Boolean(drawing.visibleToClient);

      setFormData({
        drawingName: dName,
        category: dCategory,
        project: dProject,
        status: dStatus,
        visibleToClient: dVisible
      });

      getActiveDrawingCategories()
        .then(res => {
          if (res?.categories && res.categories.length > 0) {
            setCategories(res.categories);
          }
        })
        .catch(err => console.warn(err));

      getProjects()
        .then(res => {
          let list = [];
          if (res?.projects && Array.isArray(res.projects)) list = res.projects;
          else if (Array.isArray(res)) list = res;
          if (list.length > 0) setProjectsList(list);
        })
        .catch(err => console.warn(err));
    }
  }, [isOpen, drawing]);

  if (!isOpen || !drawing) return null;

  const drawingId = drawing._id || drawing.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.drawingName.trim()) {
      errors.drawingName = "Drawing name is required";
    }
    if (!formData.project) {
      errors.project = "Project reference is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const updatePayload = {
        drawingName: formData.drawingName.trim(),
        name: formData.drawingName.trim(),
        title: formData.drawingName.trim(),
        category: formData.category,
        categoryName: formData.category,
        project: formData.project,
        status: formData.status,
        visibleToClient: formData.visibleToClient
      };

      const res = await updateDrawing(drawingId, updatePayload);
      const updatedObj = res?.drawing || res?.data || { ...drawing, ...updatePayload };
      
      showToast(`Drawing "${formData.drawingName}" updated successfully!`, "success", "Drawing Updated", true);
      if (onSuccess) onSuccess(updatedObj);
      onClose();
    } catch (err) {
      showToast(err.message || "Failed to update drawing", "error", "Update Error", false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200 font-sans text-slate-800">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Edit Drawing Master</h3>
              <p className="text-[10px] text-slate-500 font-bold">
                ID: {drawingId} • Update details & category classification
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form noValidate onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
              Drawing Name / Title <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input 
              type="text" 
              value={formData.drawingName}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, drawingName: e.target.value }));
                if (fieldErrors.drawingName) setFieldErrors(prev => ({ ...prev, drawingName: null }));
              }}
              placeholder="Drawing Title..."
              className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:ring-2 text-slate-900 bg-white font-bold ${
                fieldErrors.drawingName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500'
              }`}
            />
            {fieldErrors.drawingName && (
              <span className="text-[11px] font-bold text-red-500 mt-1 block">{fieldErrors.drawingName}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                Category Master <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white cursor-pointer font-bold"
              >
                {categories.length > 0 ? (
                  categories.map(c => (
                    <option key={c._id || c.id || c.name} value={c.name}>{c.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Working Drawings">Working Drawings</option>
                    <option value="Concept Drawings">Concept Drawings</option>
                    <option value="Process DWG">Process DWG</option>
                    <option value="GFC Drawings">GFC Drawings</option>
                    <option value="Site">Site</option>
                    <option value="Interior Drawings">Interior Drawings</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                Project Reference <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select
                value={formData.project}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, project: e.target.value }));
                  if (fieldErrors.project) setFieldErrors(prev => ({ ...prev, project: null }));
                }}
                className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:ring-2 text-slate-900 bg-white cursor-pointer font-bold ${
                  fieldErrors.project ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500'
                }`}
              >
                {projectsList.length > 0 ? (
                  projectsList.map(p => {
                    const pName = p.name || p.projectName || p.title || 'Project';
                    return (
                      <option key={p._id || p.id || pName} value={pName}>{pName}</option>
                    );
                  })
                ) : (
                  <option value={formData.project || ''}>{formData.project || 'Select Project'}</option>
                )}
              </select>
              {fieldErrors.project && (
                <span className="text-[11px] font-bold text-red-500 mt-1 block">{fieldErrors.project}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                Status Flag
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white cursor-pointer font-bold"
              >
                <option value="DESIGNER_UPLOADED">Designer Uploaded</option>
                <option value="PENDING_CLIENT_APPROVAL">Pending Review</option>
                <option value="PM_APPROVED">PM Approved</option>
                <option value="APPROVED">Approved</option>
                <option value="CHANGES_REQUESTED">Revisions Required</option>
                <option value="GFC_LOCKED">GFC Locked</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input 
                type="checkbox"
                id="edit_vis_client"
                checked={formData.visibleToClient}
                onChange={(e) => setFormData(prev => ({ ...prev, visibleToClient: e.target.checked }))}
                className="w-4 h-4 accent-indigo-600 rounded border-slate-300 cursor-pointer"
              />
              <label htmlFor="edit_vis_client" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                Client Portal Visible
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 crm-brand-btn text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Drawing Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
