import React, { useState, useRef, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, MapPin, MessageSquare, 
  CheckCircle, AlertTriangle, FileText, Send, Lock, Eye, Download, 
  History, GitCompare, ArrowLeft, ShieldCheck, Check, Share2, Layers, MoreVertical, PenTool
} from 'lucide-react';
import { 
  approveDrawing, 
  requestDrawingChanges, 
  postDrawingComment, 
  getDrawingComments,
  getClientApprovalLog,
  compareDrawingVersions,
  getCachedDrawingFile
} from '../../service/drawing';
import MarkupEditor from '../admin/markup/MarkupEditor';
import { detectFileType, getCleanFileUrl } from '../../utils/fileTypeDetector';

export default function DrawingViewer({
  drawing,
  onClose,
  onStatusChange,
  userPermissionLevel = 'OWNER', // OWNER, MEMBER, VIEW_ONLY
  initialMarkupMode = false
}) {
  const drawingId = drawing._id || drawing.id || 'drg-101';
  const [zoom, setZoom] = useState(1);
  const [showFullMarkup, setShowFullMarkup] = useState(initialMarkupMode);
  const [activeTab, setActiveTab] = useState('comments'); // comments, history, compare, clientLogs
  
  // Status state
  const [drawingStatus, setDrawingStatus] = useState(drawing.status || 'PENDING_CLIENT_APPROVAL');
  
  // Comments and pins state
  const [comments, setComments] = useState(drawing.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [pinnedCoords, setPinnedCoords] = useState(null);
  const [isDraftNote, setIsDraftNote] = useState(false);

  // Compare state (Section 17.4)
  const [versionA, setVersionA] = useState(1);
  const [versionB, setVersionB] = useState(2);
  const [compareData, setCompareData] = useState(null);

  // Approval audit logs state (Section 17.9)
  const [approvalLogs, setApprovalLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#EF4444');

  // Load existing comments & approval logs on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const commRes = await getDrawingComments(drawingId);
        if (commRes && commRes.comments) {
          setComments(commRes.comments);
        }
      } catch (err) {
        console.warn("Could not fetch comments:", err);
      }

      setLogLoading(true);
      try {
        const logRes = await getClientApprovalLog(drawingId);
        if (logRes && logRes.logs) {
          setApprovalLogs(logRes.logs);
        }
      } catch (err) {
        console.warn("Could not fetch approval logs:", err);
      } finally {
        setLogLoading(false);
      }
    };
    loadInitialData();
  }, [drawingId]);

  // Load compare data when versions change (Section 17.4)
  useEffect(() => {
    if (activeTab === 'compare') {
      const fetchCompare = async () => {
        try {
          const res = await compareDrawingVersions(drawingId, versionA, versionB);
          if (res && res.success) {
            setCompareData(res);
          }
        } catch (err) {
          console.warn("Compare endpoint warning:", err);
        }
      };
      fetchCompare();
    }
  }, [drawingId, versionA, versionB, activeTab]);

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPinnedCoords({ x: Math.round(x), y: Math.round(y) });
  };

  const clearAnnotations = () => {
    setPinnedCoords(null);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 17.7 POST /api/client/drawings/:drawingId/comments
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const payload = {
      commentText: newCommentText,
      annotationCoords: pinnedCoords,
      isDraft: isDraftNote
    };

    try {
      const res = await postDrawingComment(drawingId, payload);
      const newObj = res.comment || {
        _id: 'c_' + Date.now(),
        author: 'Current User',
        text: newCommentText,
        isDraft: isDraftNote,
        annotationCoords: pinnedCoords,
        actedAt: new Date().toISOString()
      };
      setComments([newObj, ...comments]);
      setNewCommentText('');
      setPinnedCoords(null);
    } catch (err) {
      alert("Failed to post comment.");
    }
  };

  // 17.5 POST /api/client/drawings/:drawingId/approve (OWNER / MEMBER only)
  const handleApprove = async () => {
    if (userPermissionLevel === 'VIEW_ONLY') {
      alert("HTTP 403 Forbidden: VIEW_ONLY contact level accounts cannot approve drawings.");
      return;
    }

    try {
      const res = await approveDrawing(drawingId, "Approved by client");
      setDrawingStatus('APPROVED');
      if (onStatusChange) onStatusChange(drawingId, 'APPROVED');
      alert(res.message || "Drawing approved successfully!");
      const updatedLogs = await getClientApprovalLog(drawingId);
      if (updatedLogs?.logs) setApprovalLogs(updatedLogs.logs);
    } catch (err) {
      alert(err.message || "Failed to approve drawing.");
    }
  };

  // 17.6 POST /api/client/drawings/:drawingId/request-changes (OWNER / MEMBER only)
  const handleRequestChanges = async () => {
    if (userPermissionLevel === 'VIEW_ONLY') {
      alert("HTTP 403 Forbidden: View Only accounts cannot request changes.");
      return;
    }

    if (drawingStatus === 'APPROVED') {
      alert("Approved drawings are locked. A new revision must be uploaded by the design team to make changes.");
      return;
    }

    const commentsInput = await window.prompt("Comments are mandatory when requesting changes. Enter notes for design team:", "", "Request Design Revisions");
    if (!commentsInput || !commentsInput.trim()) {
      return;
    }

    try {
      const res = await requestDrawingChanges(drawingId, commentsInput.trim());
      setDrawingStatus('CHANGES_REQUESTED');
      if (onStatusChange) onStatusChange(drawingId, 'CHANGES_REQUESTED');
      alert(res.message || "Changes requested successfully.");
      const updatedLogs = await getClientApprovalLog(drawingId);
      if (updatedLogs?.logs) setApprovalLogs(updatedLogs.logs);
    } catch (err) {
      alert(err.message || "Failed to request changes.");
    }
  };

  const versions = drawing.versions || [
    { versionNumber: 1, fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', notes: 'Initial Layout Draft', uploadedAt: '2026-07-15T10:00:00Z' },
    { versionNumber: 2, fileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', notes: 'V2 with revised column positioning', uploadedAt: '2026-07-20T14:30:00Z' }
  ];

  if (showFullMarkup) {
    return (
      <MarkupEditor
        documentData={drawing}
        onBack={() => {
          if (initialMarkupMode) {
            onClose();
          } else {
            setShowFullMarkup(false);
          }
        }}
        onSaveDocument={(updated) => {
          if (onStatusChange) onStatusChange(drawingId, updated.status || 'APPROVED');
          if (initialMarkupMode) onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* 1. TOP HEADER BAR matching dark UI with title, status & action buttons */}
      <div className="h-16 bg-[#1A2536] border-b border-slate-800 px-6 flex items-center justify-between shadow-md z-30 shrink-0">
        
        {/* Left: Back button + Title + Version + Status */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-800 text-slate-300 rounded-xl transition-all cursor-pointer shrink-0"
            title="Close Viewer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white tracking-tight leading-none">{drawing.title || drawing.name}</h3>
                <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-black rounded-md font-mono">
                  V{drawing.currentVersion || '1.0'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-slate-400">
                <span className={
                  drawingStatus === 'APPROVED' ? 'text-emerald-400 font-bold' :
                  drawingStatus === 'CHANGES_REQUESTED' ? 'text-amber-400 font-bold' : 'text-sky-400 font-bold'
                }>
                  {drawingStatus === 'APPROVED' ? 'Approved' : drawingStatus === 'CHANGES_REQUESTED' ? 'Changes Requested' : 'Pending Review'}
                </span>
                <span>• Saved just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Header Toolbar + Request Changes (Orange ✓) & Approve Buttons */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setShowFullMarkup(true)}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all border border-sky-400/40"
            title="Open Full CAD Markup & Pen Canvas Editor"
          >
            <PenTool className="w-4 h-4" />
            <span>Markup Tools</span>
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-slate-300">
            <button onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold px-2">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(1)} className="p-1.5 hover:bg-slate-800 rounded-lg cursor-pointer" title="Reset">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Action Bar Tools */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-slate-400">
            <button onClick={() => alert("Drawing downloaded")} className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer" title="Download">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => alert("Share drawing link")} className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={() => setActiveTab('history')} className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer" title="Layers / Versions">
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Top Right Orange Checkmark Button for Request Changes (User Request) */}
          <button
            onClick={handleRequestChanges}
            className="w-10 h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full flex items-center justify-center font-black shadow-lg hover:scale-105 transition-all cursor-pointer border border-amber-300"
            title="Request Changes (Click to save & submit revision comments)"
          >
            <Check className="w-5 h-5 stroke-[3]" />
          </button>

          {/* Approve Button */}
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>

        </div>

      </div>

      {/* MAIN BODY: Canvas Viewer + Workflow Tab Panel */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Side: Visual Drawing Canvas */}
        <div className="flex-1 bg-slate-950 flex flex-col relative overflow-hidden">
          
          {/* Main Visual Container */}
          <div className="flex-1 flex items-center justify-center overflow-auto relative p-6">
            <div 
              className="relative transition-transform duration-200 origin-center bg-slate-900 shadow-2xl rounded-xl border border-slate-800 overflow-hidden"
              style={{ transform: `scale(${zoom})` }}
              onClick={handleImageClick}
            >
              {(() => {
                const cached = getCachedDrawingFile(drawing._id || drawing.id || drawing.drawingNumber);
                const targetUrl = cached || drawing.fileUrl || drawing.filePath || drawing.pdfUrl || drawing.url;
                const rawUrl = getCleanFileUrl(targetUrl);
                const type = detectFileType(targetUrl || rawUrl, drawing);

                if (type === 'pdf' && rawUrl) {
                  const iframeSrc = rawUrl.includes('#') ? rawUrl : `${rawUrl}#toolbar=1&navpanes=1`;
                  return (
                    <iframe
                      src={iframeSrc}
                      title={drawing.title || drawing.name}
                      className="w-[850px] h-[550px] max-w-full rounded-xl border-0 bg-white shadow-2xl"
                    />
                  );
                }

                const fallbackImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
                return (
                  <img 
                    src={rawUrl || fallbackImg} 
                    alt={drawing.title || drawing.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackImg;
                    }}
                    className="max-w-full max-h-[550px] object-contain rounded-xl select-none shadow-2xl"
                  />
                );
              })()}

              {/* Display pinned annotation markers */}
              {comments.map((c, i) => {
                if (!c.annotationCoords || !c.annotationCoords.x) return null;
                return (
                  <div
                    key={i}
                    style={{ left: `${c.annotationCoords.x}px`, top: `${c.annotationCoords.y}px` }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  >
                    <div className={`p-1.5 rounded-full shadow-lg ${c.isDraft ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'}`}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] p-2 rounded-xl whitespace-nowrap shadow-xl z-30 border border-slate-700">
                      <strong className="block">{c.author} {c.isDraft ? '(Draft Note)' : ''}</strong>
                      <span>{c.text}</span>
                    </div>
                  </div>
                );
              })}

              {/* Temporary Pinned Marker */}
              {pinnedCoords && (
                <div
                  style={{ left: `${pinnedCoords.x}px`, top: `${pinnedCoords.y}px` }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 animate-bounce"
                >
                  <div className="p-1.5 rounded-full bg-indigo-500 text-white shadow-xl ring-4 ring-indigo-300/40">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              )}
              
              {/* HTML5 Canvas overlay */}
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
          
          {/* Canvas Bottom Sub-Bar */}
          <div className="p-3 bg-[#1A2536] border-t border-slate-800 text-white flex justify-between items-center px-6">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-semibold">{drawing.category || "Working Drawings"} • Permission: <strong className="text-indigo-400 font-bold">{userPermissionLevel}</strong></span>
            </div>
            <button
              onClick={handleRequestChanges}
              className="text-xs text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Request Changes with Comments
            </button>
          </div>
        </div>

        {/* Right Side: Tab Panel (Comments, Versions, Client Logs, Side-by-Side Compare) */}
        <div className="w-full md:w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col h-[40vh] md:h-auto text-slate-200">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1A2536]">
            <span className="text-xs font-black uppercase text-slate-300 tracking-wider">Drawing Workflow Panel</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-semibold text-xs cursor-pointer">&times; Close</button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-950 border-b border-slate-800 p-1 text-[10px]">
            <button 
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'comments' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-400'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Comments
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'history' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-400'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Versions
            </button>
            <button 
              onClick={() => setActiveTab('compare')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'compare' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-400'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" /> Compare
            </button>
            <button 
              onClick={() => setActiveTab('clientLogs')}
              className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'clientLogs' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-400'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Logs
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* 1. Comments & Annotations Tab (17.7 & 17.8) */}
            {activeTab === 'comments' && (
              <div className="space-y-4 flex flex-col h-full justify-between">
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                  {comments.length === 0 ? (
                    <div className="p-4 bg-slate-950/60 rounded-xl text-center text-xs text-slate-400 italic border border-slate-800">
                      No pin comments posted yet. Click on the canvas image to pin annotations.
                    </div>
                  ) : (
                    comments.map((c, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border text-xs space-y-1 ${c.isDraft ? 'bg-amber-950/20 border-amber-800/40 text-amber-200' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-sky-400">{c.author || 'Member'} {c.isDraft ? '(Private Draft)' : ''}</span>
                          <span className="text-slate-500">{c.actedAt ? new Date(c.actedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                        </div>
                        <p>{c.text || c.commentText}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Form to post comment */}
                <form onSubmit={handlePostComment} className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isDraftNote} 
                        onChange={(e) => setIsDraftNote(e.target.checked)} 
                        className="rounded bg-slate-800 border-slate-700 text-indigo-500"
                      />
                      <span>Private Draft Note</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Type comment or click image to pin..."
                      className="flex-1 text-xs border border-slate-800 rounded-xl px-3 py-2 bg-slate-950 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button type="submit" className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-xs cursor-pointer">
                      Post
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. Version History Tab (17.3) */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h5 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Historical Revisions</h5>
                <div className="relative pl-4 border-l-2 border-slate-800 space-y-5">
                  {versions.map((ver, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 border border-slate-900"></span>
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-bold">Revision V{ver.versionNumber || (idx + 1)}</strong>
                          <span className="text-[10px] text-slate-400">{ver.uploadedAt ? new Date(ver.uploadedAt).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <p className="text-slate-400 mt-1 italic text-[11px]">"{ver.notes || 'Version revision file'}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Side-by-Side Version Compare Tab (17.4) */}
            {activeTab === 'compare' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h5 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <GitCompare className="w-4 h-4 text-indigo-400" /> Side-by-Side Version Compare
                  </h5>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block uppercase">Version A</label>
                    <select
                      value={versionA}
                      onChange={(e) => setVersionA(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-800 rounded-xl bg-slate-950 text-xs font-bold text-white"
                    >
                      {versions.map(v => (
                        <option key={v.versionNumber} value={v.versionNumber}>Version {v.versionNumber}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block uppercase">Version B</label>
                    <select
                      value={versionB}
                      onChange={(e) => setVersionB(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-800 rounded-xl bg-slate-950 text-xs font-bold text-white"
                    >
                      {versions.map(v => (
                        <option key={v.versionNumber} value={v.versionNumber}>Version {v.versionNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-white space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                      <span className="text-[10px] font-black text-sky-400 uppercase">Version {versionA} vs Version {versionB}</span>
                      <span className="text-[9px] text-emerald-400 font-bold">Comparative Analysis</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic">
                      "{compareData?.version1?.notes || compareData?.version2?.notes || 'First draft vs latest revision changes compared side-by-side.'}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Client Approval Audit Logs (17.9) */}
            {activeTab === 'clientLogs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h5 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Client Approval History</h5>
                  <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 font-bold text-[10px] rounded-md">
                    {approvalLogs.length} Log Entries
                  </span>
                </div>

                {logLoading ? (
                  <div className="p-6 text-center text-xs text-slate-500 font-bold">Loading audit logs...</div>
                ) : approvalLogs.length > 0 ? (
                  <div className="space-y-3">
                    {approvalLogs.map((log) => {
                      const isApp = log.action === 'APPROVED';
                      return (
                        <div key={log._id} className="p-3 rounded-2xl border bg-slate-950 border-slate-800 text-xs space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isApp ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                              {log.action}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {log.actedAt ? new Date(log.actedAt).toLocaleString() : 'Recent'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 italic">"{log.comments}"</p>
                          <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-800/80">
                            By: <strong className="text-slate-200">{log.contactId?.name || 'Contact'}</strong> ({log.contactId?.permissionLevel || 'Client'})
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-950/60 rounded-2xl border border-slate-800">
                    No approval or change logs recorded yet for this drawing.
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
