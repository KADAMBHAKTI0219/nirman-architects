import React from 'react';
import { Eye, Download, RefreshCw, PlusCircle } from 'lucide-react';
import OfferLetterStatusBadge from './OfferLetterStatusBadge';
import { formatCurrency } from '../../../utils/formatters';

export default function OfferLetterTable({
  items = [],
  loading = false,
  onSelectUser,
  onDownloadPDF,
  onOpenGenerateForUser,
  downloadingUserId = null
}) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-2xs">
        <RefreshCw className="w-8 h-8 animate-spin text-[#3B82F6] mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading offer letter directory...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75">
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Employee</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Designation</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Department</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Base Salary</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Generated Date</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((emp) => {
              const latest = emp.latest || {};
              const isDownloadingThis = downloadingUserId === emp._id;
              const hasOffer = Boolean(latest._id || latest.generatedAt || latest.status || emp.hasOffer);

              const generatedDateStr = latest.generatedAt ? new Date(latest.generatedAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              }) : (hasOffer ? 'Generated' : 'Not Generated');

              return (
                <tr
                  key={emp._id}
                  onClick={() => onSelectUser(emp)}
                  className="hover:bg-[#BDE0FE]/20 transition-all cursor-pointer"
                >
                  {/* Employee Info: Left Aligned */}
                  <td className="px-4 py-4 text-left align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 font-extrabold shrink-0 text-xs">
                        {emp.name?.charAt(0)?.toUpperCase() || 'E'}
                      </div>
                      <div>
                        <strong className="text-slate-900 font-extrabold block">{emp.name}</strong>
                        {emp.email && (
                          <span className="text-[10px] text-slate-400 block font-semibold">{emp.email}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Designation: Centered */}
                  <td className="px-4 py-4 text-center text-slate-700 font-bold align-middle">
                    {latest.designationSnapshot || emp.designation || '—'}
                  </td>

                  {/* Department: Centered */}
                  <td className="px-4 py-4 text-center text-slate-600 font-semibold align-middle">
                    {latest.departmentSnapshot || emp.department || '—'}
                  </td>

                  {/* Base Salary: Centered */}
                  <td className="px-4 py-4 text-center text-slate-900 font-bold align-middle">
                    {latest.baseSalarySnapshot ? formatCurrency(latest.baseSalarySnapshot) : (emp.baseSalary ? formatCurrency(emp.baseSalary) : '—')}
                  </td>

                  {/* Generated Date: Centered */}
                  <td className="px-4 py-4 text-center text-slate-500 font-semibold align-middle text-[11px]">
                    {generatedDateStr}
                  </td>

                  {/* Status: Centered */}
                  <td className="px-4 py-4 text-center align-middle">
                    <OfferLetterStatusBadge status={hasOffer ? (latest.status || 'GENERATED') : 'NOT_GENERATED'} />
                  </td>

                  {/* Actions: Centered */}
                  <td className="px-4 py-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectUser(emp)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-3xs cursor-pointer"
                        title="View Metadata & History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {hasOffer && (
                        <button
                          onClick={() => onDownloadPDF(emp._id, emp.name)}
                          disabled={isDownloadingThis}
                          className="p-2 bg-[#BDE0FE]/40 hover:bg-[#8FC9FF] text-[#3B82F6] hover:text-white border border-[#8FC9FF]/60 rounded-xl transition-all shadow-3xs cursor-pointer disabled:opacity-50"
                          title="Download Offer Letter PDF"
                        >
                          {isDownloadingThis ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => onOpenGenerateForUser(emp)}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 rounded-xl transition-all shadow-3xs cursor-pointer"
                        title="Generate Offer Letter"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan="7" className="py-12 text-center text-xs font-bold text-slate-400">
                  No employee offer letters match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden divide-y divide-slate-100">
        {items.map((emp) => {
          const latest = emp.latest || {};
          const isDownloadingThis = downloadingUserId === emp._id;
          const hasOffer = Boolean(latest._id || latest.generatedAt || latest.status || emp.hasOffer);

          return (
            <div
              key={emp._id}
              onClick={() => onSelectUser(emp)}
              className="p-4 space-y-3 cursor-pointer hover:bg-slate-50/60 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <strong className="text-sm font-extrabold text-slate-900 block">{emp.name}</strong>
                  {emp.email && (
                    <span className="text-xs text-slate-400 font-semibold block">{emp.email}</span>
                  )}
                </div>
                <OfferLetterStatusBadge status={hasOffer ? (latest.status || 'GENERATED') : 'NOT_GENERATED'} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 font-semibold text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Designation</span>
                  <span>{latest.designationSnapshot || emp.designation || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
                  <span>{latest.departmentSnapshot || emp.department || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Salary</span>
                  <span className="font-bold text-slate-900">
                    {latest.baseSalarySnapshot ? formatCurrency(latest.baseSalarySnapshot) : (emp.baseSalary ? formatCurrency(emp.baseSalary) : '—')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Generated Date</span>
                  <span>
                    {latest.generatedAt ? new Date(latest.generatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    }) : (hasOffer ? 'Generated' : 'Not Generated')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSelectUser(emp)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                {hasOffer && (
                  <button
                    onClick={() => onDownloadPDF(emp._id, emp.name)}
                    disabled={isDownloadingThis}
                    className="px-3 py-1.5 bg-[#BDE0FE]/40 text-[#3B82F6] border border-[#8FC9FF]/60 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {isDownloadingThis ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Download</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenGenerateForUser(emp)}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate</span>
                </button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            No employees found.
          </div>
        )}
      </div>
    </div>
  );
}
