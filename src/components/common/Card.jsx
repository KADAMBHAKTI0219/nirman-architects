import React from 'react';

export default function Card({ title, subtitle, children, actions, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
