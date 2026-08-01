import React from 'react';
import { 
  Search, Filter, Lock, Unlock, Eye, FileText, CheckCircle, Clock, 
  AlertCircle, ArrowUpRight, BarChart2, FolderOpen, ShieldCheck, Download
} from 'lucide-react';

export default function DrawingList({
  drawings,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  projectFilter,
  setProjectFilter,
  statusFilter,
  setStatusFilter,
  onSelectDrawing,
  onUploadClick,
  onLockToggle,
  setViewReports
}) {
  
  // Categories mapping
  const categoriesList = [
    { id: 'All', label: 'All Drawings' },
    { id: 'Concept Drawings', label: 'Concept Drawings' },
    { id: 'Working Drawings', label: 'Working Drawings' },
    { id: 'Process DWG', label: 'Process DWG' },
    { id: 'GFC Drawings', label: 'GFC Drawings' },
    { id: 'Site Drawings', label: 'Site Drawings' },
    { id: 'Interior Drawings', label: 'Interior Drawings' }
  ];

  // Filtering drawings list
  const filteredDrawings = drawings.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    const matchesProject = projectFilter === 'All' || d.project === projectFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchesSearch && matchesCategory && matchesProject && matchesStatus;
  });

  // KPIs
  const totalCount = drawings.length;
  const pendingCount = drawings.filter(d => d.status === 'Pending Review').length;
  const approvedCount = drawings.filter(d => d.status === 'Approved').length;
  const gfcLockedCount = drawings.filter(d => d.status === 'GFC Locked').length;

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12">
      {/* 0. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Drawings Vault Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Store, review, compare versions, and approve GFC architectural blueprints & CAD schematics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* 1. Left Sidebar Filters Panel */}
      <div className="lg:col-span-1 space-y-4">
        
        {/* Categories Section */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs space-y-3">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Drawing Vault Categories</span>
          <div className="flex flex-col gap-1.5">
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setViewReports(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                  selectedCategory === cat.id
                    ? 'bg-brand-tint text-slate-900 font-extrabold border-l-4 border-brand-primary'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 bg-white border border-slate-105 rounded font-bold text-slate-450">
                  {cat.id === 'All' ? drawings.length : drawings.filter(d => d.category === cat.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Action shortcut widgets */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs space-y-3">
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Quick Shortcuts</span>
          <button
            onClick={() => setViewReports(true)}
            className="w-full py-2.5 bg-slate-50 border border-slate-150 text-slate-700 rounded-xl text-xs font-black uppercase hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-3xs"
          >
            <BarChart2 className="w-4 h-4 text-slate-500" />
            Drawing Reports
          </button>
          <button
            onClick={onUploadClick}
            className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            Upload Blueprint
          </button>
        </div>

      </div>

      {/* 2. Main section: KPI Cards and Table grid */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-3xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Vault Files</span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-lg font-black text-slate-800">{totalCount} Blueprints</span>
              <FolderOpen className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-3xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-lg font-black text-amber-600">{pendingCount} Files</span>
              <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-3xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Approved Signoffs</span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-lg font-black text-emerald-600">{approvedCount} Releases</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-3xs">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">GFC Locked (Final)</span>
            <div className="flex items-end justify-between mt-1">
              <span className="text-lg font-black text-indigo-705">{gfcLockedCount} Drawings</span>
              <Lock className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Filters and search row */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search drawings by title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
            >
              <option value="All">All Projects</option>
              <option value="Central Office Tower">Central Office Tower</option>
              <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
              <option value="Smart City Mall">Smart City Mall</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="GFC Locked">GFC Locked</option>
            </select>
          </div>
        </div>

        {/* Drawings table list */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">DWG Code</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[220px]">Drawing Name</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Category</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36">Uploaded By</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-28">Status</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDrawings.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-4 font-black text-slate-500 uppercase tracking-wider align-middle">{d.id}</td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        {d.locked ? (
                          <Lock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        ) : (
                          <Unlock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-805 block text-xs leading-normal">{d.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                            Size: {d.fileSize} | Access: {d.accessLevel}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500 font-semibold align-middle">{d.category}</td>
                    <td className="px-4 py-4 align-middle text-slate-500">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-700 block">{d.uploadedBy}</span>
                        <span className="text-[9px] text-slate-400 block font-semibold">Uploaded {d.lastUpdated}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border leading-none inline-block ${
                        d.status === 'GFC Locked' ? 'bg-indigo-50 text-indigo-600 border-indigo-150/70' :
                        d.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-150/70' :
                        'bg-amber-50 text-amber-600 border-amber-150/70'
                      }`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-4 text-right align-middle">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={() => onSelectDrawing(d)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl transition-all shadow-3xs"
                          title="Open Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onLockToggle(d.id)}
                          className={`p-1.5 rounded-xl border transition-all ${
                            d.locked 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-650 shadow-3xs' 
                              : 'bg-white border-slate-205 text-slate-400 hover:text-slate-600 hover:bg-slate-50 shadow-3xs'
                          }`}
                          title={d.locked ? "Unlock edits" : "Lock GFC Version"}
                        >
                          {d.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDrawings.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                      <AlertCircle className="w-6 h-6 text-slate-350 mx-auto mb-2" />
                      No blueprints found in category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
