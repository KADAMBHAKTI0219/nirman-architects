import React, { useState } from 'react';
import { ArrowLeft, GitCompare, FileText, CheckCircle, Clock } from 'lucide-react';
import Card from '../../common/Card';
import { getCachedDrawingFile } from '../../../service/drawing';

export default function DrawingCompare({
  drawing,
  onBack
}) {
  const versions = drawing?.versions || [
    { version: 'V1.0', date: '2026-07-10', uploader: 'Sarah Connor', changeLog: 'Initial layout draft PDF', fileUrl: drawing?.fileUrl },
    { version: 'V2.1', date: '2026-07-20', uploader: 'Sarah Connor', changeLog: 'Revised column & elevator shaft PDF', fileUrl: drawing?.fileUrl }
  ];

  const [versionA, setVersionA] = useState(versions[0]?.version || versions[0]?.versionNumber || 'V1.0');
  const [versionB, setVersionB] = useState(versions[versions.length - 1]?.version || versions[versions.length - 1]?.versionNumber || 'V2.1');

  const detailsA = versions.find(v => (v.version || `V${v.versionNumber}`) === versionA) || versions[0] || {};
  const detailsB = versions.find(v => (v.version || `V${v.versionNumber}`) === versionB) || versions[versions.length - 1] || {};

  const renderFilePreview = (url, title) => {
    const cached = getCachedDrawingFile(drawing?._id || drawing?.id || drawing?.drawingNumber);
    const targetUrl = cached || url || drawing?.fileUrl;

    if (!targetUrl) {
      return (
        <div className="h-56 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          <FileText className="w-8 h-8 mb-2 text-indigo-400" />
          <span>No File Attached for {title}</span>
        </div>
      );
    }

    const isPdf = typeof targetUrl === 'string' && (targetUrl.startsWith('data:application/pdf') || targetUrl.endsWith('.pdf') || targetUrl.includes('.pdf') || targetUrl.includes('cloudinary'));
    if (isPdf) {
      return (
        <iframe
          src={targetUrl.includes('#') ? targetUrl : `${targetUrl}#toolbar=1&navpanes=1`}
          title={title}
          className="w-full h-56 rounded-2xl border border-slate-800 bg-white"
        />
      );
    }

    return (
      <div className="h-56 flex items-center justify-center p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
        <img
          src={targetUrl}
          alt={title}
          className="w-full h-full object-contain rounded-xl select-none"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 bg-white border border-slate-200 text-slate-700 rounded-xl transition-all shadow-3xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block">Side-by-Side Revision Comparison</span>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none mt-0.5">{drawing?.name || drawing?.title}</h2>
        </div>
      </div>

      {/* Version Dropdown Selectors */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-xs font-bold text-slate-800 block">Compare First vs Current Revision Files</strong>
            <span className="text-[10px] text-slate-500">Select two drawing PDF/Image versions to inspect visual changes</span>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Version A (First/Previous)</label>
            <select
              value={versionA}
              onChange={(e) => setVersionA(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-bold cursor-pointer"
            >
              {versions.map((v, idx) => {
                const label = v.version || `V${v.versionNumber || (idx + 1)}.0`;
                return <option key={label} value={label}>{label} ({v.date || 'Initial'})</option>;
              })}
            </select>
          </div>

          <span className="text-indigo-600 font-extrabold text-xs pt-4">&larr; VS &rarr;</span>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Version B (Latest Revised)</label>
            <select
              value={versionB}
              onChange={(e) => setVersionB(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white font-bold cursor-pointer"
            >
              {versions.map((v, idx) => {
                const label = v.version || `V${v.versionNumber || (idx + 1)}.0`;
                return <option key={label} value={label}>{label} ({v.date || 'Recent'})</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparative PDF & Image Blueprint Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Version A Card (First Revision PDF/Image) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-white">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-sky-400 uppercase">Revision {versionA}</span>
              <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[9px] font-bold rounded-md">First Draft</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">By: {detailsA?.uploader || 'Sarah Connor'}</span>
          </div>

          {/* Actual PDF / Image Embed for Version A */}
          {renderFilePreview(detailsA?.fileUrl || drawing?.fileUrl, `Revision ${versionA}`)}

          <div className="text-xs font-medium text-slate-300 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Version Notes & Change Log:</span>
            <p className="text-slate-200 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-[11px] leading-relaxed italic">
              "{detailsA?.changeLog || detailsA?.notes || 'Initial architectural layout release'}"
            </p>
          </div>
        </div>

        {/* Version B Card (Current Revised PDF/Image) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 text-white">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-400 uppercase">Revision {versionB}</span>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold rounded-md">Latest Revision</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">By: {detailsB?.uploader || 'Sarah Connor'}</span>
          </div>

          {/* Actual PDF / Image Embed for Version B */}
          {renderFilePreview(detailsB?.fileUrl || drawing?.fileUrl, `Revision ${versionB}`)}

          <div className="text-xs font-medium text-slate-300 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Version Notes & Change Log:</span>
            <p className="text-slate-200 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 text-[11px] leading-relaxed italic">
              "{detailsB?.changeLog || detailsB?.notes || 'Updated columns & beam clearances revision'}"
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
