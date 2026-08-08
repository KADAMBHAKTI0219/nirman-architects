import React from 'react';
import { Clock, Monitor, Coffee, LayoutGrid, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';

export default function AppUsageStats({ statsData }) {
  const stats = statsData || {
    totalTrackedTime: '0h 0m',
    activeTime: '0h 0m',
    idleTime: '0h 0m',
    appsUsed: 0,
    productivityScore: 0
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Total Tracked Time */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-bold text-xs">Total Tracked Time</span>
          <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-dark font-bold flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900">{stats.totalTrackedTime}</div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 font-bold">
            <span>Real-time tracked</span>
          </div>
        </div>
      </div>

      {/* Card 2: Active Time */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-bold text-xs">Active Time</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
            <Monitor className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900">{stats.activeTime}</div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active user session</span>
          </div>
        </div>
      </div>

      {/* Card 3: Idle Time */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-bold text-xs">Idle Time</span>
          <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center">
            <Coffee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900">{stats.idleTime}</div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 font-bold">
            <Coffee className="w-3.5 h-3.5" />
            <span>Inactivity duration</span>
          </div>
        </div>
      </div>

      {/* Card 4: Applications Used */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-bold text-xs">Applications Used</span>
          <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-dark font-bold flex items-center justify-center">
            <LayoutGrid className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900">{stats.appsUsed}</div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 font-bold">
            <span>Unique apps logged</span>
          </div>
        </div>
      </div>

      {/* Card 5: Productivity Score */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-bold text-xs">Productivity Score</span>
          <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand-dark font-bold flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900">{stats.productivityScore}%</div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active ratio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
