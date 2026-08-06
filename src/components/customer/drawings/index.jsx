import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Download, Check, X, MessageSquare, 
  Layers, ChevronDown, CheckCircle, AlertTriangle, RefreshCw, ShieldCheck,
  FileText, LayoutGrid, List, CheckCircle2
} from 'lucide-react';
import Card from '../../common/Card';
import DataTable from '../../common/DataTable';
import DrawingViewer from '../../common/DrawingViewer';
import { 
  getProjectDrawings, 
  approveDrawing, 
  requestDrawingChanges, 
  getClientApprovalLog 
} from '../../../service/drawing';

export default function CustomerDrawings() {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid' (Table view matches Admin panel!)
  
  // Selected Drawing for Details / Full Screen Viewer
  const [selectedDwg, setSelectedDwg] = useState(null);
  const [viewerDwg, setViewerDwg] = useState(null);
  const [commentText, setCommentText] = useState('');

  const loadDrawings = async () => {
    setLoading(true);
    try {
      const res = await getProjectDrawings('proj-1');
      if (res && res.allDrawings) {
        setDrawings(res.allDrawings);
        if (!selectedDwg && res.allDrawings.length > 0) {
          setSelectedDwg(res.allDrawings[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load customer drawings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrawings();
  }, []);

  const filteredDrawings = (drawings || []).filter(d => {
    if (!d) return false;
    const title = (d.title || d.name || '').toLowerCase();
    const queryStr = (searchQuery || '').toLowerCase();
    const matchesSearch = title.includes(queryStr);
    const matchesStatus = !selectedStatus || selectedStatus === 'All' || d.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id) => {
    try {
      const res = await approveDrawing(id, "Approved by client via Client Portal");
      alert(res.message || "Drawing approved successfully!");
      loadDrawings();
    } catch (err) {
      alert("Error approving drawing.");
    }
  };

  const handleReject = async (id) => {
    const reason = commentText.trim() || await window.prompt("Please enter mandatory change request notes:", "", "Request Revisions");
    if (!reason || !reason.trim()) return;

    try {
      const res = await requestDrawingChanges(id, reason);
      alert(res.message || "Change request submitted to Architect!");
      setCommentText('');
      loadDrawings();
    } catch (err) {
      alert("Error submitting change request.");
    }
  };

  // Columns definition for Admin-style Approvals Queue DataTable
  const drawingColumns = [
    {
      header: "Drawing Title & ID",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span 
              className="font-extrabold text-slate-900 block cursor-pointer hover:text-brand-accent transition-colors text-xs"
              onClick={() => setViewerDwg(row)}
            >
              {row.title || row.name || 'Architectural Layout'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              {row.drawingNumber || row._id || 'DWG-101'} &bull; {row.category || 'Working'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Revision Version",
      accessor: "currentVersion",
      render: (row) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded-lg font-mono">
          V{row.currentVersion || 1}.0
        </span>
      )
    },
    {
      header: "Architect Uploader",
      accessor: "uploader",
      render: (row) => (
        <span className="text-xs text-slate-700 font-bold">
          {row.uploadedBy?.name || 'Sarah Connor (Architect)'}
        </span>
      )
    },
    {
      header: "Approval Stage",
      accessor: "status",
      render: (row) => {
        const isApproved = row.status === 'APPROVED';
        const isPending = row.status === 'PENDING_CLIENT_APPROVAL' || row.status?.includes('Pending');
        return (
          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
            isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            isPending ? 'bg-sky-50 text-sky-700 border border-sky-200' :
            'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {isApproved ? 'APPROVED' : isPending ? 'PENDING SIGN-OFF' : 'REVISIONS REQUESTED'}
          </span>
        );
      }
    },
    {
      header: "Action Queue",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewerDwg(row)}
            className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold rounded-xl text-xs transition-all shadow-3xs cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View & Sign</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 w-full pb-12">
      
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Client Drawing Approvals Hub
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Review architectural blueprints, sign-off GFC releases, and submit design revision notes
          </p>
        </div>

        {/* View Switcher & Refresh */}
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white border border-slate-200 rounded-xl flex gap-1 shadow-3xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-brand-primary text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Approvals Queue</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-brand-primary text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cards Grid</span>
            </button>
          </div>

          <button
            onClick={loadDrawings}
            className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. RESPONSIVE SEARCH & STATUS FILTER STRIP */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search project drawings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold bg-white text-slate-800"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING_CLIENT_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="CHANGES_REQUESTED">Revisions Requested</option>
          </select>
        </div>
      </div>

      {/* 3. ADMIN-STYLE DRAWING APPROVALS QUEUE TABLE VIEW / GRID VIEW */}
      {viewMode === 'table' ? (
        <Card title="Approvals Queue" subtitle="Drawing revisions requiring final GFC/Client release signatures (Matches Admin Command Format)">
          <DataTable 
            columns={drawingColumns} 
            data={filteredDrawings} 
            searchPlaceholder="Search project drawings..."
            exportTitle="Client Drawing Approvals Queue"
          />
        </Card>
      ) : (
        /* CLEAN CARDS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrawings.map(d => {
            const dwgId = d._id || d.id;
            const isApproved = d.status === 'APPROVED';
            const isPending = d.status === 'PENDING_CLIENT_APPROVAL' || d.status?.includes('Pending');

            return (
              <div 
                key={dwgId}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300 transition-all p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="p-4 bg-brand-soft/60 rounded-2xl border border-brand-secondary/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide font-mono">
                        V{d.currentVersion || 1}.0 &bull; {d.category || 'Architectural'}
                      </span>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      isPending ? 'bg-sky-50 text-sky-700 border-sky-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {isApproved ? 'APPROVED' : isPending ? 'PENDING' : 'REVISIONS'}
                    </span>
                  </div>

                  <div>
                    <strong className="text-slate-900 block text-sm font-extrabold truncate" title={d.title}>
                      {d.title || d.name}
                    </strong>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      {d.drawingNumber || dwgId}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {d.uploadedBy?.name || 'Sarah Connor (Architect)'}
                  </span>
                  <button
                    onClick={() => setViewerDwg(d)}
                    className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Sign</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL SCREEN INTERACTIVE DRAWING VIEWER MODAL */}
      {viewerDwg && (
        <DrawingViewer
          drawing={viewerDwg}
          onClose={() => setViewerDwg(null)}
          onStatusChange={() => {
            loadDrawings();
          }}
        />
      )}

    </div>
  );
}
