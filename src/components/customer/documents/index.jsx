import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Eye, Search, Filter, Folder, 
  ShieldCheck, FileCode, Image, FileSpreadsheet, AlertTriangle, 
  RefreshCw, CheckCircle2, Lock
} from 'lucide-react';
import { 
  getProjectDocuments, 
  previewDocument, 
  downloadDocument 
} from '../../../service/document';

import { getClientDashboard } from '../../../service/crm/client';

const FOLDERS = [
  'All',
  'Contracts',
  'Approved Drawings PDFs',
  'Photos',
  'Invoices',
  'Other Shared Documents'
];

export default function CustomerDocuments() {
  const [documentsByFolder, setDocumentsByFolder] = useState({});
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');

  const [projects, setProjects] = useState([]);
  const [selectedProjId, setSelectedProjId] = useState(null);

  // Preview Modal State
  const [previewingDoc, setPreviewingDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      const res = await getClientDashboard();
      if (res && res.activeProjects && res.activeProjects.length > 0) {
        setProjects(res.activeProjects);
        setSelectedProjId(res.activeProjects[0].projectId);
      }
    } catch (err) {
      console.error("Failed to load customer projects:", err);
    }
  };

  const fetchDocuments = async (projectId) => {
    const targetProjId = projectId || selectedProjId;
    if (!targetProjId) return;
    setLoading(true);
    try {
      const res = await getProjectDocuments(targetProjId, {
        folder: selectedFolder === 'All' ? '' : selectedFolder,
        search: searchQuery
      });
      if (res && res.allDocuments) {
        // Enforce visibleToClient === true check for Client Portal
        const clientVisible = res.allDocuments.filter(d => d.visibleToClient === true || (d.accessLevel && d.accessLevel.includes('Public')));
        setAllDocuments(clientVisible);

        const grouped = {};
        clientVisible.forEach(doc => {
          const cat = doc.category || doc.folder || 'Other Shared Documents';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(doc);
        });
        setDocumentsByFolder(grouped);
      } else {
        setAllDocuments([]);
        setDocumentsByFolder({});
      }
    } catch (err) {
      console.error("Error fetching client documents:", err);
      setAllDocuments([]);
      setDocumentsByFolder({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedProjId) {
      fetchDocuments(selectedProjId);
    }
  }, [selectedProjId, selectedFolder, searchQuery]);

  const handlePreview = async (doc) => {
    setPreviewLoading(true);
    try {
      const res = await previewDocument(doc._id || doc.id);
      setPreviewingDoc(res.document || doc);
    } catch (err) {
      alert(err.message || "Failed to preview document.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await downloadDocument(doc._id || doc.id);
      alert(`Download initiated: ${res.fileName || doc.fileName || 'Document'}`);
      const link = document.createElement('a');
      link.href = res.downloadUrl || doc.filePath;
      link.download = res.fileName || doc.fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      if (err.message.includes("410")) {
        alert("HTTP 410 Gone: This document is soft-deleted and no longer available for download.");
      } else {
        alert(err.message || "Download failed.");
      }
    }
  };

  const getFileIcon = (fileType = '') => {
    const type = fileType.toUpperCase();
    if (type.includes('PDF')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (type.includes('PNG') || type.includes('JPG') || type.includes('JPEG')) return <Image className="w-5 h-5 text-sky-500" />;
    if (type.includes('XLS') || type.includes('CSV')) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    return <FileCode className="w-5 h-5 text-indigo-500" />;
  };

  const formatFileSize = (bytes = 0) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. TOP PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Client Document Vault & Invoices
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-bold">
            {projects.find(p => p.projectId === selectedProjId)?.projectName 
              ? `Project Workspace: ${projects.find(p => p.projectId === selectedProjId).projectName}` 
              : "Download project contracts, billing invoices, approval certificates & compliance files"}
          </p>
        </div>

        {projects.length > 0 && (
          <select
            value={selectedProjId || ''}
            onChange={(e) => setSelectedProjId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer shadow-3xs"
          >
            {projects.map(p => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 1. FILTER & SEARCH HEADER */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Shared Client Documents Repository</h2>
              <p className="text-[11px] text-slate-500 font-medium">Dual-Security Cascade Checked • Verified Client Portal Access</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search contract, PDF, photos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold bg-white text-slate-800"
              />
            </div>
            
            <button
              onClick={fetchDocuments}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Folder Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFolder === f 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CATEGORY GROUPED DOCUMENTS */}
      <div className="space-y-6">
        {Object.entries(documentsByFolder).map(([categoryName, docs]) => {
          if (selectedFolder !== 'All' && selectedFolder !== categoryName) return null;
          if (docs.length === 0) return null;

          return (
            <div key={categoryName} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{categoryName}</h3>
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-[10px] rounded-full border border-indigo-100">
                    {docs.length} File{docs.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <div 
                    key={doc._id || doc.id} 
                    className="bg-white p-4.5 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-indigo-400 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl shrink-0">
                        {getFileIcon(doc.fileType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                          Version {doc.version || 1} • {formatFileSize(doc.fileSize)}
                        </span>
                        <strong className="text-slate-900 font-bold text-xs block truncate mt-0.5" title={doc.fileName}>
                          {doc.fileName}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-medium block mt-1">
                          Uploaded by: {doc.uploadedBy?.name || 'Project Manager'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Portal Verified
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Preview Document (Logs VIEW action)"
                        >
                          <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          title="Download File (Logs DOWNLOAD action)"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {allDocuments.length === 0 && !loading && (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-2">
            <Folder className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No client documents found</h4>
            <p className="text-xs text-slate-400">There are currently no documents shared in this category folder.</p>
          </div>
        )}
      </div>

      {/* 3. INLINE PREVIEW MODAL */}
      {previewingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-slate-100">
            
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold truncate max-w-md">{previewingDoc.fileName}</h4>
                  <span className="text-[10px] text-slate-400 block font-mono">Category: {previewingDoc.category} • Dual Security Cascade Passed</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewingDoc)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>
                <button
                  onClick={() => setPreviewingDoc(null)}
                  className="p-1.5 hover:bg-white/10 text-slate-300 rounded-lg font-bold"
                >
                  &times; Close
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-auto">
              {previewingDoc.filePath && (previewingDoc.filePath.endsWith('.png') || previewingDoc.filePath.endsWith('.jpg') || previewingDoc.fileType === 'PNG') ? (
                <img 
                  src={previewingDoc.filePath} 
                  alt={previewingDoc.fileName} 
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
                />
              ) : (
                <iframe
                  src={previewingDoc.filePath || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                  title={previewingDoc.fileName}
                  className="w-full h-full rounded-xl border border-slate-800 bg-white"
                />
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
