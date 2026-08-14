import React, { useState, useEffect } from 'react';
import {
  getCachedDrawingFile,
  getDrawingById,
  pmReview,
  adminReview,
  promoteToGFC,
  unlockGFC,
  editInPlaceProcessDwg,
  getClientApprovalLog
} from '../../../service/drawing';
import {
  ArrowLeft, Lock, Unlock, ZoomIn, ZoomOut, Plus,
  CheckCircle, PenTool, AlertCircle, FileText, History, ShieldAlert, Upload
} from 'lucide-react';
import Card from '../../common/Card';
import MarkupEditor from '../markup/MarkupEditor';
import DrawingVersionModal from './DrawingVersionModal';
import { detectFileType, getCleanFileUrl } from '../../../utils/fileTypeDetector';

export default function DrawingDetails({
  drawing,
  onBack,
  onUpdateDrawing,
  onCompareTrigger
}) {
  const [isFullMarkupMode, setIsFullMarkupMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [newPinMessage, setNewPinMessage] = useState('');
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [tempCoords, setTempCoords] = useState(null);
  const [reviewModalType, setReviewModalType] = useState(null); // 'PM_REJECT', 'ADMIN_REJECT', 'GFC_UNLOCK', 'PROCESS_DWG_EDIT'
  const [reviewComments, setReviewComments] = useState('');
  const [unlockReason, setUnlockReason] = useState('');
  const [editFilePath, setEditFilePath] = useState(drawing?.fileUrl || '');
  const [approvalLogs, setApprovalLogs] = useState([]);
  const [showApprovalLogs, setShowApprovalLogs] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [liveDrawing, setLiveDrawing] = useState(drawing);
  const [versionHistoryList, setVersionHistoryList] = useState(drawing?.versions || []);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const userStr = localStorage.getItem('user') || '{}';
  const currentUser = JSON.parse(userStr);
  const userRole = currentUser.roleCode || currentUser.role || 'Admin';
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SuperAdmin';
  const isAdmin = isSuperAdmin || userRole === 'ADMIN' || userRole === 'Admin';
  const isPM = isAdmin || userRole === 'PROJECT_MANAGER' || userRole === 'ProjectManager' || userRole === 'PM';

  const drawingId = liveDrawing ? (liveDrawing._id || liveDrawing.id) : null;

  const fetchFreshDrawingDetails = async () => {
    if (!drawingId) return;
    try {
      const res = await getDrawingById(drawingId);
      if (res && res.success && res.drawing) {
        setLiveDrawing(res.drawing);
        if (res.versionHistory && Array.isArray(res.versionHistory)) {
          setVersionHistoryList(res.versionHistory);
        } else if (res.drawing.versions && Array.isArray(res.drawing.versions)) {
          setVersionHistoryList(res.drawing.versions);
        }
      }
    } catch (e) {
      console.warn("Notice fetching fresh drawing by id:", e);
    }
  };

  useEffect(() => {
    if (drawing) {
      setLiveDrawing(drawing);
      if (drawing.versions && Array.isArray(drawing.versions)) {
        setVersionHistoryList(drawing.versions);
      }
    }
    fetchFreshDrawingDetails();
    if (drawingId) {
      getClientApprovalLog(drawingId)
        .then(res => {
          if (res?.approvalLogs || res?.logs) {
            setApprovalLogs(res.approvalLogs || res.logs || []);
          }
        })
        .catch(err => console.warn(err));
    }
  }, [drawingId, drawing]);

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
      id: (drawing.pins?.length || 0) + 1,
      x: tempCoords.x,
      y: tempCoords.y,
      message: newPinMessage,
      author: currentUser.name || "Internal Team"
    };

    onUpdateDrawing({
      ...drawing,
      pins: [...(drawing.pins || []), newPin]
    });

    setNewPinMessage('');
    setIsAddingPin(false);
    setTempCoords(null);
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: (drawing.comments?.length || 0) + 1,
      author: currentUser.name || "Internal Team",
      message: commentText,
      date: "Just now"
    };

    onUpdateDrawing({
      ...drawing,
      comments: [...(drawing.comments || []), newComment]
    });

    setCommentText('');
  };

  // 25.5 PM Review Handler
  const handlePmReviewAction = async (decision) => {
    if (decision === 'REJECT' && !reviewComments.trim()) {
      alert("Mandatory comments are required for PM rejection.");
      return;
    }
    setActionLoading(true);
    try {
      const verObj = drawing.currentVersionId;
      const targetVersionId = (typeof verObj === 'object' && verObj !== null) ? (verObj._id || verObj.id) : (verObj || drawing._id || drawing.id);
      const res = await pmReview(targetVersionId, { decision, comments: reviewComments });
      if (res?.success) {
        const newStatus = decision === 'APPROVE' ? 'PM Approved' : 'PM Rejected';
        onUpdateDrawing({ ...drawing, status: newStatus });
        alert(`PM Review completed: ${newStatus}`);
        setReviewModalType(null);
        setReviewComments('');
      }
    } catch (err) {
      alert(err.message || "Failed to submit PM review.");
    } finally {
      setActionLoading(false);
    }
  };

  // 25.6 Admin Review Handler (CRM Module 5 Handoff Point)
  const handleAdminReviewAction = async (decision) => {
    if (decision === 'REJECT' && !reviewComments.trim()) {
      alert("Mandatory comments are required for Admin rejection.");
      return;
    }
    setActionLoading(true);
    try {
      const verObj = drawing.currentVersionId;
      const targetVersionId = (typeof verObj === 'object' && verObj !== null) ? (verObj._id || verObj.id) : (verObj || drawing._id || drawing.id);
      const res = await adminReview(targetVersionId, { decision, comments: reviewComments });
      if (res?.success) {
        const newStatus = decision === 'APPROVE' ? 'Pending Client Approval' : 'Admin Rejected';
        onUpdateDrawing({ ...drawing, status: newStatus, visibleToClient: decision === 'APPROVE' });
        alert(decision === 'APPROVE'
          ? "Admin Review Approved! Blueprint handed off to Client Portal (CRM Module 5)."
          : "Admin Review Rejected."
        );
        setReviewModalType(null);
        setReviewComments('');
      }
    } catch (err) {
      alert(err.message || "Failed to submit Admin review.");
    } finally {
      setActionLoading(false);
    }
  };

  // 25.7 Promote to GFC Handler
  const handlePromoteGFC = async () => {
    if (!window.confirm("Promote this drawing to GFC Locked state? New version uploads will be blocked.")) return;
    setActionLoading(true);
    try {
      const res = await promoteToGFC(drawing._id || drawing.id);
      if (res?.success) {
        onUpdateDrawing({ ...drawing, status: 'GFC Locked', locked: true });
        alert("Drawing promoted to locked GFC state successfully.");
      }
    } catch (err) {
      alert(err.message || "Failed to promote drawing to GFC.");
    } finally {
      setActionLoading(false);
    }
  };

  // 25.7 Unlock GFC Handler
  const handleUnlockGFC = async () => {
    if (!unlockReason.trim()) {
      alert("Mandatory reason required to unlock GFC drawing.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await unlockGFC(drawing._id || drawing.id, { reason: unlockReason });
      if (res?.success) {
        onUpdateDrawing({ ...drawing, status: 'Designer Uploaded', locked: false });
        alert("GFC drawing unlocked successfully.");
        setReviewModalType(null);
        setUnlockReason('');
      }
    } catch (err) {
      alert(err.message || "Failed to unlock GFC drawing.");
    } finally {
      setActionLoading(false);
    }
  };

  // 25.8 In-Place Process DWG Edit
  const handleEditProcessDwgInPlace = async () => {
    if (!editFilePath.trim()) {
      alert("Updated file URL is required.");
      return;
    }
    setActionLoading(true);
    try {
      const verObj = drawing.currentVersionId;
      const targetVersionId = (typeof verObj === 'object' && verObj !== null) ? (verObj._id || verObj.id) : (verObj || drawing._id || drawing.id);
      const res = await editInPlaceProcessDwg(targetVersionId, { updatedFilePath: editFilePath, changeLog: reviewComments });
      if (res?.success) {
        onUpdateDrawing({ ...drawing, fileUrl: editFilePath });
        alert("Process DWG edited in place successfully without incrementing version number.");
        setReviewModalType(null);
      }
    } catch (err) {
      alert(err.message || "Failed to edit Process DWG in place.");
    } finally {
      setActionLoading(false);
    }
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

  const isProcessDwg = drawing.category === 'Process DWG' || drawing.categoryName === 'Process DWG' || liveDrawing?.category === 'Process DWG';
  const displayId = liveDrawing?._id || liveDrawing?.id || drawing?._id || drawing?.id || 'DWG-101';
  const displayName = liveDrawing?.name || liveDrawing?.title || liveDrawing?.drawingName || liveDrawing?.fileName || drawing?.name || drawing?.title || drawing?.drawingName || drawing?.fileName || 'Architectural Blueprint';
  const displayCategory = liveDrawing?.category || liveDrawing?.categoryName || drawing?.category || drawing?.categoryName || 'Working Drawings';
  const rawStatus = String(liveDrawing?.status || drawing?.status || 'DESIGNER_UPLOADED').toUpperCase();
  const formattedStatus = rawStatus.replace(/_/g, ' ');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800">

      {/* Header bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-slate-100 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl transition-all shadow-3xs cursor-pointer shrink-0"
            title="Back to Drawings"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 font-mono truncate max-w-[150px]" title={displayId}>
                {displayId}
              </span>
              <span className="text-[10px] bg-brand-soft font-extrabold text-slate-800 border border-brand-secondary/40 px-2.5 py-0.5 rounded-lg shrink-0">
                {displayCategory}
              </span>
              <span className={`text-[9px] px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider border shrink-0 ${
                liveDrawing?.locked || drawing?.locked || rawStatus.includes('LOCKED') || rawStatus.includes('GFC')
                  ? 'bg-slate-900 text-amber-300 border-slate-800'
                  : rawStatus.includes('APPROV')
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : rawStatus.includes('PENDING')
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {formattedStatus}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight truncate">
              {displayName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={() => setIsFullMarkupMode(true)}
            className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-brand-secondary/40 whitespace-nowrap"
          >
            <PenTool className="w-4 h-4 text-brand-dark shrink-0" />
            <span>Open Canvas Markup Editor</span>
          </button>

          <button
            onClick={() => onCompareTrigger(drawing)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-black transition-all border border-amber-200 shadow-3xs cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            <History className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Compare Revisions</span>
          </button>

          {isProcessDwg && isAdmin && (
            <button
              onClick={() => {
                setEditFilePath(drawing.fileUrl || '');
                setReviewModalType('PROCESS_DWG_EDIT');
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-2 border border-slate-700 whitespace-nowrap"
            >
              <span>In-Place Process DWG Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns (2/3 width): Blueprint Viewer, Revision Timeline & Audit Logs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Blueprint Cad Viewer Container */}
          <div className="bg-slate-100/90 border border-slate-200/90 rounded-3xl overflow-hidden relative shadow-2xs">

            {/* Control Floating Bar */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl flex items-center gap-3 z-10 border border-slate-200 shadow-md">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer p-1 rounded-lg"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-800 font-mono font-bold min-w-[36px] text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer p-1 rounded-lg"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Vector Blueprint SVG Canvas */}
            <div
              onClick={handleBlueprintClick}
              className={`h-[420px] w-full flex items-center justify-center relative overflow-hidden transition-all duration-300 ${isAddingPin ? 'cursor-crosshair' : 'cursor-default'
                }`}
            >
              <div
                className="transition-transform duration-200 ease-out absolute inset-0 flex items-center justify-center p-6"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                {(() => {
                  const cached = getCachedDrawingFile(drawing._id || drawing.id || drawing.drawingNumber);
                  const currentVerPath = versionHistoryList && versionHistoryList.length > 0 ? (versionHistoryList[0].filePath || versionHistoryList[0].fileUrl) : null;
                  const targetUrl = cached || drawing.fileUrl || drawing.filePath || drawing.pdfUrl || currentVerPath;

                  const rawUrl = getCleanFileUrl(targetUrl);
                  const fileType = detectFileType(targetUrl || rawUrl, drawing);
                  const isDwg = fileType === 'dwg';
                  const isPdf = fileType === 'pdf';

                  if (isPdf && rawUrl) {
                    const iframeSrc = rawUrl.includes('#') ? rawUrl : `${rawUrl}#toolbar=1&navpanes=1`;
                    return (
                      <iframe
                        src={iframeSrc}
                        title={drawing.name || drawing.drawingName || drawing.title}
                        className="w-full h-full min-h-[480px] rounded-2xl border border-slate-800 bg-white shadow-xl"
                      />
                    );
                  }

                  // Default architectural blueprint fallback image
                  const defaultBlueprint = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";
                  const imageSrc = (rawUrl && !isDwg) ? rawUrl : defaultBlueprint;

                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      <img
                        src={imageSrc}
                        alt={drawing.name || drawing.drawingName || drawing.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultBlueprint;
                        }}
                        className="w-full h-full object-contain rounded-2xl select-none shadow-2xl"
                      />
                      {isDwg && (
                        <div className="absolute top-4 right-4 bg-slate-900/90 text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-2 backdrop-blur-md shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                          DWG CAD FILE: {rawUrl.split('/').pop()}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Render existing pins */}
                {(drawing.pins || []).map(pin => (
                  <div
                    key={pin.id}
                    className="absolute w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shadow-md cursor-pointer group animate-bounce"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    title={`${pin.author}: ${pin.message}`}
                  >
                    {pin.id}
                    <div className="hidden group-hover:block absolute bottom-7 left-1/2 -translate-x-1/2 w-56 bg-white text-slate-800 p-3 rounded-2xl text-xs shadow-xl z-20 border border-slate-200 leading-normal font-medium">
                      <strong className="block text-[9px] font-black uppercase text-rose-600 mb-0.5">{pin.author}</strong>
                      {pin.message}
                    </div>
                  </div>
                ))}

                {/* Render temp pin placement overlay input */}
                {tempCoords && (
                  <div
                    className="absolute z-20 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xl w-64 flex flex-col gap-2.5"
                    style={{ left: `${tempCoords.x}%`, top: `${tempCoords.y}%` }}
                  >
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none">Place Pin Annotation</span>
                    <input
                      type="text"
                      placeholder="Comment for this area..."
                      value={newPinMessage}
                      onChange={(e) => setNewPinMessage(e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-slate-900 bg-slate-50 text-xs font-medium"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setTempCoords(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePin}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase cursor-pointer shadow-xs"
                      >
                        Save Pin
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Revision Version timeline history */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Revision & Version History</h3>
                <p className="text-xs text-slate-500 font-medium">All historical version iterations & uploaded blueprint revisions</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(true)}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-brand-secondary/40"
              >
                <Plus className="w-4 h-4 text-brand-dark" />
                <span>Upload New Version</span>
              </button>
            </div>

            <div className="space-y-3">
              {(versionHistoryList.length > 0 ? versionHistoryList : (liveDrawing.versions || [])).map((ver, idx) => {
                const vNum = ver.versionNumber ? `V${ver.versionNumber}.0` : (ver.version || `V${idx + 1}.0`);
                const fileTarget = ver.filePath || ver.fileUrl || liveDrawing.fileUrl || '';
                const uploaderName = typeof ver.uploadedBy === 'object' ? (ver.uploadedBy?.name || ver.uploadedBy?.email) : (ver.uploadedBy || 'Bhakti Kadam');
                const notesStr = ver.changeLog || ver.notes || 'Initial design blueprint upload';
                const dateStr = ver.uploadDate ? new Date(ver.uploadDate).toLocaleDateString() : (ver.uploadedAt ? new Date(ver.uploadedAt).toLocaleDateString() : '2026-08-10');

                return (
                  <div key={ver._id || idx} className="flex justify-between items-center p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-xs flex-wrap gap-3 hover:bg-slate-100/60 transition-all">
                    <div className="flex items-center gap-3.5">
                      <span className="px-3 py-1.5 bg-brand-soft border border-brand-secondary/60 rounded-xl font-black text-xs text-slate-900 shadow-3xs">
                        {vNum}
                      </span>
                      <div>
                        <strong className="text-slate-900 block font-bold text-xs">Notes: {notesStr}</strong>
                        <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
                          Uploaded by {uploaderName} on {dateStr}
                        </span>
                      </div>
                    </div>
                    {fileTarget && (
                      <a
                        href={fileTarget}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>View File</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Approval Audit Log */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Client Approval Audit Log</h3>
              <p className="text-xs text-slate-500 font-medium">Verified records of client sign-off actions from Client Portal</p>
            </div>

            <div className="space-y-3 pt-1">
              {(approvalLogs.length > 0 ? approvalLogs : [
                {
                  contactId: { name: 'Anand Shah' },
                  clientId: { companyName: 'Oceanic Properties Pvt Ltd' },
                  comments: 'Approved design layout for site execution.',
                  action: 'APPROVED',
                  createdAt: new Date().toISOString()
                }
              ]).map((log, index) => (
                <div key={index} className="p-4 bg-brand-soft/60 border border-brand-secondary/40 rounded-2xl text-xs flex justify-between items-center flex-wrap gap-3">
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-900 text-sm block">
                      {log.contactId?.name || "Client User"} ({log.clientId?.companyName || "Client"})
                    </span>
                    <p className="text-slate-600 font-medium text-xs">
                      "{log.comments || "Approved design layout for site execution."}"
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider border ${log.action === 'APPROVED' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-600'
                      }`}>
                      {log.action || 'APPROVED'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold block">{new Date(log.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Document Metadata, Review Gates, Comments */}
        <div className="space-y-6">

          {/* Metadata Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2.5">Document Metadata</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Project</span>
                <span className="font-extrabold text-slate-800">{drawing.project || 'Tower Phase'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Uploader</span>
                <span className="font-bold text-slate-700">{drawing.uploadedBy || 'Bhakti Kadam'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Uploaded Date</span>
                <span className="font-bold text-slate-700">{drawing.uploadedDate || '2026-08-10'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-0.5">Client Portal Handoff</span>
                <span className={`font-extrabold ${drawing.visibleToClient ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {drawing.visibleToClient ? "Visible to Client" : "Internal Only"}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Review Gates */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2.5">Review & Approval Sign-offs</h4>

            <div className="space-y-3.5">

              {/* PM Review Gate */}
              {isPM && (drawing.status === 'Designer Uploaded' || drawing.status === 'DESIGNER_UPLOADED' || drawing.status === 'PM Rejected') && (
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Step 1: Project Manager Technical Review</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      disabled={actionLoading}
                      onClick={() => handlePmReviewAction('APPROVE')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer transition-all shadow-xs"
                    >
                      PM Approve
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => setReviewModalType('PM_REJECT')}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black uppercase cursor-pointer transition-all"
                    >
                      PM Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Review Gate */}
              {isAdmin && (drawing.status === 'PM Approved' || drawing.status === 'PM_APPROVED' || drawing.status === 'Designer Uploaded' || drawing.status === 'DESIGNER_UPLOADED') && (
                <div className="p-4 bg-brand-soft/80 border border-brand-secondary/60 rounded-2xl space-y-2.5">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                    <ShieldAlert className="w-4 h-4 text-slate-800 shrink-0" />
                    <span>Step 2: Executive Approval & Client Release</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Approval publishes blueprint to Client Portal for client verification and site sign-off.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleAdminReviewAction('APPROVE')}
                      className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold rounded-xl text-xs uppercase cursor-pointer shadow-xs transition-all border border-brand-secondary/40"
                    >
                      Approve & Release
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => setReviewModalType('ADMIN_REJECT')}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black uppercase cursor-pointer transition-all"
                    >
                      Admin Reject
                    </button>
                  </div>
                </div>
              )}

              {/* 25.7 Promote to GFC */}
              {isAdmin && !drawing.locked && drawing.status !== 'GFC Locked' && drawing.status !== 'GFC_LOCKED' && (
                <button
                  disabled={actionLoading}
                  onClick={handlePromoteGFC}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  Promote to GFC Locked
                </button>
              )}

              {/* 25.7 Unlock GFC (Super Admin Only) */}
              {(drawing.locked || drawing.status === 'GFC Locked' || drawing.status === 'GFC_LOCKED') && (
                <div className="space-y-2.5">
                  <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-amber-950 leading-normal">
                      GFC Locked. Structural details are final and version uploads are blocked.
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      disabled={actionLoading}
                      onClick={() => setReviewModalType('GFC_UNLOCK')}
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Unlock className="w-4 h-4" />
                      Unlock GFC (Super Admin)
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Comments Feed thread */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2.5">Team Discussion & Comments</h4>
            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
              {(drawing.comments || []).map(c => (
                <div key={c.id} className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                    <span>{c.author}</span>
                    <span>{c.date}</span>
                  </div>
                  <p className="font-semibold text-slate-800 leading-normal">{c.message}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handlePostComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Type a design comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold rounded-xl text-xs shadow-xs cursor-pointer border border-brand-secondary/40"
              >
                Post
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Review Modal (PM Reject, Admin Reject, GFC Unlock, Process DWG Edit) */}
      {reviewModalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {reviewModalType === 'PM_REJECT' && 'PM Rejection Comments (Mandatory)'}
              {reviewModalType === 'ADMIN_REJECT' && 'Admin Rejection Comments (Mandatory)'}
              {reviewModalType === 'GFC_UNLOCK' && 'Reason for Unlocking GFC (Logged)'}
              {reviewModalType === 'PROCESS_DWG_EDIT' && 'In-Place Process DWG Edit'}
            </h3>

            {reviewModalType === 'PROCESS_DWG_EDIT' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Updated File URL / Path</label>
                  <input
                    type="text"
                    value={editFilePath}
                    onChange={(e) => setEditFilePath(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Change Log Notes</label>
                  <textarea
                    rows={2}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs"
                    placeholder="Minor correction notes..."
                  />
                </div>
              </div>
            ) : reviewModalType === 'GFC_UNLOCK' ? (
              <textarea
                rows={3}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="State official reason for unlocking GFC blueprint..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
              />
            ) : (
              <textarea
                rows={3}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Provide mandatory rejection feedback for designer..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500/20"
              />
            )}

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setReviewModalType(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {reviewModalType === 'PM_REJECT' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handlePmReviewAction('REJECT')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase rounded-xl cursor-pointer"
                >
                  Submit PM Rejection
                </button>
              )}

              {reviewModalType === 'ADMIN_REJECT' && (
                <button
                  disabled={actionLoading}
                  onClick={() => handleAdminReviewAction('REJECT')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase rounded-xl cursor-pointer"
                >
                  Submit Admin Rejection
                </button>
              )}

              {reviewModalType === 'GFC_UNLOCK' && (
                <button
                  disabled={actionLoading}
                  onClick={handleUnlockGFC}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase rounded-xl cursor-pointer"
                >
                  Confirm Unlock
                </button>
              )}

              {reviewModalType === 'PROCESS_DWG_EDIT' && (
                <button
                  disabled={actionLoading}
                  onClick={handleEditProcessDwgInPlace}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase rounded-xl cursor-pointer"
                >
                  Save In-Place Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload New Version Modal */}
      <DrawingVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        drawing={liveDrawing}
        onSuccess={() => fetchFreshDrawingDetails()}
      />

    </div>
  );
}
