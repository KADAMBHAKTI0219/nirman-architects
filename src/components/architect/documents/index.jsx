import React, { useState, useEffect } from 'react';
import { 
  Search, Folder, FileText, Download, Eye, Upload, X, ArrowLeft, RefreshCw, FolderPlus,
  ShieldCheck, Globe, Activity, CheckCircle2
} from 'lucide-react';
import Card from '../../common/Card';
import { 
  getProjectDocuments, 
  previewDocument, 
  downloadDocument, 
  uploadDocument, 
  uploadDocumentVersion, 
  createProjectFolder, 
  getProjectFolders, 
  getEmployeeDocuments,
  updateDocumentVisibility,
  getClientEngagementSummary,
  ALLOWED_FILE_TYPES
} from '../../../service/document';
import DocumentUploadModal from '../../admin/documents/DocumentUploadModal';
import DocumentVersionModal from '../../admin/documents/DocumentVersionModal';
import DocumentAccessLogModal from '../../admin/documents/DocumentAccessLogModal';

export default function ArchitectDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectingDoc, setInspectingDoc] = useState(null);
  
  // Modals & Extras
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [versionModalDoc, setVersionModalDoc] = useState(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [auditLogDoc, setAuditLogDoc] = useState(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [projectFolders, setProjectFolders] = useState([]);

  const categories = ['All', 'Design briefs', 'Contracts', 'Approved Drawings PDFs', 'Photos', 'Site documents', 'Invoices'];

  const fetchFolders = async () => {
    try {
      const res = await getProjectFolders('proj-1');
      if (res && (res.folders || res.data)) {
        setProjectFolders(res.folders || res.data || []);
      }
    } catch (e) {}
  };

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await getProjectDocuments('proj-1', { folder: selectedCategory === 'All' ? '' : selectedCategory, search: searchQuery });
      let list = [];
      if (res && Array.isArray(res.allDocuments) && res.allDocuments.length > 0) {
        list = res.allDocuments;
      } else {
        const empRes = await getEmployeeDocuments();
        if (empRes && (empRes.documents || empRes.data)) {
          list = Array.isArray(empRes.documents) ? empRes.documents : (Array.isArray(empRes.data) ? empRes.data : []);
        }
      }
      setDocuments(list);
    } catch (err) {
      console.warn("Failed to load documents:", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchDocs();
  }, [selectedCategory]);

  const filteredDocs = documents.filter(d => {
    const title = (d.name || d.documentName || d.title || '').toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory || d.folder === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUploadSubmit = async (formData) => {
    try {
      const payload = {
        projectId: formData.projectId || 'proj-1',
        folderId: formData.folderId || null,
        documentName: formData.name || formData.documentName || 'Architect Blueprint.pdf',
        fileName: formData.name || formData.fileName || 'Architect Blueprint.pdf',
        name: formData.name || formData.documentName || 'Architect Blueprint.pdf',
        filePath: formData.filePath || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: formData.type || 'PDF',
        fileSizeKB: formData.fileSizeKB || 1800,
        category: formData.category || formData.folder || 'Design briefs',
        folder: formData.folder || formData.category || 'Design briefs',
        visibleToClient: formData.visibleToClient === true ? true : false
      };
      await uploadDocument(payload);
      alert(`Document "${payload.documentName}" uploaded successfully with V1 (visibleToClient: false by default)!`);
      setIsUploadModalOpen(false);
      fetchDocs();
    } catch (err) {
      alert("Error uploading document");
      setIsUploadModalOpen(false);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = await window.prompt("Enter new Project Folder name:", "", "Create Folder");
    if (!folderName || !folderName.trim()) return;
    try {
      await createProjectFolder('proj-1', folderName.trim(), 'Created by Architect');
      fetchFolders();
      fetchDocs();
      alert(`Folder "${folderName.trim()}" created successfully! (POST /api/projects/proj-1/document-folders/create)`);
    } catch (err) {
      alert("Error creating folder");
    }
  };

  const handleToggleVisibility = async (doc) => {
    const docId = doc._id || doc.id;
    const nextVis = !doc.visibleToClient;
    try {
      await updateDocumentVisibility(docId, nextVis);
      setDocuments(prev => prev.map(d => (d._id === docId || d.id === docId) ? { ...d, visibleToClient: nextVis } : d));
      alert(`Client visibility updated to ${nextVis ? 'ENABLED (Visible in Client Portal)' : 'DISABLED (Hidden from Client)'}`);
    } catch (err) {
      alert("Error updating visibility");
    }
  };

  const handlePreviewDoc = async (doc) => {
    const docId = doc._id || doc.id;
    setInspectingDoc(doc);
    try {
      await previewDocument(docId);
    } catch (e) {}
  };

  const handleDownloadDoc = async (doc) => {
    const docId = doc._id || doc.id;
    const docName = doc.name || doc.documentName || doc.title || 'Document';
    try {
      const res = await downloadDocument(docId);
      if (res && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      } else if (doc.filePath || doc.fileUrl || doc.url) {
        window.open(doc.filePath || doc.fileUrl || doc.url, '_blank');
      } else {
        alert(`Downloading: ${docName}`);
      }
    } catch (e) {
      alert(`Downloading: ${docName}`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800">
      
      {/* 1. FILTER HEADER BAR */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-brand-primary text-slate-905 shadow-3xs' 
                  : 'bg-slate-50 border border-slate-150 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
          </div>
          
          <button
            onClick={handleCreateFolder}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-all border border-slate-200 flex items-center gap-1 shrink-0 cursor-pointer"
            title="POST /api/projects/:projectId/document-folders/create"
          >
            <FolderPlus className="w-4 h-4 text-indigo-600" />
            <span>New Folder</span>
          </button>
          
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-brand-primary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-3xs flex items-center gap-1 shrink-0 cursor-pointer"
            title="POST /api/documents/upload"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      {/* 2. CARD GRID VIEW */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-medium">Fetching live documents from server...</p>
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDocs.map((doc, idx) => {
            const docId = doc._id || doc.id || `drg-doc-${idx}`;
            const docName = doc.name || doc.documentName || doc.title || 'Architect Blueprint.pdf';
            const docCategory = doc.category || doc.folder || 'Design briefs';
            const docSize = doc.size || (doc.fileSizeKB ? `${(doc.fileSizeKB / 1024).toFixed(1)} MB` : '2.4 MB');
            const docDate = doc.date || (doc.createdAt ? doc.createdAt.split('T')[0] : '2026-08-08');
            const versionTag = doc.versionTag || (typeof doc.version === 'number' ? `V${doc.version}.0` : (doc.version || 'V1.0'));
            const isClientVisible = doc.visibleToClient === true;

            return (
              <div 
                key={docId} 
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#2484C6]/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-450 flex-shrink-0">
                      <FileText className="w-5 h-5 text-[#2484C6]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150 uppercase tracking-wider">
                          {docCategory}
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                          {versionTag}
                        </span>
                      </div>
                      <strong className="text-slate-805 block text-xs truncate mt-1" title={docName}>{docName}</strong>
                      <span className="text-[9px] text-slate-400 block mt-1 font-bold uppercase tracking-wider">
                        Size: {docSize} | Date: {docDate}
                      </span>
                    </div>
                  </div>

                  {/* Client Portal Handoff Toggle Badge (PUT /api/documents/:id/visibility) */}
                  <button
                    onClick={() => handleToggleVisibility(doc)}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      isClientVisible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                    title="PUT /api/documents/:id/visibility"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{isClientVisible ? 'Client Visible' : 'Internal Only'}</span>
                  </button>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setVersionModalDoc(doc);
                        setIsVersionModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-extrabold border border-slate-200 transition-all cursor-pointer"
                      title="POST /api/documents/:id/versions/upload"
                    >
                      + New Version
                    </button>
                    <button
                      onClick={() => {
                        setAuditLogDoc(doc);
                        setIsAuditLogOpen(true);
                      }}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-all cursor-pointer"
                      title="GET /api/documents/:id/access-log"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePreviewDoc(doc)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl transition-all shadow-3xs cursor-pointer"
                      title="GET /api/documents/:id/preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className="p-1.5 bg-white border border-slate-205 hover:bg-slate-55 text-slate-500 rounded-xl transition-all shadow-3xs cursor-pointer"
                      title="GET /api/documents/:id/download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 p-8 space-y-2">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700">No documents found.</p>
          <p className="text-[11px] text-slate-400">Click "Upload File" above to add new project documents.</p>
        </div>
      )}

      {/* 3. INSPECTION MODAL */}
      {inspectingDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inspectingDoc.category || inspectingDoc.folder} &bull; Version {inspectingDoc.versionTag || `V${inspectingDoc.version || 1}.0`}</span>
                <h3 className="text-sm font-black text-slate-905">{inspectingDoc.name || inspectingDoc.documentName}</h3>
              </div>
              <button 
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-[10px] h-48 overflow-y-auto">
                <div className="border-b border-slate-750 pb-2 text-center text-xs font-bold text-sky-400 mb-2 uppercase">
                  PDF PREVIEW: {inspectingDoc.name || inspectingDoc.documentName}
                </div>
                <p className="text-slate-500"># Nirman Architects Document Registry</p>
                <p className="mt-2">1. All structural calculations require concrete grade validations (M30/M40 mix profiles).</p>
                <p>2. Column load bearings must satisfy standard engineering seismic guidelines Zone IV specs.</p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setInspectingDoc(null)}
                  className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    handleDownloadDoc(inspectingDoc);
                    setInspectingDoc(null);
                  }}
                  className="px-4 py-2 bg-brand-primary text-slate-905 rounded-xl text-xs font-black transition-all shadow-3xs cursor-pointer"
                >
                  Download Document
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadSubmit}
      />

      {/* Document Version Modal (POST /api/documents/:id/versions/upload) */}
      <DocumentVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        doc={versionModalDoc}
        mode="upload"
        onSuccess={() => {
          alert("Uploaded new DocumentVersion! Client portal visibility automatically reset to false per spec 28.2.");
          fetchDocs();
        }}
      />

      {/* Document Access Log Modal (GET /api/documents/:id/access-log) */}
      <DocumentAccessLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        doc={auditLogDoc}
      />

    </div>
  );
}
