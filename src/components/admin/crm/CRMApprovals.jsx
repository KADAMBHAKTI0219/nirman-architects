import React from 'react';
import { Check, X, ShieldAlert, AlertCircle, FileText, Download } from 'lucide-react';
import Card from '../../common/Card';

export default function CRMApprovals({
  approvalsList,
  onApproveRelease,
  onRejectRelease
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Approvals Table */}
      <Card title="Customer Approval Ledger" subtitle="Verify drawing releases, document approvals, and change orders signed off by clients">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Document / Drawing</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Project link</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Release Date</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Remarks</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {approvalsList.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/40">
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-405 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-805 block">{app.title}</strong>
                        <span className="text-[9px] text-slate-400 block font-semibold">Version: {app.version} | Type: {app.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-705 font-bold align-middle">{app.clientName}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{app.projectName}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{app.date}</td>
                  <td className="px-4 py-3.5 text-slate-500 italic font-semibold align-middle">"{app.remarks}"</td>
                  <td className="px-4 py-3.5 align-middle">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-none ${
                      app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      app.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>{app.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right align-middle">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => alert(`Downloading document: ${app.title}`)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-655" />
                      </button>
                      {app.status === 'Awaiting Response' && (
                        <>
                          <button
                            onClick={() => onRejectRelease(app.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 rounded-xl transition-all shadow-3xs"
                            title="Decline Release"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onApproveRelease(app.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-150 rounded-xl transition-all shadow-3xs"
                            title="Confirm Approval"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
