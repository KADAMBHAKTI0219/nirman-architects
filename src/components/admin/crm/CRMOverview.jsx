import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Users, UserCheck, MessageSquare, ShieldCheck, Database, Calendar, Star, ThumbsUp } from 'lucide-react';
import Card from '../../common/Card';
import { getFeedbackAggregateSummary } from '../../../service/crm/feedback';

const COLORS = ['#8FC9FF', '#34D399', '#FBBF24', '#A2D2FF'];

export default function CRMOverview({
  clients = [],
  queriesList = [],
  approvalsList = []
}) {
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeQueries = Array.isArray(queriesList) ? queriesList : [];
  const safeApprovals = Array.isArray(approvalsList) ? approvalsList : [];

  const [csatSummary, setCsatSummary] = useState(null);

  useEffect(() => {
    fetchCsatSummary();
  }, []);

  const fetchCsatSummary = async () => {
    try {
      const res = await getFeedbackAggregateSummary();
      if (res?.success) {
        setCsatSummary(res);
      }
    } catch (err) {
      console.error("Failed to load CSAT aggregate summary", err);
    }
  };

  // 1. Process client status distribution
  const statusCounts = { Active: 0, Inactive: 0 };
  safeClients.forEach(c => {
    if (c && c.status) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    }
  });
  const statusData = Object.keys(statusCounts).map(key => ({
    name: `${key} Clients`,
    value: statusCounts[key]
  }));

  // 3. Project progress by client
  const progressData = safeClients.map(c => {
    const clientName = (c?.name || c?.companyName || 'Client').split(' ')[0];
    const projectsList = Array.isArray(c?.projects) ? c.projects : [];
    const avgProgress = projectsList.length > 0 
      ? Math.round(projectsList.reduce((acc, p) => acc + (p?.progress || 0), 0) / projectsList.length)
      : (c?.progress || 65);

    return {
      name: clientName,
      progress: avgProgress
    };
  });

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
            <strong className="text-base font-black text-slate-805 leading-none">{safeClients.length} Clients</strong>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Clients</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-emerald-600 leading-none">
              {safeClients.filter(c => c && c.status === 'Active').length} Active
            </strong>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Open Support Queries</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-amber-500 leading-none">
              {safeQueries.filter(q => q && q.status === 'Open').length} Open
            </strong>
            <MessageSquare className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Client Satisfaction CSAT</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-amber-600 leading-none flex items-center gap-1">
              <span>{csatSummary?.averageOverallRating || 4.8}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </strong>
            <ThumbsUp className="w-4 h-4 text-amber-500" />
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
            <ResponsiveContainer width="100%" height="100%">
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

      {/* 3. CRM Module 9 - Client Feedback Satisfaction Analytics Widget */}
      {csatSummary && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Client Satisfaction & Feedback Analytics
              </h3>
              <p className="text-xs text-slate-500">
                Server-aggregated ratings across project completions, batch approvals & ticket resolutions.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-black">
              Avg CSAT: {csatSummary.averageOverallRating || 4.8} / 5.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {csatSummary.categoryAverages && csatSummary.categoryAverages.map((cat, i) => (
              <div key={cat.categoryId || i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between font-bold text-slate-800">
                  <span className="truncate">{cat.categoryName}</span>
                  <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                    {cat.averageRating} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${(cat.averageRating / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
