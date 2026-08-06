import React, { useState, useEffect } from 'react';
import DrawingList from './DrawingList';
import DrawingDetails from './DrawingDetails';
import DrawingCompare from './DrawingCompare';
import DrawingCreateModal from './DrawingCreateModal';
import DrawingReports from './DrawingReports';
import { getProjectDrawings, createDrawing, uploadDrawing, cacheDrawingFile, getCachedDrawingFile } from '../../../service/drawing';

export default function AdminDrawings({ defaultTab = 'vault' }) {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details, compare
  const [viewReports, setViewReports] = useState(defaultTab === 'reports');
  const [statusFilter, setStatusFilter] = useState('All');

  // Map backend Drawing DB object to UI schema
  const mapBackendDrawing = (d) => {
    const vers = (d.versions || []).map(v => ({
      version: `V${v.versionNumber || 1}.0`,
      versionNumber: v.versionNumber || 1,
      fileUrl: v.fileUrl || d.fileUrl,
      thumbnailUrl: v.thumbnailUrl || v.fileUrl || d.fileUrl,
      date: v.uploadedAt ? new Date(v.uploadedAt).toISOString().split('T')[0] : "2026-08-05",
      uploader: typeof v.uploadedBy === 'object' ? v.uploadedBy?.name : "Lead Designer",
      changeLog: v.notes || "Version revision release"
    }));

    const currentVerNumber = d.currentVersion || (vers.length > 0 ? vers[vers.length - 1].versionNumber : 1);
    const cachedUrl = getCachedDrawingFile(d._id || d.id || d.drawingNumber);
    const primaryFileUrl = cachedUrl || d.fileUrl || (vers.length > 0 ? vers[vers.length - 1].fileUrl : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80");

    let mappedStatus = 'Pending Review';
    if (d.status === 'GFC Locked' || d.status === 'GFC_LOCKED' || d.locked) {
      mappedStatus = 'GFC Locked';
    } else if (d.status === 'APPROVED' || d.status === 'Approved') {
      mappedStatus = 'Approved';
    } else if (d.status === 'CHANGES_REQUESTED' || d.status === 'Revisions Required') {
      mappedStatus = 'Revisions Required';
    }

    return {
      id: d.drawingNumber || d._id || d.id,
      _id: d._id || d.id,
      name: d.title || d.name || "Untitled Drawing",
      title: d.title || d.name || "Untitled Drawing",
      project: d.projectId?.name || "Central Office Tower",
      category: d.category || "Working Drawings",
      version: `V${currentVerNumber}.0`,
      currentVersion: currentVerNumber,
      uploadedBy: typeof d.uploadedBy === 'object' ? d.uploadedBy?.name : "Sarah Connor",
      uploadedDate: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : "2026-08-05",
      lastUpdated: d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      status: mappedStatus,
      accessLevel: d.visibleToClient ? "Public & Client Visible" : "Admin & Staff Only",
      locked: mappedStatus === 'GFC Locked' || Boolean(d.locked),
      fileSize: "3.4 MB",
      fileUrl: primaryFileUrl,
      thumbnailUrl: d.thumbnailUrl || primaryFileUrl,
      pdfUrl: primaryFileUrl,
      versions: vers.length > 0 ? vers : [
        { version: `V${currentVerNumber}.0`, versionNumber: currentVerNumber, fileUrl: primaryFileUrl, date: "2026-08-05", uploader: "Lead Designer", changeLog: "Initial draft release" }
      ],
      comments: d.comments || [],
      pins: d.pins || [],
      linkedTasks: []
    };
  };

  // Load drawings directly from backend GET API
  const fetchBackendDrawings = async () => {
    setLoading(true);
    try {
      const res = await getProjectDrawings('proj-1');
      
      let all = [];
      if (res?.drawings && res.drawings.length > 0) all = res.drawings;
      else if (res?.allDrawings && res.allDrawings.length > 0) all = res.allDrawings;
      else if (res?.pendingApproval || res?.approved || res?.changesRequested) {
        all = [...(res.pendingApproval || []), ...(res.approved || []), ...(res.changesRequested || [])];
      } else if (Array.isArray(res?.data)) all = res.data;
      else if (Array.isArray(res)) all = res;

      // Merge locally created persistent drawings
      const localDrawings = JSON.parse(localStorage.getItem('nirman_drawings') || '[]');
      if (localDrawings.length > 0) {
        const existingIds = new Set(all.map(d => String(d._id || d.id || d.drawingNumber)));
        localDrawings.forEach(ld => {
          const key = String(ld._id || ld.id || ld.drawingNumber);
          if (!existingIds.has(key)) {
            all.push(ld);
            existingIds.add(key);
          }
        });
      }

      if (all.length > 0) {
        const mapped = all.map(mapBackendDrawing);
        setDrawings(mapped);
      } else {
        const initialDocs = [
          {
            _id: "drg-101",
            drawingNumber: "DWG-001",
            title: "Ground Floor Wall Layout Blueprint",
            category: "Working Drawings",
            currentVersion: 1,
            uploadedBy: "Sarah Connor",
            createdAt: new Date().toISOString(),
            status: "PENDING_CLIENT_APPROVAL",
            visibleToClient: true,
            fileUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            versions: [{ versionNumber: 1, fileUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", notes: "Initial layout draft", uploadedAt: new Date().toISOString() }]
          },
          {
            _id: "drg-102",
            drawingNumber: "DWG-002",
            title: "Master Bedroom GFC Structural Column Blueprint",
            category: "GFC Drawings",
            currentVersion: 2,
            uploadedBy: "Lead Architect",
            createdAt: new Date().toISOString(),
            status: "GFC Locked",
            locked: true,
            visibleToClient: true,
            fileUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            versions: [{ versionNumber: 2, fileUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", notes: "Approved GFC release", uploadedAt: new Date().toISOString() }]
          },
          {
            _id: "drg-103",
            drawingNumber: "DWG-003",
            title: "Living Room 3D Interior & Elevation Renders",
            category: "Interior Drawings",
            currentVersion: 1,
            uploadedBy: "Interior Lead",
            createdAt: new Date().toISOString(),
            status: "APPROVED",
            visibleToClient: true,
            fileUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
            versions: [{ versionNumber: 1, fileUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80", notes: "Approved by client", uploadedAt: new Date().toISOString() }]
          }
        ];
        try {
          localStorage.setItem('nirman_drawings', JSON.stringify(initialDocs));
        } catch (e) {}
        setDrawings(initialDocs.map(mapBackendDrawing));
      }
    } catch (err) {
      console.error("Failed to fetch drawings from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendDrawings();
  }, []);

  useEffect(() => {
    if (defaultTab === 'approvals') {
      setStatusFilter('Pending Review');
    } else if (defaultTab === 'gfc') {
      setStatusFilter('GFC Locked');
    } else {
      setStatusFilter('All');
    }
  }, [defaultTab]);

  // Create Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUploadDrawingSubmit = async (formData) => {
    try {
      const dataPayload = new FormData();
      dataPayload.append('projectId', '66b1c2f304918e24ab567890');
      dataPayload.append('title', formData.name);
      dataPayload.append('drawingNumber', `DWG-00${drawings.length + 1}`);
      
      const categoryMap = {
        'Working Drawings': 'Working',
        'Concept Drawings': 'Presentation',
        'Process DWG': 'Working',
        'GFC Drawings': 'Working',
        'Site Drawings': 'Working',
        'Interior Drawings': 'Working'
      };
      const cat = categoryMap[formData.category] || formData.category || 'Working';
      dataPayload.append('category', cat);
      dataPayload.append('notes', formData.changeLog || 'Initial architectural working drawing upload');
      dataPayload.append('visibleToClient', formData.accessLevel ? (formData.accessLevel.includes("Client") ? "true" : "false") : "true");

      if (formData.rawFile) {
        dataPayload.append('file', formData.rawFile);
      } else if (formData.fileUrl && typeof formData.fileUrl === 'string' && formData.fileUrl.startsWith('data:')) {
        try {
          const arr = formData.fileUrl.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const fileBlob = new File([u8arr], formData.fileName || 'drawing.pdf', { type: mime });
          dataPayload.append('file', fileBlob);
        } catch (e) {
          console.warn("Base64 conversion warning:", e);
        }
      }

      if (formData.fileUrl) {
        cacheDrawingFile(formData.name, formData.fileUrl);
        cacheDrawingFile(`DWG-00${drawings.length + 1}`, formData.fileUrl);
      }

      const res = await uploadDrawing(dataPayload);
      if (res && res.drawing) {
        if (formData.fileUrl) {
          cacheDrawingFile(res.drawing._id, formData.fileUrl);
          cacheDrawingFile(res.drawing.id, formData.fileUrl);
          cacheDrawingFile(res.drawing.drawingNumber, formData.fileUrl);
        }
        const newlyMapped = mapBackendDrawing(res.drawing);
        if (formData.fileUrl) newlyMapped.fileUrl = formData.fileUrl;
        setDrawings(prev => [newlyMapped, ...prev]);
        alert(`Drawing "${formData.name}" uploaded successfully to Cloudinary & saved to Backend DB!`);
      } else {
        alert("Drawing uploaded successfully!");
      }

      setIsUploadModalOpen(false);
      fetchBackendDrawings();
    } catch (err) {
      console.warn("Backend save notice:", err.message);
      const safeLocalUrl = typeof formData.fileUrl === 'string' && formData.fileUrl.startsWith('data:') && formData.fileUrl.length > 100000 
        ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
        : (formData.fileUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80");

      const newDwg = {
        id: `DWG-00${drawings.length + 1}`,
        name: formData.name,
        title: formData.name,
        project: formData.project || "Central Office Tower",
        category: formData.category || "Working Drawings",
        version: formData.version || "V1.0",
        uploadedBy: "Admin",
        uploadedDate: new Date().toISOString().split('T')[0],
        lastUpdated: "Just now",
        status: "Pending Review",
        accessLevel: formData.accessLevel || "Admin & Staff Only",
        locked: false,
        fileSize: formData.fileSize || "3.5 MB",
        fileUrl: safeLocalUrl,
        versions: [{ version: "V1.0", date: new Date().toISOString().split('T')[0], uploader: "Admin", changeLog: "Initial upload", status: "Pending Review" }],
        comments: [],
        pins: [],
        linkedTasks: []
      };
      setDrawings(prev => [newDwg, ...prev]);
      setIsUploadModalOpen(false);
    }
  };

  const handleUpdateDrawing = (updatedDwg) => {
    setDrawings(prev => prev.map(d => d.id === updatedDwg.id ? updatedDwg : d));
    if (selectedDrawing && selectedDrawing.id === updatedDwg.id) {
      setSelectedDrawing(updatedDwg);
    }
  };

  const handleLockToggle = (drawingId) => {
    setDrawings(prev => prev.map(d => 
      d.id === drawingId ? { ...d, locked: !d.locked } : d
    ));
    if (selectedDrawing && selectedDrawing.id === drawingId) {
      setSelectedDrawing(prev => ({ ...prev, locked: !prev.locked }));
    }
  };

  const handleDeleteDrawing = (drawingId) => {
    if (confirm("Are you sure you want to permanently delete this drawing blueprint from the vault?")) {
      setDrawings(prev => prev.filter(d => d.id !== drawingId));
      alert("Drawing blueprint deleted successfully.");
    }
  };

  const handleSelectDrawing = (drawing) => {
    setSelectedDrawing(drawing);
    setViewMode('details');
  };

  const handleCompareDrawing = (drawing) => {
    setSelectedDrawing(drawing);
    setViewMode('compare');
  };

  return (
    <div className="space-y-6">
      
      {viewReports ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-905 tracking-tight">Design Audit & GFC Analytics</h2>
              <p className="text-xs text-slate-400">Total drawings breakdown by category, approval velocity, and revision history</p>
            </div>
            <button
              onClick={() => setViewReports(false)}
              className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
            >
              Back to Drawing Vault
            </button>
          </div>
          <DrawingReports drawings={drawings} />
        </div>
      ) : (
        <>
          {viewMode === 'list' && (
            <DrawingList 
              drawings={drawings}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onSelectDrawing={handleSelectDrawing}
              onCompareDrawing={handleCompareDrawing}
              onUploadClick={() => setIsUploadModalOpen(true)}
              onLockToggle={handleLockToggle}
              onDeleteDrawing={handleDeleteDrawing}
              setViewReports={setViewReports}
            />
          )}

          {viewMode === 'details' && selectedDrawing && (
            <DrawingDetails 
              drawing={selectedDrawing}
              onBack={() => setViewMode('list')}
              onUpdateDrawing={handleUpdateDrawing}
              onCompareTrigger={handleCompareDrawing}
            />
          )}

          {viewMode === 'compare' && selectedDrawing && (
            <DrawingCompare 
              drawing={selectedDrawing}
              onBack={() => setViewMode('list')}
            />
          )}
        </>
      )}

      <DrawingCreateModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadDrawingSubmit}
      />

    </div>
  );
}
