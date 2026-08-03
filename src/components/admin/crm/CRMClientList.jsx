import React, { useState } from 'react';
import { Search, Eye, MessageSquare, Plus, FileText, Smartphone, Mail, Building } from 'lucide-react';

export default function CRMClientList({
  clients,
  selectedClient,
  onSelectClient,
  onAddClientClick
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Client Directory</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage client profiles, company contacts, linked projects and shared files
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search CRM clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Clients</option>
            <option value="Inactive">Inactive Clients</option>
          </select>

          <button
            onClick={onAddClientClick}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client / Company</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact details</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Linked projects</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Open queries</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Approvals</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-55">
              {filteredClients.map(c => (
                <tr 
                  key={c.id} 
                  className={`hover:bg-slate-50/40 cursor-pointer ${selectedClient?.id === c.id ? 'bg-slate-50' : ''}`}
                  onClick={() => onSelectClient(c)}
                >
                  <td className="px-4 py-3.5 align-middle">
                    <div>
                      <strong className="text-slate-805 block">{c.name}</strong>
                      <span className="text-[9px] text-slate-400 block font-semibold flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" /> {c.company}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-middle text-slate-500">
                    <div className="space-y-0.5">
                      <span className="block font-semibold flex items-center gap-1"><Smartphone className="w-3 h-3 text-slate-400" /> {c.phone}</span>
                      <span className="block text-[9px] flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {c.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-705 font-black align-middle">{c.projects.length} Projects</td>
                  <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{c.queriesCount} Open</td>
                  <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{c.pendingApprovals} Pending</td>
                  <td className="px-4 py-3.5 align-middle">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      c.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-550 border-slate-200'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right align-middle">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClient(c);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                      title="Inspect Client Profile"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-655" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
