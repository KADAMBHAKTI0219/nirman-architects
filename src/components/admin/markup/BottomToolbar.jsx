import React, { useState, useRef } from 'react';
import {
  MousePointer, Type, Square, Circle, Triangle, ArrowRight, Minus, Cloud,
  Ruler as RulerIcon, Pin, Hand, Plus, Check, ChevronRight, X
} from 'lucide-react';

/* Realistic SVG Renderers for iOS Pencil Kit Brushes */

// 1. Technical Pen
const TechnicalPenSvg = ({ color, isActive }) => (
  <svg viewBox="0 0 36 120" className="w-9 h-28 transition-transform duration-200">
    <rect x="13" y="60" width="10" height="55" rx="3" fill="#1E293B" />
    <rect x="13" y="55" width="10" height="5" fill="#E2E8F0" />
    <path d="M 14 55 L 18 20 L 22 55 Z" fill="#0F172A" />
    <rect x="17" y="5" width="2" height="15" fill="#F8FAFC" />
    {/* Active Color Ring */}
    <rect x="13" y="75" width="10" height="6" fill={color} />
  </svg>
);

// 2. Crayon / Wax Pastel
const CrayonSvg = ({ color, isActive }) => (
  <svg viewBox="0 0 38 120" className="w-10 h-28 transition-transform duration-200">
    <path d="M 12 40 L 19 10 L 26 40 Z" fill={color} />
    <rect x="11" y="40" width="16" height="75" rx="2" fill="#0F172A" />
    <rect x="11" y="50" width="16" height="40" fill={color} opacity="0.9" />
    <line x1="11" y1="58" x2="27" y2="58" stroke="#1E293B" strokeWidth="2" />
    <line x1="11" y1="82" x2="27" y2="82" stroke="#1E293B" strokeWidth="2" />
  </svg>
);

// 3. Fountain Pen (Calligraphy)
const FountainPenSvg = ({ color, isActive }) => (
  <svg viewBox="0 0 38 120" className="w-10 h-28 transition-transform duration-200">
    <rect x="12" y="55" width="14" height="60" rx="3" fill="#0F172A" />
    <rect x="12" y="50" width="14" height="5" fill="#CBD5E1" />
    {/* Metallic Nib */}
    <path d="M 13 50 L 19 12 L 25 50 Z" fill="#94A3B8" stroke="#64748B" strokeWidth="1" />
    <line x1="19" y1="12" x2="19" y2="35" stroke="#334155" strokeWidth="1.5" />
    <circle cx="19" cy="35" r="2" fill="#334155" />
    {/* Active Color Ring */}
    <rect x="12" y="70" width="14" height="6" fill={color} />
  </svg>
);

// 4. Watercolor / Acrylic Brush
const AcrylicBrushSvg = ({ color, isActive }) => (
  <svg viewBox="0 0 38 120" className="w-10 h-28 transition-transform duration-200">
    <rect x="13" y="60" width="12" height="55" rx="2" fill="#78350F" />
    <rect x="13" y="50" width="12" height="10" fill="#CBD5E1" />
    {/* Brush Tip */}
    <path d="M 13 50 Q 11 25 19 8 Q 27 25 25 50 Z" fill={color} />
  </svg>
);

// 5. Fine Marker (Lasso Selection Brush)
const FineMarkerSvg = ({ color, isActive }) => (
  <svg viewBox="0 0 36 120" className="w-9 h-28 transition-transform duration-200">
    <rect x="12" y="45" width="12" height="70" rx="3" fill="#18181B" />
    <rect x="12" y="40" width="12" height="5" fill="#FAFAFA" />
    <path d="M 15 40 L 18 18 L 21 40 Z" fill="#FFFFFF" />
    {/* Active Color Tip & Ring */}
    <circle cx="18" cy="18" r="2.5" fill={color || '#38BDF8'} />
    <rect x="12" y="65" width="12" height="5" fill={color || '#38BDF8'} />
    {/* Dashed Lasso Ring around tip */}
    <ellipse cx="18" cy="18" rx="8" ry="8" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 2" />
  </svg>
);

// 6. Chiseled Highlighter
const HighlighterSvg = ({ color, isActive }) => (
  <svg viewBox="0 0 40 120" className="w-10 h-28 transition-transform duration-200">
    <rect x="10" y="45" width="20" height="70" rx="4" fill="#18181B" />
    <rect x="10" y="85" width="20" height="10" fill={color || '#FACC15'} />
    {/* Chiseled Tip */}
    <path d="M 12 45 L 14 20 L 26 25 L 28 45 Z" fill={color || '#FACC15'} />
    <text x="20" y="105" fontFamily="Arial" fontSize="9" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">80</text>
  </svg>
);

// 7. Rubber Eraser
const EraserSvg = ({ isActive }) => (
  <svg viewBox="0 0 38 120" className="w-10 h-28 transition-transform duration-200">
    <rect x="11" y="45" width="16" height="70" rx="3" fill="#18181B" />
    <rect x="11" y="45" width="16" height="6" fill="#CBD5E1" />
    {/* Pink Rubber Eraser Tip */}
    <rect x="11" y="20" width="16" height="25" rx="4" fill="#F472B6" />
  </svg>
);

// 8. Graphite Pencil
const PencilSvg = ({ color, isActive }) => (
  <svg viewBox="0 0 36 120" className="w-9 h-28 transition-transform duration-200">
    <rect x="12" y="45" width="12" height="70" rx="2" fill="#1E293B" />
    {/* Wooden Conical Tip */}
    <path d="M 12 45 L 18 15 L 24 45 Z" fill="#D97706" />
    <path d="M 16 20 L 18 15 L 20 20 Z" fill="#334155" />
    <line x1="16" y1="45" x2="16" y2="115" stroke="#334155" strokeWidth="1" />
    <line x1="20" y1="45" x2="20" y2="115" stroke="#334155" strokeWidth="1" />
  </svg>
);

// 9. Acrylic Ruler
const RulerSvg = ({ isActive }) => (
  <svg viewBox="0 0 42 120" className="w-11 h-28 transition-transform duration-200">
    <rect x="10" y="10" width="22" height="105" rx="2" fill="#475569" opacity="0.85" stroke="#94A3B8" strokeWidth="1" />
    {/* Tick Marks */}
    <line x1="10" y1="20" x2="20" y2="20" stroke="#F8FAFC" strokeWidth="1.5" />
    <line x1="10" y1="30" x2="16" y2="30" stroke="#F8FAFC" strokeWidth="1" />
    <line x1="10" y1="40" x2="20" y2="40" stroke="#F8FAFC" strokeWidth="1.5" />
    <line x1="10" y1="50" x2="16" y2="50" stroke="#F8FAFC" strokeWidth="1" />
    <line x1="10" y1="60" x2="20" y2="60" stroke="#F8FAFC" strokeWidth="1.5" />
    <line x1="10" y1="70" x2="16" y2="70" stroke="#F8FAFC" strokeWidth="1" />
    <line x1="10" y1="80" x2="20" y2="80" stroke="#F8FAFC" strokeWidth="1.5" />
    <line x1="10" y1="90" x2="16" y2="90" stroke="#F8FAFC" strokeWidth="1" />
    <line x1="10" y1="100" x2="20" y2="100" stroke="#F8FAFC" strokeWidth="1.5" />
  </svg>
);

export default function BottomToolbar({
  activeTool = 'pen',
  activeShape = 'rectangle',
  strokeColor = '#2484C6',
  onSelectTool,
  onSelectShape,
  onToggleSettings,
  isSettingsOpen
}) {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const scrollContainerRef = useRef(null);

  const toolsList = [
    { id: 'pen', label: 'Calligraphy Pen', component: FountainPenSvg },
    { id: 'technical', label: 'Technical Pen', component: TechnicalPenSvg },
    { id: 'crayon', label: 'Crayon Pastel', component: CrayonSvg },
    { id: 'acrylic', label: 'Acrylic Brush', component: AcrylicBrushSvg },
    { id: 'marker', label: 'Lasso Select (Fine Marker)', component: FineMarkerSvg },
    { id: 'highlighter', label: 'Highlighter', component: HighlighterSvg },
    { id: 'eraser', label: 'Eraser', component: EraserSvg },
    { id: 'pencil', label: 'Pencil', component: PencilSvg },
    { id: 'ruler', label: 'Ruler', component: RulerSvg }
  ];

  const plusMenuItems = [
    { id: 'text', label: 'Text Box', icon: Type },
    { id: 'pin', label: 'Comment Pin', icon: Pin },
    { id: 'pan', label: 'Pan Hand', icon: Hand },
    { id: 'select', label: 'Select Tool', icon: MousePointer },
    { id: 'rectangle', label: 'Rectangle', icon: Square, isShape: true },
    { id: 'circle', label: 'Circle', icon: Circle, isShape: true },
    { id: 'triangle', label: 'Triangle', icon: Triangle, isShape: true },
    { id: 'arrow', label: 'Arrow Line', icon: ArrowRight, isShape: true },
    { id: 'line', label: 'Straight Line', icon: Minus, isShape: true },
    { id: 'cloud', label: 'Revision Cloud', icon: Cloud, isShape: true }
  ];

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[95vw] sm:w-[540px] max-w-full">
      {/* Plus Menu Popup (Shapes, Text, Pins) */}
      {showPlusMenu && (
        <div
          onClick={() => setShowPlusMenu(false)}
          className="absolute bottom-28 right-4 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl p-3 w-56 text-xs z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-100 space-y-1"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
            <span className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider">Add Objects</span>
            <button onClick={() => setShowPlusMenu(false)} className="text-slate-400 hover:text-white p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0.5 pt-1">
            {plusMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isShape) {
                      onSelectShape(item.id);
                      onSelectTool('shape');
                    } else {
                      onSelectTool(item.id);
                    }
                    setShowPlusMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-800 flex items-center justify-between transition-colors font-bold text-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-sky-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main iOS Bottom Floating Dock */}
      <div className="relative bg-[#1C1C1E]/82 backdrop-blur-[30px] border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.45)] p-2.5 flex items-center justify-between overflow-hidden">
        {/* Left: Scrollable Brushes Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto no-scrollbar flex items-end gap-3 sm:gap-4 px-2 pt-4 pb-1 transition-all touch-pan-x"
        >
          {toolsList.map((t) => {
            const BrushSvg = t.component;
            const isActive = activeTool === t.id;

            return (
              <button
                key={t.id}
                onClick={() => {
                  if (isActive && onToggleSettings) {
                    onToggleSettings();
                  } else {
                    onSelectTool(t.id);
                  }
                }}
                className={`flex flex-col items-center cursor-pointer transition-all duration-120 active:scale-95 flex-shrink-0 group ${
                  isActive ? '-translate-y-4 scale-110' : 'hover:-translate-y-2 opacity-85 hover:opacity-100'
                }`}
                title={t.label}
              >
                <BrushSvg color={strokeColor} isActive={isActive} />
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1 shadow-xs animate-in zoom-in-50 duration-150" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Fixed Controls (Color Wheel & Plus Button) */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800/80 flex-shrink-0">
          {/* Multi-Color Rainbow Wheel Button */}
          <button
            onClick={onToggleSettings}
            className={`w-10 h-10 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-md border ${
              isSettingsOpen ? 'ring-2 ring-sky-500 scale-110' : 'hover:scale-105 active:scale-95'
            }`}
            style={{
              background: 'conic-gradient(from 0deg, #ef4444, #f97316, #facc15, #10b981, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
              borderColor: 'rgba(255,255,255,0.4)'
            }}
            title="Color Palette & Brush Stroke"
          >
            <div className="w-4 h-4 rounded-full border border-white shadow-3xs" style={{ backgroundColor: strokeColor }} />
          </button>

          {/* Plus Add Button (+) */}
          <button
            onClick={() => setShowPlusMenu(!showPlusMenu)}
            className={`w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700 shadow-md ${
              showPlusMenu ? 'rotate-45 bg-sky-600 border-sky-500' : ''
            }`}
            title="Add Shapes, Text & Pins"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
