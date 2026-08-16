import React from 'react';
import { History, FileText, Calendar, DollarSign, Briefcase } from 'lucide-react';
import OfferLetterStatusBadge from './OfferLetterStatusBadge';
import { formatCurrency } from '../../../utils/formatters';

export default function OfferLetterHistory({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center text-xs font-bold text-slate-400">
        No previous offer letter versions found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <History className="w-3.5 h-3.5 text-slate-400" />
        <span>Version History ({history.length})</span>
      </h4>

      <div className="space-y-2.5">
        {history.map((ver, idx) => (
          <div key={ver._id || idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Version #{history.length - idx}
              </span>
              <OfferLetterStatusBadge status={ver.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Designation</span>
                <span className="font-bold">{ver.designationSnapshot || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Department</span>
                <span className="font-bold">{ver.departmentSnapshot || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Base Salary</span>
                <span className="font-bold text-slate-900">{formatCurrency(ver.baseSalarySnapshot || 0)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Generated At</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {ver.generatedAt ? new Date(ver.generatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  }) : '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
