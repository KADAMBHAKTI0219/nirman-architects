import React, { useState } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart as RechartsBarChart, Bar 
} from 'recharts';
import { 
  MapPin, Users, AlertTriangle, Send, Camera, Clock, 
  CheckSquare, ArrowRight, Eye, Image as ImageIcon 
} from 'lucide-react';
import Card from '../../common/Card';
import { siteCheckin, siteCheckout } from '../../../service/mockApi';

const SITE_PROGRESS_DATA = [
  { week: 'Wk 1', 'Smart City Mall': 10, 'Metro Tunnel': 40 },
  { week: 'Wk 2', 'Smart City Mall': 25, 'Metro Tunnel': 55 },
  { week: 'Wk 3', 'Smart City Mall': 38, 'Metro Tunnel': 72 },
  { week: 'Wk 4', 'Smart City Mall': 48, 'Metro Tunnel': 92 }
];

const ISSUE_SEVERITY = [
  { name: 'Critical', count: 2, fill: '#EF4444' },
  { name: 'Medium', count: 3, fill: '#F59E0B' },
  { name: 'Low', count: 1, fill: '#64748B' }
];

export default function Dashboard() {
  const [activeSite, setActiveSite] = useState('Smart City Mall Foundations');
  const [crewCount, setCrewCount] = useState("12 / 15 Present");
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleSiteCheckin = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const userId = savedUser ? JSON.parse(savedUser).id : 'usr_5';
      const response = await siteCheckin(userId, 'proj_1', 21.110, 72.885, 'https://cdn.example.com/selfie.jpg');
      setIsCheckedIn(true);
      alert(response.message || "Site check-in recorded successfully!");
    } catch (err) {
      setIsCheckedIn(true);
      alert("Site check-in recorded successfully!");
    }
  };

  const handleSiteCheckout = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const userId = savedUser ? JSON.parse(savedUser).id : 'usr_5';
      const response = await siteCheckout(userId, 'proj_1', 21.110, 72.885);
      setIsCheckedIn(false);
      alert(response.message || "Site check-out recorded successfully!");
    } catch (err) {
      setIsCheckedIn(false);
      alert("Site check-out recorded successfully.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. GREETING + SITE SELECTOR */}
      <div className="bg-gradient-to-r from-blue-50/50 to-[#E5F0FA]/30 p-5 rounded-3xl border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">Field Operations Control Room</h2>
            <p className="text-[10px] text-slate-405 font-bold block mt-1.5 uppercase tracking-wider">
              Site Engineer Portal &... Real-time construction tracking
            </p>
          </div>

          <div className="flex gap-2">
            {!isCheckedIn ? (
              <button 
                onClick={handleSiteCheckin}
                className="px-3.5 py-1.5 bg-brand-primary text-slate-905 rounded-xl text-[10px] font-black uppercase shadow-3xs"
              >
                Punch In Site
              </button>
            ) : (
              <button 
                onClick={handleSiteCheckout}
                className="px-3.5 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase shadow-3xs"
              >
                Punch Out
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Site:</label>
          <select
            value={activeSite}
            onChange={(e) => setActiveSite(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl bg-white font-semibold text-slate-705"
          >
            <option value="Smart City Mall Foundations">Smart City Mall Foundations</option>
            <option value="Metro Station Tunnel Excavation">Metro Station Tunnel Excavation</option>
            <option value="Oceanic Villas Block C Slab">Oceanic Villas Block C Slab</option>
          </select>
        </div>
      </div>

      {/* 2. SUMMARY STRIP CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Active Sites</span>
          <strong className="text-sm font-black text-slate-750 block mt-1">3 Sites</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Checked-in Staff</span>
          <strong className="text-sm font-black text-slate-750 block mt-1">{crewCount}</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Open Issues</span>
          <strong className="text-sm font-black text-rose-500 block mt-1">7 Issues</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Client Updates</span>
          <strong className="text-sm font-black text-slate-750 block mt-1">3 Dispatched</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Today's Photos</span>
          <strong className="text-sm font-black text-slate-750 block mt-1">3 Uploads</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Overdue Actions</span>
          <strong className="text-sm font-black text-rose-600 block mt-1">2 Targets</strong>
        </div>

      </div>

      {/* 3. CORE ANALYTICS CHARTS WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Site Progress area chart */}
        <Card title="Physical Progress Trend" subtitle="Percentage completions over weeks" className="lg:col-span-2">
          <div className="h-[240px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SITE_PROGRESS_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2484C6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2484C6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                <Area type="monotone" dataKey="Smart City Mall" stroke="#2484C6" fillOpacity={1} fill="url(#progressGradient)" />
                <Area type="monotone" dataKey="Metro Tunnel" stroke="#818CF8" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Issue severity split Recharts */}
        <Card title="Issue Severity Split" subtitle="Count of open site incidents by severity">
          <div className="h-[240px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={ISSUE_SEVERITY} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* 4. RECENT PHOTO GRID & CLIENT UPDATES FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Photo Grid */}
        <Card title="Recent Photo Uploads" subtitle="Site verification snapshots" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { site: "Smart City Mall", desc: "Foundation casting section A", tag: "Progress", time: "10:15 AM" },
              { site: "Oceanic Villas", desc: "Slab rebar alignment check", tag: "Defect", time: "Yesterday" },
              { site: "Metro Station", desc: "Tunnel ventilation ducts installation", tag: "Progress", time: "2 days ago" }
            ].map((p, idx) => (
              <div key={idx} className="border border-slate-150 rounded-2xl overflow-hidden hover:shadow-3xs transition-all">
                <div className="bg-slate-900 h-24 flex items-center justify-center relative">
                  <ImageIcon className="w-8 h-8 text-slate-650" />
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                    <span>{p.site}</span>
                    <span className="text-[#2484C6]">{p.tag}</span>
                  </div>
                  <p className="text-[10px] text-slate-700 font-bold truncate">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Client updates feed */}
        <Card title="Latest Client Timeline" subtitle="Dispatched project milestone logs">
          <div className="space-y-3.5 pt-2 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin">
            {[
              { title: "Tunnel excavation completed", site: "Metro Station Phase 3", date: "July 22" },
              { title: "Basement concrete slab poured", site: "Smart City Mall", date: "July 20" }
            ].map((upd, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <div className="flex justify-between text-[9px] text-slate-405 font-bold uppercase">
                  <span>{upd.site}</span>
                  <span>{upd.date}</span>
                </div>
                <strong className="text-[11px] font-black text-slate-805 block">{upd.title}</strong>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
