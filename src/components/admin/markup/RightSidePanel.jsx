import React, { useState } from 'react';
import {
  X, Layers, MessageSquare, History, List, Clock, Eye,
  Trash2, ArrowUp, ArrowDown, Lock, Unlock, CheckCircle2, User
} from 'lucide-react';

export default function RightSidePanel({
  isOpen = false,
  onClose,
  annotations = [],
  pins = [],
  activeSelectedObject = null,
  onSelectObject,
  onDeleteObject,
  onBringForward,
  onSendBackward,
  onToggleLockObject,
  onSelectPin
}) {
  const [activeTab, setActiveTab] = useState('annotations'); // annotations | comments | layers | versions | activity

  if (!isOpen) return null;

  const versions = [
    { version: 'v3.2 (Current)', date: 'Aug 03, 2026', author: 'Eng. Rohit Mehta', label: 'GFC Locked Release' },
    { version: 'v3.0', date: 'Jul 28, 2026', author: 'Bhakti Kadam', label: 'Structural Rebar Updates' },
    { version: 'v2.1', date: 'Jul 20, 2026', author: 'Nirman Admin', label: 'HVAC CFM Duct Revisions' },
    { version: 'v1.0', date: 'Jul 10, 2026', author: 'Client Signature', label: 'Initial Site Charter' }
  ];

  const activityLog = [
    { action: 'Added Pen Annotation', user: 'Eng. Rohit Mehta', time: '10 mins ago' },
    { action: 'Dropped Comment Pin #2', user: 'Bhakti Kadam', time: '25 mins ago' },
    { action: 'Added Dimension Line 16\'0"', user: 'Super Admin', time: '1 hour ago' },
    { action: 'Approved Drawing Version v3.2', user: 'Project Manager', time: '3 hours ago' }
  ];

  return (
    <aside className="fixed top-20 right-4 bottom-24 z-40 w-[320px] sm:w-[360px] bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-250">
      {/* Header Tabs Bar */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'annotations', label: 'Markups', icon: List },
            { id: 'comments', label: 'Comments', icon: MessageSquare },
            { id: 'layers', label: 'Layers', icon: Layers },
            { id: 'versions', label: 'Versions', icon: History }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer ml-1 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
        {/* Tab 1: Annotations List */}
        {activeTab === 'annotations' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-bold text-[10px] uppercase tracking-wider px-1">
              <span>Canvas Objects ({annotations.length})</span>
              <span>Actions</span>
            </div>
            {annotations.length > 0 ? (
              annotations.map((ann, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectObject(ann.rawObj)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    activeSelectedObject === ann.rawObj
                      ? 'bg-sky-50 border-sky-300 shadow-3xs'
                      : 'bg-white border-slate-150 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ann.color || '#2484C6' }}
                    />
                    <div className="min-w-0">
                      <span className="font-extrabold text-slate-800 truncate block text-xs capitalize">
                        {ann.type} Annotation
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Opacity: {Math.round((ann.opacity || 1) * 100)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObject(ann.rawObj);
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete Markup"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-1">
                <List className="w-6 h-6 mx-auto opacity-40 text-slate-400" />
                <p>No annotations added yet.</p>
                <p className="text-[10px] text-slate-400">Use Pen, Text or Shapes below to annotate.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Comments & Pin Threads */}
        {activeTab === 'comments' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-bold text-[10px] uppercase tracking-wider px-1">
              <span>Dropped Comment Pins ({pins.length})</span>
            </div>
            {pins.length > 0 ? (
              pins.map((pin) => (
                <div
                  key={pin.id}
                  onClick={() => onSelectPin(pin)}
                  className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 transition-all cursor-pointer space-y-1.5 shadow-3xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-sky-600 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] flex items-center justify-center font-black">
                        #{pin.number || pin.id}
                      </span>
                      {pin.author || 'Super Admin'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-100 text-slate-700 uppercase">
                      {pin.status || 'Open'}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs font-medium line-clamp-2">{pin.message}</p>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-1">
                <MessageSquare className="w-6 h-6 mx-auto opacity-40 text-slate-400" />
                <p>No comment pins dropped yet.</p>
                <p className="text-[10px] text-slate-400">Select Pin tool from toolbar to drop pins on document.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Layers Manager */}
        {activeTab === 'layers' && (
          <div className="space-y-2">
            <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider px-1">
              Layer Hierarchy
            </div>
            {annotations.map((ann, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <span className="font-bold text-slate-800 capitalize">Layer {idx + 1}: {ann.type}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onBringForward(ann.rawObj)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    title="Bring Forward"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSendBackward(ann.rawObj)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    title="Send Backward"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Version History */}
        {activeTab === 'versions' && (
          <div className="space-y-3">
            <div className="text-slate-400 font-bold text-[10px] uppercase tracking-wider px-1">
              Document Revision History
            </div>
            {versions.map((ver, idx) => (
              <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs">{ver.version}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{ver.date}</span>
                </div>
                <p className="text-slate-600 font-medium text-[11px]">{ver.label}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold pt-1">
                  <User className="w-3 h-3 text-sky-600" />
                  <span>{ver.author}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
