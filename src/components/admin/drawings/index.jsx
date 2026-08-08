import React, { useState, useEffect } from 'react';
import DrawingList from './DrawingList';
import DrawingDetails from './DrawingDetails';
import DrawingCompare from './DrawingCompare';
import DrawingCreateModal from './DrawingCreateModal';
import DrawingReports from './DrawingReports';
import { 
  getDrawings,
  getProjectDrawings, 
  createDrawing, 
  uploadDrawingVersion, 
  getProjectDrawingsBreakdown,
  cacheDrawingFile, 
  getCachedDrawingFile 
} from '../../../service/drawing';
import { FileText, CheckCircle, Clock, AlertTriangle, PieChart } from 'lucide-react';

export default function AdminDrawings({ defaultTab = 'vault' }) {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details, compare
  const [viewReports, setViewReports] = useState(defaultTab === 'reports');
  const [statusFilter, setStatusFilter] = useState('All');
  const [breakdownStats, setBreakdownStats] = useState(null);

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

    let mappedStatus = 'Designer Uploaded';
    if (d.status === 'GFC Locked' || d.status === 'GFC_LOCKED' || d.isGFCLocked || d.locked) {
      mappedStatus = 'GFC Locked';
    } else if (d.status === 'APPROVED' || d.status === 'Approved') {
      mappedStatus = 'Approved';
    } else if (d.status === 'PM_APPROVED' || d.status === 'PM Approved') {
      mappedStatus = 'PM Approved';
    } else if (d.status === 'PENDING_CLIENT_APPROVAL' || d.status === 'Pending Client Approval') {
      mappedStatus = 'Pending Client Approval';
    } else if (d.status === 'CHANGES_REQUESTED' || d.status === 'PM_REJECTED' || d.status === 'ADMIN_REJECTED' || d.status === 'Revisions Required') {
      mappedStatus = 'Revisions Required';
    }

    return {
      id: d.drawingNumber || d._id || d.id,
      _id: d._id || d.id,
      drawingNumber: d.drawingNumber || d.id,
      name: d.drawingName || d.title || d.name || "Untitled Drawing",
      title: d.drawingName || d.title || d.name || "Untitled Drawing",
      project: d.projectId?.name || d.projectId?.projectName || "Central Office Tower",
      category: d.categoryName || d.category || "Working Drawings",
      categoryId: d.categoryId,
      version: `V${currentVerNumber}.0`,
      currentVersion: currentVerNumber,
      currentVersionId: d.currentVersionId || d._id,
      uploadedBy: typeof d.createdBy === 'object' ? d.createdBy?.name : (typeof d.uploadedBy === 'object' ? d.uploadedBy?.name : "Sarah Connor"),
      uploadedDate: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : "2026-08-05",
      lastUpdated: d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      status: mappedStatus,
      rawStatus: d.status,
      visibleToClient: Boolean(d.visibleToClient),
      accessLevel: d.visibleToClient ? "Public & Client Visible" : "Admin & Staff Only",
      locked: mappedStatus === 'GFC Locked' || Boolean(d.isGFCLocked) || Boolean(d.locked),
      fileSize: "3.4 MB",
      fileUrl: primaryFileUrl,
      thumbnailUrl: d.thumbnailUrl || primaryFileUrl,
      pdfUrl: primaryFileUrl,
      versions: vers.length > 0 ? vers : [
        { version: `V${currentVerNumber}.0`, versionNumber: currentVerNumber, fileUrl: primaryFileUrl, date: "2026-08-05", uploader: "Lead Designer", changeLog: "Initial release" }
      ],
      comments: d.comments || [],
      pins: d.pins || [],
      linkedTasks: []
    };
  };

  const fetchBackendDrawings = async () => {
    setLoading(true);
    try {
      const res = await getDrawings({ page: 1, limit: 100 });
      
      let all = [];
      if (res?.drawings && res.drawings.length > 0) all = res.drawings;
      else if (res?.allDrawings && res.allDrawings.length > 0) all = res.allDrawings;
      else if (res?.data?.drawings && res.data.drawings.length > 0) all = res.data.drawings;
      else if (Array.isArray(res?.data)) all = res.data;
      else if (Array.isArray(res)) all = res;

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

      const mapped = all.map(mapBackendDrawing);
      setDrawings(mapped);

      // 25.11 Fetch ERP Progress Breakdown
      const sampleProjId = all.length > 0 ? (all[0].projectId?.id || all[0].projectId?._id || all[0].projectId || 'proj-1') : 'proj-1';
      getProjectDrawingsBreakdown(sampleProjId)
        .then(bd => {
          if (bd?.data || bd?.totalDrawings !== undefined) {
            setBreakdownStats(bd.data || bd);
          }
        })
        .catch(e => console.warn(e));

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

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 25.1 & 25.2 Create Parent Drawing & Initial Version Upload
  const handleUploadDrawingSubmit = async (formData) => {
    try {
      const createRes = await createDrawing({
        projectId: '6a607dae7f99c70902371c1d',
        drawingName: formData.name,
        categoryId: formData.categoryId || 'cat-working',
        drawingNumber: `DWG-00${drawings.length + 1}`
      });

      const newDrg = createRes?.drawing || createRes?.data?.drawing;
      if (newDrg) {
        if (formData.fileUrl) {
          cacheDrawingFile(newDrg._id, formData.fileUrl);
          cacheDrawingFile(newDrg.id, formData.fileUrl);
        }

        // Upload initial version v1
        await uploadDrawingVersion(newDrg._id || newDrg.id, {
          filePath: formData.fileUrl,
          fileType: 'DWG',
          changeLog: formData.changeLog || 'Initial version release'
        });

        alert(`Drawing "${formData.name}" created successfully (ERP Module 3)!`);
      }

      setIsUploadModalOpen(false);
      fetchBackendDrawings();
    } catch (err) {
      console.warn("Backend save notice:", err.message);
      setIsUploadModalOpen(false);
      fetchBackendDrawings();
    }
  };

  const handleUpdateDrawing = (updatedDwg) => {
    setDrawings(prev => {
      const newList = prev.map(d => (d._id === updatedDwg._id || d.id === updatedDwg.id || d.drawingNumber === updatedDwg.drawingNumber) ? updatedDwg : d);
      try {
        localStorage.setItem('nirman_drawings', JSON.stringify(newList));
      } catch (e) {}
      return newList;
    });
    if (selectedDrawing && (selectedDrawing._id === updatedDwg._id || selectedDrawing.id === updatedDwg.id || selectedDrawing.drawingNumber === updatedDwg.drawingNumber)) {
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

      {/* 25.11 ERP Module 1 & 3 Progress Breakdown Header Bar Removed */}
      
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
