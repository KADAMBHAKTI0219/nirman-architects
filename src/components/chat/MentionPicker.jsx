import React from 'react';
import { User } from 'lucide-react';

/**
 * Reusable MentionPicker Component
 * Shows autocomplete suggestion dropdown when user types '@' in composer
 */
export default function MentionPicker({
  users = [],
  filterText = '',
  onSelectUser = null,
  onClose = null
}) {
  const defaultList = users.length > 0 ? users : [
    { id: 'usr-pm', name: 'Project Manager', role: 'Project Lead', email: 'pm@nirman.com' },
    { id: 'usr-ar', name: 'Lead Architect', role: 'Design Studio', email: 'architect@nirman.com' },
    { id: 'usr-se', name: 'Site Engineer', role: 'Field Operations', email: 'site@nirman.com' },
    { id: 'usr-cc', name: 'Client Contact', role: 'Client Representative', email: 'client@nirman.com' }
  ];

  const filtered = defaultList.filter(u => {
    const name = u.name || u.employeeName || u.label || '';
    return name.toLowerCase().includes((filterText || '').toLowerCase());
  });

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 left-4 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 font-sans">
      <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span>Mention Participant</span>
        <span>{filtered.length} found</span>
      </div>

      <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
        {filtered.map(u => (
          <button
            key={u._id || u.id || u.email || u.name}
            type="button"
            onClick={() => onSelectUser && onSelectUser(u)}
            className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-brand-soft/60 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-brand-primary text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
              {u.name ? u.name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-slate-800 block truncate">{u.name || u.employeeName}</span>
              <span className="text-[10px] text-slate-400 block truncate">{u.designation || u.role || u.email || 'Participant'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
