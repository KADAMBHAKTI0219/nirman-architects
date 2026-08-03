import React, { useState } from 'react';
import { 
  ArrowLeft, Lock, Unlock, ZoomIn, ZoomOut, Maximize2, Plus, 
  MessageSquare, FileText, Send, Clock, CheckCircle, ShieldAlert, Layers,
  PenTool
} from 'lucide-react';
import Card from '../../common/Card';
import MarkupEditor from '../markup/MarkupEditor';

export default function DrawingDetails({
  drawing,
  onBack,
  onUpdateDrawing,
  onCompareTrigger
}) {
  const [isFullMarkupMode, setIsFullMarkupMode] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [newPinMessage, setNewPinMessage] = useState('');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [tempCoords, setTempCoords] = useState(null);

  // Handle blueprint click for adding custom annotation pins
  const handleBlueprintClick = (e) => {
    if (!isAddingPin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTempCoords({ x, y });
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    if (!newPinMessage.trim() || !tempCoords) return;

    const newPin = {
      id: drawing.pins.length + 1,
      x: tempCoords.x,
      y: tempCoords.y,
      message: newPinMessage,
      author: "Super Admin"
    };

    onUpdateDrawing({
      ...drawing,
      pins: [...drawing.pins, newPin]
    });

    setNewPinMessage('');
    setIsAddingPin(false);
    setTempCoords(null);
    alert("Annotation pin pinned successfully on CAD sheet!");
  };

  // Add standard comments
  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: drawing.comments.length + 1,
      author: "Super Admin",
      message: commentText,
      date: "Just now"
    };

    onUpdateDrawing({
      ...drawing,
      comments: [...drawing.comments, newComment]
    });

    setCommentText('');
  };

  // Approve drawing
  const handleApprove = () => {
    onUpdateDrawing({
      ...drawing,
      status: "Approved"
    });
    alert("Drawing approved successfully!");
  };

  // Lock GFC
  const handleLockGfc = () => {
    onUpdateDrawing({
      ...drawing,
      status: "GFC Locked",
      locked: true
    });
    alert("Drawing locked as final GFC Release. Future edits restricted.");
  };

  if (isFullMarkupMode) {
    return (
      <MarkupEditor
        documentData={drawing}
        onBack={() => setIsFullMarkupMode(false)}
        onSaveDocument={onUpdateDrawing}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-slate-150 bg-white border border-slate-205 text-slate-600 rounded-xl transition-all shadow-3xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{drawing.id}</span>
            <h2 className="text-base font-black text-slate-905 tracking-tight leading-none mt-0.5">{drawing.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullMarkupMode(true)}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Open Blueprint Markup Editor</span>
          </button>
          <button
            onClick={() => onCompareTrigger(drawing)}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-700 rounded-xl text-[10px] font-black uppercase transition-all shadow-3xs"
          >
            Compare Revisions
          </button>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
            drawing.status === 'GFC Locked' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
            drawing.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
            'bg-amber-50 text-amber-605 border border-amber-100 animate-pulse'
          }`}>
            {drawing.status}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (2/3 width): Blueprint Viewer, Revision Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Blueprint Cad Viewer */}
          <div className="bg-[#0B1E33] border border-slate-800 rounded-3xl overflow-hidden relative shadow-md">
            
            {/* Control Bar */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs px-3 py-2 rounded-xl flex items-center gap-3 z-10 border border-slate-800/80">
              <button 
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="text-slate-400 hover:text-white transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-slate-300 font-extrabold">{Math.round(zoomLevel * 100)}%</span>
              <button 
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                className="text-slate-400 hover:text-white transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-3 bg-slate-800"></div>
              <button
                onClick={() => setIsAddingPin(prev => !prev)}
                className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider transition-all px-2 py-0.5 rounded ${
                  isAddingPin 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingPin ? 'Click Blueprint' : 'Add Pin'}
              </button>
            </div>

            {/* Vector Blueprint SVG Canvas */}
            <div 
              onClick={handleBlueprintClick}
              className={`h-96 w-full flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                isAddingPin ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              <div 
                className="transition-transform duration-200 ease-out absolute inset-0 flex items-center justify-center p-8"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {/* Simulated Blueprint SVG drawing */}
                <svg viewBox="0 0 400 300" className="w-full h-full stroke-sky-400/80 fill-none stroke-[1.5] max-w-lg">
                  {/* Grid Lines */}
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" stroke="#0f3458" strokeWidth="0.5" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" stroke="#0e2f50" strokeWidth="1" />

                  {/* Outer Wall Boundary */}
                  <rect x="50" y="50" width="300" height="200" strokeWidth="3" stroke="#2484C6" />
                  
                  {/* Internal Rooms Partition */}
                  <line x1="150" y1="50" x2="150" y2="250" />
                  <line x1="150" y1="150" x2="350" y2="150" />
                  <line x1="250" y1="150" x2="250" y2="250" />

                  {/* Doors Arc Indicator */}
                  <path d="M 150 110 A 40 40 0 0 1 110 150" strokeDasharray="3 3" />
                  <line x1="150" y1="110" x2="150" y2="150" />

                  <path d="M 250 210 A 40 40 0 0 1 210 250" strokeDasharray="3 3" />
                  <line x1="250" y1="210" x2="250" y2="250" />

                  {/* Columns Indicator */}
                  <rect x="47" y="47" width="6" height="6" fill="#2484C6" />
                  <rect x="347" y="47" width="6" height="6" fill="#2484C6" />
                  <rect x="47" y="247" width="6" height="6" fill="#2484C6" />
                  <rect x="347" y="247" width="6" height="6" fill="#2484C6" />
                  
                  {/* Structural labels */}
                  <text x="70" y="90" fill="#38BDF8" fontSize="8" stroke="none" fontWeight="bold">ROOM A (Lobby)</text>
                  <text x="210" y="100" fill="#38BDF8" fontSize="8" stroke="none" fontWeight="bold">OFFICE SUITE B</text>
                  <text x="200" y="200" fill="#38BDF8" fontSize="8" stroke="none" fontWeight="bold">CONFERENCE ROOM</text>
                </svg>

                {/* Render existing pins */}
                {drawing.pins.map(pin => (
                  <div
                    key={pin.id}
                    className="absolute w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-black shadow-xs cursor-pointer group animate-pulse"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    title={`${pin.author}: ${pin.message}`}
                  >
                    {pin.id}
                    
                    {/* Hover tooltip */}
                    <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white p-2 rounded-xl text-[10px] shadow-lg z-20 border border-slate-700 leading-normal font-semibold">
                      <strong className="block text-[8px] font-black uppercase text-rose-400">{pin.author}</strong>
                      {pin.message}
                    </div>
                  </div>
                ))}

                {/* Render temp pin placement overlay input */}
                {tempCoords && (
                  <div 
                    className="absolute z-20 bg-slate-900 border border-slate-750 p-3 rounded-2xl shadow-xl w-56 flex flex-col gap-2"
                    style={{ left: `${tempCoords.x}%`, top: `${tempCoords.y}%` }}
                  >
                    <span className="text-[8px] font-black text-rose-450 uppercase tracking-widest leading-none">Place Pin Annotations</span>
                    <input 
                      type="text" 
                      placeholder="Comment for this area..." 
                      value={newPinMessage}
                      onChange={(e) => setNewPinMessage(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-100 bg-slate-800 text-[10px] font-semibold"
                    />
                    <div className="flex gap-1.5 justify-end">
                      <button 
                        onClick={() => setTempCoords(null)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[9px] font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSavePin}
                        className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Revision Version timeline history */}
          <Card title="Revision History Vault" subtitle="Chronological blueprint uploads list. Previous versions remain accessible">
            <div className="space-y-4 pt-2">
              {drawing.versions.map((ver, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white border border-slate-150 rounded-xl font-black text-[10px] text-slate-650">
                      {ver.version}
                    </span>
                    <div>
                      <strong className="text-slate-805 block">Changes: {ver.changeLog}</strong>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-semibold">Uploaded by {ver.uploader} on {ver.date}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Downloading blueprint revision version: ${ver.version}`)}
                    className="px-3.5 py-1.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black uppercase transition-all shadow-3xs"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Columns (1/3 width): Metadata, Comments thread, approvals */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Document Info</h4>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Project Link</span>
                <span className="font-extrabold text-slate-700">{drawing.project}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Uploader</span>
                <span className="font-semibold text-slate-700">{drawing.uploadedBy}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Upload Date</span>
                <span className="font-semibold text-slate-700">{drawing.uploadedDate}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Access Rights</span>
                <span className="font-bold text-[#2484C6]">{drawing.accessLevel}</span>
              </div>
            </div>
          </div>

          {/* Workflow approval controls */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Approval Sign-off</h4>
            
            <div className="space-y-2">
              {drawing.status === 'Pending Review' && (
                <>
                  <button
                    onClick={handleApprove}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase transition-all shadow-sm"
                  >
                    Approve Drawing
                  </button>
                  <button
                    onClick={() => alert("Rejection comments logged. designer notified for reworking blueprints.")}
                    className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black uppercase transition-all"
                  >
                    Reject & Request Revision
                  </button>
                </>
              )}

              {drawing.status === 'Approved' && (
                <button
                  onClick={handleLockGfc}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  Lock as Final GFC Release
                </button>
              )}

              {drawing.status === 'GFC Locked' && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-indigo-800 leading-normal">
                    This file is GFC Locked. Structural details are final and visible to staff and customers.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Linked Tasks */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-3">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Linked Operations</h4>
            <div className="space-y-2">
              {drawing.linkedTasks.map((t, idx) => (
                <span key={idx} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Comments Feed thread */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Comments Thread</h4>
            <div className="max-h-40 overflow-y-auto space-y-2.5 pr-1">
              {drawing.comments.map(c => (
                <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-[8px] text-slate-450 font-bold uppercase">
                    <span>{c.author}</span>
                    <span>{c.date}</span>
                  </div>
                  <p className="font-semibold text-slate-700 leading-normal">{c.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type a design comment..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs"
              >
                Post
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
