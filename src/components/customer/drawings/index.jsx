import React, { useState } from 'react';
import { 
  Search, Eye, Download, Check, X, MessageSquare, 
  Layers, ChevronDown, CheckCircle, AlertTriangle 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_DRAWINGS = [
  { id: "DWG-101", name: "Central Lobby 3D Architectural Render", project: "Central Office Tower", version: "V2.1", date: "2026-07-22", status: "Awaiting Approval", comments: 2 },
  { id: "DWG-102", name: "Ground Floor Wall Layout Blueprint", project: "Central Office Tower", version: "V1.0", date: "2026-07-20", status: "Approved", comments: 0 },
  { id: "DWG-103", name: "L3 Electrical & Power Routing Blueprint", project: "Central Office Tower", version: "V1.1", date: "2026-07-21", status: "Awaiting Approval", comments: 1 }
];

export default function Drawings() {
  const [drawings, setDrawings] = useState(INITIAL_DRAWINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDwg, setSelectedDwg] = useState(INITIAL_DRAWINGS[0]);
  const [commentText, setCommentText] = useState('');

  const filteredDrawings = drawings.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || d.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id) => {
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, status: 'Approved' } : d));
    if (selectedDwg && selectedDwg.id === id) {
      setSelectedDwg(prev => ({ ...prev, status: 'Approved' }));
    }
    alert("Drawing approved successfully!");
  };

  const handleReject = (id) => {
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, status: 'Revisions Requested' } : d));
    if (selectedDwg && selectedDwg.id === id) {
      setSelectedDwg(prev => ({ ...prev, status: 'Revisions Requested' }));
    }
    alert("Revisions requested for this drawing.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. FILTER CONTROLS */}
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl bg-white font-semibold text-slate-707"
          >
            <option value="All">All Statuses</option>
            <option value="Awaiting Approval">Awaiting Approval</option>
            <option value="Approved">Approved</option>
            <option value="Revisions Requested">Revisions Requested</option>
          </select>
        </div>
      </div>

      {/* 2. MAIN LAYOUT AND DETAIL DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Gallery Grid (3/4 width) */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDrawings.map(d => (
            <div 
              key={d.id}
              onClick={() => setSelectedDwg(d)}
              className={`bg-white rounded-3xl border transition-all cursor-pointer overflow-hidden hover:border-[#2484C6]/40 flex flex-col justify-between ${
                selectedDwg?.id === d.id ? 'border-[#2484C6] shadow-3xs' : 'border-slate-150'
              }`}
            >
              {/* Simulated Thumbnail */}
              <div className="bg-[#0A192F] p-4 h-24 flex items-center justify-center relative select-none">
                <svg viewBox="0 0 100 80" className="w-16 h-16 stroke-sky-500 fill-none stroke-[0.8] opacity-60">
                  <rect x="10" y="10" width="80" height="60" stroke="#1D4ED8" />
                  <circle cx="50" cy="40" r="8" />
                </svg>
                <span className="absolute bottom-2 right-2 bg-slate-900/60 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-sky-400">
                  {d.version}
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{d.id} &bull; {d.project}</span>
                  <strong className="text-slate-850 block text-xs truncate mt-0.5" title={d.name}>{d.name}</strong>
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 pt-2.5">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    d.status === 'Approved' ? 'bg-emerald-50 text-emerald-605 border-emerald-100' :
                    d.status === 'Awaiting Approval' ? 'bg-amber-50 text-amber-605 border-amber-100' :
                    'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>{d.status}</span>

                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {d.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Details Panel (1/4 width) */}
        {selectedDwg && (
          <div className="xl:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-50 pb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedDwg.id} &bull; {selectedDwg.project}</span>
              <strong className="text-slate-805 block text-xs mt-1">{selectedDwg.name}</strong>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-550">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5 text-[10px]">
                <span className="text-slate-400 block uppercase">Active Version</span>
                <strong className="text-slate-700">{selectedDwg.version} (Uploaded: {selectedDwg.date})</strong>
              </div>

              {selectedDwg.status === 'Awaiting Approval' ? (
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-405 block uppercase">Review Decision</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(selectedDwg.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-center shadow-3xs flex items-center justify-center gap-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedDwg.id)}
                      className="flex-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl font-bold uppercase text-center"
                    >
                      Request Revisions
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-2">
                  {selectedDwg.status === 'Approved' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  )}
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Approval Status</span>
                    <strong className="text-slate-700 block mt-0.5">{selectedDwg.status}</strong>
                  </div>
                </div>
              )}

              {/* Comment Input */}
              <div className="space-y-2.5 pt-2 border-t border-slate-50">
                <span className="text-[9px] text-slate-400 block uppercase">Add Design Correction Notes</span>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type any structural correction details or checklist reviews..."
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-[10px] font-semibold text-slate-705 h-20 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (commentText.trim()) {
                      alert("Review comment posted to design channel!");
                      setCommentText('');
                    }
                  }}
                  className="w-full py-1.5 bg-brand-primary text-slate-905 rounded-xl text-center shadow-3xs font-black uppercase"
                >
                  Submit Notes
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
