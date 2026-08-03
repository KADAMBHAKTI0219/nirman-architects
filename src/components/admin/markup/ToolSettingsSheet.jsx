import React from 'react';
import { Sliders, X, Check, CircleDot, Grid } from 'lucide-react';

const COLOR_SWATCHES = [
  { hex: '#2484C6', label: 'Primary Blue' },
  { hex: '#FACC15', label: 'Highlighter Yellow' },
  { hex: '#FB923C', label: 'Marker Orange' },
  { hex: '#EF4444', label: 'Crimson Red' },
  { hex: '#10B981', label: 'Emerald Green' },
  { hex: '#8B5CF6', label: 'Purple' },
  { hex: '#0F172A', label: 'Black Graphite' },
  { hex: '#FFFFFF', label: 'White' }
];

const THICKNESS_PRESETS = [
  { label: 'Fine', width: 2, iconW: 1.5 },
  { label: 'Light', width: 6, iconW: 3.5 },
  { label: 'Medium', width: 12, iconW: 6.5 },
  { label: 'Bold', width: 20, iconW: 10 },
  { label: 'Heavy', width: 32, iconW: 15 }
];

export default function ToolSettingsSheet({
  activeTool = 'pen',
  strokeColor = '#2484C6',
  strokeWidth = 4,
  opacity = 1,
  fontSize = 20,
  eraserMode = 'pixel',
  onChangeColor,
  onChangeStrokeWidth,
  onChangeOpacity,
  onChangeFontSize,
  onChangeEraserMode,
  onClose
}) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E]/95 backdrop-blur-[30px] border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 w-[340px] sm:w-[380px] text-xs space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span className="font-extrabold text-slate-100 capitalize text-xs">
            {activeTool} Tool Settings
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Apple iOS 5-Preset Thickness Selector Row (Image 2 style) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
            Stroke Thickness Preset
          </span>
          <span className="font-mono text-[10px] text-sky-400 font-bold">{strokeWidth}px</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          {THICKNESS_PRESETS.map((preset) => {
            const isSelected = Math.abs(strokeWidth - preset.width) <= 2;
            return (
              <button
                key={preset.label}
                onClick={() => onChangeStrokeWidth(preset.width)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-md border border-white/20 scale-105'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
                title={`${preset.label} (${preset.width}px)`}
              >
                <svg viewBox="0 0 36 24" className="w-7 h-5">
                  <path
                    d="M 4 18 Q 12 4 18 12 T 32 6"
                    fill="none"
                    stroke={isSelected ? '#FFFFFF' : strokeColor}
                    strokeWidth={preset.iconW}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[9px] font-bold mt-1 tracking-tight">{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continuous Thickness Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min="1"
          max="48"
          step="1"
          value={strokeWidth}
          onChange={(e) => onChangeStrokeWidth(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
      </div>

      {/* 2. Checkered Opacity Slider Bar (Image 2 style) */}
      {activeTool !== 'highlighter' && activeTool !== 'eraser' && (
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
              Opacity ({Math.round(opacity * 100)}%)
            </span>
          </div>

          <div className="relative w-full h-7 rounded-xl overflow-hidden border border-slate-700/80 shadow-inner flex items-center px-1">
            {/* Checkered pattern background */}
            <div
              className="absolute inset-0 z-0 opacity-70"
              style={{
                backgroundImage: `linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)`,
                backgroundSize: `10px 10px`,
                backgroundPosition: `0 0, 0 5px, 5px -5px, -5px 0px`
              }}
            />
            {/* Color Gradient Overlay */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: `linear-gradient(to right, transparent, ${strokeColor})`
              }}
            />
            {/* Opacity Range Input */}
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => onChangeOpacity(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
            />
            {/* Custom White Slider Knob */}
            <div
              className="w-5 h-5 rounded-full bg-white border border-slate-300 shadow-md z-10 pointer-events-none transition-all"
              style={{
                left: `calc(${opacity * 100}% - ${opacity * 20}px)`
              }}
            />
          </div>
        </div>
      )}

      {/* 3. Eraser Mode Switcher */}
      {activeTool === 'eraser' && (
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
            Eraser Mode
          </span>
          <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => onChangeEraserMode && onChangeEraserMode('pixel')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                eraserMode === 'pixel' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Pixel Eraser</span>
            </button>
            <button
              onClick={() => onChangeEraserMode && onChangeEraserMode('object')}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                eraserMode === 'object' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Object Eraser</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Color Swatches Grid */}
      {activeTool !== 'eraser' && (
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
            Color Palette
          </span>
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            {COLOR_SWATCHES.map((c) => {
              const isSelected = strokeColor.toLowerCase() === c.hex.toLowerCase();
              return (
                <button
                  key={c.hex}
                  onClick={() => onChangeColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer border ${
                    isSelected ? 'ring-2 ring-sky-500 ring-offset-2 ring-offset-slate-900 scale-110 shadow-xs' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex, borderColor: c.hex === '#FFFFFF' ? '#CBD5E1' : c.hex }}
                  title={c.label}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${c.hex === '#FFFFFF' || c.hex === '#FACC15' ? 'text-slate-900' : 'text-white'}`} />
                  )}
                </button>
              );
            })}
            <label className="w-7 h-7 rounded-full bg-conic-gradient from-rose-500 via-amber-400 to-sky-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-3xs relative overflow-hidden">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => onChangeColor(e.target.value)}
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
