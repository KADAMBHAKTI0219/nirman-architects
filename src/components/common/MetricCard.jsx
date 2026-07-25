import React from 'react';
import * as Icons from 'lucide-react';

export default function MetricCard({ title, value, iconName, change, isPositive, subtext }) {
  const Icon = Icons[iconName] || Icons.HelpCircle;

  return (
    <div className="premium-stat-box p-5 flex justify-between items-start">
      <div className="space-y-2">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        
        {subtext && (
          <div className="flex items-center gap-1.5 pt-1">
            {change && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isPositive 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-rose-50 text-rose-600'
              }`}>
                {change}
              </span>
            )}
            <span className="text-xs text-slate-400">{subtext}</span>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-brand-tint rounded-xl">
        <Icon className="w-5 h-5 text-slate-700" />
      </div>
    </div>
  );
}
