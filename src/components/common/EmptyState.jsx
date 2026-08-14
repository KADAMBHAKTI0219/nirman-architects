import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Common Reusable EmptyState Component
 */
export default function EmptyState({
  title = "No data available",
  description = "There are no records found for the current selection.",
  icon: Icon = Inbox,
  action = null,
  className = ""
}) {
  return (
    <div className={`py-12 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-2xs space-y-3 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-brand-soft border border-brand-secondary/30 text-slate-700 mx-auto flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
