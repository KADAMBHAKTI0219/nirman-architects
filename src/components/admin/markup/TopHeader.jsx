import React, { useState } from 'react';
import {
  ArrowLeft, Save, Share2, Download, MoreVertical, Layers,
  FileText, Check, RotateCcw, RotateCw, Trash2, Copy, Edit3,
  FileDown, ShieldCheck, History, Sliders, ChevronDown, CheckCircle2, CheckSquare
} from 'lucide-react';

export default function TopHeader({
  title = "GROUND_FLOOR_ARCHITECTURAL_PLAN.PDF",
  version = "v3.2",
  status = "GFC Released",
  saveStatus = "Saved just now",
  canUndo = false,
  canRedo = false,
  onBack,
  onUndo,
  onRedo,
  onSave,
  onExportPng,
  onExportPdf,
  onExportJson,
  onToggleSidePanel,
  isSidePanelOpen,
  onSelectAllMarkups,
  onClearAllMarkups,
  onFlattenMarkups,
  onOpenProperties
}) {
  const [showThreeDotMenu, setShowThreeDotMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <header className="fixed top-3 left-3 right-3 z-30 flex items-center justify-between px-3 py-2 bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-xl transition-all text-white">
      {/* Left: Round Dark Back Button & Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700 shadow-md flex-shrink-0"
          title="Back to Details"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xs sm:text-sm text-slate-100 truncate max-w-[140px] sm:max-w-[280px] md:max-w-[400px]">
                {title}
              </h1>
              <span className="px-2 py-0.5 text-[9px] font-black bg-slate-800 text-sky-400 border border-slate-700 rounded-full uppercase tracking-wider flex-shrink-0">
                {version}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <span className="text-emerald-400 font-bold">{status}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">{saveStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: iOS Floating Pill (Undo, Redo, Three-Dot, Yellow Checkmark) */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800/90 backdrop-blur-xl border border-slate-700 rounded-full shadow-md">
          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-full transition-all ${
              canUndo ? 'text-slate-200 hover:bg-slate-700 active:scale-95 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-full transition-all ${
              canRedo ? 'text-slate-200 hover:bg-slate-700 active:scale-95 cursor-pointer' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

          {/* Export / Download */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-1.5 text-slate-200 hover:bg-slate-700 rounded-full transition-all cursor-pointer"
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>

            {showExportMenu && (
              <div
                onClick={() => setShowExportMenu(false)}
                className="absolute right-0 top-10 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 py-1.5 w-48 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  onClick={onExportPdf}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 font-bold"
                >
                  <FileDown className="w-4 h-4 text-sky-400" />
                  <span>Export as Printable PDF</span>
                </button>
                <button
                  onClick={onExportPng}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 font-bold"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export as High-Res PNG</span>
                </button>
                <button
                  onClick={onExportJson}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 font-bold"
                >
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Export Annotations (JSON)</span>
                </button>
              </div>
            )}
          </div>

          {/* Toggle Side Panel */}
          <button
            onClick={onToggleSidePanel}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isSidePanelOpen ? 'text-sky-400 bg-slate-700' : 'text-slate-200 hover:bg-slate-700'
            }`}
            title="Layers & Comments"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Three Dots Menu */}
          <div className="relative">
            <button
              onClick={() => setShowThreeDotMenu(!showThreeDotMenu)}
              className="p-1.5 text-slate-200 hover:bg-slate-700 rounded-full transition-all cursor-pointer"
              title="More Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showThreeDotMenu && (
              <div
                onClick={() => setShowThreeDotMenu(false)}
                className="absolute right-0 top-10 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 py-1.5 w-52 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  onClick={onSelectAllMarkups}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 font-bold text-sky-400"
                >
                  <CheckSquare className="w-4 h-4 text-sky-400" />
                  <span>Select All Markups (Ctrl+A)</span>
                </button>
                <button
                  onClick={onOpenProperties}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 font-bold"
                >
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Document Properties</span>
                </button>
                <button
                  onClick={onFlattenMarkups}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2.5 font-bold"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Flatten Markups (Lock)</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={onClearAllMarkups}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-950/50 text-rose-400 flex items-center gap-2.5 font-bold"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Delete All Markups</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Iconic iOS Yellow Checkmark Done/Save Button */}
        <button
          onClick={onSave}
          className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 flex items-center justify-center font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20 border border-amber-300"
          title="Save & Done"
        >
          <Check className="w-6 h-6 stroke-[3]" />
        </button>
      </div>
    </header>
  );
}
