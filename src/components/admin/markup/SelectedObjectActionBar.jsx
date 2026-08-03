import React, { useState } from 'react';
import { Copy, Trash2, MoreVertical, ArrowUp, ArrowDown, Lock, Unlock, Check } from 'lucide-react';

const PALETTE = [
  '#F59E0B', '#2484C6', '#EF4444', '#10B981', '#8B5CF6', '#0F172A', '#FFFFFF'
];

export default function SelectedObjectActionBar({
  selectedObject,
  fabricCanvas,
  onUpdateObject,
  onDeleteObject,
  onDuplicateObject
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  if (!selectedObject || !fabricCanvas) return null;

  // Calculate screen position for floating action bar relative to object bounding box
  let top = 100;
  let left = 100;

  try {
    const rect = selectedObject.getBoundingRect();
    const vpt = fabricCanvas.viewportTransform || [1, 0, 0, 1, 0, 0];

    // Convert scene coords to screen viewport position
    const screenTop = rect.top * vpt[3] + vpt[5];
    const screenLeft = rect.left * vpt[0] + vpt[4];
    const screenWidth = rect.width * vpt[0];
    const screenHeight = rect.height * vpt[3];

    left = Math.max(20, Math.min(window.innerWidth - 220, screenLeft + screenWidth / 2));
    top = Math.min(window.innerHeight - 120, screenTop + screenHeight + 20);
  } catch (e) {
    // Fallback position
  }

  const currentColor = selectedObject.stroke || selectedObject.fill || '#F59E0B';
  const isLocked = selectedObject.lockMovementX;

  const handleColorChange = (color) => {
    if (selectedObject.stroke) selectedObject.set({ stroke: color });
    if (selectedObject.fill && selectedObject.fill !== 'transparent') selectedObject.set({ fill: color });
    fabricCanvas.renderAll();
    setShowColorPicker(false);
    if (onUpdateObject) onUpdateObject();
  };

  const handleBringForward = () => {
    fabricCanvas.bringObjectForward(selectedObject);
    fabricCanvas.renderAll();
    setShowMoreMenu(false);
    if (onUpdateObject) onUpdateObject();
  };

  const handleSendBackward = () => {
    fabricCanvas.sendObjectBackwards(selectedObject);
    fabricCanvas.renderAll();
    setShowMoreMenu(false);
    if (onUpdateObject) onUpdateObject();
  };

  const handleToggleLock = () => {
    const locked = !selectedObject.lockMovementX;
    selectedObject.set({
      lockMovementX: locked,
      lockMovementY: locked,
      lockRotation: locked,
      lockScalingX: locked,
      lockScalingY: locked
    });
    fabricCanvas.renderAll();
    setShowMoreMenu(false);
    if (onUpdateObject) onUpdateObject();
  };

  return (
    <div
      style={{ top: `${top}px`, left: `${left}px` }}
      className="fixed -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Color Palette Popover */}
      {showColorPicker && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-2 flex items-center gap-1.5 z-50">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => handleColorChange(c)}
              className="w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110 flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: c }}
            >
              {currentColor === c && <Check className="w-3 h-3 text-slate-900 stroke-[3]" />}
            </button>
          ))}
        </div>
      )}

      {/* More Options Popover */}
      {showMoreMenu && (
        <div className="absolute bottom-14 right-0 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-1.5 w-44 text-xs z-50 text-slate-200 space-y-0.5">
          <button
            onClick={handleBringForward}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Bring Forward</span>
          </button>
          <button
            onClick={handleSendBackward}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
            <span>Send Backward</span>
          </button>
          <button
            onClick={handleToggleLock}
            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 rounded-xl flex items-center gap-2 font-bold cursor-pointer"
          >
            {isLocked ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isLocked ? 'Unlock Object' : 'Lock Object'}</span>
          </button>
        </div>
      )}

      {/* Main Apple Contextual Pill Action Bar */}
      <div className="bg-[#1C1C1E]/95 backdrop-blur-2xl border border-slate-800 rounded-full shadow-2xl px-3 py-1.5 flex items-center gap-2 text-white">
        {/* Active Color Dot */}
        <button
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowMoreMenu(false);
          }}
          className="w-6 h-6 rounded-full border border-white/40 shadow-xs transition-transform hover:scale-110 cursor-pointer"
          style={{ backgroundColor: currentColor }}
          title="Change Color"
        />

        <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

        {/* Duplicate Button */}
        <button
          onClick={onDuplicateObject}
          className="p-1.5 hover:bg-slate-800 active:scale-95 text-slate-200 rounded-full transition-all cursor-pointer"
          title="Duplicate Markup"
        >
          <Copy className="w-4 h-4 text-slate-200" />
        </button>

        {/* Delete Button */}
        <button
          onClick={onDeleteObject}
          className="p-1.5 hover:bg-rose-950/50 active:scale-95 text-rose-400 rounded-full transition-all cursor-pointer"
          title="Delete Markup"
        >
          <Trash2 className="w-4 h-4 text-rose-500" />
        </button>

        {/* More Options */}
        <button
          onClick={() => {
            setShowMoreMenu(!showMoreMenu);
            setShowColorPicker(false);
          }}
          className="p-1.5 hover:bg-slate-800 active:scale-95 text-slate-200 rounded-full transition-all cursor-pointer"
          title="More Actions"
        >
          <MoreVertical className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </div>
  );
}
