import React, { useState } from 'react';
import { X, Upload, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { uploadDrawingVersion } from '../../../service/drawing';

export default function DrawingVersionModal({
  isOpen,
  onClose,
  drawing,
  onSuccess
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [changeLog, setChangeLog] = useState('');
  const [fileUrlInput, setFileUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !drawing) return null;

  const drawingId = drawing._id || drawing.id;
  const drawingTitle = drawing.drawingName || drawing.title || drawing.name || 'Drawing';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !fileUrlInput.trim()) {
      setErrorMsg('Please select a drawing file or enter a valid file URL.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('file', selectedFile);
        payload.append('filePath', `/uploads/drawings/${selectedFile.name}`);
        payload.append('changeLog', changeLog.trim() || 'Revised blueprint drawing version');
      } else {
        payload = {
          filePath: fileUrlInput.trim(),
          fileUrl: fileUrlInput.trim(),
          changeLog: changeLog.trim() || 'Revised blueprint drawing version'
        };
      }

      const res = await uploadDrawingVersion(drawingId, payload);
      if (res && (res.success || res.drawing || res.version)) {
        alert(res.message || 'Drawing version uploaded successfully!');
        if (onSuccess) onSuccess(res);
        onClose();
      } else {
        setErrorMsg(res?.message || 'Failed to upload new drawing version.');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Error uploading drawing version.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Upload New Revision</h3>
              <p className="text-[10px] text-slate-500 font-bold">
                POST /api/drawings/{drawingId}/versions/upload
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 font-semibold text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Drawing</label>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">{drawingTitle}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Select File (.dwg, .pdf, .png, .jpg)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 cursor-pointer relative">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".dwg,.pdf,.png,.jpg,.jpeg,.svg"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <span className="font-bold text-slate-700 block text-xs">
                {selectedFile ? selectedFile.name : 'Click to select file from computer'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Max size 25MB</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Or File URL / Storage Path</label>
            <input 
              type="text"
              value={fileUrlInput}
              onChange={(e) => setFileUrlInput(e.target.value)}
              placeholder="/uploads/drawings/skyline_v2.dwg"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Revision Change Notes</label>
            <textarea
              rows={3}
              value={changeLog}
              onChange={(e) => setChangeLog(e.target.value)}
              placeholder="E.g., Revised column setbacks per client feedback"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Submit New Version'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
