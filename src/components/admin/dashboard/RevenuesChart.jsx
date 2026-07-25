import React from 'react';
import Card from '../../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const revenueData = [
  { name: 'Office Tower', revenue: 450000, cost: 310000 },
  { name: 'Oceanic Villas', revenue: 320000, cost: 210000 },
  { name: 'Smart Mall', revenue: 680000, cost: 490000 },
  { name: 'Metro Phase 3', revenue: 520000, cost: 420000 },
];

export default function RevenuesChart() {
  return (
    <Card title="Project Revenue Overview" subtitle="Budget cost vs final client revenues">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tickFormatter={(val) => `$${val/1000}k`} tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="revenue" fill="#8FC9FF" radius={[4, 4, 0, 0]} name="Project Value" />
            <Bar dataKey="cost" fill="#A2D2FF" radius={[4, 4, 0, 0]} name="Operational Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
