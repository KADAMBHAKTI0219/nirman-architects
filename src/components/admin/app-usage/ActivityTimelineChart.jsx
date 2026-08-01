import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DEFAULT_TIMELINE_DATA = [
  { day: '19 May', active: 11.5, idle: 3.2, offline: 4.5 },
  { day: '20 May', active: 11.2, idle: 2.8, offline: 5.0 },
  { day: '21 May', active: 12.0, idle: 3.5, offline: 3.5 },
  { day: '22 May', active: 11.0, idle: 2.2, offline: 4.8 },
  { day: '23 May', active: 12.5, idle: 3.0, offline: 3.0 },
  { day: '24 May', active: 12.8, idle: 3.2, offline: 2.5 },
  { day: '25 May', active: 11.4, idle: 3.4, offline: 4.2 }
];

export default function ActivityTimelineChart({ data = DEFAULT_TIMELINE_DATA }) {
  const [viewType, setViewType] = useState('Daily View');

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between h-full">
      {/* Header & View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <h3 className="font-extrabold text-slate-900 text-sm">Activity Timeline</h3>
        </div>

        <div className="flex items-center gap-4">
          {/* Custom Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Active Time
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Idle Time
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Offline Time
            </span>
          </div>

          {/* View Dropdown */}
          <div className="relative">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none pr-7 cursor-pointer"
            >
              <option value="Daily View">Daily View</option>
              <option value="Weekly View">Weekly View</option>
              <option value="Monthly View">Monthly View</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Legend fallback */}
      <div className="sm:hidden flex items-center justify-center gap-3 text-[11px] font-bold pt-1">
        <span className="flex items-center gap-1 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Active
        </span>
        <span className="flex items-center gap-1 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span> Idle
        </span>
        <span className="flex items-center gap-1 text-slate-600">
          <span className="w-2 h-2 rounded-full bg-slate-300 inline-block"></span> Offline
        </span>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}h`} domain={[0, 20]} />
            <Tooltip
              formatter={(value, name) => [`${value} hrs`, name === 'active' ? 'Active Time' : name === 'idle' ? 'Idle Time' : 'Offline Time']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Bar dataKey="active" stackId="a" fill="#8FC9FF" radius={[0, 0, 0, 0]} barSize={22} />
            <Bar dataKey="idle" stackId="a" fill="#A2D2FF" radius={[0, 0, 0, 0]} barSize={22} />
            <Bar dataKey="offline" stackId="a" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
