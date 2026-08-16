import React from 'react';

export default function PayrollStatusBadge({ status, generatedAt }) {
  const normalized = (status || (generatedAt ? 'GENERATED' : 'NOT_GENERATED')).toUpperCase();

  let label = 'Not Generated';
  let badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
  let dotStyle = 'bg-slate-400';

  if (normalized === 'GENERATED' || normalized === 'PAID') {
    label = 'Generated';
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotStyle = 'bg-emerald-500';
  } else if (normalized === 'READY_FOR_REVIEW' || normalized === 'REVIEW') {
    label = 'Ready for Review';
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
    dotStyle = 'bg-blue-500';
  } else if (normalized === 'APPROVED' || normalized === 'RELEASED') {
    label = 'Released';
    badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
    dotStyle = 'bg-purple-500';
  } else if (normalized === 'PENDING') {
    label = 'Pending';
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
    dotStyle = 'bg-amber-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      <span>{label}</span>
    </span>
  );
}
