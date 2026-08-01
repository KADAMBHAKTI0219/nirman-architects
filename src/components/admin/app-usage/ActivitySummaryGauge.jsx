import React from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function ActivitySummaryGauge({
  productivityScore = 92,
  activeTime = '11h 28m',
  idleTime = '3h 27m',
  breakTime = '1h 15m',
  totalTime = '14h 55m'
}) {
  const gaugeData = [
    { name: 'Score', value: productivityScore, color: '#10B981' },
    { name: 'Remaining', value: 100 - productivityScore, color: '#E2E8F0' }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-600" />
        <h3 className="font-extrabold text-slate-900 text-sm">Activity Summary</h3>
      </div>

      {/* Main Gauge & Side Details Layout */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
        {/* Semi-circle Gauge */}
        <div className="relative w-44 h-28 flex flex-col items-center justify-center flex-shrink-0 overflow-hidden">
          <div className="w-44 h-44 absolute -top-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill="#10B981" stroke="none" />
                  <Cell fill="#E2E8F0" stroke="none" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="absolute bottom-2 text-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 leading-none block">{productivityScore}%</span>
            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Productivity Score</span>
          </div>
        </div>

        {/* Side Breakdown Items */}
        <div className="flex-1 w-full space-y-2 text-xs">
          <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
            <span className="font-bold text-slate-600">Active Time</span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-md border border-emerald-100 text-xs">
              {activeTime}
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
            <span className="font-bold text-slate-600">Idle Time</span>
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-extrabold rounded-md border border-amber-100 text-xs">
              {idleTime}
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
            <span className="font-bold text-slate-600">Break Time</span>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-extrabold rounded-md border border-blue-100 text-xs">
              {breakTime}
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 pt-2 border-t border-slate-100">
            <span className="font-extrabold text-slate-900">Total Time</span>
            <span className="font-black text-slate-900 text-xs">{totalTime}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start gap-1 text-xs text-emerald-600 font-extrabold pt-1">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>↑ 7% vs yesterday</span>
      </div>
    </div>
  );
}
