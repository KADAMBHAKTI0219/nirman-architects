import React, { useState } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar 
} from 'recharts';
import { 
  Search, Eye, Clock, MapPin, Laptop, ShieldCheck, Smartphone, 
  Download, ArrowRight, UserCheck, AlertTriangle
} from 'lucide-react';
import Card from '../../common/Card';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#64748B'];

export default function AttendanceOps({
  attendanceLogs,
  liveAlerts,
  onSelectEmployee,
  selectedEmployee
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('All'); // All, Office, Site

  // Filtered Logs
  const filteredLogs = attendanceLogs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === 'All' || log.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  // Recharts Data
  const donutData = [
    { name: 'Present Today', value: attendanceLogs.filter(l => l.status === 'Present').length },
    { name: 'Late Arrival', value: attendanceLogs.filter(l => l.status === 'Late').length },
    { name: 'Absent', value: 2 },
    { name: 'On Leave', value: 1 }
  ];

  const trendData = [
    { day: 'Mon', office: 12, site: 8 },
    { day: 'Tue', office: 14, site: 9 },
    { day: 'Wed', office: 15, site: 9 },
    { day: 'Thu', office: 13, site: 7 },
    { day: 'Fri', office: 15, site: 10 }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Present Today</span>
          <strong className="text-base font-black text-emerald-600 block mt-1">24 Staff</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Absent</span>
          <strong className="text-base font-black text-rose-600 block mt-1">2 Staff</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Late Arrival</span>
          <strong className="text-base font-black text-amber-500 block mt-1">3 Staff</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">On Leave</span>
          <strong className="text-base font-black text-slate-500 block mt-1">1 Staff</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Office Check-ins</span>
          <strong className="text-base font-black text-sky-505 block mt-1">15 Laptop</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Site Check-ins</span>
          <strong className="text-base font-black text-indigo-505 block mt-1">9 Mobile</strong>
        </div>
      </div>

      {/* 2. Main content Split: List & Charts (2/3 width) + Live feed (1/3 width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Search, Table and Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search staff attendance..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Office', 'Site'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    filterMode === mode 
                      ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs' 
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Name</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-In</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Check-Out</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Hours</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mode</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-55">
                  {filteredLogs.map(log => (
                    <tr key={log.id} className={`hover:bg-slate-50/40 cursor-pointer ${selectedEmployee?.id === log.employeeId ? 'bg-slate-50' : ''}`} onClick={() => onSelectEmployee(log)}>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-tint border border-brand-primary flex items-center justify-center font-bold text-[10px] text-slate-700">
                            {log.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <strong className="text-slate-805 block">{log.name}</strong>
                            <span className="text-[9px] text-slate-400 block font-semibold">{log.role}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{log.timeIn}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{log.timeOut}</td>
                      <td className="px-4 py-3.5 text-slate-705 font-black align-middle">{log.hours}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-1">
                          {log.mode === 'Office' ? <Laptop className="w-3.5 h-3.5 text-slate-400" /> : <Smartphone className="w-3.5 h-3.5 text-slate-400" />}
                          <span className="text-[10px] font-semibold text-slate-600">{log.mode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          log.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          log.status === 'Late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>{log.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEmployee(log);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                          title="Inspect Selfie Validation"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-650" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status donut */}
            <Card title="Attendance Present Distribution" subtitle="Today check-ins status segmentation">
              <div className="h-48 flex justify-center items-center">
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
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

            {/* Stacked bar ratio */}
            <Card title="Office vs Site Check-In Trends" subtitle="Laptop auto login versus site mobile GPS validations">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="105%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                    <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="office" stackId="a" fill="#A2D2FF" name="Office Laptop" />
                    <Bar dataKey="site" stackId="a" fill="#34D399" name="Site Mobile GPS" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>

        </div>

        {/* Right Side: Live Alerts feed & selfie validation displays */}
        <div className="space-y-6">
          
          {/* Selfie Snapshot display of clicked employee */}
          {selectedEmployee && (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <div className="border-b border-slate-50 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Biometric Selfie Validation</span>
                <strong className="text-xs text-slate-805 block mt-0.5">{selectedEmployee.name}</strong>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-150 h-36 bg-slate-900 flex items-center justify-center">
                {/* Simulated Selfie webcam picture */}
                <div className="w-16 h-16 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center font-black text-white text-base">
                  {selectedEmployee.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Selfie Matches Profile ID
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Timestamp</span>
                  <span className="font-semibold text-slate-700">{selectedEmployee.timeIn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Device Verified</span>
                  <span className="font-semibold text-slate-700">{selectedEmployee.mode} Authentication</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase text-[9px]">Geo-Fence status</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">Inside Site radius</span>
                </div>
              </div>
            </div>
          )}

          {/* Live Alerts feed */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <h4 className="text-[10px] font-black text-slate-455 uppercase tracking-widest block border-b border-slate-55 pb-2">Live Check-In alerts</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {liveAlerts.map(alert => (
                <div key={alert.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                    <span>{alert.type} Alert</span>
                    <span>{alert.time}</span>
                  </div>
                  <p className="font-semibold text-slate-700 leading-normal">{alert.message}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button 
                onClick={() => alert("Downloading PDF summary data reports...")}
                className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-205 text-slate-700 rounded-xl text-[10px] font-black uppercase transition-all shadow-3xs"
              >
                Export Reports
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
