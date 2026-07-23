import React, { useState } from 'react';
import { 
  Users, MapPin, CheckSquare, Clock, Map, Plus, Search, CheckCircle 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card from '../../common/Card';

const WEEKLY_MANPOWER = [
  { day: 'Mon', count: 18 },
  { day: 'Tue', count: 24 },
  { day: 'Wed', count: 22 },
  { day: 'Thu', count: 28 },
  { day: 'Fri', count: 25 }
];

const INITIAL_LOGS = [
  { id: 1, name: "John Wick", role: "Site Supervisor", site: "Smart City Mall Foundations", timeIn: "08:45 AM", timeOut: "--", hours: 4.5, status: "Present", gpsVerified: true },
  { id: 2, name: "Frank Castle", role: "Concrete Mason Lead", site: "Smart City Mall Foundations", timeIn: "08:55 AM", timeOut: "--", hours: 4.3, status: "Present", gpsVerified: true },
  { id: 3, name: "Alice Cooper", role: "Safety Inspector", site: "Metro Station Tunnel Excavation", timeIn: "09:02 AM", timeOut: "--", hours: 4.2, status: "Present", gpsVerified: true },
  { id: 4, name: "Mike Tyson", role: "Steel Rebar Tech", site: "Metro Station Tunnel Excavation", timeIn: "08:30 AM", timeOut: "--", hours: 4.7, status: "Present", gpsVerified: false },
  { id: 5, name: "Bob Vance", role: "Electrical Contractor", site: "Oceanic Villas Block C Slab", timeIn: "--", timeOut: "--", hours: 0, status: "Absent", gpsVerified: false }
];

export default function Attendance() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('All');

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = selectedSite === 'All' || l.site === selectedSite;
    return matchesSearch && matchesSite;
  });

  const presentCount = logs.filter(l => l.status === 'Present').length;
  const absentCount = logs.filter(l => l.status === 'Absent').length;
  const gpsCount = logs.filter(l => l.gpsVerified).length;

  const handleToggleStatus = (id) => {
    setLogs(prev => prev.map(l => {
      if (l.id === id) {
        const nextStatus = l.status === 'Present' ? 'Absent' : 'Present';
        return {
          ...l,
          status: nextStatus,
          timeIn: nextStatus === 'Present' ? "09:00 AM" : "--",
          hours: nextStatus === 'Present' ? 4.0 : 0,
          gpsVerified: nextStatus === 'Present' ? true : false
        };
      }
      return l;
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Total Crew Present</span>
            <strong className="text-base font-black text-slate-750 block mt-0.5">{presentCount} / {logs.length} Staff</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Absent Log</span>
            <strong className="text-base font-black text-slate-750 block mt-0.5">{absentCount} Supervisor</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">GPS Verified</span>
            <strong className="text-base font-black text-emerald-600 block mt-0.5">{gpsCount} Checked-In</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Verification Status</span>
            <strong className="text-base font-black text-slate-750 block mt-0.5">Noida Sector 62</strong>
          </div>
        </div>
      </div>

      {/* 2. MANPOWER MOVEMENT CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Weekly Manpower Movement Chart */}
        <Card title="Weekly Crew Movement" subtitle="Total staff headcount logged on site daily" className="lg:col-span-1">
          <div className="h-[200px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_MANPOWER} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="count" stroke="#2484C6" strokeWidth={2} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Attendance ledger log table */}
        <Card title="Today's Crew Attendance Register" subtitle="Verify timesheet entries and geo-fence check-ins" className="lg:col-span-2">
          
          <div className="flex gap-3 flex-wrap items-center pb-4 border-b border-slate-50">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search staff name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
              />
            </div>

            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-205 rounded-xl bg-white font-semibold text-slate-700"
            >
              <option value="All">All Sites</option>
              <option value="Smart City Mall Foundations">Smart City Mall Foundations</option>
              <option value="Metro Station Tunnel Excavation">Metro Station Tunnel Excavation</option>
              <option value="Oceanic Villas Block C Slab">Oceanic Villas Block C Slab</option>
            </select>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Crew Details</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Site Name</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Gate Log</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">GPS Verified</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3 align-middle">
                      <strong className="text-slate-805 block">{log.name}</strong>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{log.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-bold align-middle truncate max-w-[150px]" title={log.site}>{log.site}</td>
                    <td className="px-4 py-3 text-slate-500 font-semibold align-middle">
                      <span>{log.timeIn} &bull; {log.timeOut}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Logged: {log.hours} hrs</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        log.gpsVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>{log.gpsVerified ? 'GPS OK' : 'No GPS Check'}</span>
                    </td>
                    <td className="px-4 py-3 text-right align-middle">
                      <button
                        onClick={() => handleToggleStatus(log.id)}
                        className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded border transition-all ${
                          log.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100'
                        }`}
                      >
                        {log.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </Card>

      </div>

    </div>
  );
}
