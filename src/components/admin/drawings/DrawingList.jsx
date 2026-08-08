import React, { useState } from 'react';
import { 
  Search, Lock, Unlock, Eye, CheckCircle, Clock, 
  AlertCircle, BarChart2, FolderOpen, ChevronLeft, ChevronRight, ChevronDown, Plus
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtering drawings list safely with null/undefined guards
  const filteredDrawings = (drawings || []).filter(d => {
    if (!d) return false;
    const nameStr = (d.name || d.title || '').toLowerCase();
    const idStr = (d.id || d.drawingNumber || d._id || '').toLowerCase();
    const queryStr = (searchQuery || '').toLowerCase();

    const matchesSearch = nameStr.includes(queryStr) || idStr.includes(queryStr);
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || d.category === selectedCategory;
    const matchesProject = !projectFilter || projectFilter === 'All' || d.project === projectFilter;
    const matchesStatus = !statusFilter || statusFilter === 'All' || 
      d.status === statusFilter || 
      (statusFilter === 'GFC Locked' && (d.status === 'GFC Locked' || d.status === 'GFC_LOCKED' || Boolean(d.locked))) ||
      (statusFilter === 'Approved' && (d.status === 'Approved' || d.status === 'APPROVED')) ||
      (statusFilter === 'Pending Review' && (d.status === 'Pending Review' || d.status === 'PENDING_CLIENT_APPROVAL')) ||
      (statusFilter === 'Revisions Required' && (d.status === 'Revisions Required' || d.status === 'CHANGES_REQUESTED'));
    return matchesSearch && matchesCategory && matchesProject && matchesStatus;
  });

  // KPIs
  const totalCount = (drawings || []).length;
  const pendingCount = (drawings || []).filter(d => d?.status === 'Pending Review' || d?.status === 'PENDING_CLIENT_APPROVAL').length;
  const approvedCount = (drawings || []).filter(d => d?.status === 'Approved' || d?.status === 'APPROVED').length;
  const gfcLockedCount = (drawings || []).filter(d => d?.status === 'GFC Locked' || d?.locked).length;

  // Dynamic Project Options list
  const uniqueProjects = Array.from(new Set((drawings || []).map(d => d?.project).filter(Boolean)));
  const projectOptions = uniqueProjects.length > 0 ? uniqueProjects : ["Central Office Tower", "Oceanic Luxury Villas", "Smart City Mall"];

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 w-full">
      
      {/* 0. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Drawings Vault Management
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Store, review, compare versions, and approve GFC architectural blueprints & CAD schematics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewReports(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-3xs"
          >
            <BarChart2 className="w-4 h-4 text-slate-500" />
            Drawing Reports
          </button>
          <button
            onClick={onUploadClick}
            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>Upload Blueprint</span>
          </button>
        </div>
      </div>

      {/* 1. KPI CARDS ROW (FULL WIDTH 4 COLUMNS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Card 1: TOTAL VAULT FILES */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              TOTAL VAULT FILES
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{totalCount}</span>
              <span className="text-sm font-bold text-slate-900">Blueprints</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <FolderOpen className="w-5 h-5" />
          </div>
        </div>
        
        {/* Card 2: PENDING REVIEW */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
              PENDING REVIEW
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-500">{pendingCount}</span>
              <span className="text-sm font-bold text-amber-500">Files</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Card 3: APPROVED SIGNOFFS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
              APPROVED SIGNOFFS
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-600">{approvedCount}</span>
              <span className="text-sm font-bold text-emerald-600">Files</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: GFC LOCKED */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100/90 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
              GFC LOCKED
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-800">{gfcLockedCount}</span>
              <span className="text-sm font-bold text-slate-800">Frozen</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTERS CONTROL BAR (WITH CATEGORIES DROPDOWN) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search drawings by title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs border border-slate-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-slate-50/40 font-semibold"
          />
        </div>

        {/* 3 Dropdowns Row */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setViewReports(false);
              }}
              className="appearance-none pl-4 pr-9 py-2.5 text-xs border border-slate-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 bg-white font-semibold cursor-pointer shadow-3xs"
            >
              <option value="All">All Categories</option>
              <option value="Concept Drawings">Concept Drawings</option>
              <option value="Working Drawings">Working Drawings</option>
              <option value="Process DWG">Process DWG</option>
              <option value="GFC Drawings">GFC Drawings</option>
              <option value="Site Drawings">Site Drawings</option>
              <option value="Interior Drawings">Interior Drawings</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Project Dropdown */}
          <div className="relative">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 text-xs border border-slate-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 bg-white font-semibold cursor-pointer shadow-3xs"
            >
              <option value="All">All Projects</option>
              <option value="Central Office Tower">Central Office Tower</option>
              <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
              <option value="Smart City Mall">Smart City Mall</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 text-xs border border-slate-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 bg-white font-semibold cursor-pointer shadow-3xs"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="GFC Locked">GFC Locked</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. FULL-WIDTH DRAWINGS TABLE */}
      <div className="bg-white border border-slate-100/90 rounded-3xl overflow-hidden shadow-2xs w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">
                  DWG CODE
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  DRAWING NAME
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40">
                  CATEGORY
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">
                  UPLOADED BY
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-36">
                  STATUS
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-28 text-right">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredDrawings.map((d, idx) => (
                <tr 
                  key={d._id ? `${d._id}-${idx}` : `${d.id || d.drawingNumber || 'dwg'}-${idx}`} 
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => onSelectDrawing(d)}
                >
                  {/* DWG CODE */}
                  <td className="px-6 py-5 font-bold text-slate-700 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors">{d.id}</span>
                      {d.locked ? (
                        <Lock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 flex-shrink-0" />
                      )}
                    </div>
                  </td>

                  {/* DRAWING NAME & DETAILS */}
                  <td className="px-6 py-5 align-middle">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                        {d.name}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-extrabold block uppercase tracking-wider">
                        SIZE: {d.fileSize} | ACCESS: {d.accessLevel.toUpperCase()}
                      </span>
                    </div>
                  </td>

                  {/* CATEGORY */}
                  <td className="px-6 py-5 font-extrabold text-indigo-600 align-middle text-xs">
                    {d.category}
                  </td>

                  {/* UPLOADED BY */}
                  <td className="px-6 py-5 align-middle text-slate-700">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 block text-xs">
                        {d.uploadedBy}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Uploaded {d.lastUpdated}
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5 align-middle">
                    {d.status === 'Pending Review' && (
                      <span className="px-3.5 py-1.5 bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] uppercase tracking-wider rounded-full inline-block">
                        PENDING REVIEW
                      </span>
                    )}
                    {d.status === 'Approved' && (
                      <span className="px-3.5 py-1.5 bg-[#D1FAE5] text-[#059669] font-bold text-[10px] uppercase tracking-wider rounded-full inline-block">
                        APPROVED
                      </span>
                    )}
                    {d.status === 'GFC Locked' && (
                      <span className="px-3.5 py-1.5 bg-[#EEF2FF] text-[#4F46E5] font-bold text-[10px] uppercase tracking-wider rounded-full inline-block">
                        GFC LOCKED
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectDrawing(d)}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-all shadow-3xs"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onLockToggle(d.id)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-3xs ${
                          d.locked
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
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
                  <td colSpan="6" className="py-16 text-center text-slate-400 font-bold">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No drawings match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            Showing 1 to {filteredDrawings.length} of {filteredDrawings.length} results
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="appearance-none pl-3 pr-7 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                className="w-7 h-7 rounded-lg bg-brand-soft border border-brand-secondary text-slate-900 font-black flex items-center justify-center text-xs shadow-3xs"
              >
                1
              </button>
              <button 
                disabled={true}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
