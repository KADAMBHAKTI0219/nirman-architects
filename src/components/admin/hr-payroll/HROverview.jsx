import React from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar 
} from 'recharts';
import { 
  Users, UserCheck, Calendar, FileClock, Cake, AlertTriangle, ArrowRight 
} from 'lucide-react';
import Card from '../../common/Card';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#64748B'];

export default function HROverview({
  stats,
  distributionData,
  leaveTrendData,
  exceptions
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Employees</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-slate-800 leading-none">{stats.total} Staff</strong>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">On Leave Today</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-rose-600 leading-none">{stats.onLeave} Staff</strong>
            <Calendar className="w-4 h-4 text-rose-455" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Open Leave Requests</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-amber-500 leading-none">{stats.pendingLeaves} Open</strong>
            <FileClock className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Attendance Exceptions</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-rose-500 leading-none">{stats.exceptions} Alert</strong>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Reviews</span>
          <div className="flex items-end justify-between mt-1">
            <strong className="text-base font-black text-indigo-505 leading-none">{stats.pendingReviews} Staff</strong>
            <UserCheck className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* 2. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workforce Distribution */}
        <Card title="Workforce Distribution" subtitle="Staff allocation segments by department">
          <div className="h-56 flex justify-center items-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
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

        {/* Leave Cost Trends */}
        <Card title="Leave Velocity Trend" subtitle="Monthly count of requested leave days over time" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leaveTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                <Tooltip />
                <Line type="monotone" dataKey="leaves" stroke="#EF4444" strokeWidth={3} name="Leaves Count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* 3. Exceptions & Birthdays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attendance exceptions */}
        <Card title="Attendance Exceptions Alerts" subtitle="Missed gate sync, delay check-ins, or unchecked sessions">
          <div className="space-y-3 pt-2">
            {exceptions.map(exc => (
              <div key={exc.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <div>
                    <strong className="text-slate-805 block">{exc.name} &bull; {exc.reason}</strong>
                    <span className="text-[9px] text-slate-400 block font-semibold">Date: {exc.date} | Logged: {exc.time}</span>
                  </div>
                </div>
                <button 
                  onClick={() => alert(`Exception alert notification sent to ${exc.name}`)}
                  className="px-2.5 py-1 bg-white border border-rose-200 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-3xs transition-all"
                >
                  Notify Staff
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Birthdays Anniversaries */}
        <Card title="Team Birthday & Anniversaries" subtitle="Staff milestones in the next 30 days">
          <div className="space-y-3 pt-2">
            {[
              { id: 1, name: "Alice Smith", event: "Work Anniversary (2 Years)", date: "July 28" },
              { id: 2, name: "Sarah Connor", event: "Birthday Celebration", date: "August 02" }
            ].map(milestone => (
              <div key={milestone.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cake className="w-4 h-4 text-indigo-500" />
                  <div>
                    <strong className="text-slate-850 block">{milestone.name}</strong>
                    <span className="text-[9px] text-slate-400 block font-bold">{milestone.event}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">{milestone.date}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
