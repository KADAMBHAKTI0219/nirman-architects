import React from 'react';
import { FileSpreadsheet, RefreshCw, PlusCircle } from 'lucide-react';

export default function PayrollEmptyState({ monthName, year, onGenerate, isGenerating }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-2xs space-y-4 my-4">
      <div className="w-16 h-16 bg-brand-tint border border-brand-primary/30 rounded-2xl flex items-center justify-center mx-auto text-brand-primary">
        <FileSpreadsheet className="w-8 h-8 text-slate-800 stroke-[1.75]" />
      </div>
      <div className="max-w-md mx-auto space-y-1.5">
        <h3 className="text-base font-extrabold text-slate-900">
          No Payroll Records Found for {monthName} {year}
        </h3>
        <p className="text-xs font-semibold text-slate-500 leading-relaxed">
          Monthly payroll cycle has not been generated yet for active staff. Click below to initiate automated salary calculations.
        </p>
      </div>
      {onGenerate && (
        <div className="pt-2">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer border border-brand-secondary/40 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                <span>Generating Payroll...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-slate-900 stroke-[2.5]" />
                <span>Generate Payroll for {monthName} {year}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
