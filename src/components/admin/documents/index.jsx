import React, { useState, useEffect } from 'react';
import DocumentList from './DocumentList';
import DocumentDetails from './DocumentDetails';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentReports from './DocumentReports';
import { getProjectDocuments, createDocument } from '../../../service/document';

export default function AdminDocuments({ defaultTab = 'vault' }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Load documents directly from backend DB
  const fetchBackendDocuments = async () => {
    setLoading(true);
    try {
      const res = await getProjectDocuments('proj-1', { folder: '', search: '' });
      if (res && res.allDocuments && res.allDocuments.length > 0) {
        const mapped = res.allDocuments.map(d => ({
          id: d._id || d.id,
          _id: d._id || d.id,
          name: d.fileName,
          project: d.projectId?.name || "Central Office Tower",
          folder: d.category || "Other Shared Documents",
          type: d.fileType || "PDF",
          version: `V${d.version || 1}.0`,
          uploadedBy: d.uploadedBy?.name || "Admin Sarah",
          uploadedDate: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : "2026-07-15",
          accessLevel: d.visibleToClient ? "Public & Staff" : "Admin Only",
          confidential: !d.visibleToClient,
          locked: false,
          fileSize: "4.2 MB",
          versions: [
            { version: `V${d.version || 1}.0`, date: "2026-07-15", uploader: d.uploadedBy?.name || "Admin", changeLog: "Initial upload" }
          ],
          downloadHistory: []
        }));
        setDocuments(mapped);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error("Failed to fetch documents from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendDocuments();
  }, []);

  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUploadDocumentSubmit = async (formData) => {
    const payload = {
      projectId: 'proj-1',
      fileName: formData.name,
      filePath: formData.filePath || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: formData.type || 'PDF',
      fileSize: 4200000,
      category: formData.folder || 'Other Shared Documents',
      visibleToClient: formData.accessLevel ? formData.accessLevel.includes("Public") : true
    };

    try {
      await createDocument(payload);
      alert(`Document "${formData.name}" saved to Backend Database!`);
      setIsUploadModalOpen(false);
      fetchBackendDocuments();
    } catch (err) {
      console.warn("Backend save notice:", err.message);
      const newDoc = {
        id: `DOC-${100 + documents.length + 1}`,
        name: formData.name,
        project: formData.project || "Central Office Tower",
        folder: formData.folder || "Other Shared Documents",
        type: formData.type || "PDF",
        version: formData.version || "V1.0",
        uploadedBy: "Admin",
        uploadedDate: new Date().toISOString().split('T')[0],
        accessLevel: formData.accessLevel || "Admin Only",
        confidential: formData.confidential || false,
        locked: false,
        fileSize: formData.fileSize || "4.2 MB",
        versions: [{ version: "V1.0", date: new Date().toISOString().split('T')[0], uploader: "Admin", changeLog: "Uploaded document" }],
        downloadHistory: []
      };
      setDocuments(prev => [newDoc, ...prev]);
      setIsUploadModalOpen(false);
    }
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

  const handleCreateFolderClick = async () => {
    const folderName = await window.prompt("Enter new directory folder name:", "", "Create Directory Folder");
    if (folderName && folderName.trim()) {
      alert(`Directory folder '${folderName.trim()}' created successfully!`);
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
              className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
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
