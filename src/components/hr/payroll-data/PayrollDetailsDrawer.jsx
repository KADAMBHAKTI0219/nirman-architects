import React from 'react';
import { X, Download, RefreshCw, User, Calendar, DollarSign, Clock, Shield, Play, Lock, CheckCircle2 } from 'lucide-react';
import PayrollStatusBadge from './PayrollStatusBadge';
import { formatCurrency } from '../../../utils/formatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollDetailsDrawer({
  isOpen,
  onClose,
  record,
  monthNum,
  year,
  isReleased = false,
  onDownloadPayslip,
  onGenerateSingle,
  isDownloadingPayslip,
  isGeneratingSingle
}) {
  if (!isOpen || !record) return null;

  const monthName = MONTH_NAMES[monthNum - 1] || monthNum;
  const hasRecord = Boolean(record.id);
  const isRecReleased = isReleased || record.status === 'RELEASED' || record.status === 'APPROVED';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-100">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Payroll Details
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">{record.name}</h2>
            {record.email && (
              <span className="text-xs text-slate-400 font-semibold block">{record.email}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Status & Period Pill */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Payroll Cycle</span>
              <span className="text-xs font-extrabold text-slate-900">{monthName} {year}</span>
            </div>
            <PayrollStatusBadge status={isRecReleased ? 'RELEASED' : record.status} generatedAt={record.generatedAt} />
          </div>

          {/* Section 1: Employee Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Employee Info</span>
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Department</span>
                <span className="text-slate-800 font-bold">{record.department || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Designation</span>
                <span className="text-slate-800 font-bold">{record.designation || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Attendance & Leave Breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Attendance & Leave</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Days in Month</span>
                <span className="text-sm font-black text-slate-800">{record.daysInMonth || 0}</span>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                <span className="text-[10px] text-emerald-600 block font-bold uppercase">Present Days</span>
                <span className="text-sm font-black text-emerald-700">{record.presentDays || 0}</span>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
                <span className="text-[10px] text-amber-600 block font-bold uppercase">Paid Leave</span>
                <span className="text-sm font-black text-amber-700">{record.paidLeaveDays || 0}</span>
              </div>
              <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
                <span className="text-[10px] text-rose-600 block font-bold uppercase">Unpaid Leave</span>
                <span className="text-sm font-black text-rose-700">{record.unpaidLeaveDays || 0}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Salary Calculation */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Salary Breakdown</span>
            </h3>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between text-slate-600">
                <span>Base Salary</span>
                <span className="font-bold text-slate-900">{formatCurrency(record.baseSalary)}</span>
              </div>
              {record.perDaySalary > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Per Day Salary</span>
                  <span>{formatCurrency(record.perDaySalary)}</span>
                </div>
              )}
              <div className="flex justify-between text-rose-600">
                <span>Total Deductions</span>
                <span className="font-bold">-{formatCurrency(record.totalDeduction)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Net Payable Amount</span>
                <span className="text-emerald-600">{formatCurrency(record.netSalary)}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Metadata */}
          {hasRecord && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Payroll Metadata</span>
              </h3>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-[11px] font-semibold text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Generated Date</span>
                  <span className="font-bold text-slate-700">
                    {record.generatedAt ? new Date(record.generatedAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Release Notice Banner if not released */}
          {hasRecord && !isRecReleased && (
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800 font-semibold">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Payslip download becomes active once HR clicks "Approve & Release".</span>
            </div>
          )}
        </div>

        {/* Drawer Actions Footer */}
        <div className="p-6 border-t border-slate-100 bg-white space-y-2.5 sticky bottom-0">
          {hasRecord && isRecReleased ? (
            <button
              onClick={() => onDownloadPayslip(record)}
              disabled={isDownloadingPayslip}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isDownloadingPayslip ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Downloading Payslip...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Payslip PDF</span>
                </>
              )}
            </button>
          ) : hasRecord ? (
            <div className="py-2.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 text-center flex items-center justify-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Payslip Locked (Awaiting Approval & Release)</span>
            </div>
          ) : (
            <button
              onClick={() => onGenerateSingle(record.userId)}
              disabled={isGeneratingSingle}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingSingle ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Generating Payroll...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Generate Payroll for {record.name.split(' ')[0]}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
