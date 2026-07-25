import React, { useState } from 'react';
import { ArrowLeft, GitCompare, RefreshCw } from 'lucide-react';
import Card from '../../common/Card';

export default function DrawingCompare({
  drawing,
  onBack
}) {
  const [versionA, setVersionA] = useState(drawing.versions[0]?.version || 'V1.0');
  const [versionB, setVersionB] = useState(drawing.versions[drawing.versions.length - 1]?.version || 'V2.1');

  const detailsA = drawing.versions.find(v => v.version === versionA) || drawing.versions[0];
  const detailsB = drawing.versions.find(v => v.version === versionB) || drawing.versions[drawing.versions.length - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <button 
          onClick={onBack}
          className="p-1.5 hover:bg-slate-150 bg-white border border-slate-205 text-slate-600 rounded-xl transition-all shadow-3xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{drawing.id} Compare Revisions</span>
          <h2 className="text-base font-black text-slate-905 tracking-tight leading-none mt-0.5">{drawing.name}</h2>
        </div>
      </div>

      {/* Version Dropdown Selectors */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <GitCompare className="w-5 h-5 text-[#2484C6]" />
          <span className="text-xs font-bold text-slate-600">Select Revisions to compare:</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Version A</label>
            <select
              value={versionA}
              onChange={(e) => setVersionA(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-700 bg-white font-semibold"
            >
              {drawing.versions.map(v => (
                <option key={v.version} value={v.version}>{v.version} ({v.date})</option>
              ))}
            </select>
          </div>
          <span className="text-slate-400 font-extrabold text-xs pt-4">&larr; vs &rarr;</span>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Version B</label>
            <select
              value={versionB}
              onChange={(e) => setVersionB(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-700 bg-white font-semibold"
            >
              {drawing.versions.map(v => (
                <option key={v.version} value={v.version}>{v.version} ({v.date})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-side Comparative Blueprint Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Version A Card */}
        <div className="bg-[#0B1E33] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
            <span className="text-xs font-black text-sky-400">Revision {versionA}</span>
            <span className="text-[9px] text-slate-400 font-semibold">Uploaded by {detailsA?.uploader}</span>
          </div>
          <div className="h-56 flex items-center justify-center relative p-4 bg-slate-950/20 rounded-2xl border border-slate-900">
            <svg viewBox="0 0 400 300" className="w-full h-full stroke-sky-400 fill-none stroke-[1.5] opacity-80">
              <rect width="100%" height="100%" fill="none" />
              {/* Outer boundary */}
              <rect x="50" y="50" width="300" height="200" strokeWidth="2.5" stroke="#2484C6" />
              <line x1="150" y1="50" x2="150" y2="250" />
              <text x="70" y="90" fill="#38BDF8" fontSize="12" stroke="none" fontWeight="bold">LOBBY DRAFT</text>
            </svg>
          </div>
          <div className="text-xs font-semibold text-slate-400 space-y-1">
            <span>Change log:</span>
            <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">{detailsA?.changeLog}</p>
          </div>
        </div>

        {/* Version B Card */}
        <div className="bg-[#0D253F] border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
            <span className="text-xs font-black text-[#2484C6]">Revision {versionB}</span>
            <span className="text-[9px] text-slate-400 font-semibold">Uploaded by {detailsB?.uploader}</span>
          </div>
          <div className="h-56 flex items-center justify-center relative p-4 bg-slate-950/20 rounded-2xl border border-slate-900">
            <svg viewBox="0 0 400 300" className="w-full h-full stroke-sky-300 fill-none stroke-[1.5]">
              <rect width="100%" height="100%" fill="none" />
              {/* Outer boundary */}
              <rect x="50" y="50" width="300" height="200" strokeWidth="2.5" stroke="#38BDF8" />
              <line x1="150" y1="50" x2="150" y2="250" />
              {/* New revisions overlay */}
              <line x1="150" y1="150" x2="350" y2="150" stroke="#F43F5E" strokeDasharray="3 3" />
              <text x="70" y="90" fill="#E2E8F0" fontSize="12" stroke="none" fontWeight="bold">LOBBY V2</text>
              <text x="210" y="100" fill="#F43F5E" fontSize="9" stroke="none" fontWeight="bold">+ ADDED PARTITION</text>
            </svg>
          </div>
          <div className="text-xs font-semibold text-slate-400 space-y-1">
            <span>Change log:</span>
            <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">{detailsB?.changeLog}</p>
          </div>
        </div>

      </div>

    </div>
  );
}
