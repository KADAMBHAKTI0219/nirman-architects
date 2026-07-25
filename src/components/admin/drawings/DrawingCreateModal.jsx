import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function DrawingCreateModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [formData, setFormData] = useState({
    name: '',
    project: 'Central Office Tower',
    category: 'Working Drawings',
    version: 'V1.0',
    accessLevel: 'Admin & Staff Only',
    fileSize: '3.2 MB',
    changeLog: 'Initial design blueprint upload'
  });

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
      category: 'Working Drawings',
      version: 'V1.0',
      accessLevel: 'Admin & Staff Only',
      fileSize: '3.2 MB',
      changeLog: 'Initial design blueprint upload'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Upload New Design Blueprint</h3>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">Register contract blueprints, version history and accessibility tags</span>
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
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Drawing Title</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Ground Floor Electrical Elevation Schematic"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Project Reference</label>
              <select 
                value={formData.project}
                onChange={(e) => handleChange('project', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Central Office Tower">Central Office Tower</option>
                <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
                <option value="Smart City Mall">Smart City Mall</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Category Type</label>
              <select 
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Concept Drawings">Concept Drawings</option>
                <option value="Working Drawings">Working Drawings</option>
                <option value="Process DWG">Process DWG</option>
                <option value="GFC Drawings">GFC Drawings</option>
                <option value="Site Drawings">Site Drawings</option>
                <option value="Interior Drawings">Interior Drawings</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Initial Revision Version</label>
              <input 
                type="text" 
                required 
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="V1.0"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Access Level Permissions</label>
              <select 
                value={formData.accessLevel}
                onChange={(e) => handleChange('accessLevel', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              >
                <option value="Admin & Staff Only">Admin & Staff Only</option>
                <option value="Public & Client Visible">Public & Client Visible</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Mock File Size</label>
              <input 
                type="text" 
                required 
                value={formData.fileSize}
                onChange={(e) => handleChange('fileSize', e.target.value)}
                placeholder="3.2 MB"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Change Log / Initial Notes</label>
            <textarea 
              rows="3"
              value={formData.changeLog}
              onChange={(e) => handleChange('changeLog', e.target.value)}
              placeholder="e.g. Initial draft layout released to engineers..."
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-800 bg-white font-semibold"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-sm transition-all"
            >
              Upload Blueprint
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
