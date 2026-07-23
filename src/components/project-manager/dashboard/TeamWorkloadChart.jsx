import React from 'react';
import Card from '../../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const workloadData = [
  { name: 'Sarah (Arch)', active: 36, idle: 4 },
  { name: 'Alice (Arch)', active: 34, idle: 6 },
  { name: 'John (Eng)', active: 42, idle: 3 },
  { name: 'Bob (Site)', active: 38, idle: 7 },
  { name: 'Jane (Draft)', active: 30, idle: 10 },
];

export default function TeamWorkloadChart() {
  return (
    <Card title="Team Productivity (This Week)" subtitle="Biometric active vs idle hours log">
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={workloadData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="active" fill="#8FC9FF" stackId="a" radius={[0, 4, 4, 0]} name="Active Hours" />
            <Bar dataKey="idle" fill="#D1E8FC" stackId="a" radius={[0, 4, 4, 0]} name="Idle Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
