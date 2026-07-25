import React from 'react';
import { 
  Search, File, Lock, Unlock, Eye, Trash2, Database, BarChart2, Plus
} from 'lucide-react';

export default function DocumentList({
  documents,
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
  
  // Projects List
  const projectsList = ['All Projects', 'Central Office Tower', 'Oceanic Luxury Villas', 'Smart City Mall'];

  // Folders List
  const foldersList = [
    'Drawings', 'Reports', 'Client Files', 'Approvals', 
    'Site Photos', 'Contracts', 'Meeting Notes', 'Financial Files'
  ];

  // Filters logic
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = selectedProject === 'All Projects' || doc.project === selectedProject;
    const matchesFolder = selectedFolder === 'All' || doc.folder === selectedFolder;
    const matchesType = typeFilter === 'All' || doc.type === typeFilter;
    return matchesSearch && matchesProject && matchesFolder && matchesType;
  });

  // KPIs
  const totalStorageUsed = documents.reduce((acc, doc) => acc + parseFloat(doc.fileSize), 0);
  const confidentialCount = documents.filter(doc => doc.confidential).length;
  const lockedCount = documents.filter(doc => doc.locked).length;

  return (
    <div className="space-y-6">
      
      {/* 1. Project Selector Tabs */}
      <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-none">
        {projectsList.map(proj => (
          <button
            key={proj}
            onClick={() => {
              setSelectedProject(proj);
              setViewReports(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex-shrink-0 border ${
              selectedProject === proj
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
            <span className="text-lg font-black text-indigo-705">{confidentialCount} / {lockedCount} Files</span>
            <Lock className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100/90 shadow-3xs flex flex-col justify-between h-20">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Space Valuation Capacity</span>
          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-black text-slate-755">{totalStorageUsed.toFixed(1)} MB</span>
            <span className="text-[10px] text-slate-400 font-semibold">100 GB Cap</span>
          </div>
        </div>
      </div>

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

          {/* File Format Dropdown */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-705 bg-white font-semibold"
          >
            <option value="All">All File Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="DWG">DWG Drawings</option>
            <option value="JPEG">JPEG Images</option>
            <option value="PNG">PNG Images</option>
            <option value="DOCX">DOCX Documents</option>
            <option value="XLSX">XLSX Sheets</option>
            <option value="ZIP">ZIP Archives</option>
          </select>

          {/* Action buttons next to filters */}
          <button
            onClick={() => setViewReports(true)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase transition-all shadow-3xs flex items-center gap-1.5"
            title="Storage Reports"
          >
            <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
            Reports
          </button>

          <button
            onClick={onUploadClick}
            className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload
          </button>
        </div>
      </div>

      {/* 4. Document Table Grid (Full Width) */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left table-auto">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">File Details</th>
                <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36">Project Reference</th>
                <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-28">Folder</th>
                <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36">Uploaded By</th>
                <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Access Level</th>
                <th className="px-4 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDocuments.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/40">
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-2.5">
                      <File className="w-4 h-4 text-slate-450 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-805 block text-xs leading-normal">{doc.name}</span>
                          {doc.confidential && (
                            <span className="text-[7px] font-black uppercase tracking-widest bg-rose-50 text-rose-605 border border-rose-100 px-1 rounded-sm">
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
                  <td className="px-4 py-4 text-slate-705 font-bold align-middle">{doc.project}</td>
                  <td className="px-4 py-4 text-slate-500 font-semibold align-middle">{doc.folder}</td>
                  <td className="px-4 py-4 align-middle text-slate-550">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700 block">{doc.uploadedBy}</span>
                      <span className="text-[9px] text-slate-400 block font-semibold">Uploaded {doc.uploadedDate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      doc.accessLevel === 'Admin Only' ? 'bg-rose-50 text-rose-605 border-rose-100' :
                      doc.accessLevel.includes('Client') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      'bg-slate-50 text-slate-550 border-slate-105'
                    }`}>{doc.accessLevel}</span>
                  </td>
                  <td className="px-4 py-4 text-right align-middle">
                    <div className="flex justify-end gap-2 items-center">
                      <button
                        onClick={() => onSelectDocument(doc)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl transition-all shadow-3xs"
                        title="Inspect File"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onLockToggle(doc.id)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          doc.locked 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-650 shadow-3xs' 
                            : 'bg-white border-slate-205 text-slate-405 hover:text-slate-600 hover:bg-slate-50 shadow-3xs'
                        }`}
                        title={doc.locked ? "Unlock edits" : "Lock Version"}
                      >
                        {doc.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button 
                        onClick={() => onDeleteFile(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 border border-slate-205 hover:bg-rose-50 hover:border-rose-100 rounded-xl shadow-3xs transition-all"
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
      </div>

    </div>
  );
}
