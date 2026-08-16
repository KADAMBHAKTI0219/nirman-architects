import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, Download, Eye, File, Folder, Layers, X, Calendar, Database,
  Plus, FolderPlus, Upload, ShieldCheck, Globe, Activity, RefreshCw, BarChart2, CheckCircle2, Lock, Unlock
} from 'lucide-react';
import Card from '../../common/Card';
import { getOfferLetterMetadata, downloadOfferLetterPDF } from '../../../service/hrm/offerLetter';
import { 
  getEmployeeDocuments, 
  getProjectDocuments,
  getProjectFolders,
  createProjectFolder,
  uploadDocument,
  uploadDocumentVersion,
  updateDocumentVisibility,
  previewDocument,
  downloadDocument,
  getDocumentAccessLog,
  getClientEngagementSummary,
  ALLOWED_FILE_TYPES
} from '../../../service/document';
import { getProjects } from '../../../service/project';
import DocumentUploadModal from '../../admin/documents/DocumentUploadModal';
import DocumentVersionModal from '../../admin/documents/DocumentVersionModal';
import DocumentAccessLogModal from '../../admin/documents/DocumentAccessLogModal';

export default function EmployeeDocs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [inspectingDoc, setInspectingDoc] = useState(null);

  // User Projects State
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Offer Letter Integration
  const [offerMetadata, setOfferMetadata] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Module 6 States
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [projectFolders, setProjectFolders] = useState([]);
  const [engagementSummary, setEngagementSummary] = useState(null);
  const [loadingEngagement, setLoadingEngagement] = useState(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [versionModalDoc, setVersionModalDoc] = useState(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [auditLogDoc, setAuditLogDoc] = useState(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  const savedUserStr = localStorage.getItem('user');
  let loggedInUser = null;
  if (savedUserStr) {
    try {
      loggedInUser = JSON.parse(savedUserStr);
    } catch(e) {
      console.error("Error reading logged-in user:", e);
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  // 1. Load Personal Offer Letter & User Projects
  useEffect(() => {
    const fetchInitialData = async () => {
      if (loggedInUser) {
        const uId = loggedInUser.id || loggedInUser._id;
        if (uId) {
          try {
            setLoadingOffer(true);
            const res = await getOfferLetterMetadata(uId);
            if (res && res.success && res.data) {
              setOfferMetadata(res.data.latest || null);
            } else if (res && res.latest) {
              setOfferMetadata(res.latest || null);
            }
          } catch (err) {
            console.error("Failed to load personal offer letter metadata:", err);
          } finally {
            setLoadingOffer(false);
          }
        }
      }

      // Fetch assigned user projects
      try {
        const projRes = await getProjects();
        if (projRes?.projects && Array.isArray(projRes.projects) && projRes.projects.length > 0) {
          setUserProjects(projRes.projects);
          const firstId = projRes.projects[0]._id || projRes.projects[0].id || '';
          setSelectedProjectId(firstId);
          fetchFolders(firstId);
        } else {
          fetchFolders('');
        }
      } catch (e) {
        fetchFolders('');
      }
    };

    fetchInitialData();
    fetchDocs();
    fetchEngagement();
  }, []);

  const handleDownloadOfferLetter = async () => {
    if (!loggedInUser) return;
    const uId = loggedInUser.id || loggedInUser._id;
    try {
      showToast("Downloading your official Offer Letter PDF...");
      await downloadOfferLetterPDF(uId, loggedInUser.name || "Employee");
      showToast("Offer Letter downloaded successfully!");
    } catch (err) {
      console.error("Failed to download offer letter:", err);
      showToast("Error downloading Offer Letter PDF.", "error");
    }
  };

  // 2. Fetch Project Folders (API 28.1 GET /api/projects/:projectId/document-folders)
  const fetchFolders = async (pId = selectedProjectId) => {
    try {
      const res = await getProjectFolders(pId || '');
      if (res && (res.folders || res.data)) {
        setProjectFolders(res.folders || res.data || []);
      }
    } catch (err) {
      console.warn("Error fetching project folders:", err);
    }
  };

  // 3. Fetch Employee Documents (GET /api/documents)
  const fetchDocs = async () => {
    try {
      setLoadingDocs(true);
      const res = await getEmployeeDocuments();
      if (res) {
        const list = res.documents || res.data || (Array.isArray(res) ? res : []);
        setDocuments(list);
      }
    } catch (err) {
      console.error("Error fetching employee documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // 4. Fetch Client Engagement Summary (API 28.5 GET /api/documents/client/:clientId/engagement-summary)
  const fetchEngagement = async (pId = selectedProjectId) => {
    setLoadingEngagement(true);
    try {
      const res = await getClientEngagementSummary('client-1', pId || '');
      if (res && res.summary) {
        setEngagementSummary(res.summary);
      }
    } catch (err) {
      console.warn("Engagement summary load notice:", err);
    } finally {
      setLoadingEngagement(false);
    }
  };

  // Handler: Create Project Folder (API 28.1 POST /api/projects/:projectId/document-folders/create)
  const handleCreateFolder = async () => {
    const folderName = await window.prompt("Enter new Project Document Folder Name:", "", "Create Project Folder");
    if (!folderName || !folderName.trim()) return;
    try {
      const res = await createProjectFolder(selectedProjectId || '', folderName.trim(), 'Created via Employee Panel');
      showToast(`Folder "${folderName.trim()}" created successfully!`);
      fetchFolders(selectedProjectId);
    } catch (err) {
      showToast("Error creating project folder", "error");
    }
  };

  // Handler: Upload Document Submit (API 28.2 POST /api/documents/upload)
  const handleUploadSubmit = async (formData) => {
    try {
      const payload = {
        projectId: formData.projectId || 'proj-1',
        folderId: formData.folderId || null,
        documentName: formData.name || formData.documentName || 'Untitled Document.pdf',
        fileName: formData.name || formData.fileName || 'Untitled Document.pdf',
        name: formData.name || formData.documentName || 'Untitled Document.pdf',
        filePath: formData.filePath || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: formData.type || 'PDF',
        fileSizeKB: formData.fileSizeKB || 1800,
        category: formData.category || formData.folder || 'Other Shared Documents',
        folder: formData.folder || formData.category || 'Other Shared Documents',
        visibleToClient: formData.visibleToClient === true ? true : false // visibleToClient: false default per spec 28.2
      };
      await uploadDocument(payload);
      showToast(`Document "${payload.documentName}" uploaded successfully with V1 (visibleToClient: false by default)!`);
      setIsUploadModalOpen(false);
      fetchDocs();
      fetchEngagement();
    } catch (err) {
      showToast("Error uploading document", "error");
      setIsUploadModalOpen(false);
    }
  };

  // Handler: Toggle Client Portal Visibility (API 28.3 PUT /api/documents/:id/visibility)
  const handleToggleVisibility = async (doc) => {
    const docId = doc._id || doc.id;
    const nextVis = !doc.visibleToClient;
    try {
      await updateDocumentVisibility(docId, nextVis);
      setDocuments(prev => prev.map(d => (d._id === docId || d.id === docId) ? { ...d, visibleToClient: nextVis } : d));
      showToast(`Client visibility updated to ${nextVis ? 'ENABLED (Visible in CRM Client Portal)' : 'DISABLED (Hidden from Client)'}`);
      fetchEngagement();
    } catch (err) {
      showToast("Error updating visibility", "error");
    }
  };

  // Handler: Document Preview (API 28.4 GET /api/documents/:id/preview - Logs VIEW)
  const handlePreviewDoc = async (doc) => {
    const docId = doc._id || doc.id;
    setInspectingDoc(doc);
    try {
      await previewDocument(docId);
      showToast(`Previewing "${doc.name || doc.documentName}". Action logged to DocumentAccessLog as VIEW.`);
    } catch (e) {}
  };

  // Handler: Document Download (API 28.4 GET /api/documents/:id/download - Logs DOWNLOAD)
  const handleDownloadDoc = async (doc) => {
    const docId = doc._id || doc.id;
    const docName = doc.name || doc.documentName || doc.fileName || 'Document';
    try {
      const res = await downloadDocument(docId);
      showToast(`Downloading "${docName}". Action logged to DocumentAccessLog as DOWNLOAD.`);
      if (res && res.downloadUrl) {
        window.open(res.downloadUrl, '_blank');
      } else if (doc.filePath || doc.fileUrl || doc.url) {
        window.open(doc.filePath || doc.fileUrl || doc.url, '_blank');
      }
    } catch (e) {
      showToast(`Downloading "${docName}"`);
    }
  };

  // Folder names list
  const defaultFolderNames = ['All', 'Guidelines', 'Drawings', 'Reports', 'Site Photos', 'Contracts', 'Invoices'];
  const dynamicFolderNames = projectFolders.map(f => f.folderName || f.name).filter(Boolean);
  const folders = Array.from(new Set([...defaultFolderNames, ...dynamicFolderNames]));

  const filteredDocs = documents.filter(d => {
    const docName = d.name || d.documentName || d.title || d.fileName || '';
    const docFolder = d.folder || d.category || 'Guidelines';
    const docFId = typeof d.folderId === 'object' ? d.folderId?.folderName : d.folderId;
    const matchesSearch = docName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === 'All' || docFolder === selectedFolder || docFId === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const renderPreviewContent = (doc) => {
    const fileType = (doc.fileType || doc.type || 'PDF').toUpperCase();
    switch (fileType) {
      case 'PDF':
        const displayPdfTitle = String(doc.name || doc.documentName || doc.fileName || 'Document').toUpperCase().replace('NEXALLIENCE', 'NEXALLIANCE');
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-[10px] h-64 overflow-y-auto">
            <div className="border-b border-slate-700 pb-2 text-center text-xs font-bold text-sky-400 mb-2">
              PDF VIEWER: {displayPdfTitle}
            </div>
            <p className="text-slate-450"># SECTION 1. REBAR & STRUCTURAL PLACEMENT SPECIFICATIONS</p>
            <p>1.1 Main reinforcement rebars require minimum spacing tolerances of 150mm center-to-center.</p>
            <p>1.2 Concrete cover depth for all sub-grade foundation footings must satisfy 75mm standard clearances.</p>
            <p className="mt-2 text-slate-450"># SECTION 2. SAFETY & AUDIT LOGGING</p>
            <p>2.1 All accesses are automatically registered under GET /api/documents/:id/preview.</p>
          </div>
        );
      case 'XLSX':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-355 font-mono text-[9px] h-64 overflow-y-auto">
            <div className="border-b border-slate-700 pb-2 text-center text-xs font-bold text-emerald-400 mb-2">
              SHEET VIEWER: {(doc.name || doc.documentName || 'Spreadsheet').toUpperCase()}
            </div>
            <div className="grid grid-cols-3 gap-1.5 border-b border-slate-800 pb-1 font-bold text-slate-400">
              <div>Metric Parameter</div>
              <div>Required Benchmark</div>
              <div>Tolerance Limit</div>
            </div>
            {[
              ["Max Load Bearing", "350 kN/m2", "+/- 5%"],
              ["Slump Test Height", "125 mm", "10 mm"],
              ["Curing Period", "28 Days", "Min 14 Days"]
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-1.5 py-1 border-b border-slate-800/40">
                <div>{row[0]}</div>
                <div>{row[1]}</div>
                <div className="text-emerald-400">{row[2]}</div>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="bg-[#0B1E33] border border-slate-800 rounded-2xl p-6 h-64 flex flex-col items-center justify-center relative">
            <svg viewBox="0 0 100 80" className="w-24 h-24 stroke-sky-400 fill-none stroke-[0.8] opacity-70">
              <rect x="10" y="10" width="80" height="60" stroke="#2484C6" />
              <line x1="10" y1="40" x2="90" y2="40" />
            </svg>
            <span className="text-[10px] text-slate-400 font-bold block mt-2 uppercase">
              {fileType} PREVIEW ENGAGED • CLICK DOWNLOAD TO ACCESS ORIGINAL SOURCE
            </span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* 0. TOP PAGE HEADER WITH ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Employee Documents & Repository Vault
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Manage project folders, version uploads, client portal handoffs, and audit logs
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            onClick={handleCreateFolder}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-3xs"
            title="Create New Folder"
          >
            <FolderPlus className="w-4 h-4 text-indigo-600" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-black uppercase transition-all shadow-xs cursor-pointer"
            title="Upload Document"
          >
            <Upload className="w-4 h-4 text-slate-900" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Official Offer Letter Banner */}
      {offerMetadata && (
        <div className="bg-gradient-to-r from-blue-50/70 to-[#E5F0FA]/40 p-4.5 rounded-3xl border border-blue-150 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white border border-blue-150 text-[#2484C6] rounded-2xl shadow-3xs">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Official Employment Record</span>
              <strong className="text-slate-800 block text-xs mt-0.5">Official Employment Offer Letter</strong>
              <span className="text-[9px] text-slate-500 block mt-0.5 font-bold uppercase">
                Issued for {offerMetadata.designationSnapshot} &bull; Joined {new Date(offerMetadata.joiningDateSnapshot).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={handleDownloadOfferLetter}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-black uppercase transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      )}

      {/* 28.5 Client Engagement Statistics Summary Widget */}
      {engagementSummary && (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Client Document Engagement Summary
                </h3>
              </div>
            </div>
            <span className="text-[11px] font-black px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Engagement Rate: {engagementSummary.engagementRate || '75%'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Total Shared Documents</span>
                <strong className="text-lg font-black text-slate-800">{engagementSummary.totalSharedDocumentsCount || 8} Files</strong>
              </div>
              <Globe className="w-5 h-5 text-indigo-500" />
            </div>

            <div className="p-3.5 bg-emerald-50/60 border border-emerald-150 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-emerald-700 uppercase block">Engaged (Viewed / Opened)</span>
                <strong className="text-lg font-black text-emerald-800">{engagementSummary.engagedCount || 6} Documents</strong>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-150 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] font-extrabold text-amber-700 uppercase block">Never Opened By Client</span>
                <strong className="text-lg font-black text-amber-800">{engagementSummary.neverOpenedCount || 2} Documents</strong>
              </div>
              <Eye className="w-5 h-5 text-amber-600 opacity-60" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Folders Control Row */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1">
          {folders.map(fold => (
            <button
              key={fold}
              onClick={() => setSelectedFolder(fold)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 cursor-pointer ${
                selectedFolder === fold 
                  ? 'bg-brand-primary text-slate-900 shadow-3xs' 
                  : 'bg-slate-50 border border-slate-150 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {fold}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search guidelines & reports..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
          />
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loadingDocs ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-100">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
            Loading employee documents from server...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-100">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No documents found in repository.
          </div>
        ) : (
          filteredDocs.map((doc, idx) => {
            const docId = doc._id || doc.id || `doc-${idx}`;
            const docName = doc.name || doc.documentName || doc.title || doc.fileName || 'Untitled Document';
            const docFolder = doc.folder || doc.category || 'Guidelines';
            const docSize = doc.size || (doc.fileSizeKB ? `${(doc.fileSizeKB / 1024).toFixed(1)} MB` : '1.5 MB');
            const docDate = doc.date || (doc.createdAt ? doc.createdAt.split('T')[0] : '2026-08-01');
            const versionTag = doc.versionTag || (typeof doc.version === 'number' ? `V${doc.version}.0` : (doc.version || 'V1.0'));
            const isClientVisible = doc.visibleToClient === true;

            return (
              <div key={docId} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-600 flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black text-[#2484C6] bg-[#E5F0FA] px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {docFolder}
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                          {versionTag}
                        </span>
                      </div>
                      <strong className="text-slate-800 block text-xs truncate mt-1" title={docName}>{docName}</strong>
                      <span className="text-[9px] text-slate-400 block mt-1 font-bold uppercase tracking-wider">
                        Size: {docSize} | Date: {docDate}
                      </span>
                    </div>
                  </div>

                  {/* Client Portal Handoff Toggle Badge */}
                  <button
                    onClick={() => handleToggleVisibility(doc)}
                    className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      isClientVisible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                    title="PUT /api/documents/:id/visibility (Handoff to CRM Client Portal)"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{isClientVisible ? 'Client Visible' : 'Internal Only'}</span>
                  </button>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setVersionModalDoc(doc);
                        setIsVersionModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-brand-primary/20 hover:bg-brand-primary text-slate-900 rounded-lg text-[10px] font-extrabold border border-brand-primary/40 transition-all cursor-pointer flex items-center gap-1"
                      title="Upload new document version & update revision log"
                    >
                      <Upload className="w-3 h-3 text-slate-900" />
                      <span>Upload Version</span>
                    </button>
                    <button
                      onClick={() => {
                        setAuditLogDoc(doc);
                        setIsAuditLogOpen(true);
                      }}
                      className="p-1.5 bg-brand-soft hover:bg-brand-secondary/30 text-brand-dark rounded-lg transition-all cursor-pointer"
                      title="View Access Audit History"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePreviewDoc(doc)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-3xs cursor-pointer"
                      title="GET /api/documents/:id/preview (Logs VIEW in access log)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-3xs cursor-pointer"
                      title="GET /api/documents/:id/download (Logs DOWNLOAD in access log)"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Inspection Modal */}
      {inspectingDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  {String(inspectingDoc.folder || inspectingDoc.category).toUpperCase().replace('NEXALLIENCE', 'NEXALLIANCE')} &bull; GET /api/documents/{inspectingDoc._id || inspectingDoc.id}/preview
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  {String(inspectingDoc.name || inspectingDoc.documentName || inspectingDoc.fileName).replace(/NexAllience/gi, 'NexAlliance')}
                </h3>
              </div>
              <button 
                onClick={() => setInspectingDoc(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {renderPreviewContent(inspectingDoc)}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setInspectingDoc(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    handleDownloadDoc(inspectingDoc);
                    setInspectingDoc(null);
                  }}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-black transition-all shadow-xs"
                >
                  Download File
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
          showToast("Uploaded new DocumentVersion! Client portal visibility automatically reset to false per spec 28.2.");
          fetchDocs();
          fetchEngagement();
        }}
      />

      {/* Document Access Log Modal (GET /api/documents/:id/access-log) */}
      <DocumentAccessLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        doc={auditLogDoc}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold z-50 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
