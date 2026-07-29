import React, { useState, useEffect } from 'react';
import DrawingList from './DrawingList';
import DrawingDetails from './DrawingDetails';
import DrawingCompare from './DrawingCompare';
import DrawingCreateModal from './DrawingCreateModal';
import DrawingReports from './DrawingReports';

const INITIAL_DRAWINGS = [
  {
    id: "DWG-001",
    name: "Ground Floor Wall Layout Blueprint",
    project: "Central Office Tower",
    category: "Working Drawings",
    version: "V2.1",
    uploadedBy: "Sarah Connor",
    uploadedDate: "2026-07-20",
    lastUpdated: "2 hours ago",
    status: "Pending Review",
    accessLevel: "Admin & Staff Only",
    locked: false,
    fileSize: "3.4 MB",
    versions: [
      { version: "V1.0", date: "2026-07-10", uploader: "Sarah Connor", changeLog: "Initial draft wall layout", status: "Approved" },
      { version: "V2.0", date: "2026-07-18", uploader: "Alice Smith", changeLog: "Offset lobby column wall adjustment", status: "Approved" },
      { version: "V2.1", date: "2026-07-20", uploader: "Sarah Connor", changeLog: "Added elevator structural shaft dimensions", status: "Pending Review" }
    ],
    comments: [
      { id: 1, author: "Sarah Connor", message: "Needs civil check on staircase columns thickness.", date: "10 mins ago" },
      { id: 2, author: "John Wick", message: "Approved MEP layouts before scheduling wall castings.", date: "1 hour ago" }
    ],
    pins: [
      { id: 1, x: 50, y: 50, message: "Confirm column dimension matches structural code sheet", author: "Sarah Connor" },
      { id: 2, x: 150, y: 110, message: "Ensure electrical conduit clearance", author: "John Wick" }
    ],
    linkedTasks: ["TSK-401: Staircase treads detailing", "TSK-403: Verify soil capacity logs"]
  },
  {
    id: "DWG-002",
    name: "Facade Cladding Expansion Section",
    project: "Smart City Mall",
    category: "Process DWG",
    version: "V1.0",
    uploadedBy: "John Wick",
    uploadedDate: "2026-07-18",
    lastUpdated: "Yesterday",
    status: "Approved",
    accessLevel: "Admin & Staff Only",
    locked: false,
    fileSize: "4.8 MB",
    versions: [
      { version: "V1.0", date: "2026-07-18", uploader: "John Wick", changeLog: "Initial facade bracket elevation draft", status: "Approved" }
    ],
    comments: [],
    pins: [],
    linkedTasks: ["TSK-404: Alternate brackets sourcing"]
  },
  {
    id: "DWG-003",
    name: "First Floor Plan Draft",
    project: "Oceanic Luxury Villas",
    category: "Concept Drawings",
    version: "V1.1",
    uploadedBy: "Alice Smith",
    uploadedDate: "2026-07-21",
    lastUpdated: "Just now",
    status: "GFC Locked",
    accessLevel: "Public & Client Visible",
    locked: true,
    fileSize: "2.1 MB",
    versions: [
      { version: "V1.0", date: "2026-07-12", uploader: "Alice Smith", changeLog: "Initial draft villa layout plan", status: "Approved" },
      { version: "V1.1", date: "2026-07-21", uploader: "Alice Smith", changeLog: "Confirm balcony width layout V2", status: "Approved" }
    ],
    comments: [
      { id: 1, author: "Alice Smith", message: "Client signed off on larger balcony layout.", date: "2 hours ago" }
    ],
    pins: [],
    linkedTasks: []
  }
];

export default function Drawings({ defaultTab = 'all' }) {
  const [drawings, setDrawings] = useState(INITIAL_DRAWINGS);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, details, compare
  const [viewReports, setViewReports] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const handleUploadDrawingSubmit = (formData) => {
    const newId = `DWG-00${drawings.length + 1}`;
    const newDwg = {
      id: newId,
      name: formData.name,
      project: formData.project,
      category: formData.category,
      version: formData.version,
      uploadedBy: "Super Admin",
      uploadedDate: new Date().toISOString().split('T')[0],
      lastUpdated: "Just now",
      status: "Pending Review",
      accessLevel: formData.accessLevel,
      locked: false,
      fileSize: formData.fileSize,
      versions: [
        { version: formData.version, date: new Date().toISOString().split('T')[0], uploader: "Super Admin", changeLog: formData.changeLog, status: "Pending Review" }
      ],
      comments: [],
      pins: [],
      linkedTasks: []
    };

    setDrawings(prev => [newDwg, ...prev]);
    setIsUploadModalOpen(false);
    alert(`Drawing ${newId} uploaded successfully as Draft!`);
  };

  const handleUpdateDrawing = (updatedDwg) => {
    setDrawings(prev => prev.map(d => d.id === updatedDwg.id ? updatedDwg : d));
    if (selectedDrawing && selectedDrawing.id === updatedDwg.id) {
      setSelectedDrawing(updatedDwg);
    }
  };

  const handleLockToggle = (dwgId) => {
    setDrawings(prev => prev.map(d => {
      if (d.id === dwgId) {
        const nextLocked = !d.locked;
        return {
          ...d,
          locked: nextLocked,
          status: nextLocked ? 'GFC Locked' : 'Approved'
        };
      }
      return d;
    }));
  };

  const handleSelectDrawing = (drawing) => {
    setSelectedDrawing(drawing);
    setViewMode('details');
  };

  const handleCompareTrigger = (drawing) => {
    setSelectedDrawing(drawing);
    setViewMode('compare');
  };

  return (
    <div className="space-y-6">
      
      {viewReports ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Drawing Analytics Reports</h2>
              <p className="text-xs text-slate-400">Approval ratios, category counts, and uploads velocity trends</p>
            </div>
            <button
              onClick={() => setViewReports(false)}
              className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-3xs"
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
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              projectFilter={projectFilter}
              setProjectFilter={setProjectFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              onSelectDrawing={handleSelectDrawing}
              onUploadClick={() => setIsUploadModalOpen(true)}
              onLockToggle={handleLockToggle}
              setViewReports={setViewReports}
            />
          )}

          {viewMode === 'details' && selectedDrawing && (
            <DrawingDetails 
              drawing={selectedDrawing}
              onBack={() => setViewMode('list')}
              onUpdateDrawing={handleUpdateDrawing}
              onCompareTrigger={handleCompareTrigger}
            />
          )}

          {viewMode === 'compare' && selectedDrawing && (
            <DrawingCompare 
              drawing={selectedDrawing}
              onBack={() => setViewMode('details')}
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
