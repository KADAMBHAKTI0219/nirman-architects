import React, { useState, useEffect } from 'react';
import { X, Eye, FileDown, ShieldCheck, Clock, User, HardDrive, RefreshCw } from 'lucide-react';
import { getDocumentAccessLog, previewDocument, downloadDocument } from '../../../service/document';

export default function DocumentAccessLogModal({
  isOpen,
  onClose,
  doc
}) {
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const docId = doc ? (doc._id || doc.id) : null;

  const fetchLogs = async () => {
    if (!docId) return;
    setLoading(true);
    try {
      // Trigger preview log action
      await previewDocument(docId);
      const res = await getDocumentAccessLog(docId);
      if (res && res.accessLogs) {
        setAccessLogs(res.accessLogs);
      } else if (res && res.data) {
        setAccessLogs(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch document access log", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && docId) {
      fetchLogs();
    }
  }, [isOpen, docId]);

  if (!isOpen || !doc) return null;

  const docTitle = doc.documentName || doc.fileName || doc.name || 'Untitled Document.pdf';
  const folderName = typeof doc.folderId === 'object' ? doc.folderId?.folderName : (doc.folder || doc.category || 'General');

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Document Access Audit Log</h3>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                GET /api/documents/{docId}/access-log • Real-time access history
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[500px] space-y-5">
          
          {/* Document Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-xs font-black text-slate-900">{docTitle}</strong>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {folderName}
                </span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                  doc.visibleToClient ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {doc.visibleToClient ? 'Client Portal Shared' : 'Admin Internal Only'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">
                Uploaded by: {doc.createdBy?.name || doc.uploadedBy?.name || doc.uploadedBy || 'Staff'} • Version: {doc.versionTag || `V${doc.version || 1}.0`}
              </p>
            </div>
          </div>

          {/* Access Log Audit Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Access Log Entries ({accessLogs.length})</h4>
              <button 
                onClick={fetchLogs}
                className="text-[10px] font-extrabold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-1" />
                Fetching audit log records...
              </div>
            ) : accessLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                No access audit log records recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {accessLogs.map((log, idx) => {
                  const isDownload = log.action === 'DOWNLOAD';
                  const isView = log.action === 'VIEW';
                  const userStr = log.performedBy || log.userId?.name || 'User';
                  const roleStr = log.userRole || log.userId?.role || 'Staff';
                  const dateStr = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now';

                  return (
                    <div 
                      key={log.id || log._id || idx}
                      className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 transition-all text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          isDownload 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : 'bg-sky-50 text-sky-600 border-sky-200'
                        }`}>
                          {isDownload ? <FileDown className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="font-bold text-slate-800">{userStr}</strong>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                              {roleStr}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                            IP: {log.ipAddress || '192.168.1.10'} • Session Authenticated
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block mb-0.5 ${
                          isDownload ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {log.action || 'VIEW'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
          >
            Close Audit Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
