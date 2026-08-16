import React, { useState, useEffect } from 'react';
import { X, Download, RefreshCw, PlusCircle, Sparkles, User, Briefcase, Building, DollarSign, Calendar } from 'lucide-react';
import OfferLetterStatusBadge from './OfferLetterStatusBadge';
import OfferLetterHistory from './OfferLetterHistory';
import { getOfferLetterMetadata } from '../../../service/hrm/offerLetter';
import { formatCurrency } from '../../../utils/formatters';

export default function OfferLetterDetailsDrawer({
  isOpen,
  onClose,
  employee,
  onDownloadPDF,
  onOpenGenerateForUser,
  isDownloadingPDF
}) {
  const [metadata, setMetadata] = useState({ latest: null, history: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee && employee._id) {
      fetchMetadata(employee._id);
    }
  }, [isOpen, employee]);

  const fetchMetadata = async (userId) => {
    setLoading(true);
    try {
      const res = await getOfferLetterMetadata(userId);
      if (res && res.data) {
        setMetadata(res.data);
      } else {
        setMetadata({ latest: null, history: [] });
      }
    } catch (err) {
      console.error("Error fetching offer letter metadata:", err);
      setMetadata({ latest: null, history: [] });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  const latest = metadata.latest || employee.latest || {};
  const hasLatest = Boolean(latest._id || latest.generatedAt);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-100">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Offer Letter Details
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">{employee.name}</h2>
            {employee.email && (
              <span className="text-xs text-slate-400 font-semibold block">{employee.email}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-xs font-bold text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
              <span>Fetching offer letter history...</span>
            </div>
          ) : (
            <>
              {/* Latest Offer Overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Latest Version</span>
                  </h3>
                  <OfferLetterStatusBadge status={hasLatest ? (latest.status || 'GENERATED') : 'NOT_GENERATED'} />
                </div>

                {hasLatest ? (
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/80 space-y-2.5 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Designation</span>
                      <span className="text-slate-900 font-bold">{latest.designationSnapshot || employee.designation || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department</span>
                      <span className="text-slate-900 font-bold">{latest.departmentSnapshot || employee.department || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Base Salary</span>
                      <span className="text-slate-900 font-extrabold">{formatCurrency(latest.baseSalarySnapshot || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Joining Date</span>
                      <span className="text-slate-800 font-bold">
                        {latest.joiningDateSnapshot ? new Date(latest.joiningDateSnapshot).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : '—'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-blue-100 text-[11px] text-slate-500 flex justify-between">
                      <span>Generated Date</span>
                      <span className="font-bold text-slate-700">
                        {latest.generatedAt ? new Date(latest.generatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs font-bold text-slate-400">
                    No offer letter has been generated for this employee yet.
                  </div>
                )}
              </div>

              {/* Version History List */}
              <OfferLetterHistory history={metadata.history} />
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white space-y-2.5 sticky bottom-0">
          {hasLatest && (
            <button
              onClick={() => onDownloadPDF(employee._id, employee.name)}
              disabled={isDownloadingPDF}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDownloadingPDF ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Downloading PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Offer Letter PDF</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => onOpenGenerateForUser(employee)}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span>Generate New Version</span>
          </button>
        </div>

      </div>
    </div>
  );
}
