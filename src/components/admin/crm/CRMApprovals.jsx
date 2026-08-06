import React, { useState } from 'react';
import { 
  Check, X, ShieldAlert, AlertCircle, FileText, Download, Search, Plus, 
  Eye, CheckCircle2, Clock, XCircle, Filter, RefreshCw, Building, User, Calendar
} from 'lucide-react';

export default function CRMApprovals({
  approvalsList = [],
  onApproveRelease,
  onRejectRelease,
  onAddApproval
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [inspectApproval, setInspectApproval] = useState(null);

  // New Approval Request Form
  const [formData, setFormData] = useState({
    title: '',
    version: 'V1.0',
    type: 'PDF',
    clientName: 'Wayne Enterprises',
    projectName: 'Oceanic Luxury Villas',
    remarks: 'Awaiting client technical review.'
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newApproval = {
      id: Date.now(),
      title: formData.title.trim(),
      version: formData.version || 'V1.0',
      type: formData.type || 'PDF',
      clientName: formData.clientName,
      projectName: formData.projectName,
      date: new Date().toISOString().split('T')[0],
      remarks: formData.remarks.trim() || 'Awaiting client sign-off.',
      status: 'Awaiting Response'
    };

    if (onAddApproval) {
      onAddApproval(newApproval);
    }
    setShowRequestModal(false);
    setFormData({
      title: '',
      version: 'V1.0',
      type: 'PDF',
      clientName: 'Wayne Enterprises',
      projectName: 'Oceanic Luxury Villas',
      remarks: 'Awaiting client technical review.'
    });
    alert("Client approval release request issued successfully!");
  };

  // Filtered List
  const filteredApprovals = approvalsList.filter(app => {
    const titleStr = (app.title || '').toLowerCase();
    const clientStr = (app.clientName || '').toLowerCase();
    const projStr = (app.projectName || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = titleStr.includes(q) || clientStr.includes(q) || projStr.includes(q);
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalCount = approvalsList.length;
  const approvedCount = approvalsList.filter(a => a.status === 'Approved').length;
  const pendingCount = approvalsList.filter(a => a.status === 'Awaiting Response').length;
  const rejectedCount = approvalsList.filter(a => a.status === 'Rejected').length;

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 w-full">
      
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Client Approvals Ledger</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Track drawing releases, technical specifications, and client digital sign-offs
          </p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-brand-dark" />
          Request Client Approval
        </button>
      </div>

      {/* 2. Key Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Requests</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">Awaiting Response</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Approved Releases</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-600">{approvedCount}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">Revisions / Declined</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-rose-600">{rejectedCount}</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-3 items-center justify-between w-full">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by drawing title, client, or project..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium bg-slate-50/50"
          />
        </div>

        <div className="flex gap-2.5 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Awaiting Response">Awaiting Response</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected / Declined</option>
          </select>
        </div>
      </div>

      {/* 4. Approvals Ledger Table (STRICT ZERO HORIZONTAL SCROLL - 5 ESSENTIAL COLUMNS) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <th className="px-5 py-4">Document / Drawing</th>
                <th className="px-5 py-4">Client Name</th>
                <th className="px-5 py-4">Project Link</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredApprovals.length > 0 ? (
                filteredApprovals.map(app => {
                  const isApproved = app.status === 'Approved';
                  const isRejected = app.status === 'Rejected';
                  const isPending = app.status === 'Awaiting Response';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-all">
                      {/* Document / Drawing */}
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <strong className="text-slate-900 font-extrabold text-xs block truncate">{app.title}</strong>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              Version: {app.version} &bull; Type: {app.type}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client Name */}
                      <td className="px-5 py-4 font-bold text-slate-800 align-middle whitespace-nowrap">
                        {app.clientName}
                      </td>

                      {/* Project Link */}
                      <td className="px-5 py-4 text-slate-600 font-semibold align-middle whitespace-nowrap">
                        {app.projectName}
                      </td>

                      {/* Status (SINGLE LINE BADGE - NO WRAP) */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-3xs ${
                          isApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isRejected ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right align-middle whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectApproval(app)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all border border-slate-200"
                            title="Inspect Release Details & Remarks"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => alert(`Downloading release file: ${app.title}`)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200"
                            title="Download Release File"
                          >
                            <Download className="w-4 h-4 text-slate-600" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => onRejectRelease(app.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-200"
                                title="Decline Release"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onApproveRelease(app.id)}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all border border-emerald-200"
                                title="Confirm Approval"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No approval records match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: REQUEST CLIENT APPROVAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Request Client Approval</h3>
                <p className="text-xs text-slate-500">Issue new drawing/specification release for client sign-off</p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Document / Drawing Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Glass Facade Structural Calculation Release"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Version</label>
                  <input
                    type="text"
                    placeholder="V1.0"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Format Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-bold text-slate-800"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DWG">DWG Drawing</option>
                    <option value="BIM/RVT">BIM 3D Model</option>
                    <option value="XLSX">BOQ / Specs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Client Account *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Link *</label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Initial Release Remarks</label>
                <textarea
                  rows="2"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary text-brand-dark font-extrabold rounded-xl shadow-xs"
                >
                  Issue Release Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: INSPECT APPROVAL DETAILS */}
      {inspectApproval && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{inspectApproval.title}</h3>
                  <span className="text-xs text-slate-500 font-mono">Version {inspectApproval.version} &bull; {inspectApproval.type}</span>
                </div>
              </div>
              <button onClick={() => setInspectApproval(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Client Name</span>
                  <span className="font-extrabold text-slate-900">{inspectApproval.clientName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Project Name</span>
                  <span className="font-extrabold text-slate-900">{inspectApproval.projectName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Release Date</span>
                  <span className="font-mono text-slate-700 font-bold">{inspectApproval.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Current Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${
                    inspectApproval.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    inspectApproval.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {inspectApproval.status}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-black uppercase block">Client Feedback Remarks</span>
                <p className="mt-1 text-slate-800 italic bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-semibold">
                  "{inspectApproval.remarks || 'No remarks available.'}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => alert(`Downloading document: ${inspectApproval.title}`)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-slate-600" /> Download Document
              </button>

              <div className="flex gap-2">
                {inspectApproval.status === 'Awaiting Response' && (
                  <>
                    <button
                      onClick={() => { onRejectRelease(inspectApproval.id); setInspectApproval(null); }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-rose-200"
                    >
                      <X className="w-4 h-4" /> Decline
                    </button>
                    <button
                      onClick={() => { onApproveRelease(inspectApproval.id); setInspectApproval(null); }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
