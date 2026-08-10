import React, { useState, useEffect } from 'react';
import { X, Upload, Edit3, AlertCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { uploadDocumentVersion, updateDocumentVersion } from '../../../service/document';

export default function DocumentVersionModal({
  isOpen,
  onClose,
  doc,
  mode = 'upload', // 'upload' (POST) or 'edit' (PUT)
  onSuccess
}) {
  const [versionTag, setVersionTag] = useState('');
  const [changeLog, setChangeLog] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('PDF');
  const [fileSizeKB, setFileSizeKB] = useState(1800);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const docId = doc ? (doc._id || doc.id) : null;
  const currentVersion = doc ? (doc.versionTag || `V${doc.version || 1}.0`) : 'V1.0';

  const ALLOWED_TYPES = ['PDF', 'DWG', 'JPEG', 'PNG', 'DOCX', 'XLSX', 'ZIP'];

  useEffect(() => {
    if (doc) {
      if (mode === 'edit') {
        setVersionTag(doc.versionTag || `V${doc.version || 1}.0`);
        setChangeLog(doc.changeLog || doc.notes || '');
      } else {
        const nextVerNum = (typeof doc.version === 'number' ? doc.version : parseInt(String(doc.version || '1').replace(/\D/g, '')) || 1) + 1;
        setVersionTag(`V${nextVerNum}.0`);
        setChangeLog('');
      }
      setErrorMsg('');
      setSelectedFile(null);
    }
  }, [doc, mode, isOpen]);

  if (!isOpen || !doc) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toUpperCase();
    let normalizedType = ext;
    if (ext === 'JPG') normalizedType = 'JPEG';

    if (!ALLOWED_TYPES.includes(normalizedType)) {
      setErrorMsg(`Invalid file type "${ext}". Allowed types: ${ALLOWED_TYPES.join(', ')}.`);
      setSelectedFile(null);
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);
    setFileType(normalizedType);
    setFileSizeKB(Math.round(file.size / 1024) || 1800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!changeLog.trim()) {
      setErrorMsg('Please enter revision log notes for this version update.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'upload') {
        // POST /api/documents/:id/versions/upload
        const payload = {
          versionTag: versionTag,
          changeLog: changeLog,
          fileType: fileType,
          fileSizeKB: fileSizeKB,
          filePath: selectedFile ? URL.createObjectURL(selectedFile) : `/storage/documents/${docId}_${versionTag}.pdf`,
          uploader: 'Internal Staff'
        };

        const res = await uploadDocumentVersion(docId, payload);
        alert(`POST /api/documents/${docId}/versions/upload: Uploaded version ${versionTag} successfully! Client portal visibility automatically reset to false.`);
        if (onSuccess) onSuccess(res);
      } else {
        // PUT /api/documents/:id/versions/upload
        const payload = {
          versionTag: versionTag,
          changeLog: changeLog,
          filePath: doc.filePath,
          visibleToClient: doc.visibleToClient
        };

        const res = await updateDocumentVersion(docId, payload);
        alert(`PUT /api/documents/${docId}/versions/upload: Version ${versionTag} revision notes updated successfully!`);
        if (onSuccess) onSuccess(res);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process version action.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              mode === 'upload' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}>
              {mode === 'upload' ? <Upload className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                {mode === 'upload' ? 'POST /documents/:id/versions/upload' : 'PUT /documents/:id/versions/upload'}
              </h3>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                {mode === 'upload' ? 'Upload new DocumentVersion (Auto-increments version & resets client visibility)' : 'Update DocumentVersion revision details'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current vs Next Version */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Version</span>
              <strong className="text-slate-800 font-extrabold">{currentVersion}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-indigo-600 font-bold uppercase block">Target Revision</span>
              <strong className="text-indigo-700 font-extrabold">{versionTag}</strong>
            </div>
          </div>

          {/* File Picker for POST upload */}
          {mode === 'upload' && (
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                Select Revision File
              </label>
              <input
                type="file"
                accept=".pdf,.dwg,.jpg,.jpeg,.png,.docx,.xlsx,.zip"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 font-semibold block pt-0.5">
                Allowed Formats: PDF, DWG, JPEG, PNG, DOCX, XLSX, ZIP
              </span>
            </div>
          )}

          {/* Version Tag */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Version Tag / Identifier
            </label>
            <input
              type="text"
              value={versionTag}
              onChange={(e) => setVersionTag(e.target.value)}
              placeholder="e.g. V2.0"
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800 bg-white"
            />
          </div>

          {/* Revision ChangeLog Notes */}
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Revision Log Notes / ChangeLog *
            </label>
            <textarea
              rows={3}
              value={changeLog}
              onChange={(e) => setChangeLog(e.target.value)}
              placeholder="Specify structural drawing alterations, redline notes, or specification adjustments..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-800 bg-white"
              required
            />
          </div>

          {mode === 'upload' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Note: Uploading a new version automatically RESETS client portal visibility (`visibleToClient`) to FALSE.</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer ${
                mode === 'upload' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {loading ? 'Processing...' : (mode === 'upload' ? 'POST Upload Version' : 'PUT Update Version')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
