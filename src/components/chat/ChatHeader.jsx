import React from 'react';
import { ShieldCheck, Building2, Users } from 'lucide-react';

/**
 * Reusable ChatHeader Component
 */
export default function ChatHeader({
  title = "Chat Workspace",
  subtitle = "Real-time communication",
  contextBadge = "INTERNAL TEAM",
  type = "internal", // 'internal' | 'client'
  participantCount = 0
}) {
  const isClient = type === 'client';

  return (
    <div className="h-16 bg-[#f0f2f5] px-5 flex items-center justify-between border-b border-[#e9edef] shrink-0 z-10 font-sans">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
          isClient ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-brand-soft text-brand-dark border border-brand-secondary/50'
        }`}>
          {isClient ? <Building2 className="w-5 h-5" /> : <Users className="w-5 h-5" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 leading-none">{title}</h3>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
              isClient ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-brand-soft text-slate-900 border-brand-secondary/40'
            }`}>
              {contextBadge}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium block mt-1">
            {subtitle} {participantCount > 0 && `• ${participantCount} Active Participants`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized Channel
        </span>
      </div>
    </div>
  );
}
