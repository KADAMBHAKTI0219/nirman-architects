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
import DocumentVersionModal from './DocumentVersionModal';
import { detectFileType, getCleanFileUrl } from '../../../utils/fileTypeDetector';

export default function DocumentDetails({
  doc,
  onBack,
  onUpdateDocument
}) {
  const [isFullMarkupMode, setIsFullMarkupMode] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedRole, setSelectedRole] = useState(doc.accessLevel || 'Public & Staff');
  const [accessLogs, setAccessLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionModalMode, setVersionModalMode] = useState('upload');

  const docId = doc ? (doc._id || doc.id) : null;
  const docTitle = doc?.documentName || doc?.fileName || doc?.name || 'Untitled Document.pdf';
  const rawFileUrl = doc?.filePath || doc?.fileUrl || doc?.url || doc?.currentVersionId?.filePath || doc?.currentVersionId?.fileUrl || '';
  
  const fileUrl = getCleanFileUrl(rawFileUrl);
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
  }, [docId]);

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

  // Post Comment Annotation
  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newHistory = [
      ...(doc.downloadHistory || []),
      { user: "Super Admin", role: "Admin", date: "Just now", version: `Comment: ${commentText}` }
    ];
    if (onUpdateDocument) {
      onUpdateDocument({
        ...doc,
        downloadHistory: newHistory
      });
    }
    setCommentText('');
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
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Navigation Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200 cursor-pointer"
            title="Back to Document Vault"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {docId}
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase border border-indigo-100">
                {fileExt}
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 leading-tight">{docTitle}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsFullMarkupMode(true)}
            className="px-3.5 py-2 crm-brand-btn font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Open PDF Markup Editor</span>
          </button>

          <button
            onClick={handleVisibilityToggle}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
              doc.visibleToClient 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{doc.visibleToClient ? 'Hide from Client' : 'Publish to Client'}</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Pane (2/3 Width) - Preview & Version Vault */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* File Preview Canvas */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
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

            {isPdf && fileUrl ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 min-h-[380px] overflow-hidden">
                <iframe 
                  src={fileUrl.includes('#') ? fileUrl : `${fileUrl}#toolbar=1`}
                  title={docTitle}
                  className="w-full h-[400px] rounded-xl border-none"
                />
              </div>
            ) : isImage ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 min-h-[320px] max-h-[460px] flex flex-col items-center justify-center relative overflow-hidden group">
                <img 
                  src={fileUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80"} 
                  alt={docTitle}
                  className="max-h-[380px] w-auto object-contain rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.01]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
                <span className="text-[10px] text-slate-400 font-mono mt-3">
                  Image Resolution: High quality • File Type: {fileExt}
                </span>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 font-mono text-xs space-y-3 min-h-[300px] overflow-y-auto">
                <div className="border-b border-slate-700 pb-2 flex justify-between items-center text-xs font-bold text-sky-400">
                  <span>DOCUMENT PREVIEW: {docTitle.toUpperCase()}</span>
                  <span className="text-[10px] text-slate-400">{fileExt} FORMAT</span>
                </div>
                <div className="text-slate-300 space-y-2 pt-2 text-[11px] leading-relaxed">
                  <p className="text-slate-400"># SECTION 1. PROJECT CHARTER & SPECIFICATION SHEET</p>
                  <p>1.1 NIRMAN ARCHITECTS agrees to provide detailed structural blueprints, site excavation coordinates, and GFC drawings catalogued under contract {doc.project || 'Tower Phase'}.</p>
                  <p>1.2 The designated project manager lead is authorized for document handoffs and version releases.</p>
                  <p className="text-slate-400"># SECTION 2. COMPLIANCE & MATERIAL STANDARDS</p>
                  <p>2.1 Concrete footings shall undergo soil bearing capacity checks as outlined in Geotechnical logs.</p>
                </div>
              </div>
            )}
          </div>

          {/* Revision & Version Vault */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Revision & Version Vault</h3>
                <p className="text-xs text-slate-500">Document history & past revision logs</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVersionModalMode('edit');
                    setIsVersionModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Revision Log
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVersionModalMode('upload');
                    setIsVersionModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  + Upload New Version
                </button>
              </div>
            </div>

            {/* Version Items */}
            <div className="space-y-2.5">
              {(doc.versions || [
                { version: 1, versionTag: "V1.0", date: doc.uploadedDate || "2026-08-10", uploader: doc.uploadedBy || "Staff", changeLog: "Initial document release" }
              ]).map((ver, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-100/50 transition-all text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-indigo-700 shadow-3xs">
                      {ver.versionTag || `V${ver.version || 1}.0`}
                    </span>
                    <div>
                      <strong className="text-slate-800 block font-bold">Changes: {ver.changeLog || "No notes"}</strong>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">
                        Uploaded by {ver.uploader || "Staff"} on {ver.date || "2026-08-10"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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

        </div>

        {/* Right Pane (1/3 Width) - Metadata, Client Handoff, Access Audit Log */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
              Document Metadata
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Project Link</span>
                <strong className="font-extrabold text-slate-800 block">{doc.project || 'Tower Phase'}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Folder</span>
                <strong className="font-bold text-slate-800 block">{doc.folder || doc.category || 'Contracts'}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Uploaded Date</span>
                <span className="font-semibold text-slate-700 block">{doc.uploadedDate || '2026-08-10'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Uploaded By</span>
                <span className="font-semibold text-slate-700 block">{doc.uploadedBy || 'Bhakti Kadam'}</span>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>CRM Client Portal Handoff</span>
                </div>
                <button
                  type="button"
                  onClick={handleVisibilityToggle}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-3xs cursor-pointer ${
                    doc.visibleToClient
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {accessLogs && accessLogs.length > 0 ? (
                accessLogs.map((log, idx) => (
                  <div key={log.id || idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className={`uppercase font-black ${
                        log.action === 'DOWNLOAD' ? 'text-emerald-600' : 'text-sky-600'
                      }`}>
                        {log.action || 'VIEW'}
                      </span>
                      <span className="text-slate-400">
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
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
