import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react';

export default function ZoomControls({
  zoomLevel = 1,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen
}) {
  const percentage = Math.round(zoomLevel * 100);

  return (
    <div className="fixed bottom-5 left-5 z-30 flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl transition-all">
      <button
        onClick={onZoomOut}
        className="p-1.5 hover:bg-slate-100 active:scale-95 text-slate-700 rounded-xl transition-all cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={onResetZoom}
        className="px-2.5 py-1 hover:bg-slate-100 font-mono font-extrabold text-xs text-slate-800 rounded-xl transition-all cursor-pointer min-w-[50px] text-center"
        title="Reset Zoom to 100%"
      >
        {percentage}%
      </button>

      <button
        onClick={onZoomIn}
        className="p-1.5 hover:bg-slate-100 active:scale-95 text-slate-700 rounded-xl transition-all cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />

      <button
        onClick={onFitToScreen}
        className="p-1.5 hover:bg-slate-100 active:scale-95 text-slate-600 rounded-xl transition-all cursor-pointer"
        title="Fit Blueprint to Screen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}
