import React, { useState } from 'react';
import { Download, RefreshCw, AlertTriangle, Play, CheckCircle2, ShieldCheck } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollHeader({
  selectedMonthNum,
  selectedYear,
  onPeriodChange,
  onGeneratePayroll,
  onApproveRelease,
  onDownloadZip,
  isGenerating,
  isDownloadingZip,
  isReleased,
  hasRecords,
  loading
}) {
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false);

  const currentYr = new Date().getFullYear();
  const yearOptions = [currentYr - 1, currentYr, currentYr + 1];

  const monthName = MONTH_NAMES[selectedMonthNum - 1] || 'Current Month';

  const handleConfirmRelease = () => {
    setShowReleaseConfirm(false);
    onApproveRelease();
  };

  return (
    <div className="space-y-4">
      {/* Sleek Top Header Bar - Title Left, Controls & Buttons Right */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 w-full bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs">
        
        {/* Title & Description */}
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Payroll Processing Center
          </h1>
          <p className="text-slate-500 text-xs font-semibold">
            Calculate salaries, deductions, overtime, and release monthly payslips.
          </p>
        </div>

        {/* Action Controls & Combined Month/Year Picker Right Aligned */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          
          {/* Combined Month & Year Picker */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-3xs">
            <select
              value={selectedMonthNum}
              onChange={(e) => onPeriodChange(Number(e.target.value), selectedYear)}
              className="px-2.5 py-1.5 text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1}>{m}</option>
              ))}
            </select>

            <span className="text-slate-300 font-bold text-xs select-none">|</span>

            <select
              value={selectedYear}
              onChange={(e) => onPeriodChange(selectedMonthNum, Number(e.target.value))}
              className="px-2.5 py-1.5 text-xs font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Generate / Re-generate Payroll Button */}
          <button
            onClick={() => setShowGenerateConfirm(true)}
            disabled={isGenerating || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#BDE0FE] hover:bg-[#8FC9FF] text-slate-900 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-50 border border-[#8FC9FF]/60 shadow-3xs"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
                <span>{hasRecords ? 'Re-generate Payroll' : 'Generate Payroll'}</span>
              </>
            )}
          </button>

          {/* Approve & Release Button (Appears when records exist and not yet released) */}
          {hasRecords && !isReleased && (
            <button
              onClick={() => setShowReleaseConfirm(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-3xs hover:shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Approve & Release</span>
            </button>
          )}

          {/* Released Status Badge & ZIP Download */}
          {hasRecords && isReleased && (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-extrabold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Released & Available</span>
              </div>

              <button
                onClick={onDownloadZip}
                disabled={isDownloadingZip || loading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-50 shadow-3xs"
                title="Download Released Payslips ZIP"
              >
                {isDownloadingZip ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Preparing ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Download Payroll ZIP</span>
                  </>
                )}
              </button>
            </>
          )}

        </div>
      </div>

      {/* Modal 1: Generate Payroll Confirmation */}
      {showGenerateConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3.5 rounded-xl border border-amber-100">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-extrabold text-amber-900">Generate Payroll Cycle</h3>
                <p className="text-xs text-amber-700 font-medium">Calculate salaries for active staff.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Are you sure you want to generate payroll for <span className="font-extrabold text-slate-900">{monthName} {selectedYear}</span>? This will calculate base salaries, present days, and deductions.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowGenerateConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGenerateConfirm(false);
                  onGeneratePayroll();
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                Generate Payroll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Approve & Release Confirmation */}
      {showReleaseConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-extrabold text-emerald-900">Approve & Release Payroll</h3>
                <p className="text-xs text-emerald-700 font-medium">Make payslips available to employees.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Are you sure you want to approve and release payroll for <span className="font-extrabold text-slate-900">{monthName} {selectedYear}</span>? Clicking this will activate payslip download buttons for employees in the table and details drawer.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowReleaseConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRelease}
                className="px-5 py-2 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
              >
                Approve & Release
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
