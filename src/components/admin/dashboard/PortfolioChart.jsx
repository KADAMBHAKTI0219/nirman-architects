import React from 'react';
import Card from '../../common/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const projectStatusData = [
  { name: 'Planning', value: 4, color: '#B0E0FE' },
  { name: 'In Progress', value: 8, color: '#8FC9FF' },
  { name: 'Under Review', value: 5, color: '#A2D2FF' },
  { name: 'Completed', value: 7, color: '#D1E8FC' },
];

export default function PortfolioChart() {
  return (
    <Card title="Project Portfolios" subtitle="Overall status breakdowns">
      <div className="h-[200px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={projectStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {projectStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold">
        {projectStatusData.map((e, idx) => (
          <div key={idx} className="flex items-center gap-1.5 justify-center py-1 bg-slate-50 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }}></span>
            <span className="text-slate-605">{e.name}: {e.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
