import React, { useState } from 'react';
import { 
  Search, MapPin, Users, AlertTriangle, Plus, CheckSquare, 
  Layers, Filter, Eye, RefreshCw 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_SITES = [
  { id: 1, name: "Smart City Mall Foundations", project: "Smart City Mall", location: "Sector 4, Noida", progress: 48, status: "Active", manpower: 12, issues: 3, priority: "High" },
  { id: 2, name: "Metro Station Tunnel Excavation", project: "Metro Station Phase 3", location: "Connaught Place, Delhi", progress: 92, status: "Active", manpower: 24, issues: 0, priority: "Medium" },
  { id: 3, name: "Oceanic Villas Block C Slab", project: "Oceanic Luxury Villas", location: "Goa Beachfront", progress: 12, status: "Delayed", manpower: 6, issues: 4, priority: "High" }
];

export default function Sites() {
  const [sites, setSites] = useState(INITIAL_SITES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  
  const filteredSites = sites.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || s.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateProgress = async (id) => {
    const newProgress = await window.prompt("Enter new physical progress percentage (0 - 100):", "50", "Update Site Progress");
    const num = parseFloat(newProgress);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setSites(prev => prev.map(s => s.id === id ? { ...s, progress: num } : s));
      alert("Progress updated successfully!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. FILTER CONTROLS BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex gap-3 flex-wrap items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search active site files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Delayed">Delayed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>

        <button
          onClick={async () => {
            const name = await window.prompt("Enter Site Name:", "", "Add New Construction Site");
            if (!name) return;
            const project = await window.prompt("Enter Project Name:", "", "Add New Construction Site");
            if (!project) return;
            const location = await window.prompt("Enter Location:", "", "Add New Construction Site");
            if (name && project && location) {
              const newSite = {
                id: Date.now(),
                name,
                project,
                location,
                status: 'Active',
                priority: 'Medium',
                progress: 0,
                lead: 'Site Lead',
                workers: 10
              };
              setSites(prev => [newSite, ...prev]);
              alert(`Site '${name}' registered successfully!`);
            }
          }}
          className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Site file
        </button>

      </div>

      {/* 2. SITES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredSites.map(site => (
          <div 
            key={site.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden hover:border-[#2484C6]/40 transition-all flex flex-col justify-between"
          >
            {/* Top info */}
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">{site.project}</span>
                  <strong className="text-slate-805 block text-sm mt-0.5 leading-snug">{site.name}</strong>
                </div>

                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                  site.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>{site.status}</span>
              </div>

              <div className="space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{site.location}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-b border-slate-50 py-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Manpower: {site.manpower}
                  </span>
                  <span className="flex items-center gap-1 text-rose-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Issues: {site.issues}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Progress and Quick Action */}
            <div className="bg-slate-50/50 p-5 border-t border-slate-50 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>Physical Progress</span>
                  <span>{site.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2484C6] h-full" style={{ width: `${site.progress}%` }}></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateProgress(site.id)}
                  className="flex-1 py-2 bg-white border border-slate-205 hover:bg-slate-50 text-slate-655 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-3xs flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Progress
                </button>
                
                <button
                  onClick={() => alert(`Redirecting to Site Attendance details for site: ${site.name}`)}
                  className="flex-1 py-2 bg-brand-primary text-slate-905 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-3xs flex items-center justify-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  Attendance
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
