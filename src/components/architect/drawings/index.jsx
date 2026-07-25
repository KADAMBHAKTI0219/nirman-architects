import React, { useState } from 'react';
import { 
  Search, Eye, FileDown, Lock, Unlock, MessageSquare, Layers, 
  Upload, ArrowLeft, Trash2, CheckCircle, ChevronDown, RefreshCw 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_DRAWINGS = [
  { id: "DWG-201", name: "First Floor Plan Column Layouts", project: "Central Office Tower", type: "Working Drawing", version: "V1.1", status: "Approved", date: "2026-07-21", comments: 2 },
  { id: "DWG-202", name: "HVAC Duct Sizing & Layout Drafts", project: "Smart City Mall", type: "MEP Plans", version: "V1.0", status: "Under Review", date: "2026-07-22", comments: 1 },
  { id: "DWG-203", name: "Lobby Interior Rendering Schema", project: "Oceanic Luxury Villas", type: "Concept Design", version: "V2.0", status: "Revisions Required", date: "2026-07-18", comments: 4 }
];

export default function Drawings() {
  const [drawings, setDrawings] = useState(INITIAL_DRAWINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  
  // Modal / Drawer inspect states
  const [inspectingDwg, setInspectingDwg] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProj, setNewProj] = useState('Central Office Tower');
  const [newType, setNewType] = useState('Working Drawing');

  const filteredDrawings = drawings.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProj = selectedProject === 'All' || d.project === selectedProject;
    const matchesType = selectedType === 'All' || d.type === selectedType;
    return matchesSearch && matchesProj && matchesType;
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDwg = {
      id: `DWG-${200 + drawings.length + 1}`,
      name: newTitle,
      project: newProj,
      type: newType,
      version: "V1.0",
      status: "Under Review",
      date: new Date().toISOString().split('T')[0],
      comments: 0
    };

    setDrawings([newDwg, ...drawings]);
    setUploadOpen(false);
    setNewTitle('');
    alert("Revision uploaded successfully!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. FILTER HEADER BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex gap-3 flex-wrap items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search drawings..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
            />
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Projects</option>
            <option value="Central Office Tower">Central Office Tower</option>
            <option value="Smart City Mall">Smart City Mall</option>
            <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Types</option>
            <option value="Working Drawing">Working Drawings</option>
            <option value="MEP Plans">MEP Plans</option>
            <option value="Concept Design">Concept Design</option>
          </select>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
        >
          <Upload className="w-4 h-4" />
          Upload Drawing
        </button>

      </div>

      {/* 2. GRID GALLERY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {filteredDrawings.map(dwg => (
          <div 
            key={dwg.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden hover:border-[#2484C6]/40 transition-all flex flex-col justify-between"
          >
            {/* Blueprint preview thumbnail mock */}
            <div className="bg-[#0A192F] p-4 h-28 flex items-center justify-center relative select-none">
              <svg viewBox="0 0 100 80" className="w-20 h-20 stroke-sky-500 fill-none stroke-[0.8] opacity-60">
                <rect x="10" y="10" width="80" height="60" stroke="#1D4ED8" />
                <line x1="10" y1="40" x2="90" y2="40" />
                <circle cx="50" cy="40" r="10" />
              </svg>
              <span className="absolute bottom-2 right-2 bg-slate-900/60 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-sky-400">
                {dwg.version}
              </span>
            </div>

            <div className="p-4 space-y-3.5">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{dwg.id} &bull; {dwg.project}</span>
                <strong className="text-slate-805 block text-xs truncate mt-0.5" title={dwg.name}>{dwg.name}</strong>
              </div>

              <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  dwg.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  dwg.status === 'Under Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-rose-50 text-rose-600 border-rose-100'
                }`}>{dwg.status}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setInspectingDwg(dwg)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-3xs"
                    title="Inspect Blueprint"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => alert(`Downloading drawing file: ${dwg.name}`)}
                    className="p-1.5 bg-white border border-slate-205 hover:bg-slate-55 text-slate-500 rounded-xl transition-all shadow-3xs"
                    title="Download File"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>

      {/* 3. UPLOAD MODAL */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <strong className="text-slate-800 text-sm">Upload New Drawing Revision</strong>
              <button onClick={() => setUploadOpen(false)} className="text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4 text-xs font-semibold text-slate-550">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block uppercase">Drawing Name *</label>
                <input 
                  type="text" 
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ground Floor Electrical Layout"
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase">Project</label>
                  <select 
                    value={newProj} 
                    onChange={(e) => setNewProj(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white"
                  >
                    <option value="Central Office Tower">Central Office Tower</option>
                    <option value="Smart City Mall">Smart City Mall</option>
                    <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block uppercase">Drawing Type</label>
                  <select 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white"
                  >
                    <option value="Working Drawing">Working Drawing</option>
                    <option value="MEP Plans">MEP Plans</option>
                    <option value="Concept Design">Concept Design</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-brand-primary text-slate-905 rounded-xl font-black uppercase text-center shadow-3xs"
              >
                Submit Drawing Revision
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. DETAIL INSPECTOR DRAWER */}
      {inspectingDwg && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl border-l border-slate-100 flex flex-col justify-between overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
            
            <div className="space-y-5">
              <div className="flex justify-between items-start border-b border-slate-50 pb-3">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{inspectingDwg.id} &bull; {inspectingDwg.project}</span>
                  <strong className="text-slate-805 block text-sm mt-1">{inspectingDwg.name}</strong>
                </div>
                <button 
                  onClick={() => setInspectingDwg(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Large Blueprint Canvas inside side drawer */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 h-44 flex items-center justify-center relative">
                <svg viewBox="0 0 100 80" className="w-[85%] h-[85%] stroke-sky-400 fill-none stroke-[0.7] opacity-75">
                  <rect x="5" y="5" width="90" height="70" stroke="#2484C6" />
                  <line x1="5" y1="35" x2="95" y2="35" />
                  <circle cx="50" cy="35" r="12" />
                </svg>
              </div>

              <div className="space-y-4 text-xs font-bold text-slate-655">
                
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                  <span className="text-[9px] text-slate-400 block uppercase">Drawing Specs</span>
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div>
                      <span className="text-slate-450 block font-semibold">Active Version</span>
                      <strong className="text-slate-700">{inspectingDwg.version}</strong>
                    </div>
                    <div>
                      <span className="text-slate-450 block font-semibold">Revision Status</span>
                      <strong className="text-slate-700">{inspectingDwg.status}</strong>
                    </div>
                  </div>
                </div>

                {/* Revisions list history */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 block uppercase">Revision History</span>
                  <div className="space-y-2.5 pt-1.5 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[10px]">
                      <span>{inspectingDwg.version} (Active)</span>
                      <span className="text-slate-400">{inspectingDwg.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>V1.0 (Initial Draft)</span>
                      <span>2026-07-10</span>
                    </div>
                  </div>
                </div>

                {/* Review feedback alerts */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 block uppercase">Review Notes</span>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] leading-normal font-semibold">
                    {inspectingDwg.comments > 0 
                      ? "Sarah Connor (PM): Verify column grid spacings on intersection B4. The alignment is off by 50mm."
                      : "No revision comment feedback logs currently recorded."}
                  </div>
                </div>

              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-50 pt-4">
              <button
                onClick={() => {
                  alert("Drawing marked as reviewed!");
                  setInspectingDwg(null);
                }}
                className="flex-1 py-2 bg-brand-primary text-slate-905 rounded-xl text-xs font-black uppercase text-center shadow-3xs"
              >
                Mark Reviewed
              </button>
              <button
                onClick={() => alert(`Downloading source blueprint file: ${inspectingDwg.name}`)}
                className="px-4 py-2 border border-slate-205 text-slate-655 hover:bg-slate-50 rounded-xl text-xs font-bold uppercase"
              >
                Download
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
