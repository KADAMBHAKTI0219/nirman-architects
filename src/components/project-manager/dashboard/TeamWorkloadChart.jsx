import React from 'react';
import Card from '../../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, CheckCircle2, AlertCircle } from 'lucide-react';

const workloadData = [
  { name: 'Sarah (Arch)', active: 36, idle: 4, status: 'Optimal' },
  { name: 'Alice (Arch)', active: 34, idle: 6, status: 'Optimal' },
  { name: 'John (Eng)', active: 42, idle: 3, status: 'High' },
  { name: 'Bob (Site)', active: 38, idle: 7, status: 'Optimal' },
  { name: 'Jane (Draft)', active: 30, idle: 10, status: 'Available' },
];

export default function TeamWorkloadChart() {
  return (
    <Card 
      title="Team Productivity (This Week)" 
      subtitle="Biometric active logged hours vs idle desk time"
    >
      <div className="space-y-3">
        <div className="h-[220px] pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workloadData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 50]} ticks={[0, 15, 30, 45]} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }} width={80} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderRadius: '12px', 
                  border: '1px solid #1E293B', 
                  color: '#FFF', 
                  fontSize: '11px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
                itemStyle={{ color: '#38BDF8', fontWeight: 600 }}
              />
              <Bar dataKey="active" fill="#0EA5E9" stackId="a" radius={[0, 0, 0, 0]} name="Active Hours" />
              <Bar dataKey="idle" fill="#BAE6FD" stackId="a" radius={[0, 6, 6, 0]} name="Idle Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Capacity Summary Legend */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="p-2 bg-sky-50/70 rounded-xl border border-sky-100">
            <span className="text-[9px] font-bold text-sky-700 uppercase block">Active Hours</span>
            <strong className="text-sm font-black text-sky-900">36.0 hrs/avg</strong>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Available Capacity</span>
            <strong className="text-sm font-black text-slate-800">1 Available</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}


