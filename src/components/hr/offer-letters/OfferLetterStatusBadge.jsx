import React from 'react';

export default function OfferLetterStatusBadge({ status }) {
  const norm = (status || 'GENERATED').toUpperCase();

  let label = 'Generated';
  let style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dot = 'bg-emerald-500';

  if (norm === 'SENT') {
    label = 'Sent';
    style = 'bg-blue-50 text-blue-700 border-blue-200';
    dot = 'bg-blue-500';
  } else if (norm === 'ACKNOWLEDGED' || norm === 'ACCEPTED') {
    label = 'Accepted';
    style = 'bg-purple-50 text-purple-700 border-purple-200';
    dot = 'bg-purple-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
}
