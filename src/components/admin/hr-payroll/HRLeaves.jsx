import React from 'react';
import { Check, X, Calendar, FileClock, ShieldAlert, AlertCircle } from 'lucide-react';
import Card from '../../common/Card';

export default function HRLeaves({
  leaveRequests,
  leaveBalances,
  holidaysList,
  onApproveLeave,
  onRejectLeave
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {leaveBalances.map((bal, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{bal.type} Leave allocation</span>
            <div className="flex justify-between items-end">
              <strong className="text-xl font-black text-slate-805 block">{bal.used} / {bal.total} Days Used</strong>
              <span className="text-[10px] text-slate-400 font-semibold">{bal.total - bal.used} Days Left</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-brand-primary h-full rounded-full" style={{ width: `${(bal.used / bal.total) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main split: Leave inbox & Holiday list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leave Requests inbox (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="border-b border-slate-50 pb-2 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Leave Requests Inbox</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Approve or reject active employee requests</span>
            </div>
            <span className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded font-black uppercase">
              {leaveRequests.filter(r=>r.status==='Pending').length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {leaveRequests.map(req => (
              <div 
                key={req.id}
                className="p-3.5 border border-slate-150 rounded-2xl flex items-start justify-between gap-4 flex-wrap"
              >
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700">
                      {req.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <strong className="text-slate-805 block text-xs">{req.name}</strong>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">{req.department} &bull; {req.type} Leave</span>
                    </div>
                  </div>
                  <p className="text-slate-550 text-xs italic font-semibold leading-normal">"Reason: {req.reason}"</p>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                    Duration: {req.startDate} to {req.endDate} ({req.days} days)
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {req.status === 'Pending' ? (
                    <>
                      <button 
                        onClick={() => onRejectLeave(req.id)}
                        className="p-2 border border-slate-205 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all shadow-3xs"
                        title="Reject Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onApproveLeave(req.id)}
                        className="px-3.5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                    </>
                  ) : (
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded border ${
                      req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>{req.status}</span>
                  )}
                </div>
              </div>
            ))}

            {leaveRequests.length === 0 && (
              <div className="py-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                <AlertCircle className="w-6 h-6 text-slate-350 mx-auto mb-2" />
                No leave requests pending.
              </div>
            )}
          </div>
        </div>

        {/* Holiday Overlays / List (1/3 width) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="border-b border-slate-50 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Holiday Calendar</span>
            <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Upcoming gazetted corporate holidays</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {holidaysList.map(hol => (
              <div key={hol.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-[8px] text-[#2484C6] font-bold uppercase">
                  <span>Gazetted Holiday</span>
                  <span>{hol.date}</span>
                </div>
                <strong className="font-black text-slate-755 block leading-normal">{hol.name}</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
