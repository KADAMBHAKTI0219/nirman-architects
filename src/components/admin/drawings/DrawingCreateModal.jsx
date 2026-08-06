import React, { useState } from 'react';
import { X, FileText, Upload, Check } from 'lucide-react';

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
    accessLevel: 'Public & Client Visible',
    fileSize: '3.2 MB',
    fileUrl: '',
    fileName: '',
    changeLog: 'Initial design blueprint upload'
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      category: 'Working Drawings',
      version: 'V1.0',
      accessLevel: 'Public & Client Visible',
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
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Upload & Share Drawing PDF</h3>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">Attach PDF or Image file for client portal & backend DB storage</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form fields */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto max-h-[480px] space-y-4 text-xs font-medium">
          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Drawing Title *</label>
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
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Project Reference</label>
              <select 
                value={formData.project}
                onChange={(e) => handleChange('project', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold cursor-pointer"
              >
                <option value="Central Office Tower">Central Office Tower</option>
                <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
                <option value="Smart City Mall">Smart City Mall</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Category Type</label>
              <select 
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold cursor-pointer"
              >
                <option value="Working Drawings">Working Drawings</option>
                <option value="Concept Drawings">Concept Drawings</option>
                <option value="Process DWG">Process DWG</option>
                <option value="GFC Drawings">GFC Drawings</option>
                <option value="Site Drawings">Site Drawings</option>
                <option value="Interior Drawings">Interior Drawings</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Revision Version</label>
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
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Client Portal Visibility</label>
              <select 
                value={formData.accessLevel}
                onChange={(e) => handleChange('accessLevel', e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-semibold cursor-pointer"
              >
                <option value="Public & Client Visible">Public & Client Visible (Shared)</option>
                <option value="Admin & Staff Only">Admin & Staff Only (Internal)</option>
              </select>
            </div>
          </div>

          {/* File Upload Input for PDF or Images */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Drawing File (PDF or Image) *</label>
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-all text-center space-y-2">
              <input 
                type="file" 
                required={!formData.fileUrl}
                accept="application/pdf,image/*,.pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden" 
                id="modal-pdf-upload"
              />
              <label htmlFor="modal-pdf-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                <FileText className="w-8 h-8 text-indigo-600" />
                <span className="text-xs font-extrabold text-indigo-600">Click to Select Drawing PDF / Image</span>
                <span className="text-[10px] text-slate-400">Supports PDF, PNG, JPG files up to 25MB</span>
              </label>

              {selectedFile && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Selected: {selectedFile.name} ({formData.fileSize})
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Change Log / Initial Notes</label>
            <textarea 
              rows="2"
              value={formData.changeLog}
              onChange={(e) => handleChange('changeLog', e.target.value)}
              placeholder="e.g. Initial PDF layout drawing sent for approval..."
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
              Upload & Share PDF
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
