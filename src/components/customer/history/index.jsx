import React, { useState } from 'react';
import { 
  Archive, FileText, CheckCircle, Download, Search, 
  Layers, MessageSquare, Calendar 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_AUDITS = [
  { id: 1, date: "2026-07-22", event: "Lobby Interior rendering approved by client", category: "Sign-off", actor: "Bruce Wayne (You)" },
  { id: 2, date: "2026-07-20", event: "Italian White Marble tiling material specs locked", category: "Milestone", actor: "Sarah Connor (PM)" },
  { id: 3, date: "2026-07-15", site: "Central Office Tower", event: "Basement concrete slab casting completed", category: "Construction", actor: "Frank Castle (Site Engineer)" },
  { id: 4, date: "2026-06-10", event: "Noida municipal authority site permits signed", category: "Compliance", actor: "Sarah Connor (PM)" }
];

export default function History() {
  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filteredAudits = audits.filter(a => {
    const matchesSearch = a.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.actor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'All' || a.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search historical ledger..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl bg-white font-semibold text-slate-707"
          >
            <option value="All">All Categories</option>
            <option value="Sign-off">Sign-offs</option>
            <option value="Milestone">Milestones</option>
            <option value="Construction">Construction</option>
            <option value="Compliance">Compliance</option>
          </select>
        </div>

        <button
          onClick={() => {
            alert("Exporting historical project logs to CSV... Successful.");
          }}
          className="px-4 py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase transition-all shadow-3xs flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Export Ledger
        </button>
      </div>

      {/* 2. LEDGER TABLE */}
      <Card title="Project Audits History Ledger" subtitle="Complete transparent historical log of construction and design milestones">
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-left table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged Event</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged By</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAudits.map(audit => (
                <tr key={audit.id} className="hover:bg-slate-55/30">
                  <td className="px-4 py-3.5 align-middle">
                    <strong className="text-slate-805 block">{audit.event}</strong>
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-slate-150 bg-slate-50 text-slate-500">
                      {audit.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-705 font-bold align-middle">{audit.actor}</td>
                  <td className="px-4 py-3.5 text-right text-slate-450 align-middle">{audit.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
