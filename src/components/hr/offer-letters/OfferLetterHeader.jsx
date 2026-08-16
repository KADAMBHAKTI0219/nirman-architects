import React from 'react';
import { FileText, PlusCircle } from 'lucide-react';

export default function OfferLetterHeader({ onOpenGenerateModal }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <FileText className="w-5 h-5 stroke-[2]" />
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Offer Letters
          </h1>
        </div>
        <p className="text-slate-500 text-xs sm:text-sm pl-1 font-medium">
          Create, regenerate and manage employee offer letters and version history.
        </p>
      </div>

      <button
        onClick={onOpenGenerateModal}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#BDE0FE] to-[#8FC9FF] hover:from-[#8FC9FF] hover:to-[#3B82F6] text-slate-900 font-black rounded-xl text-xs shadow-sm hover:shadow-md transition-all cursor-pointer border border-[#8FC9FF]/60"
      >
        <PlusCircle className="w-4 h-4 text-slate-900 stroke-[2.5]" />
        <span>Generate Offer Letter</span>
      </button>
    </div>
  );
}
