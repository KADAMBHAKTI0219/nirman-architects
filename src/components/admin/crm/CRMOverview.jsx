import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Users, UserCheck, MessageSquare, ShieldCheck, Database, Calendar } from 'lucide-react';
import Card from '../../common/Card';

const COLORS = ['#8FC9FF', '#34D399', '#FBBF24', '#A2D2FF'];

export default function CRMOverview({
  clients,
  queriesList,
  approvalsList
}) {
  
  // 1. Process client status distribution
  const statusCounts = { Active: 0, Inactive: 0 };
  clients.forEach(c => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });
  const statusData = Object.keys(statusCounts).map(key => ({
    name: `${key} Clients`,
    value: statusCounts[key]
  }));

  // 2. Process query categories distribution
  const queryCounts = { Structural: 1, Electrical: 1, Layouts: 1 };
  const queryData = Object.keys(queryCounts).map(key => ({
    name: key,
    value: queryCounts[key]
  }));

  // 3. Project progress by client
  const progressData = clients.map(c => ({
    name: c.name.split(' ')[0],
    progress: c.projects.reduce((acc, p)=>acc+p.progress,0) / (c.projects.length || 1)
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">CRM Overview</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            High-level metrics, client distribution and support operational analytics
          </p>
        </div>
      </div>

      {/* 1. KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Clients</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-slate-805 leading-none">{clients.length} Clients</strong>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Clients</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-emerald-600 leading-none">
              {clients.filter(c=>c.status==='Active').length} Active
            </strong>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Open Support Queries</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-amber-500 leading-none">
              {queriesList.filter(q=>q.status==='Open').length} Open
            </strong>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Approvals</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-rose-500 leading-none">
              {approvalsList.filter(a=>a.status==='Awaiting Response').length} Pending
            </strong>
            <Calendar className="w-4 h-4 text-rose-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Shared documents</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-indigo-505 leading-none">8 Files</strong>
            <Database className="w-4 h-4 text-indigo-405" />
          </div>
        </div>
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active vs Inactive ratio */}
        <Card title="Active vs Inactive Clients" subtitle="Monthly client engagement segments ratio">
          <div className="h-56 flex justify-center items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" iconSize={8} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Project progress by client */}
        <Card title="Project Progress by Client" subtitle="Average milestone progress percentage by client link" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="105%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="progress" fill="#A2D2FF" radius={[4, 4, 0, 0]} name="Progress (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

    </div>
  );
}
