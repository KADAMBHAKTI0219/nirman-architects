import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, Check, Plus } from 'lucide-react';
import { getActiveDrawingCategories, createDrawingCategory } from '../../../service/drawing';
import { getProjects } from '../../../service/project';

export default function DrawingCreateModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [categories, setCategories] = useState([
    { _id: 'cat-working', name: 'Working Drawings' },
    { _id: 'cat-concept', name: 'Concept Drawings' },
    { _id: 'cat-process-dwg', name: 'Process DWG' },
    { _id: 'cat-gfc', name: 'GFC Drawings' },
    { _id: 'cat-site', name: 'Site' },
    { _id: 'cat-interior', name: 'Interior Drawings' }
  ]);

  const [projectsList, setProjectsList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    project: 'Central Office Tower',
    projectId: '',
    category: 'Working Drawings',
    categoryId: 'cat-working',
    version: 'V1.0',
    accessLevel: 'Admin & Staff Only',
    fileSize: '3.2 MB',
    fileUrl: '',
    fileName: '',
    changeLog: 'Initial design blueprint upload'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatRequiresApproval, setNewCatRequiresApproval] = useState(true);
  const [newCatRestrictedEdit, setNewCatRestrictedEdit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 1. Fetch Drawing Categories
      getActiveDrawingCategories()
        .then(res => {
          if (res?.categories && res.categories.length > 0) {
            setCategories(res.categories);
            if (!formData.categoryId) {
              setFormData(prev => ({
                ...prev,
                categoryId: res.categories[0]._id,
                category: res.categories[0].name
              }));
            }
          }
        })
        .catch(err => console.warn(err));

      // 2. Fetch Projects dynamically from backend API
      getProjects()
        .then(res => {
          let list = [];
          if (res?.projects && Array.isArray(res.projects)) {
            list = res.projects;
          } else if (Array.isArray(res)) {
            list = res;
          }
          if (list.length > 0) {
            setProjectsList(list);
            const firstP = list[0];
            const pName = firstP.name || firstP.projectName || firstP.title;
            const pId = firstP._id || firstP.id;
            setFormData(prev => ({
              ...prev,
              project: pName || prev.project,
              projectId: pId || prev.projectId
            }));
          }
        })
        .catch(err => console.warn("Failed to fetch projects dynamically:", err));
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelect = (catName) => {
    const found = categories.find(c => c.name === catName || String(c._id) === String(catName));
    if (found) {
      setFormData(prev => ({ ...prev, category: found.name, categoryId: found._id }));
    } else {
      setFormData(prev => ({ ...prev, category: catName }));
    }
  };

  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await createDrawingCategory({
        name: newCatName.trim(),
        requiresClientApproval: newCatRequiresApproval,
        restrictedEditing: newCatRestrictedEdit
      });
      if (res?.category || res?.data?.category) {
        const addedCat = res.category || res.data.category;
        setCategories(prev => [...prev, addedCat]);
        setFormData(prev => ({ ...prev, category: addedCat.name, categoryId: addedCat._id }));
        setIsCreatingNewCategory(false);
        setNewCatName('');
        alert(`Drawing category "${addedCat.name}" created successfully.`);
      }
    } catch (err) {
      alert(err.message || 'Failed to create category.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileDataUrl = event.target.result;
        setFormData(prev => ({
          ...prev,
          rawFile: file,
          fileUrl: fileDataUrl,
          fileName: file.name,
          fileSize: `${sizeMB} MB`,
          name: prev.name || file.name.replace(/\.[^/.]+$/, "")
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.fileUrl) {
      alert("Please select a PDF or Image blueprint file to upload.");
      return;
    }
    onSubmit(formData);
    setFormData({
      name: '',
      project: 'Central Office Tower',
      projectId: '',
      category: 'Working Drawings',
      categoryId: 'cat-working',
      version: 'V1.0',
      accessLevel: 'Admin & Staff Only',
      fileSize: '3.2 MB',
      fileUrl: '',
      fileName: '',
      changeLog: 'Initial design blueprint upload'
    });
    setSelectedFile(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-slate-800">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Upload Blueprint (ERP Module 3)</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">Creates parent record and v1 drawing version with auto-increment</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[500px] space-y-4 text-xs font-medium">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Drawing Title / Name *</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Ground Floor Electrical Elevation Schematic"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Project Reference *</label>
              <select 
                value={formData.project}
                onChange={(e) => {
                  const val = e.target.value;
                  const found = projectsList.find(p => (p.name || p.projectName || p.title) === val || String(p._id || p.id) === String(val));
                  if (found) {
                    handleChange('project', found.name || found.projectName || found.title);
                    handleChange('projectId', found._id || found.id);
                  } else {
                    handleChange('project', val);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold cursor-pointer"
              >
                {projectsList.length > 0 ? (
                  projectsList.map(p => {
                    const pName = p.name || p.projectName || p.title || 'Untitled Project';
                    const pId = p._id || p.id;
                    return (
                      <option key={pId || pName} value={pName}>
                        {pName}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value="Central Office Tower">Central Office Tower</option>
                    <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
                    <option value="Smart City Mall">Smart City Mall</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Category Master *</label>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewCategory(prev => !prev)}
                  className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  {isCreatingNewCategory ? 'Select Existing' : 'New Category'}
                </button>
              </div>

              {!isCreatingNewCategory ? (
                <select 
                  value={formData.category}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 border border-indigo-200 bg-indigo-50/50 rounded-xl space-y-2">
                  <input
                    type="text"
                    placeholder="New category name..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-700">
                      <input 
                        type="checkbox" 
                        checked={newCatRestrictedEdit} 
                        onChange={(e) => setNewCatRestrictedEdit(e.target.checked)} 
                      />
                      Restricted In-Place Edit
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateCategorySubmit}
                    className="w-full py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                  >
                    Save Master Category
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Initial Version</label>
              <input 
                type="text" 
                required 
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="V1.0"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Access Level</label>
              <select 
                value={formData.accessLevel}
                onChange={(e) => handleChange('accessLevel', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold cursor-pointer"
              >
                <option value="Admin & Staff Only">Admin & Staff Only (Internal)</option>
                <option value="Public & Client Visible">Public & Client Visible (Shared)</option>
              </select>
            </div>
          </div>

          {/* File Upload Input for PDF or Images */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Blueprint File (DWG / PDF / Image) *</label>
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-all text-center space-y-2">
              <input 
                type="file" 
                required={!formData.fileUrl}
                accept="application/pdf,image/*,.pdf,.png,.jpg,.jpeg,.dwg"
                onChange={handleFileChange}
                className="hidden" 
                id="modal-pdf-upload"
              />
              <label htmlFor="modal-pdf-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                <FileText className="w-8 h-8 text-indigo-600" />
                <span className="text-xs font-extrabold text-indigo-600">Click to Select Blueprint DWG / PDF / Image</span>
                <span className="text-[10px] text-slate-400">Supports DWG, PDF, PNG, JPG files up to 50MB</span>
              </label>

              {selectedFile && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Selected: {selectedFile.name} ({formData.fileSize})
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Change Log / Release Notes</label>
            <textarea 
              rows="2"
              value={formData.changeLog}
              onChange={(e) => handleChange('changeLog', e.target.value)}
              placeholder="e.g. Initial design blueprint release..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold"
            ></textarea>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer"
            >
              Create Drawing Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
