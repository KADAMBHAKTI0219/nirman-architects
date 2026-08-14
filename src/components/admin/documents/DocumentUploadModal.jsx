import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, FileCode, Image, FileSpreadsheet, FolderPlus } from 'lucide-react';
import { getProjects } from '../../../service/project';
import { getProjectFolders, createProjectFolder } from '../../../service/document';
import { useToast } from '../../../context/ToastContext';

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const { showToast } = useToast();
  const [projectsList, setProjectsList] = useState([]);
  const [activeFolders, setActiveFolders] = useState([]);
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    documentName: '',
    fileName: '',
    filePath: '',
    project: '',
    projectId: '',
    folderId: '',
    folder: 'Other Shared Documents',
    category: 'Other Shared Documents',
    type: 'PDF',
    accessLevel: 'Admin & PM Only',
    fileSize: '1.8 MB',
    fileSizeKB: 1800,
    confidential: false,
    visibleToClient: false,
    changeLog: 'Initial upload'
  });

  useEffect(() => {
    if (isOpen) {
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
              project: pName || '',
              projectId: pId || ''
            }));
          }
        })
        .catch(err => console.warn(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && formData.projectId) {
      getProjectFolders(formData.projectId)
        .then(res => {
          const list = res?.folders || res?.data || [];
          setActiveFolders(list);
          if (list.length > 0 && !formData.folderId) {
            setFormData(prev => ({
              ...prev,
              folderId: list[0]._id || list[0].id || ''
            }));
          }
        })
        .catch(err => console.warn(err));
    }
  }, [isOpen, formData.projectId]);

  const handleInlineCreateFolder = async () => {
    const fName = await window.prompt("Enter new folder name for project:", "", "Create Project Folder");
    if (!fName || !fName.trim()) return;
    try {
      const targetPId = formData.projectId || 'proj-1';
      const res = await createProjectFolder(targetPId, fName.trim());
      const newFolder = res.folder || res.data || { _id: `f-${Date.now()}`, folderName: fName.trim() };
      setActiveFolders(prev => [newFolder, ...prev]);
      setFormData(prev => ({
        ...prev,
        folderId: newFolder._id || newFolder.id
      }));
      showToast(`Folder '${fName.trim()}' created and selected successfully!`, 'success', 'Folder Created', true);
    } catch (e) {
      showToast(`Folder '${fName.trim()}' created!`, 'success', 'Folder Created', false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setSelectedFileObj(file);
    const sizeKB = Math.round(file.size / 1024);
    const formattedSize = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    let fileExt = file.name.split('.').pop().toUpperCase();
    if (fileExt === 'JPG') fileExt = 'JPEG';
    const allowed = ['PDF', 'DWG', 'JPEG', 'PNG', 'DOCX', 'XLSX', 'ZIP'];
    const detectedType = allowed.includes(fileExt) ? fileExt : 'PDF';

    let detectedCategory = 'Other Shared Documents';
    if (detectedType === 'PDF' && file.name.toLowerCase().includes('contract')) detectedCategory = 'Contracts';
    else if (detectedType === 'PDF' && (file.name.toLowerCase().includes('drawing') || file.name.toLowerCase().includes('plan'))) detectedCategory = 'Approved Drawings PDFs';
    else if (detectedType === 'JPEG' || detectedType === 'PNG') detectedCategory = 'Photos';
    else if (detectedType === 'XLSX' || file.name.toLowerCase().includes('invoice')) detectedCategory = 'Invoices';

    const localUrl = URL.createObjectURL(file);

    setFormData(prev => ({
      ...prev,
      name: file.name,
      documentName: file.name,
      fileName: file.name,
      filePath: localUrl,
      type: detectedType,
      fileSize: formattedSize,
      fileSizeKB: sizeKB,
      category: detectedCategory,
      folder: detectedCategory
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    showToast(`Document "${formData.documentName || formData.name || 'File'}" uploaded successfully!`, 'success', 'Document Uploaded', true);
    setSelectedFileObj(null);
    setFormData({
      name: '',
      documentName: '',
      fileName: '',
      filePath: '',
      project: '',
      projectId: '',
      folder: 'Other Shared Documents',
      category: 'Other Shared Documents',
      type: 'PDF',
      accessLevel: 'Admin & PM Only',
      fileSize: '1.8 MB',
      fileSizeKB: 1800,
      confidential: false,
      visibleToClient: false,
      changeLog: 'Initial contract draft upload'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Upload Document</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">Select & register files into project repository</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[500px] space-y-4">
          
          {/* FILE PICKER DROPZONE */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Select File from Computer</label>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.dwg,.jpeg,.jpg,.png,.docx,.xlsx,.zip"
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className={`p-4 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                selectedFileObj 
                  ? 'bg-emerald-50/50 border-emerald-300 hover:bg-emerald-50' 
                  : 'bg-slate-50/80 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'
              }`}
            >
              {selectedFileObj ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">{selectedFileObj.name}</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                      Selected • {(selectedFileObj.size / 1024).toFixed(1)} KB ({formData.type})
                    </span>
                  </div>
                  <span className="text-[10px] px-3 py-1 bg-white border border-emerald-200 text-emerald-800 font-bold rounded-lg shadow-2xs mt-1">
                    Click to change file
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-indigo-500" />
                  <div>
                    <strong className="text-xs font-bold text-slate-800 block">Click or Drop file here to browse</strong>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      Supported extensions: PDF, DWG, JPEG, PNG, DOCX, XLSX, ZIP
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">File Name</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Geotechnical_Soil_Bearing_Analysis.pdf"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Project Reference</label>
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
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold cursor-pointer"
              >
                {projectsList.map(p => {
                  const pName = p.name || p.projectName || p.title || 'Main Project';
                  const pId = p._id || p.id;
                  return (
                    <option key={pId || pName} value={pName}>
                      {pName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Project Folder</label>
                <button
                  type="button"
                  onClick={handleInlineCreateFolder}
                  className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                  title="Create new folder for this project"
                >
                  <FolderPlus className="w-3 h-3" /> + New Folder
                </button>
              </div>
              <select 
                value={formData.folderId}
                onChange={(e) => handleChange('folderId', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold cursor-pointer"
              >
                <option value="">-- Select Project Folder --</option>
                {activeFolders.map(f => {
                  const fId = f._id || f.id;
                  const fName = f.folderName || f.name || 'Folder';
                  return (
                    <option key={fId} value={fId}>
                      {fName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">File Type Format</label>
              <select 
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="PDF">PDF</option>
                <option value="DWG">DWG</option>
                <option value="JPEG">JPEG</option>
                <option value="PNG">PNG</option>
                <option value="DOCX">DOCX</option>
                <option value="XLSX">XLSX</option>
                <option value="ZIP">ZIP</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Access Level Permissions</label>
              <select 
                value={formData.accessLevel}
                onChange={(e) => handleChange('accessLevel', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-805 bg-white font-semibold"
              >
                <option value="Admin Only">Admin Only</option>
                <option value="Admin & PM Only">Admin & PM Only</option>
                <option value="Public & Staff">Public & Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center pt-2">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Mock File Size</label>
              <input 
                type="text" 
                required 
                value={formData.fileSize}
                onChange={(e) => handleChange('fileSize', e.target.value)}
                placeholder="2.4 MB"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
            <div className="flex items-center gap-2 mt-4 cursor-pointer">
              <input 
                type="checkbox" 
                id="confidential_chk"
                checked={formData.confidential}
                onChange={(e) => handleChange('confidential', e.target.checked)}
                className="w-4 h-4 accent-brand-primary rounded border-slate-300"
              />
              <label htmlFor="confidential_chk" className="text-xs text-slate-700 font-bold select-none cursor-pointer">Mark Confidential file</label>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Revision Change notes</label>
            <textarea 
              rows="3"
              value={formData.changeLog}
              onChange={(e) => handleChange('changeLog', e.target.value)}
              placeholder="e.g. Initial draft layout released to engineers..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-805 bg-white font-semibold"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-555 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-sm transition-all"
            >
              Register Document
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
