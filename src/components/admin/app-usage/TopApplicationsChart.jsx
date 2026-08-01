import React from 'react';
import { LayoutGrid, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DEFAULT_TOP_APPS = [
  { name: 'Google Chrome', value: 375, formattedTime: '6h 15m', percent: '41.8%', color: '#3B82F6' },
  { name: 'VS Code', value: 200, formattedTime: '3h 20m', percent: '22.3%', color: '#10B981' },
  { name: 'Figma', value: 130, formattedTime: '2h 10m', percent: '14.6%', color: '#8B5CF6' },
  { name: 'Slack', value: 85, formattedTime: '1h 25m', percent: '9.5%', color: '#F59E0B' },
  { name: 'Microsoft Excel', value: 70, formattedTime: '1h 10m', percent: '7.8%', color: '#06B6D4' },
  { name: 'Others', value: 35, formattedTime: '35m', percent: '4.0%', color: '#94A3B8' }
];

export default function TopApplicationsChart({ apps = DEFAULT_TOP_APPS }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-brand-dark" />
          <h3 className="font-extrabold text-slate-900 text-sm">Top Applications</h3>
        </div>
        <button className="text-xs font-extrabold text-brand-dark hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer">
          View All
        </button>
      </div>

      {/* Donut & Side Legend Layout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        {/* Donut Container with Center Label */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={apps}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {apps.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, item) => [`${item.payload.formattedTime} (${item.payload.percent})`, item.payload.name]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base font-black text-slate-900">14h 55m</span>
            <span className="text-[11px] font-bold text-slate-400">Total</span>
          </div>
        </div>

        {/* Right Side Application Breakdown List */}
        <div className="flex-1 w-full space-y-2 text-xs">
          {apps.map((app) => (
            <div key={app.name} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: app.color }}></span>
                <span className="font-bold text-slate-700 truncate">{app.name}</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-right flex-shrink-0">
                <span>{app.formattedTime}</span>
                <span className="text-slate-400 font-normal text-[11px]">({app.percent})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
