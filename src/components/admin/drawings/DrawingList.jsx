import React, { useState, useEffect } from 'react';
import {
  Search, Lock, Unlock, Eye, CheckCircle, Clock,
  AlertCircle, BarChart2, FolderOpen, ChevronLeft, ChevronRight, ChevronDown, Plus,
  LayoutGrid, LayoutList, File, Edit3
} from 'lucide-react';
import { getActiveDrawingCategories } from '../../../service/drawing';
import { getProjects } from '../../../service/project';

export const getDrawingStatusBadge = (rawStatus, isGFCLocked = false) => {
  if (isGFCLocked || String(rawStatus).toUpperCase() === 'GFC_LOCKED' || String(rawStatus).toUpperCase() === 'GFC LOCKED') {
    return {
      label: 'GFC Locked',
      className: 'bg-slate-900 text-amber-300 border-slate-800 font-extrabold'
    };
  }

  const s = String(rawStatus || 'DESIGNER_UPLOADED').toUpperCase().trim();

  switch (s) {
    case 'PM_APPROVED':
    case 'PM APPROVED':
      return {
        label: 'PM Approved',
        className: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD] font-extrabold'
      };
    case 'PM_REJECTED':
    case 'PM REJECTED':
      return {
        label: 'PM Rejected',
        className: 'bg-[#FFE4E6] text-[#E11D48] border-[#FECDD3] font-extrabold'
      };
    case 'ADMIN_REJECTED':
    case 'ADMIN REJECTED':
      return {
        label: 'Admin Rejected',
        className: 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5] font-extrabold'
      };
    case 'PENDING_CLIENT_APPROVAL':
    case 'PENDING CLIENT APPROVAL':
    case 'PENDING_CLIENT':
      return {
        label: 'Pending Client Approval',
        className: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] font-extrabold'
      };
    case 'APPROVED':
    case 'CLIENT APPROVED':
    case 'CLIENT_APPROVED':
      return {
        label: 'Client Approved',
        className: 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0] font-black'
      };
    case 'CHANGES_REQUESTED':
    case 'CHANGES REQUESTED':
    case 'REVISIONS REQUIRED':
      return {
        label: 'Changes Requested',
        className: 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA] font-extrabold'
      };
    case 'DESIGNER_UPLOADED':
    case 'DESIGNER UPLOADED':
    default:
      return {
        label: 'Designer Uploaded',
        className: 'bg-[#F0F9FF] text-[#0284C7] border-[#E0F2FE] font-extrabold'
      };
  }
};

export default function DrawingList({
  drawings = [],
  selectedCategory = 'All',
  setSelectedCategory,
  searchQuery = '',
  setSearchQuery,
  projectFilter = 'All',
  setProjectFilter,
  statusFilter = 'All',
  setStatusFilter,
  onSelectDrawing,
  onUploadClick,
  onLockToggle,
  setViewReports
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [categoriesList, setCategoriesList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);

  useEffect(() => {
    getActiveDrawingCategories()
      .then(res => {
        let list = [];
        if (res?.categories && Array.isArray(res.categories)) list = res.categories;
        else if (Array.isArray(res)) list = res;
        if (list.length > 0) setCategoriesList(list);
      })
      .catch(err => console.warn(err));

    getProjects()
      .then(res => {
        let list = [];
        if (res?.projects && Array.isArray(res.projects)) list = res.projects;
        else if (Array.isArray(res)) list = res;
        if (list.length > 0) setProjectsList(list);
      })
      .catch(err => console.warn(err));
  }, []);

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
      d.rawStatus === statusFilter ||
      (statusFilter === 'DESIGNER_UPLOADED' && (d.status === 'DESIGNER_UPLOADED' || d.status === 'Designer Uploaded')) ||
      (statusFilter === 'PM_APPROVED' && (d.status === 'PM_APPROVED' || d.status === 'PM Approved')) ||
      (statusFilter === 'PM_REJECTED' && (d.status === 'PM_REJECTED' || d.status === 'PM Rejected')) ||
      (statusFilter === 'ADMIN_REJECTED' && (d.status === 'ADMIN_REJECTED' || d.status === 'Admin Rejected')) ||
      (statusFilter === 'PENDING_CLIENT_APPROVAL' && (d.status === 'PENDING_CLIENT_APPROVAL' || d.status === 'Pending Client Approval')) ||
      (statusFilter === 'APPROVED' && (d.status === 'APPROVED' || d.status === 'Approved')) ||
      (statusFilter === 'CHANGES_REQUESTED' && (d.status === 'CHANGES_REQUESTED' || d.status === 'Changes Requested' || d.status === 'Revisions Required')) ||
      (statusFilter === 'GFC_LOCKED' && (d.status === 'GFC_LOCKED' || d.status === 'GFC Locked' || Boolean(d.locked) || Boolean(d.isGFCLocked)));
    return matchesSearch && matchesCategory && matchesProject && matchesStatus;
  });

  // KPIs
  const totalCount = (drawings || []).length;
  const pendingCount = (drawings || []).filter(d => d?.status === 'Pending Client Approval' || d?.status === 'Pending Review' || d?.rawStatus === 'PENDING_CLIENT_APPROVAL').length;
  const approvedCount = (drawings || []).filter(d => d?.status === 'Approved' || d?.rawStatus === 'APPROVED').length;
  const gfcLockedCount = (drawings || []).filter(d => d?.status === 'GFC Locked' || d?.rawStatus === 'GFC_LOCKED' || d?.locked).length;

  // Dynamic Project Options list
  const uniqueProjects = Array.from(new Set((drawings || []).map(d => d?.project).filter(Boolean)));
  const projectOptions = uniqueProjects;

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
                if (typeof setSelectedCategory === 'function') setSelectedCategory(e.target.value);
                if (typeof setViewReports === 'function') setViewReports(false);
              }}
              className="appearance-none pl-4 pr-9 py-2.5 text-xs border border-slate-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 bg-white font-semibold cursor-pointer shadow-3xs"
            >
              <option value="All">All Categories</option>
              {categoriesList.length > 0 ? (
                categoriesList.map(c => {
                  const cName = c.name || c.categoryName || c.title || 'Category';
                  return <option key={c._id || c.id || cName} value={cName}>{cName}</option>;
                })
              ) : (
                <>
                  <option value="Concept Drawings">Concept Drawings</option>
                  <option value="Working Drawings">Working Drawings</option>
                  <option value="Process DWG">Process DWG</option>
                  <option value="GFC Drawings">GFC Drawings</option>
                </>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Project Dropdown */}
          <div className="relative">
            <select
              value={projectFilter}
              onChange={(e) => {
                if (typeof setProjectFilter === 'function') setProjectFilter(e.target.value);
              }}
              className="appearance-none pl-4 pr-9 py-2.5 text-xs border border-slate-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 bg-white font-semibold cursor-pointer shadow-3xs"
            >
              <option value="All">All Projects</option>
              {projectsList.length > 0 && projectsList.map(p => {
                const pName = p.projectName || p.name || p.title || 'Project';
                return <option key={p._id || p.id || pName} value={pName}>{pName}</option>;
              })}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                if (typeof setStatusFilter === 'function') setStatusFilter(e.target.value);
              }}
              className="appearance-none pl-4 pr-9 py-2.5 text-xs border border-slate-150 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 bg-white font-semibold cursor-pointer shadow-3xs"
            >
              <option value="All">All Statuses</option>
              <option value="DESIGNER_UPLOADED">Designer Uploaded</option>
              <option value="PM_APPROVED">PM Approved</option>
              <option value="PM_REJECTED">PM Rejected</option>
              <option value="ADMIN_REJECTED">Admin Rejected</option>
              <option value="PENDING_CLIENT_APPROVAL">Pending Client Approval</option>
              <option value="APPROVED">Client Approved</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="GFC_LOCKED">GFC Locked</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Toggle View Buttons */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-3xs">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              title="Table List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'cards' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. FULL-WIDTH DRAWINGS TABLE / CARDS GRID */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {filteredDrawings.map((d, idx) => (
            <div
              key={d._id ? `${d._id}-${idx}` : `${d.id || d.drawingNumber || 'dwg'}-${idx}`}
              className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              onClick={() => onSelectDrawing(d)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <File className="w-5 h-5 text-slate-550" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{d.name}</h4>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider font-mono">
                      {d.id} • {d.fileSize}
                    </span>
                  </div>
                </div>
                {d.locked && (
                  <span className="text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded-sm">
                    GFC LOCKED
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">Project Link</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">{d.project}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">Category</span>
                  <span className="font-semibold text-indigo-650">{d.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">Status</span>
                  {(() => {
                    const info = getDrawingStatusBadge(d.status, Boolean(d.locked || d.isGFCLocked));
                    return (
                      <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-wider rounded-full border inline-block ${info.className}`}>
                        {info.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[9px] flex items-center justify-center border border-slate-200">
                    {d.uploadedBy ? d.uploadedBy.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-600 font-semibold block">{d.uploadedBy}</span>
                    <span className="text-[8px] text-slate-400 block font-normal">{d.lastUpdated}</span>
                  </div>
                </div>

                <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectDrawing(d)}
                    className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center transition-all shadow-3xs"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onLockToggle(d.id)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-3xs ${d.locked
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-50'
                      }`}
                    title={d.locked ? "Unlock edits" : "Lock GFC Version"}
                  >
                    {d.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredDrawings.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white border border-slate-100 rounded-3xl">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-xs font-medium text-slate-800">No drawings match your search criteria.</h4>
            </div>
          )}
        </div>
      ) : (
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
                          {d.name || d.drawingName || d.title || 'Architectural Blueprint'}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-extrabold block uppercase tracking-wider">
                          SIZE: {d.fileSize || '3.2 MB'} | ACCESS: {(d.accessLevel || 'ADMIN & PM ONLY').toUpperCase()}
                        </span>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-5 font-extrabold text-indigo-600 align-middle text-xs">
                      {d.category || d.categoryName || 'Working Drawings'}
                    </td>

                    {/* UPLOADED BY */}
                    <td className="px-6 py-5 align-middle text-slate-700">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block text-xs">
                          {typeof d.uploadedBy === 'object' ? (d.uploadedBy?.name || 'Staff') : (d.uploadedBy || d.createdBy?.name || 'Bhakti Kadam')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Uploaded {d.lastUpdated || (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Recently')}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5 align-middle">
                      {(() => {
                        const info = getDrawingStatusBadge(d.status, Boolean(d.locked || d.isGFCLocked));
                        return (
                          <span className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-full border inline-block ${info.className}`}>
                            {info.label}
                          </span>
                        );
                      })()}
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
                          onClick={() => onSelectDrawing(d)}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-indigo-600 flex items-center justify-center transition-all shadow-3xs"
                          title="Edit Drawing Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onLockToggle(d.id)}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-3xs ${d.locked
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-50'
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
        </div>
      )}

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
              className="appearance-none pl-3 pr-7 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 cursor-pointer focus:outline-none pagination-select"
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
  );
}
