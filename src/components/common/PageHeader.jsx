import React from 'react';

/**
 * Common Reusable PageHeader Component
 * Used across Admin, Workforce, HR, PM, and Client modules for consistent top heading & action button layouts.
 */
export default function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  children,
  className = ''
}) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {(actions || children || badge) && (
        <div className="flex items-center gap-3 shrink-0">
          {badge && (
            <div className="flex items-center gap-2">
              {typeof badge === 'string' ? (
                <span className="px-3.5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs whitespace-nowrap">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {badge}
                </span>
              ) : (
                badge
              )}
            </div>
          )}

          {actions}
          {children}
        </div>
      )}
    </div>
  );
}
