import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Lock, Unlock, ShieldCheck, Clock, Eye, FileDown, 
  Send, Layers, Calendar, CheckSquare, Plus, FileText, CheckCircle2,
  PenTool, Maximize2, Globe, Shield, RefreshCw, Upload, Edit3, Image as ImageIcon
} from 'lucide-react';
import Card from '../../common/Card';
import MarkupEditor from '../markup/MarkupEditor';
import { 
  uploadDocumentVersion, 
  updateDocumentVersion,
  updateDocumentVisibility, 
  getDocumentAccessLog,
  previewDocument,
  downloadDocument 
} from '../../../service/document';
import { getCachedDocumentFile } from '../../../service/document';
import { getCachedDrawingFile } from '../../../service/drawing';
import DocumentVersionModal from './DocumentVersionModal';
import { detectFileType, getCleanFileUrl } from '../../../utils/fileTypeDetector';

export default function DocumentDetails({
  doc,
  onBack,
  onUpdateDocument
}) {
  const [isFullMarkupMode, setIsFullMarkupMode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [accessLogs, setAccessLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionModalMode, setVersionModalMode] = useState('upload');
  const [imgFailed, setImgFailed] = useState(false);

  const docId = doc ? (doc._id || doc.id) : null;
  const docTitle = doc?.documentName || doc?.fileName || doc?.name || 'Untitled Document.pdf';
  
  const resolveTargetFileUrl = (d) => {
    if (!d) return '';
    const cached = getCachedDocumentFile(d._id) || 
                   getCachedDocumentFile(d.id) || 
                   getCachedDocumentFile(d.documentName) || 
                   getCachedDocumentFile(d.fileName) || 
                   getCachedDocumentFile(d.name) ||
                   getCachedDrawingFile(d._id) ||
                   getCachedDrawingFile(d.id) ||
                   getCachedDrawingFile(d.documentName) ||
                   getCachedDrawingFile(d.fileName) ||
                   getCachedDrawingFile(d.name);

    const verPath = d.currentVersionId && typeof d.currentVersionId === 'object' ? (d.currentVersionId.filePath || d.currentVersionId.fileUrl) : null;
    const raw = cached || d.filePath || d.fileUrl || d.url || d.file || d.previewUrl || d.pdfUrl || verPath ||
      (Array.isArray(d.versions) && d.versions.length > 0 ? (d.versions[d.versions.length - 1]?.filePath || d.versions[d.versions.length - 1]?.fileUrl) : null);
    
    return getCleanFileUrl(raw);
  };

  const rawFileUrl = doc?.filePath || doc?.fileUrl || doc?.url || doc?.currentVersionId?.filePath || doc?.currentVersionId?.fileUrl || '';
  const fileUrl = resolveTargetFileUrl(doc) || getCleanFileUrl(rawFileUrl);
  const detectedType = detectFileType(rawFileUrl || fileUrl, doc);
  const isImage = detectedType === 'image';
  const isPdf = detectedType === 'pdf';
  const fileExt = (doc?.fileType || doc?.type || docTitle.split('.').pop() || 'PDF').toUpperCase();

  const fetchAccessLog = async () => {
    if (!docId) return;
    setLoadingLogs(true);
    try {
      await previewDocument(docId);
      const res = await getDocumentAccessLog(docId);
      if (res && res.accessLogs) setAccessLogs(res.accessLogs);
      else if (res && res.data) setAccessLogs(res.data);
    } catch (e) {
      // Catch access log 403/404 silently
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAccessLog();
    setImgFailed(false);
  }, [docId, fileUrl]);

  // Handle Download File with Access Logging
  const handleDownloadFile = async () => {
    try {
      const res = await downloadDocument(docId);
      if (res && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      } else if (fileUrl) {
        window.open(fileUrl, '_blank');
      } else {
        alert(`Download action logged for "${docTitle}".`);
      }
      fetchAccessLog();
    } catch (e) {
      if (fileUrl) window.open(fileUrl, '_blank');
    }
  };

  // Toggle Client Handoff Visibility (PUT /api/documents/:id/visibility)
  const handleVisibilityToggle = async () => {
    const nextVis = !doc.visibleToClient;
    try {
      await updateDocumentVisibility(docId, nextVis);
      if (onUpdateDocument) {
        onUpdateDocument({
          ...doc,
          visibleToClient: nextVis
        });
      }
      fetchAccessLog();
    } catch (err) {
      if (onUpdateDocument) {
        onUpdateDocument({ ...doc, visibleToClient: nextVis });
      }
    }
  };

  if (isFullMarkupMode) {
    return (
      <MarkupEditor
        documentData={doc}
        onBack={() => setIsFullMarkupMode(false)}
        onSaveDocument={onUpdateDocument}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800">
      
      {/* Top Header Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2.5 hover:bg-slate-100 bg-slate-50 text-slate-700 rounded-2xl transition-all border border-slate-200 cursor-pointer shadow-3xs"
            title="Back to Document Vault"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">
                {docId}
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-brand-soft text-slate-800 uppercase border border-brand-secondary/40">
                {fileExt}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">{docTitle}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsFullMarkupMode(true)}
            className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-brand-secondary/40 whitespace-nowrap"
          >
            <PenTool className="w-4 h-4 text-brand-dark shrink-0" />
            <span>Open PDF Markup Editor</span>
          </button>

          <button
            onClick={handleVisibilityToggle}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 border whitespace-nowrap ${
              doc.visibleToClient 
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
            }`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>{doc.visibleToClient ? 'Hide from Client' : 'Publish to Client'}</span>
          </button>
        </div>
      </div>

      {/* Top 2-Column Grid Layout (Preview Left, Metadata/Audit Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Pane (2/3 Width) - Preview Canvas */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Document File Preview</span>
              </div>
              {fileUrl && (
                <a 
                  href={fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[11px] font-extrabold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Fullscreen View
                </a>
              )}
            </div>

            {isPdf ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 min-h-[420px] overflow-hidden flex flex-col flex-1">
                <div className="bg-slate-800 px-4 py-2 rounded-t-xl flex justify-between items-center text-xs font-bold text-slate-200 border-b border-slate-700">
                  <span className="truncate max-w-md">📄 {docTitle}</span>
                  <span className="px-2 py-0.5 rounded bg-brand-primary text-brand-dark text-[10px] font-extrabold uppercase">{fileExt} Document</span>
                </div>
                {fileUrl ? (
                  <iframe 
                    src={fileUrl.includes('#') ? fileUrl : `${fileUrl}#toolbar=1`}
                    title={docTitle}
                    className="w-full h-[440px] rounded-b-xl border-none bg-white flex-1"
                  />
                ) : (
                  <div className="bg-white p-8 rounded-b-xl min-h-[380px] flex flex-col justify-between text-slate-800 font-sans space-y-4 flex-1">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <span className="text-xs font-black uppercase text-brand-dark tracking-widest">Nirman Architects Official Specification Document</span>
                        <span className="text-[10px] text-slate-400 font-mono">Format: PDF</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{docTitle}</h3>
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-700">
                        <p className="font-bold text-slate-900">Project: {doc.project || 'Central Office Tower'}</p>
                        <p className="leading-relaxed">This PDF document contains official project architectural guidelines, material specifications, and structural compliance records generated by Nirman Architects.</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-bold">Ready for print & client download</span>
                      <button
                        onClick={handleDownloadFile}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer border border-brand-secondary/40"
                      >
                        Download PDF File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isImage && !imgFailed && fileUrl ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 min-h-[360px] max-h-[480px] flex flex-col items-center justify-center relative overflow-hidden group flex-1">
                <img 
                  src={fileUrl} 
                  alt={docTitle}
                  className="max-h-[400px] w-auto object-contain rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.01]"
                  onError={() => setImgFailed(true)}
                />
                <span className="text-[10px] text-slate-400 font-mono mt-3">
                  Image Resolution: High quality • File Type: {fileExt}
                </span>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-800 font-sans text-xs space-y-4 min-h-[360px] flex flex-col justify-between flex-1">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-primary/20 border border-brand-secondary/40 rounded-2xl text-brand-dark">
                      <FileText className="w-6 h-6 text-brand-dark" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">{docTitle}</h3>
                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Project: {doc.project || 'Central Office Tower'}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-brand-soft border border-brand-secondary/40 text-brand-dark rounded-full text-[10px] font-extrabold uppercase">
                    {fileExt} Format
                  </span>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
                    <span className="text-[10px] font-black uppercase text-brand-dark tracking-widest block">Project Document Specification Record</span>
                    <p>1.1 Official document artifact registered under project <strong>{doc.project || 'Central Office Tower'}</strong>. Catalogued in document repository vault.</p>
                    <p>1.2 File access, client portal handoffs, and revision iterations managed by Nirman Architects project team.</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-bold">Uploaded by: {doc.uploadedBy || doc.createdBy?.name || 'Staff'}</span>
                  <button
                    onClick={handleDownloadFile}
                    className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer border border-brand-secondary/40"
                  >
                    Download Document File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane (1/3 Width) - Metadata, Client Handoff, Access Audit Log */}
        <div className="lg:col-span-1 space-y-6 flex flex-col justify-between">
          
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Document Metadata
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Project Link</span>
                <strong className="font-extrabold text-slate-800 block truncate">{doc.project || 'Tower Phase'}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Folder</span>
                <strong className="font-bold text-slate-800 block truncate">{doc.folder || doc.category || 'Architecture'}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Uploaded Date</span>
                <span className="font-semibold text-slate-700 block">{doc.uploadedDate || doc.createdAt ? new Date(doc.createdAt || Date.now()).toISOString().split('T')[0] : '2026-08-14'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Uploaded By</span>
                <span className="font-semibold text-slate-700 block truncate">{doc.uploadedBy || doc.createdBy?.name || 'Bhakti Kadam'}</span>
              </div>
            </div>
          </div>

          {/* CRM Client Handoff Control */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Access Rules & Client Handoff</h4>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${
                doc.visibleToClient ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {doc.visibleToClient ? 'Client Visible' : 'Client Hidden'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>CRM Client Portal Handoff</span>
                </div>
                <button
                  type="button"
                  onClick={handleVisibilityToggle}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all shadow-3xs cursor-pointer border whitespace-nowrap shrink-0 ${
                    doc.visibleToClient
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                      : 'bg-brand-primary hover:bg-brand-secondary text-brand-dark border-brand-secondary/40'
                  }`}
                >
                  {doc.visibleToClient ? 'Hide from Client' : 'Publish to Client'}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {doc.visibleToClient 
                  ? 'Document is currently published & visible in CRM Module 6 Client Portal.' 
                  : 'Document is internal-only. Toggle to handoff and make it visible in Client Portal.'}
              </p>
            </div>
          </div>

          {/* Document Access Log Audit */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Access Log Audit</h4>
              </div>
              <button 
                onClick={fetchAccessLog}
                className="text-[10px] font-extrabold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingLogs ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {accessLogs && accessLogs.length > 0 ? (
                accessLogs.map((log, idx) => (
                  <div key={log.id || idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className={`uppercase font-black ${
                        log.action === 'DOWNLOAD' ? 'text-emerald-600' : 'text-sky-600'
                      }`}>
                        {log.action || 'VIEW'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-700 text-[11px]">
                      By {log.performedBy || 'User'} ({log.userRole || 'Staff'}) • IP: {log.ipAddress || 'Internal'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No access audit log entries recorded yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Full-Width Container (100% Width) - Revision & Version Vault */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 w-full">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Revision & Version Vault</h3>
            <p className="text-xs text-slate-500 font-medium">Document history & past revision logs</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setVersionModalMode('edit');
                setIsVersionModalOpen(true);
              }}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-xs rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              <span>Edit Revision Log</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVersionModalMode('upload');
                setIsVersionModalOpen(true);
              }}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-brand-secondary/40"
            >
              <Plus className="w-4 h-4 text-brand-dark" />
              <span>Upload New Version</span>
            </button>
          </div>
        </div>

        {/* Version Items */}
        <div className="space-y-2.5 w-full">
          {(doc.versions || [
            { version: 1, versionTag: "V1.0", date: doc.uploadedDate || "2026-08-10", uploader: doc.uploadedBy || "Staff", changeLog: "Initial document release" }
          ]).map((ver, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/50 transition-all text-xs w-full">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-brand-dark shadow-3xs shrink-0">
                  {ver.versionTag || `V${ver.version || 1}.0`}
                </span>
                <div>
                  <strong className="text-slate-800 block font-bold">Changes: {ver.changeLog || "No notes"}</strong>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">
                    Uploaded by {ver.uploader || "Staff"} on {ver.date || "2026-08-10"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button 
                  onClick={() => {
                    setVersionModalMode('edit');
                    setIsVersionModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-bold transition-all shadow-3xs cursor-pointer"
                >
                  Edit Log
                </button>
                <button 
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-[10px] font-bold transition-all shadow-3xs cursor-pointer"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version Modal (POST / PUT) */}
      <DocumentVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        doc={doc}
        mode={versionModalMode}
        onSuccess={(updatedRes) => {
          if (onUpdateDocument) onUpdateDocument({ ...doc, ...updatedRes?.data });
          fetchAccessLog();
        }}
      />

    </div>
  );
}
