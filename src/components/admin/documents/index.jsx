import React, { useState, useEffect } from 'react';
import DocumentList from './DocumentList';
import DocumentDetails from './DocumentDetails';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentReports from './DocumentReports';

const INITIAL_DOCUMENTS = [
  {
    id: "DOC-101",
    name: "Structural Load Analysis.pdf",
    project: "Central Office Tower",
    folder: "Reports",
    type: "PDF",
    version: "V1.2",
    uploadedBy: "Sarah Connor",
    uploadedDate: "2026-07-15",
    accessLevel: "Admin & PM Only",
    confidential: true,
    locked: false,
    fileSize: "4.2 MB",
    versions: [
      { version: "V1.0", date: "2026-07-01", uploader: "Sarah Connor", changeLog: "Initial draft load checks" },
      { version: "V1.1", date: "2026-07-08", uploader: "Alice Smith", changeLog: "Corrected staircase support deadweight" },
      { version: "V1.2", date: "2026-07-15", uploader: "Sarah Connor", changeLog: "Final approved structural analysis release" }
    ],
    downloadHistory: [
      { user: "John Wick", role: "Project Manager", date: "2 hours ago", version: "V1.2" },
      { user: "Bob Johnson", role: "Site Engineer", date: "Yesterday", version: "V1.1" }
    ]
  },
  {
    id: "DOC-102",
    name: "Land Survey compaction report.xlsx",
    project: "Smart City Mall",
    folder: "Site Photos",
    type: "XLSX",
    version: "V1.0",
    uploadedBy: "Bob Johnson",
    uploadedDate: "2026-07-10",
    accessLevel: "Public & Staff",
    confidential: false,
    locked: false,
    fileSize: "2.1 MB",
    versions: [
      { version: "V1.0", date: "2026-07-10", uploader: "Bob Johnson", changeLog: "Compaction trial pits logs complete" }
    ],
    downloadHistory: [
      { user: "Sarah Connor", role: "Lead Architect", date: "2 days ago", version: "V1.0" }
    ]
  },
  {
    id: "DOC-103",
    name: "Facade brackets drawings catalog.zip",
    project: "Smart City Mall",
    folder: "Drawings",
    type: "ZIP",
    version: "V2.0",
    uploadedBy: "John Wick",
    uploadedDate: "2026-07-20",
    accessLevel: "Admin Only",
    confidential: true,
    locked: true,
    fileSize: "18.5 MB",
    versions: [
      { version: "V1.0", date: "2026-07-12", uploader: "John Wick", changeLog: "Bracket elevation dwg drafts" },
      { version: "V2.0", date: "2026-07-20", uploader: "John Wick", changeLog: "Locked production-ready brackets drawings" }
    ],
    downloadHistory: [
      { user: "Frank Castle", role: "Supervisor", date: "Yesterday", version: "V2.0" }
    ]
  },
  {
    id: "DOC-104",
    name: "Client Billing Milestone Contract.pdf",
    project: "Oceanic Luxury Villas",
    folder: "Contracts",
    type: "PDF",
    version: "V1.0",
    uploadedBy: "Sarah Connor",
    uploadedDate: "2026-07-18",
    accessLevel: "Admin Only",
    confidential: true,
    locked: false,
    fileSize: "1.2 MB",
    versions: [
      { version: "V1.0", date: "2026-07-18", uploader: "Sarah Connor", changeLog: "Signed contract stage billing agreements" }
    ],
    downloadHistory: []
  }
];

export default function Documents({ defaultTab = 'vault' }) {
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details
  const [viewReports, setViewReports] = useState(defaultTab === 'reports');

  useEffect(() => {
    setViewReports(defaultTab === 'reports');
  }, [defaultTab]);

  // Filters State
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUploadDocumentSubmit = (formData) => {
    const newId = `DOC-${100 + documents.length + 1}`;
    const newDoc = {
      id: newId,
      name: formData.name,
      project: formData.project,
      folder: formData.folder,
      type: formData.type,
      version: formData.version,
      uploadedBy: "Super Admin",
      uploadedDate: new Date().toISOString().split('T')[0],
      accessLevel: formData.accessLevel,
      confidential: formData.confidential,
      locked: false,
      fileSize: formData.fileSize,
      versions: [
        { version: formData.version, date: new Date().toISOString().split('T')[0], uploader: "Super Admin", changeLog: formData.changeLog }
      ],
      downloadHistory: []
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadModalOpen(false);
    alert(`Document ${newId} registered successfully in ${formData.folder}!`);
  };

  const handleUpdateDocument = (updatedDoc) => {
    setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    if (selectedDocument && selectedDocument.id === updatedDoc.id) {
      setSelectedDocument(updatedDoc);
    }
  };

  const handleLockToggle = (docId) => {
    setDocuments(prev => prev.map(d => 
      d.id === docId ? { ...d, locked: !d.locked } : d
    ));
    // Sync active drawer lock state
    if (selectedDocument && selectedDocument.id === docId) {
      setSelectedDocument(prev => ({ ...prev, locked: !prev.locked }));
    }
  };

  const handleDeleteFile = (docId) => {
    if (confirm("Are you sure you want to permanently delete this document from the project vault?")) {
      setDocuments(prev => prev.filter(d => d.id !== docId));
      alert("Document deleted successfully.");
    }
  };

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc);
    setViewMode('details');
  };

  const handleCreateFolderClick = () => {
    const folderName = prompt("Enter new directory folder name:");
    if (folderName) {
      alert(`Directory folder '${folderName}' created successfully!`);
    }
  };

  return (
    <div className="space-y-6">
      
      {viewReports ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-905 tracking-tight">Storage Analytics Reports</h2>
              <p className="text-xs text-slate-400">Total data capacity ratios, file type distributions, and uploads over time</p>
            </div>
            <button
              onClick={() => setViewReports(false)}
              className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-3xs"
            >
              Back to Document Vault
            </button>
          </div>
          <DocumentReports documents={documents} />
        </div>
      ) : (
        <>
          {viewMode === 'list' && (
            <DocumentList 
              documents={documents}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedFolder={selectedFolder}
              setSelectedFolder={setSelectedFolder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              onSelectDocument={handleSelectDocument}
              onUploadClick={() => setIsUploadModalOpen(true)}
              onCreateFolderClick={handleCreateFolderClick}
              onLockToggle={handleLockToggle}
              onDeleteFile={handleDeleteFile}
              setViewReports={setViewReports}
            />
          )}

          {viewMode === 'details' && selectedDocument && (
            <DocumentDetails 
              doc={selectedDocument}
              onBack={() => setViewMode('list')}
              onUpdateDocument={handleUpdateDocument}
            />
          )}
        </>
      )}

      <DocumentUploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadDocumentSubmit}
      />

    </div>
  );
}
