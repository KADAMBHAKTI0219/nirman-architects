import React, { useState, useEffect } from 'react';
import {
  Search, File, Lock, Unlock, Eye, Trash2, Database, BarChart2, Plus, Folder, ShieldCheck,
  LayoutGrid, LayoutList, Calendar, User, Clock
} from 'lucide-react';
import { getProjects } from '../../../service/project';
import DocumentAccessLogModal from './DocumentAccessLogModal';
import Pagination from '../../common/Pagination';

export default function DocumentList({
  documents,
  projectFolders = [],
  fetchBackendFolders,
  selectedProject,
  setSelectedProject,
  selectedFolder,
  setSelectedFolder,
  searchQuery,
  setSearchQuery,
  typeFilter,
  setTypeFilter,
  onSelectDocument,
  onUploadClick,
  onLockToggle,
  onDeleteFile,
  setViewReports
}) {
  const [liveProjects, setLiveProjects] = useState([]);
  const [auditModalDoc, setAuditModalDoc] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    getProjects()
      .then(res => {
        let list = [];
        if (res?.projects && Array.isArray(res.projects)) list = res.projects;
        else if (Array.isArray(res)) list = res;
        setLiveProjects(list);
      })
      .catch(err => console.warn(err));
  }, []);

  // Dynamic Projects List from backend API + document references
  const apiProjects = liveProjects.map(p => p.name || p.projectName || p.title).filter(Boolean);
  const docProjects = (documents || []).map(d => d.project).filter(Boolean);
  const combinedProjects = Array.from(new Set([...apiProjects, ...docProjects]));
  const projectsList = ['ALL PROJECTS', ...combinedProjects];

  // Dynamic Folders derived strictly from backend projectFolders or document categories
  const folderItems = projectFolders.length > 0
    ? projectFolders
    : Array.from(new Set((documents || []).map(d => typeof d.folderId === 'object' ? d.folderId?.folderName : (d.folder || d.category)).filter(Boolean)))
      .map(fName => ({ _id: fName, folderName: fName, createdBy: { name: 'Staff' } }));

  const foldersList = folderItems.map(fObj => typeof fObj === 'string' ? fObj : (fObj.folderName || fObj.name || 'Folder'));

  // Filters logic
  const filteredDocuments = documents.filter(doc => {
    const docTitle = doc.documentName || doc.fileName || doc.name || '';
    const matchesSearch = docTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.id || doc._id || '').toLowerCase().includes(searchQuery.toLowerCase());
    const selProjNorm = (selectedProject || 'ALL PROJECTS').trim().toUpperCase();
    const docProjNorm = (doc.project || '').trim().toUpperCase();
    const matchesProject = selProjNorm === 'ALL PROJECTS' || selProjNorm === 'ALL' || docProjNorm === selProjNorm;

    const docFolderName = typeof doc.folderId === 'object' ? doc.folderId?.folderName : (doc.folder || doc.category);
    const matchesFolder = selectedFolder === 'All' || doc.folder === selectedFolder || doc.category === selectedFolder || docFolderName === selectedFolder;
    const matchesType = typeFilter === 'All' || doc.type === typeFilter || doc.fileType === typeFilter;
    return matchesSearch && matchesProject && matchesFolder && matchesType;
  });

  // KPIs
  const totalStorageUsed = documents.reduce((acc, doc) => acc + (parseFloat(doc.fileSize) || 0), 0);
  const confidentialCount = documents.filter(doc => doc.confidential).length;
  const lockedCount = documents.filter(doc => doc.locked).length;

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">

      {/* 0. TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Documents Vault & Archiving
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Store, organize, version control, and secure project documents and client agreements
          </p>
        </div>
        <button
          onClick={onUploadClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary  text-black font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          Upload Document
        </button>
      </div>

      {/* 1. Project Selector Tabs */}
      <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none">
        {projectsList.map(proj => (
          <button
            key={proj}
            onClick={() => {
              setSelectedProject(proj);
              setViewReports(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 border ${selectedProject === proj
              ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
              : 'bg-white border-slate-205 text-slate-550 hover:bg-slate-50'
              }`}
          >
            {proj}
          </button>
        ))}
      </div>

      {/* 2. KPI Cards row (Full Width) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Vault Files</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-black text-slate-800">{documents.length} Files</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Confidential / Locked</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-black text-amber-600">{confidentialCount} Internal</span>
            <Lock className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Client Shared Handoffs</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-black text-emerald-600">{documents.filter(d => d.visibleToClient).length} Shared</span>
            <Unlock className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* 2.5 PROJECT DOCUMENT FOLDERS */}
      {folderItems.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-3xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-brand-accent">
                <Folder className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Project Document Folders
                </h3>
                <span className="text-[10px] text-slate-400 font-bold block">
                  Active folder directories for selected project
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-brand-primary text-slate-900 rounded-lg border border-brand-secondary/40">
              {folderItems.length} Folders
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
            {folderItems.map(fObj => {
              const folderName = fObj.folderName || fObj.name || 'Folder';
              const docCount = documents.filter(d => {
                const dFolder = typeof d.folderId === 'object' ? d.folderId?.folderName : (d.folder || d.category);
                return dFolder === folderName || d.category === folderName;
              }).length;
              const isSelected = selectedFolder === folderName;
              const creatorName = fObj.createdBy?.name || 'Staff';

              return (
                <div
                  key={fObj._id || folderName}
                  onClick={() => setSelectedFolder(isSelected ? 'All' : folderName)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${isSelected
                    ? 'bg-brand-soft border-brand-secondary ring-2 ring-brand-secondary/40 shadow-xs'
                    : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-100/60 hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-brand-secondary text-slate-900 font-bold' : 'bg-white text-slate-600 border border-slate-200'}`}>
                        <File className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black text-slate-800 line-clamp-1">{folderName}</span>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                    <span>Created: {creatorName}</span>
                    <span className="font-extrabold text-slate-700">{docCount} Files</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Search, Filters & Action Buttons Row (Full Width) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search file catalog by title or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Folders Dropdown */}
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
          >
            <option value="All">All Folders</option>
            {foldersList.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold"
          >
            <option value="All">All File Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="DWG">DWG Schematics</option>
            <option value="DOCX">DOCX Documents</option>
            <option value="XLSX">XLSX Spreadsheets</option>
            <option value="JPG">JPG / Images</option>
          </select>

          <button
            onClick={() => setViewReports(true)}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-3xs cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
            <span>REPORTS</span>
          </button>

          {/* Toggle View Buttons */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Documents Grid/Table Container */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc, idx) => (
            <div 
              key={doc._id ? `${doc._id}-${idx}` : `${doc.id}-${idx}`}
              className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              onClick={() => onSelectDocument(doc)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
                    <File className="w-5 h-5 text-slate-550" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{doc.name}</h4>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                      {doc.fileSize} • {doc.type} • v{doc.version}
                    </span>
                  </div>
                </div>
                {doc.confidential && (
                  <span className="text-[7px] font-black uppercase tracking-widest bg-rose-50 text-rose-605 border border-rose-100 px-1.5 py-0.5 rounded-sm">
                    Confidential
                  </span>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">Project Link</span>
                  <span className="font-semibold text-slate-800">{doc.project}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">Folder</span>
                  <span className="font-semibold text-slate-650">{doc.folder}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">Access</span>
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    doc.accessLevel === 'Admin Only' ? 'bg-rose-50 text-rose-650 border-rose-100' :
                    doc.accessLevel.includes('Client') ? 'bg-brand-soft text-slate-800 border-brand-primary/50' :
                    'bg-slate-50 text-slate-550 border-slate-105'
                  }`}>{doc.accessLevel}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100/60">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 font-bold text-[9px] flex items-center justify-center">
                    {doc.uploadedBy ? doc.uploadedBy.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-600 font-semibold block">{doc.uploadedBy}</span>
                    <span className="text-[8px] text-slate-400 block font-normal">{doc.uploadedDate}</span>
                  </div>
                </div>

                <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setAuditModalDoc(doc);
                      setIsAuditOpen(true);
                    }}
                    className="p-1.5 bg-brand-soft hover:bg-brand-primary/60 text-slate-800 rounded-xl transition-all shadow-3xs cursor-pointer"
                    title="Audit Logs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-3xs cursor-pointer"
                    title="Inspect"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onLockToggle(doc.id)}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${doc.locked
                      ? 'bg-brand-soft border-brand-secondary text-slate-800'
                      : 'bg-white border-slate-205 text-slate-405 hover:bg-slate-50'
                    }`}
                    title={doc.locked ? "Unlock" : "Lock"}
                  >
                    {doc.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDeleteFile(doc._id || doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 border border-slate-205 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredDocuments.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-3xl">
              <File className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-xs font-medium text-slate-800">No documents found in folder.</h4>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-100/90 rounded-3xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-105 bg-slate-50/50">
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[200px] pl-6">File Details</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36 text-center">Project Reference</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-28 text-center">Folder</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36 text-center">Uploaded By</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24 text-center">Access Level</th>
                  <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDocuments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((doc, idx) => (
                  <tr key={doc._id ? `${doc._id}-${idx}` : `${doc.id}-${idx}`} className="hover:bg-slate-50/40">
                    <td className="px-4 py-4 align-middle pl-6">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 block text-xs leading-normal hover:text-indigo-650 transition-colors cursor-pointer" onClick={() => onSelectDocument(doc)}>{doc.name}</span>
                            {doc.confidential && (
                              <span className="text-[7px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-sm">
                                Confidential
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                            Size: {doc.fileSize} | Version: {doc.version} | Type: {doc.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-700 font-bold align-middle text-center">{doc.project}</td>
                    <td className="px-4 py-4 text-slate-500 font-semibold align-middle text-center">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-md">
                        {doc.folder}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-middle text-slate-550 text-center">
                      <div className="flex flex-col items-center space-y-0.5">
                        <span className="font-bold text-slate-700 block">{doc.uploadedBy}</span>
                        <span className="text-[9px] text-slate-400 block font-semibold">Uploaded {doc.uploadedDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-middle text-center">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${doc.accessLevel === 'Admin Only' ? 'bg-rose-50 text-rose-655 border-rose-100' :
                        doc.accessLevel.includes('Client') ? 'bg-brand-soft text-slate-805 border-brand-primary/50' :
                          'bg-slate-50 text-slate-550 border-slate-105'
                        }`}>{doc.accessLevel}</span>
                    </td>
                    <td className="px-4 py-4 text-center align-middle">
                      <div className="flex justify-center gap-2 items-center">
                        <button
                          onClick={() => {
                            setAuditModalDoc(doc);
                            setIsAuditOpen(true);
                          }}
                          className="p-1.5 bg-brand-soft hover:bg-brand-primary/60 text-slate-800 rounded-xl transition-all shadow-3xs cursor-pointer"
                          title="View DocumentAccessLog Audit History"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectDocument(doc)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl transition-all shadow-3xs cursor-pointer"
                          title="Inspect File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onLockToggle(doc.id)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${doc.locked
                            ? 'bg-brand-soft border-brand-secondary text-slate-800 shadow-3xs'
                            : 'bg-white border-slate-205 text-slate-405 hover:text-slate-600 hover:bg-slate-50 shadow-3xs'
                            }`}
                          title={doc.locked ? "Unlock edits" : "Lock Version"}
                        >
                          {doc.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onDeleteFile(doc._id || doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 border border-slate-205 hover:bg-rose-50 hover:border-rose-100 rounded-xl shadow-3xs transition-all cursor-pointer"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDocuments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                      No documents found in folder.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Integrated Pagination Bar */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredDocuments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(size) => {
              setItemsPerPage(size);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <DocumentAccessLogModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        doc={auditModalDoc}
      />
    </div>
  );
}
