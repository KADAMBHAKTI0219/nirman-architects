import React from 'react';
import { Check, X, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function LeaveRequestsInbox({
  leaveRequests = [],
  onApprove,
  onReject
}) {
  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending');

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col h-[440px]">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center flex-shrink-0">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Requests Inbox</span>
          <span className="text-xs text-slate-500 block font-medium mt-0.5">Review pending staff applications</span>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-600" />
          {pendingRequests.length} Pending
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-1 scrollbar-thin">
        {pendingRequests.map(req => (
          <div key={req.id} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col gap-2.5 hover:bg-slate-50 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  {req.name.charAt(0)}
                </div>
                <div>
                  <strong className="text-slate-900 block text-xs font-black">{req.name}</strong>
                  <span className="text-[10px] text-sky-600 font-extrabold uppercase block">{req.role} &bull; {req.type}</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {req.dates}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-slate-600 text-xs italic">
              "{req.reason}"
            </div>

            {/* Overlap warnings mock */}
            {req.name === 'Alice Smith' && (
              <div className="p-2 bg-rose-50/70 border border-rose-200/60 rounded-xl text-[10px] text-rose-700 font-bold flex items-center gap-1.5 leading-normal">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Overlap Alert: Sarah Connor is also off on these dates!</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/60">
              <button 
                onClick={() => onReject(req.id)}
                className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="Reject Request"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button 
                onClick={() => onApprove(req.id)}
                className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-black uppercase shadow-xs flex items-center gap-1 cursor-pointer border border-brand-secondary/40"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        ))}

        {pendingRequests.length === 0 && (
          <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-60" />
            <span className="text-xs text-slate-500 font-bold">All pending leave applications cleared!</span>
          </div>
        )}
      </div>
    </div>
  );
}
