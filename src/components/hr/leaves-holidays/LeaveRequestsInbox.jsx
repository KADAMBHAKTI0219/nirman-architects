import React from 'react';
import { Check, X, AlertTriangle, AlertCircle } from 'lucide-react';

export default function LeaveRequestsInbox({
  leaveRequests,
  onApprove,
  onReject
}) {
  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending');

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4 flex flex-col h-[400px]">
      <div className="border-b border-slate-50 pb-2 flex justify-between items-center flex-shrink-0">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Requests Inbox</span>
          <span className="text-[9px] text-slate-455 block font-semibold">Review pending staff applications</span>
        </div>
        <span className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded font-black uppercase">
          {pendingRequests.length} Pending
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto flex-1 pr-1 scrollbar-thin">
        {pendingRequests.map(req => (
          <div key={req.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <strong className="text-slate-805 block text-xs">{req.name}</strong>
                <span className="text-[9px] text-[#2484C6] block font-bold uppercase">{req.role} &bull; {req.type}</span>
              </div>
              <span className="text-[9px] font-black text-slate-400 block uppercase">
                {req.dates}
              </span>
            </div>

            <p className="text-slate-550 text-[11px] italic font-semibold leading-normal">"Reason: {req.reason}"</p>

            {/* Overlap warnings mock */}
            {req.name === 'Alice Smith' && (
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl text-[9px] text-rose-650 font-bold flex items-center gap-1.5 leading-normal">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Overlap Warning: Sarah Connor is also off on these dates!</span>
              </div>
            )}

            <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-100">
              <button 
                onClick={() => onReject(req.id)}
                className="p-1 border border-slate-205 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-all"
                title="Reject Request"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onApprove(req.id)}
                className="px-2.5 py-1 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-lg text-[9px] font-black uppercase shadow-3xs flex items-center gap-0.5"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
            </div>
          </div>
        ))}

        {pendingRequests.length === 0 && (
          <div className="py-8 text-center text-slate-400 font-bold uppercase tracking-wider">
            <AlertCircle className="w-5 h-5 text-slate-350 mx-auto mb-2" />
            No pending leave requests.
          </div>
        )}
      </div>
    </div>
  );
}
