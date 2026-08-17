import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, Check, Plus } from 'lucide-react';
import { getActiveDrawingCategories, createDrawingCategory } from '../../../service/drawing';
import { getProjects } from '../../../service/project';
import { useToast } from '../../../context/ToastContext';
import { FieldError } from '../../../utils/validation';

export default function DrawingCreateModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const { showToast } = useToast();
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
    project: '',
    projectId: '',
    category: '',
    categoryId: '',
    version: 'V1.0',
    accessLevel: 'Admin & Staff Only',
    fileSize: '3.2 MB',
    fileUrl: '',
    fileName: '',
    changeLog: 'Initial design blueprint upload'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTypeFormat, setFileTypeFormat] = useState('JPEG');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatRequiresApproval, setNewCatRequiresApproval] = useState(true);
  const [newCatRestrictedEdit, setNewCatRestrictedEdit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFieldErrors({});
      // 1. Fetch Drawing Categories from backend
      getActiveDrawingCategories()
        .then(res => {
          if (res?.categories && res.categories.length > 0) {
            setCategories(res.categories);
            setFormData(prev => ({
              ...prev,
              categoryId: prev.categoryId || res.categories[0]._id,
              category: prev.category || res.categories[0].name
            }));
          }
        })
        .catch(err => console.warn(err));

      // 2. Fetch Projects dynamically from backend API (filters user assigned projects for employee)
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
              project: prev.project || pName || '',
              projectId: prev.projectId || pId || ''
            }));
          }
        })
        .catch(err => console.warn("Failed to fetch projects dynamically:", err));
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFormatChange = (fmt) => {
    setFileTypeFormat(fmt);
    setFormData(prev => ({ ...prev, fileTypeFormat: fmt, format: fmt, fileType: fmt }));
  };

  const getAcceptAttribute = (fmt) => {
    switch (fmt) {
      case 'JPEG':
      case 'JPG':
        return '.jpg,.jpeg,image/jpeg';
      case 'PNG':
        return '.png,image/png';
      case 'PDF':
        return '.pdf,application/pdf';
      case 'DWG':
        return '.dwg,application/dwg';
      default:
        return '.pdf,.png,.jpg,.jpeg,.dwg,application/pdf,image/*';
    }
  };

  const handleCategorySelect = (catName) => {
    const found = categories.find(c => c.name === catName || String(c._id) === String(catName));
    if (found) {
      setFormData(prev => ({ ...prev, category: found.name, categoryId: found._id }));
    } else {
      setFormData(prev => ({ ...prev, category: catName }));
    }
    if (fieldErrors.category) {
      setFieldErrors(prev => ({ ...prev, category: null }));
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
        showToast(`Drawing category "${addedCat.name}" created successfully.`, 'success', 'Category Created', true);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create category.', 'error', 'Error', false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      
      const blobUrl = URL.createObjectURL(file);
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      
      let detectedFmt = fileTypeFormat;
      if (ext === 'jpg' || ext === 'jpeg') detectedFmt = 'JPEG';
      else if (ext === 'png') detectedFmt = 'PNG';
      else if (ext === 'pdf') detectedFmt = 'PDF';
      else if (ext === 'dwg') detectedFmt = 'DWG';

      setFileTypeFormat(detectedFmt);
      if (fieldErrors.file) {
        setFieldErrors(prev => ({ ...prev, file: null }));
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileDataUrl = event.target.result;
        setFormData(prev => ({
          ...prev,
          rawFile: file,
          fileUrl: blobUrl,
          filePath: blobUrl,
          base64Data: fileDataUrl,
          fileName: file.name,
          fileSize: `${sizeMB} MB`,
          fileTypeFormat: detectedFmt,
          format: detectedFmt,
          fileType: detectedFmt,
          name: prev.name || file.name.replace(/\.[^/.]+$/, "")
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Drawing title / name is required";
    }
    if (!formData.project) {
      errors.project = "Project reference is required";
    }
    if (!formData.category) {
      errors.category = "Category master is required";
    }
    if (!formData.fileUrl && !selectedFile) {
      errors.file = "Blueprint file is required";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    onSubmit(formData);
    showToast(`Blueprint "${formData.name}" uploaded successfully!`, 'success', 'Blueprint Uploaded', true);
    setFormData({
      name: '',
      project: projectsList[0]?.name || projectsList[0]?.projectName || '',
      projectId: projectsList[0]?._id || projectsList[0]?.id || '',
      category: categories[0]?.name || '',
      categoryId: categories[0]?._id || '',
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
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Upload Blueprint</h3>
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
        <form noValidate onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[500px] space-y-4 text-xs font-medium">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
              Drawing Title / Name <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Ground Floor Electrical Elevation Schematic"
              className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-2 text-slate-800 bg-white font-semibold ${
                fieldErrors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500'
              }`}
            />
            <FieldError error={fieldErrors.name} id="dwg-name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                Project Reference <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
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
                className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-2 text-slate-800 bg-white font-semibold cursor-pointer ${
                  fieldErrors.project ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500'
                }`}
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
                  <option value="">No Projects Available</option>
                )}
              </select>
              <FieldError error={fieldErrors.project} id="dwg-project" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Category Master <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
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
                <>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-2 text-slate-800 bg-white font-semibold cursor-pointer ${
                      fieldErrors.category ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500'
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <FieldError error={fieldErrors.category} id="dwg-cat" />
                </>
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                FILE TYPE FORMAT <span className="text-red-500 font-bold ml-0.5">*</span>
              </label>
              <select 
                value={fileTypeFormat}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-bold cursor-pointer"
              >
                <option value="JPEG">JPEG</option>
                <option value="PNG">PNG</option>
                <option value="PDF">PDF</option>
                <option value="DWG">DWG</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Initial Version</label>
              <input 
                type="text" 
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="V1.0"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Access Level</label>
              <select 
                value={formData.accessLevel}
                onChange={(e) => handleChange('accessLevel', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold cursor-pointer"
              >
                <option value="Admin & Staff Only">Internal</option>
                <option value="Public & Client Visible">Public</option>
              </select>
            </div>
          </div>

          {/* File Upload Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
              Blueprint File ({fileTypeFormat} Format) <span className="text-red-500 font-bold ml-0.5">*</span>
            </label>
            <div className={`p-4 border-2 border-dashed rounded-2xl transition-all text-center space-y-2 ${
              fieldErrors.file ? 'border-red-500 bg-red-50/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
            }`}>
              <input 
                type="file" 
                accept={getAcceptAttribute(fileTypeFormat)}
                onChange={handleFileChange}
                className="hidden" 
                id="modal-pdf-upload"
              />
              <label htmlFor="modal-pdf-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                <FileText className="w-8 h-8 text-indigo-600" />
                <span className="text-xs font-extrabold text-indigo-600">Click to Select Blueprint ({fileTypeFormat})</span>
                <span className="text-[10px] text-slate-400">Accepted format: {fileTypeFormat} files up to 50MB</span>
              </label>

              {selectedFile && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Selected: {selectedFile.name} ({formData.fileSize}) - Format: {fileTypeFormat}
                </div>
              )}
            </div>
            {fieldErrors.file && (
              <span className="text-[11px] font-bold text-red-500 mt-1 block">{fieldErrors.file}</span>
            )}
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
              className="px-5 py-2 crm-brand-btn rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer"
            >
              Create Drawing Record
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
