import React from 'react';
import { Eye, Download, RefreshCw, Lock } from 'lucide-react';
import PayrollStatusBadge from './PayrollStatusBadge';
import { formatCurrency } from '../../../utils/formatters';

export default function PayrollTable({
  records = [],
  loading = false,
  isReleased = false,
  selectedRecordId = null,
  onSelectRecord,
  onDownloadPayslip,
  downloadingPayslipUserId = null
}) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-2xs">
        <RefreshCw className="w-8 h-8 animate-spin text-[#3B82F6] mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading payroll register data...</p>
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
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Department</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Designation</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Base Salary</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attendance</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Leave</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Deductions</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Net Pay</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map((rec) => {
              const isSelected = selectedRecordId === rec.id;
              const isDownloadingThis = downloadingPayslipUserId === rec.userId;
              const isRecReleased = isReleased || rec.status === 'RELEASED' || rec.status === 'APPROVED';

              return (
                <tr
                  key={rec.id || rec.userId}
                  onClick={() => onSelectRecord(rec)}
                  className={`hover:bg-[#BDE0FE]/20 transition-all cursor-pointer ${
                    isSelected ? 'bg-[#BDE0FE]/30' : ''
                  }`}
                >
                  {/* Employee Name & Email: Left Aligned */}
                  <td className="px-4 py-4 text-left align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700 font-extrabold shrink-0 text-xs">
                        {rec.name?.charAt(0)?.toUpperCase() || 'E'}
                      </div>
                      <div>
                        <strong className="text-slate-900 font-extrabold block">{rec.name}</strong>
                        {rec.email && (
                          <span className="text-[10px] text-slate-400 block font-semibold">{rec.email}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Department: Centered */}
                  <td className="px-4 py-4 text-center text-slate-600 font-bold align-middle">
                    {rec.department || '—'}
                  </td>

                  {/* Designation: Centered */}
                  <td className="px-4 py-4 text-center text-slate-600 font-semibold align-middle">
                    {rec.designation || '—'}
                  </td>

                  {/* Base Salary: Centered */}
                  <td className="px-4 py-4 text-center text-slate-900 font-bold align-middle">
                    {formatCurrency(rec.baseSalary)}
                  </td>

                  {/* Attendance: Centered */}
                  <td className="px-4 py-4 text-center align-middle">
                    <div className="space-y-0.5 text-[11px] text-center">
                      <span className="text-emerald-700 font-extrabold block">
                        {rec.presentDays} days
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Out of {rec.daysInMonth} days
                      </span>
                    </div>
                  </td>

                  {/* Leave: Centered */}
                  <td className="px-4 py-4 text-center align-middle">
                    <div className="space-y-0.5 text-[10px] font-semibold text-slate-500 text-center">
                      <span>Paid: {rec.paidLeaveDays || 0}d</span>
                      <span className="mx-1 text-slate-300">|</span>
                      <span>Unpaid: {rec.unpaidLeaveDays || 0}d</span>
                    </div>
                  </td>

                  {/* Deductions: Centered */}
                  <td className="px-4 py-4 text-center text-rose-600 font-bold align-middle">
                    {formatCurrency(rec.totalDeduction)}
                  </td>

                  {/* Net Pay: Centered */}
                  <td className="px-4 py-4 text-center text-emerald-600 font-black align-middle text-sm">
                    {formatCurrency(rec.netSalary)}
                  </td>

                  {/* Status Badge: Centered */}
                  <td className="px-4 py-4 text-center align-middle">
                    <PayrollStatusBadge status={isRecReleased ? 'RELEASED' : rec.status} generatedAt={rec.generatedAt} />
                  </td>

                  {/* Actions: Centered */}
                  <td className="px-4 py-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectRecord(rec)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-3xs cursor-pointer"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Payslip Button IS ONLY SHOWN AFTER APPROVE & RELEASE */}
                      {isRecReleased ? (
                        <button
                          onClick={() => onDownloadPayslip(rec)}
                          disabled={isDownloadingThis}
                          className="px-3 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-3xs cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1"
                          title="Download Payslip PDF"
                        >
                          {isDownloadingThis ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span>Payslip</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200" title="Payslip will be available after Approve & Release">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Awaiting Release</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {records.length === 0 && (
              <tr>
                <td colSpan="10" className="py-12 text-center text-xs font-bold text-slate-400">
                  No payroll records match the current criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden divide-y divide-slate-100">
        {records.map((rec) => {
          const isSelected = selectedRecordId === rec.id;
          const isDownloadingThis = downloadingPayslipUserId === rec.userId;
          const isRecReleased = isReleased || rec.status === 'RELEASED' || rec.status === 'APPROVED';

          return (
            <div
              key={rec.id || rec.userId}
              onClick={() => onSelectRecord(rec)}
              className={`p-4 space-y-3 cursor-pointer transition-all ${
                isSelected ? 'bg-[#BDE0FE]/30' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <strong className="text-sm font-extrabold text-slate-900 block">{rec.name}</strong>
                  {rec.email && (
                    <span className="text-xs text-slate-400 font-semibold block">{rec.email}</span>
                  )}
                  <span className="text-xs text-slate-500 font-bold block mt-0.5">
                    {rec.department || '—'} · {rec.designation || '—'}
                  </span>
                </div>
                <PayrollStatusBadge status={isRecReleased ? 'RELEASED' : rec.status} generatedAt={rec.generatedAt} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 font-semibold text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Salary</span>
                  <span className="font-extrabold text-slate-900">{formatCurrency(rec.baseSalary)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Pay</span>
                  <span className="font-black text-emerald-600">{formatCurrency(rec.netSalary)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Attendance</span>
                  <span>{rec.presentDays} / {rec.daysInMonth} days</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Deductions</span>
                  <span className="text-rose-600 font-bold">{formatCurrency(rec.totalDeduction)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSelectRecord(rec)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                {/* Payslip Button IS ONLY SHOWN AFTER APPROVE & RELEASE */}
                {isRecReleased ? (
                  <button
                    onClick={() => onDownloadPayslip(rec)}
                    disabled={isDownloadingThis}
                    className="px-3.5 py-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-3xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    {isDownloadingThis ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Payslip</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Awaiting Release</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {records.length === 0 && (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            No payroll records found.
          </div>
        )}
      </div>
    </div>
  );
}
