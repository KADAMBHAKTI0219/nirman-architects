import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Edit3, MessageSquare, History, FileText, CheckCircle, Clock } from 'lucide-react';

export default function DrawingViewer({ drawing, onClose, onStatusChange }) {
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments', 'history', 'workflow'
  const [comments, setComments] = useState(drawing.commentsList || [
    { id: 1, author: "John Doe (PM)", text: "Please verify the load bearing column alignment in the master bedroom.", date: "2026-07-20 14:00" },
    { id: 2, author: "Sarah Connor (Architect)", text: "Updated drawing in V1.1 with corrected columns.", date: "2026-07-21 09:30" }
  ]);
  const [newComment, setNewComment] = useState('');
  const [drawingStatus, setDrawingStatus] = useState(drawing.status || 'Pending Review');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#EF4444');
  
  const canvasRef = useRef(null);
  const canvasContextRef = useRef(null);

  // Initialize Canvas for Annotations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set display size
    canvas.width = 600;
    canvas.height = 400;
    
    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = brushColor;
    context.lineWidth = 3;
    canvasContextRef.current = context;
  }, [brushColor]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    canvasContextRef.current.beginPath();
    canvasContextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    canvasContextRef.current.lineTo(offsetX, offsetY);
    canvasContextRef.current.stroke();
  };

  const stopDrawing = () => {
    canvasContextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearAnnotations = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const commentObj = {
      id: Date.now(),
      author: "CurrentUser (Simulated)",
      text: newComment,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    
    setComments([...comments, commentObj]);
    setNewComment('');
  };

  const handleUpdateStatus = (status) => {
    setDrawingStatus(status);
    if (onStatusChange) onStatusChange(drawing.id, status);
  };

  // Mock versions list
  const versions = [
    { version: "V1.1", date: "2026-07-21 09:30", author: "Sarah Connor", log: "Revised master bedroom columns" },
    { version: "V1.0", date: "2026-07-18 10:15", author: "Sarah Connor", log: "Initial drafting upload" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col md:flex-row overflow-hidden border border-slate-100">
        
        {/* Left Side: Visual Drawing Area */}
        <div className="flex-1 bg-slate-900 flex flex-col relative h-[50vh] md:h-auto">
          {/* Header controls inside viewer */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-xl p-1 pointer-events-auto">
              <button 
                onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoom(1)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-xl p-1 pointer-events-auto">
              <span className="text-white text-xs font-semibold px-2">Annotation Tool</span>
              <button 
                onClick={clearAnnotations}
                className="text-[10px] px-2 py-1 text-slate-200 bg-white/10 rounded hover:bg-white/20 transition-colors"
              >
                Clear Draw
              </button>
              <input 
                type="color" 
                value={brushColor} 
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-5 h-5 border-none cursor-pointer rounded bg-transparent"
              />
            </div>
          </div>

          {/* Main Visual Container */}
          <div className="flex-1 flex items-center justify-center overflow-auto relative p-6">
            <div 
              className="relative transition-transform duration-200 origin-center bg-white shadow-lg rounded-md"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Drawing image */}
              <img 
                src={drawing.fileUrl || "/placeholder-drawing.jpg"} 
                alt={drawing.title} 
                className="max-w-[500px] h-[350px] object-contain select-none pointer-events-none"
                onError={(e) => {
                  // fallback visual placeholder
                  e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='350' viewBox='0 0 500 350'><rect width='100%' height='100%' fill='%23EEF2F6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2364748B'>[Nirman Blueprint Blueprint View - Interactive Canvas]</text><line x1='50' y1='50' x2='450' y2='300' stroke='%23CBD5E1' stroke-width='2'/><line x1='50' y1='300' x2='450' y2='50' stroke='%23CBD5E1' stroke-width='2'/></svg>";
                }}
              />
              
              {/* HTML5 Canvas overlay for annotation */}
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="absolute inset-0 cursor-crosshair z-10"
              />
            </div>
          </div>
          
          {/* Metadata Footer */}
          <div className="p-4 bg-black/35 border-t border-white/10 text-white flex justify-between items-center">
            <div>
              <span className="text-xs text-slate-300 font-semibold">{drawing.category || "General concept"}</span>
              <h4 className="text-sm font-bold truncate max-w-sm">{drawing.title}</h4>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
              drawingStatus === 'Approved' ? 'bg-emerald-500/20 text-emerald-300' :
              drawingStatus === 'Revisions Required' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {drawingStatus}
            </span>
          </div>
        </div>

        {/* Right Side: Tab Panel (Comments, History, Workflow approvals) */}
        <div className="w-full md:w-[400px] bg-slate-50 border-l border-slate-100 flex flex-col h-[35vh] md:h-auto">
          {/* Close Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <span className="text-sm font-bold text-slate-800">Drawing Panel</span>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 font-semibold"
            >
              ✕ Close
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 border-b border-slate-100 p-1">
            <button 
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'comments' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Comments
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'history' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Versions
            </button>
            <button 
              onClick={() => setActiveTab('workflow')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'workflow' ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Workflow
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4">
            
            {/* 1. Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-slate-800">{comment.author}</span>
                        <span className="text-[9px] text-slate-400">{comment.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-200/50 mt-4 flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type comments & notes..."
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  <button 
                    type="submit" 
                    className="px-3 py-2 bg-brand-dark hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* 2. Version History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Version Logs</h5>
                <div className="relative pl-4 border-l-2 border-slate-200 space-y-6">
                  {versions.map((ver, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-50"></span>
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-850">{ver.version}</strong>
                          <span className="text-[10px] text-slate-400">{ver.date}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Uploaded by: {ver.author}</span>
                        <p className="text-slate-650 mt-1 italic">"{ver.log}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Workflow Tab */}
            {activeTab === 'workflow' && (
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Approval Workflow Tracker</h5>
                
                {/* Visual Pipeline */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <div className="text-xs">
                      <div className="font-bold text-slate-700">Designer Stage</div>
                      <span className="text-[10px] text-slate-400">Approved by Sarah Connor</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${drawingStatus === 'Revisions Required' ? 'text-rose-500' : 'text-emerald-500'}`} />
                    <div className="text-xs">
                      <div className="font-bold text-slate-700">Project Manager Stage</div>
                      <span className="text-[10px] text-slate-400">Reviewed & comment logged</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      drawingStatus === 'Approved' ? 'bg-emerald-500 border-emerald-500 text-white' : 
                      drawingStatus === 'Revisions Required' ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      <span className="text-[9px]">3</span>
                    </div>
                    <div className="text-xs">
                      <div className="font-bold text-slate-700">Admin Approval</div>
                      <span className="text-[10px] text-slate-400">Awaiting final GFC release sign-off</span>
                    </div>
                  </div>
                </div>

                {/* Status Changer Actions */}
                <div className="pt-4 border-t border-slate-200/50 space-y-2.5">
                  <label className="text-xs font-bold text-slate-600 block">Actions (Simulation Role)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleUpdateStatus('Approved')}
                      className="px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all"
                    >
                      Approve (GFC Release)
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus('Revisions Required')}
                      className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all"
                    >
                      Request Revisions
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Panel Footer */}
          <div className="p-4 bg-slate-100/50 border-t border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block">Nirman ERP V2 Drawing System</span>
          </div>
        </div>

      </div>
    </div>
  );
}
