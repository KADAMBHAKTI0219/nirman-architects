import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getProjects } from '../../../service/project';

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [projectsList, setProjectsList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    project: 'Central Office Tower',
    projectId: '',
    folder: 'Reports',
    type: 'PDF',
    accessLevel: 'Public & Staff',
    fileSize: '1.8 MB',
    confidential: false,
    changeLog: 'Initial contract draft upload'
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
              project: pName || prev.project,
              projectId: pId || prev.projectId
            }));
          }
        })
        .catch(err => console.warn(err));
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      name: '',
      project: 'Central Office Tower',
      projectId: '',
      folder: 'Reports',
      type: 'PDF',
      accessLevel: 'Public & Staff',
      fileSize: '1.8 MB',
      confidential: false,
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
            <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">Register files into the project-wise database repository</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[460px] space-y-4">
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Folder Category</label>
              <select 
                value={formData.folder}
                onChange={(e) => handleChange('folder', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Drawings">Drawings</option>
                <option value="Reports">Reports</option>
                <option value="Client Files">Client Files</option>
                <option value="Approvals">Approvals</option>
                <option value="Site Photos">Site Photos</option>
                <option value="Contracts">Contracts</option>
                <option value="Meeting Notes">Meeting Notes</option>
                <option value="Financial Files">Financial Files</option>
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
