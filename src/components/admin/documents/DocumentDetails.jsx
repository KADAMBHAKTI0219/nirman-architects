import React, { useState } from 'react';
import { 
  ArrowLeft, Lock, Unlock, ShieldAlert, Clock, Eye, FileDown, 
  Send, Layers, Calendar, CheckSquare, Plus, FileText, CheckCircle2,
  PenTool, Maximize2
} from 'lucide-react';
import Card from '../../common/Card';
import MarkupEditor from '../markup/MarkupEditor';

export default function DocumentDetails({
  doc,
  onBack,
  onUpdateDocument
}) {
  const [isFullMarkupMode, setIsFullMarkupMode] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [newChangeLog, setNewChangeLog] = useState('');
  const [selectedRole, setSelectedRole] = useState('Public & Staff');

  // Preview Simulator contents
  const renderPreviewSimulator = () => {
    switch (doc.type) {
      case 'PDF':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 font-mono text-[10px] space-y-3 h-80 overflow-y-auto">
            <div className="border-b border-slate-700 pb-2 text-center text-xs font-bold text-sky-400">
              DOCUMENT VIEWER: {doc.name.toUpperCase()}
            </div>
            <p className="text-slate-400"># Section 1. PROJECT SPECIFICATIONS & CHARTER</p>
            <p>1.1 NIRMAN ARCHITECTS agrees to provide detailed structural blueprints, site excavation coordinates, and GFC drawings catalogued under contract {doc.project}.</p>
            <p>1.2 The project manager {doc.uploadedBy} is designated lead signatory for drawing releases.</p>
            <p className="text-slate-400"># Section 2. REGULATORY & MATERIAL STANDARDS</p>
            <p>2.1 Concrete footings shall undergo soil bearing capacity checks as outlined in Geotechnical logs.</p>
            <p>2.2 All mechanical HVAC drafts require CFM flow verification mapping before site installation.</p>
          </div>
        );
      case 'XLSX':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-300 font-mono text-[9px] h-80 overflow-y-auto">
            <div className="border-b border-slate-700 pb-2 text-center text-xs font-bold text-emerald-400 mb-2">
              SPREADSHEET PREVIEW: {doc.name.toUpperCase()}
            </div>
            <div className="grid grid-cols-4 gap-1.5 border-b border-slate-800 pb-1 text-slate-400 font-bold uppercase">
              <div>A: Item</div>
              <div>B: Target limit</div>
              <div>C: Spent Value</div>
              <div>D: Status</div>
            </div>
            {[
              ["Excavation", "150,000", "148,000", "Complete"],
              ["Footing Cast", "280,005", "291,000", "Review"],
              ["Steel Rebars", "420,000", "310,000", "In Progress"],
              ["Lobby Framing", "95,000", "0", "Planned"]
            ].map((row, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-1.5 py-1 border-b border-slate-800/40">
                <div>{row[0]}</div>
                <div>${row[1]}</div>
                <div>${row[2]}</div>
                <div className={row[3] === 'Complete' ? 'text-emerald-450' : 'text-amber-450'}>{row[3]}</div>
              </div>
            ))}
          </div>
        );
      case 'ZIP':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-300 font-mono text-[10px] h-80 overflow-y-auto">
            <div className="border-b border-slate-700 pb-2 text-center text-xs font-bold text-indigo-400 mb-3">
              ARCHIVE TREE: {doc.name.toUpperCase()}
            </div>
            <div className="space-y-2">
              <div className="text-slate-400">&darr; Root Directory</div>
              <div className="pl-4">&rarr; drawings/foundation_treads.dwg (3.5 MB)</div>
              <div className="pl-4">&rarr; certificates/soil_bearing.pdf (1.2 MB)</div>
              <div className="pl-4">&rarr; invoices/compaction_tests.xlsx (250 KB)</div>
              <div className="pl-4">&rarr; readme.txt (1.2 KB)</div>
            </div>
          </div>
        );
      default:
        // JPEG, PNG, DWG
        return (
          <div className="bg-[#0B1E33] border border-slate-800 rounded-2xl p-6 h-80 flex flex-col items-center justify-center relative">
            <div className="absolute top-3 left-3 bg-slate-900/60 px-2 py-0.5 rounded text-[8px] font-black uppercase text-sky-400">
              IMAGE/BLUEPRINT PREVIEW
            </div>
            <svg viewBox="0 0 100 80" className="w-48 h-48 stroke-sky-450 fill-none stroke-[0.8] opacity-75">
              <rect x="10" y="10" width="80" height="60" stroke="#2484C6" />
              <line x1="10" y1="40" x2="90" y2="40" />
              <line x1="50" y1="10" x2="50" y2="70" />
              <circle cx="50" cy="40" r="10" />
            </svg>
            <span className="text-[10px] text-slate-400 font-bold block mt-2">{doc.name}</span>
          </div>
        );
    }
  };

  // Submit Comments
  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newHistory = [
      ...doc.downloadHistory, // using downloadHistory or custom comments logs
      { user: "Super Admin", role: "Admin", date: "Just now", version: `Comment: ${commentText}` }
    ];
    onUpdateDocument({
      ...doc,
      downloadHistory: newHistory
    });
    setCommentText('');
  };

  // Upload new version
  const handleUpgradeVersion = (e) => {
    e.preventDefault();
    if (!newVersionLabel.trim() || !newChangeLog.trim()) return;

    const newVerObj = {
      version: newVersionLabel,
      date: new Date().toISOString().split('T')[0],
      uploader: "Super Admin",
      changeLog: newChangeLog
    };

    onUpdateDocument({
      ...doc,
      version: newVersionLabel,
      versions: [...doc.versions, newVerObj],
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: "Super Admin"
    });

    setNewVersionLabel('');
    setNewChangeLog('');
    alert(`Version upgraded successfully to ${newVersionLabel}!`);
  };

  // Toggle confidentiality
  const handleConfidentialToggle = () => {
    onUpdateDocument({
      ...doc,
      confidential: !doc.confidential
    });
  };

  // Lock toggle
  const handleLockToggle = () => {
    onUpdateDocument({
      ...doc,
      locked: !doc.locked
    });
  };

  if (isFullMarkupMode) {
    return (
      <MarkupEditor
        documentData={doc}
        onBack={() => setIsFullMarkupMode(false)}
        onSaveDocument={onUpdateDocument}
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
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.id} Document Details</span>
            <h2 className="text-base font-black text-slate-905 tracking-tight leading-none mt-0.5">{doc.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullMarkupMode(true)}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Open PDF Markup Editor</span>
          </button>
          {doc.confidential && (
            <span className="text-[9px] px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 font-black uppercase rounded-lg">
              Confidential
            </span>
          )}
          <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-wider border ${
            doc.locked ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            {doc.locked ? 'Locked' : 'Editable'}
          </span>
        </div>
      </div>

      {/* Grid view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane (2/3 width) - Preview & Versioning */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Simulated File Preview Canvas */}
          {renderPreviewSimulator()}

          {/* Version Chronology logs */}
          <Card title="Revision & Version Vault" subtitle="Document history. Previous file versions remain accessible">
            <div className="space-y-3 pt-2">
              {doc.versions.map((ver, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-1 bg-white border border-slate-200 rounded-xl text-[9px] font-black text-slate-600">
                      {ver.version}
                    </span>
                    <div>
                      <strong className="text-slate-805 block">Changes: {ver.changeLog}</strong>
                      <span className="text-[9px] text-slate-400 mt-0.5 block font-semibold">Uploaded by {ver.uploader} on {ver.date}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Downloading document version: ${ver.version}`)}
                    className="px-3 py-1 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-lg text-[9px] font-bold uppercase transition-all shadow-3xs"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Upgrade Version Form */}
          {!doc.locked ? (
            <form onSubmit={handleUpgradeVersion} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <strong className="text-xs font-black text-slate-900 uppercase block">Upload Revision Version</strong>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">Replace file with new updated version logs</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">New Version Tag</label>
                  <input 
                    type="text" 
                    required 
                    value={newVersionLabel}
                    onChange={(e) => setNewVersionLabel(e.target.value)}
                    placeholder="e.g. V1.3"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white font-semibold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Revision Change notes</label>
                  <input 
                    type="text" 
                    required 
                    value={newChangeLog}
                    onChange={(e) => setNewChangeLog(e.target.value)}
                    placeholder="e.g. Adjusted stairs deadweight load coefficients"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 bg-white font-semibold"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-3xs"
              >
                Upload Revision Upgrade
              </button>
            </form>
          ) : (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-2">
              <Lock className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-805 text-xs font-bold block">Document Locked</strong>
                <span className="text-[10px] text-indigo-750 block mt-0.5 leading-relaxed">
                  This document has been locked as a final contract release. To upload new revisions, toggle document edit locks first.
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Right pane (1/3 width) - Metadata, Sharing, download logs */}
        <div className="space-y-6">
          
          {/* Metadata Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Document Metadata</h4>
            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Project Link</span>
                <span className="font-extrabold text-slate-700">{doc.project}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Folder</span>
                <span className="font-bold text-slate-700">{doc.folder}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Uploaded Date</span>
                <span className="font-semibold text-slate-700">{doc.uploadedDate}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Uploaded By</span>
                <span className="font-semibold text-slate-700">{doc.uploadedBy}</span>
              </div>
            </div>
          </div>

          {/* Sharing Permissions */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Access Rules</h4>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Share by Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    onUpdateDocument({ ...doc, accessLevel: e.target.value });
                    alert(`Access permissions changed to: ${e.target.value}`);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-750 bg-white font-semibold"
                >
                  <option value="Admin Only">Admin Only</option>
                  <option value="Admin & PM Only">Admin & PM Only</option>
                  <option value="Public & Staff">Public & Staff</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfidentialToggle}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    doc.confidential 
                      ? 'bg-rose-50 border-rose-150 text-rose-600 font-extrabold' 
                      : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {doc.confidential ? 'Mark Confidential' : 'Confidential Off'}
                </button>
                <button
                  type="button"
                  onClick={handleLockToggle}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    doc.locked 
                      ? 'bg-indigo-50 border-indigo-150 text-indigo-600 font-extrabold' 
                      : 'bg-white border-slate-205 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {doc.locked ? 'Unlock Edits' : 'Lock Document'}
                </button>
              </div>
            </div>
          </div>

          {/* Activity / Download Logs */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Activity & Download Logs</h4>
            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
              {doc.downloadHistory.map((hist, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-[8px] text-slate-450 font-bold uppercase">
                    <span>{hist.user} ({hist.role})</span>
                    <span>{hist.date}</span>
                  </div>
                  <p className="font-semibold text-slate-700 leading-normal">
                    {hist.version.startsWith('Comment:') ? hist.version : `Downloaded version ${hist.version}`}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Add Comments */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Add annotation note..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
              />
              <button 
                type="submit"
                className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs"
              >
                Send
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
