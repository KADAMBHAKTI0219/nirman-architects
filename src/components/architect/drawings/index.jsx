import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, FileDown, Lock, Unlock, MessageSquare, Layers, 
  Upload, ArrowLeft, Trash2, CheckCircle, ChevronDown, RefreshCw, ShieldCheck 
} from 'lucide-react';
import DrawingViewer from '../../common/DrawingViewer';
import { 
  getProjectDrawings, 
  getClientApprovalLog 
} from '../../../service/drawing';

export default function ArchitectDrawings() {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  
  // Viewer and Modal states
  const [viewerDwg, setViewerDwg] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Working');

  const loadDrawings = async () => {
    setLoading(true);
    try {
      const res = await getProjectDrawings('proj-1');
      if (res && res.allDrawings) {
        setDrawings(res.allDrawings);
      }
    } catch (err) {
      console.error("Failed to load architect drawings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrawings();
  }, []);

  const filteredDrawings = drawings.filter(d => {
    const title = d.title || d.name || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (d.drawingNumber && d.drawingNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'All' || d.category === selectedType;
    return matchesSearch && matchesType;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDwg = {
      _id: `drg-${Date.now()}`,
      title: newTitle,
      drawingNumber: `AR-REV-${drawings.length + 1}`,
      category: newCategory,
      currentVersion: 1,
      fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
      status: "PENDING_CLIENT_APPROVAL",
      visibleToClient: true,
      versions: [
        { versionNumber: 1, fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', notes: 'Uploaded by Architect', uploadedAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    };

    setDrawings([newDwg, ...drawings]);
    setUploadOpen(false);
    setNewTitle('');
    alert("New architectural revision uploaded & sent for Client/PM Approval!");
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* 1. FILTER HEADER BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex gap-3 flex-wrap items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search drawings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold bg-white text-slate-800"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Working">Working Drawings</option>
            <option value="GFC">GFC (Good For Construction)</option>
            <option value="Interior">Interior 3D Renders</option>
            <option value="Concept">Concept Drawings</option>
          </select>

          <button
            onClick={loadDrawings}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Upload className="w-4 h-4" />
          Upload New Revision
        </button>

      </div>

      {/* 2. GRID GALLERY */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-semibold">Loading CAD blueprints from server...</p>
        </div>
      ) : filteredDrawings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDrawings.map(dwg => {
            const isApproved = dwg.status === 'APPROVED';
            const isPending = dwg.status === 'PENDING_CLIENT_APPROVAL';

            return (
              <div 
                key={dwg._id || dwg.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden hover:border-indigo-400 transition-all flex flex-col justify-between"
              >
                {/* Thumbnail */}
                <div className="bg-slate-900 p-4 h-32 flex items-center justify-center relative select-none">
                  <img 
                    src={dwg.thumbnailUrl || dwg.fileUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"} 
                    alt={dwg.title} 
                    className="w-full h-full object-cover rounded-xl opacity-80"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[9px] font-black uppercase text-sky-400 border border-white/10">
                    V{dwg.currentVersion || 1}
                  </span>
                </div>

                <div className="p-4 space-y-3.5">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{dwg.drawingNumber || dwg._id} &bull; {dwg.category || 'Architectural'}</span>
                    <strong className="text-slate-900 block text-xs font-bold truncate mt-0.5" title={dwg.title}>{dwg.title}</strong>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {isApproved ? 'APPROVED' : isPending ? 'PENDING CLIENT' : 'CHANGES REQUESTED'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewerDwg(dwg)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                        title="Inspect Blueprint & Client Logs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-2">
          <Layers className="w-8 h-8 text-slate-300 mx-auto mb-1" />
          <p className="text-xs font-semibold text-slate-700">No drawings found.</p>
          <p className="text-[11px] text-slate-400">Click "Upload New Revision" to add blueprint drawings.</p>
        </div>
      )}

      {/* 3. UPLOAD MODAL */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <strong className="text-slate-900 font-extrabold text-sm">Upload New Drawing Revision</strong>
              <button onClick={() => setUploadOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs font-medium text-slate-700">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Drawing Title *</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Bedroom Column Grid Layout"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Category</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-bold"
                >
                  <option value="Working">Working Drawing</option>
                  <option value="GFC">GFC (Good For Construction)</option>
                  <option value="Interior">Interior Renders</option>
                  <option value="Concept">Concept Draft</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  Upload & Notify Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL SCREEN INTERACTIVE DRAWING VIEWER WITH CLIENT APPROVAL LOGS */}
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
