import React, { useState } from 'react';
import { TrendingUp, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DEFAULT_TREND_DATA = [
  { day: '19 May', score: 60 },
  { day: '20 May', score: 55 },
  { day: '21 May', score: 70 },
  { day: '22 May', score: 60 },
  { day: '23 May', score: 78 },
  { day: '24 May', score: 64 },
  { day: '25 May', score: 82 }
];

export default function ProductivityTrendChart({ data = DEFAULT_TREND_DATA }) {
  const [period, setPeriod] = useState('Daily');

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-dark" />
          <h3 className="font-extrabold text-slate-900 text-sm">Productivity Trend</h3>
        </div>

        {/* Period Selector */}
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 appearance-none pr-7 cursor-pointer"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Line Chart */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Productivity Score']}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2484C6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#2484C6', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#1E293B' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
