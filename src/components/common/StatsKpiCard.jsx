import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

/**
 * Common Reusable StatsKpiCard Component
 * Renders executive KPI summary stat boxes with icon, value, title, and badge accents.
 * 
 * @param {string} title - Label title for stat (e.g., 'Total Projects')
 * @param {string|number} value - Primary numeric or text metric (e.g., '14 Projects', '94.8%')
 * @param {string} subtext - Supporting caption text below value
 * @param {React.ElementType} icon - Lucide-react icon component
 * @param {string} badge - Pill badge text (e.g., '+12.5% this month')
 * @param {string} badgeColor - Tailwind color for badge pill
 * @param {string} iconBg - Tailwind color for icon container background
 * @param {function} onClick - Optional click callback handler
 */
export default function StatsKpiCard({
  title,
  value,
  subtext,
  icon: IconComponent,
  badge,
  badgeColor = 'bg-indigo-50 text-indigo-700',
  iconBg = 'bg-brand-tint text-slate-700',
  onClick,
  className = ''
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-36 ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      } ${className}`}
    >
      <div className="flex justify-between items-start min-w-0 gap-2">
        <div className="space-y-1 min-w-0 pr-1 flex-1 overflow-hidden">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">
            {title}
          </span>
          <h3 
            className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate max-w-full block"
            title={typeof value === 'string' || typeof value === 'number' ? String(value) : undefined}
          >
            {value}
          </h3>
        </div>
        {IconComponent && (
          <div className={`p-2.5 rounded-2xl shrink-0 ${iconBg}`}>
            <IconComponent className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        {badge ? (
          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase flex items-center gap-1 ${badgeColor}`}>
            <ArrowUpRight className="w-3 h-3" />
            {badge}
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium truncate">
            {subtext || 'Updated in real-time'}
          </span>
        )}
      </div>
    </div>
  );
}
