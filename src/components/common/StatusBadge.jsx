import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, Play, Check, ShieldCheck } from 'lucide-react';

/**
 * Common Reusable StatusBadge Component
 * Standardizes status pill rendering across Admin, PM, HR, CRM, Customer, and Employee portals.
 * 
 * @param {string} status - Status text (e.g., 'APPROVED', 'PENDING', 'REJECTED', 'IN_PROGRESS', 'PRESENT', 'ABSENT', 'LATE')
 * @param {string} size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {boolean} showIcon - Whether to render matching status icon
 * @param {string} className - Additional CSS classes
 */
export default function StatusBadge({
  status = 'PENDING',
  size = 'md',
  showIcon = true,
  className = ''
}) {
  const normStatus = (status || '').toString().toUpperCase().trim();

  let colorStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = Clock;

  if (normStatus.includes('APPROV') || normStatus.includes('PRESENT') || normStatus.includes('COMPLET') || normStatus.includes('QUALIF')) {
    colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    IconComponent = CheckCircle2;
  } else if (normStatus.includes('PENDING') || normStatus.includes('AWAIT') || normStatus.includes('SCHEDULE') || normStatus.includes('REVIEW')) {
    colorStyle = 'bg-amber-50 text-amber-700 border-amber-200';
    IconComponent = Clock;
  } else if (normStatus.includes('REJECT') || normStatus.includes('ABSENT') || normStatus.includes('CANCEL') || normStatus.includes('CRITICAL')) {
    colorStyle = 'bg-rose-50 text-rose-700 border-rose-200';
    IconComponent = XCircle;
  } else if (normStatus.includes('PROGRESS') || normStatus.includes('ACTIVE') || normStatus.includes('ONGOING')) {
    colorStyle = 'bg-sky-50 text-sky-700 border-sky-200';
    IconComponent = Play;
  } else if (normStatus.includes('LATE') || normStatus.includes('WARN') || normStatus.includes('LEAD') || normStatus.includes('CONTACT')) {
    colorStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    IconComponent = AlertTriangle;
  } else if (normStatus.includes('DRAFT') || normStatus.includes('OFFLINE')) {
    colorStyle = 'bg-slate-100 text-slate-600 border-slate-200';
    IconComponent = Clock;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9px]',
    md: 'px-2.5 py-1 text-[11px]',
    lg: 'px-3.5 py-1.5 text-xs'
  }[size] || 'px-2.5 py-1 text-[11px]';

  const iconSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size] || 'w-3.5 h-3.5';

  return (
    <span className={`inline-flex items-center gap-1.5 font-extrabold rounded-full border shadow-3xs whitespace-nowrap ${colorStyle} ${sizeClasses} ${className}`}>
      {showIcon && <IconComponent className={iconSizes} />}
      <span>{status}</span>
    </span>
  );
}
