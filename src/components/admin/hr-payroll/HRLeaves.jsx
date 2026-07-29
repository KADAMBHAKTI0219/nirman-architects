import React, { useState } from 'react';
import { Check, X, Calendar, FileClock, ShieldAlert, AlertCircle, PlusCircle, Search, Edit3 } from 'lucide-react';
import Card from '../../common/Card';

export default function HRLeaves({
  leaveRequests,
  companyLeaves = [],
  usersList = [],
  leaveTypes = [],
  holidaysList,
  onApproveLeave,
  onRejectLeave,
  onAdjustBalance
}) {
  const [subView, setSubView] = useState('inbox'); // inbox, registry
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [registrySearch, setRegistrySearch] = useState('');
  
  const [adjustForm, setAdjustForm] = useState({
    targetUserId: '',
    leaveTypeId: '',
    newValue: 15,
    reason: ''
  });

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!adjustForm.targetUserId || !adjustForm.leaveTypeId || !adjustForm.reason) {
      alert("Please fill out all balance adjustment fields.");
      return;
    }
    onAdjustBalance({
      targetUserId: adjustForm.targetUserId,
      leaveTypeId: adjustForm.leaveTypeId,
      newValue: parseInt(adjustForm.newValue) || 0,
      reason: adjustForm.reason
    });
    setIsAdjustModalOpen(false);
    // Reset
    setAdjustForm({
      targetUserId: '',
      leaveTypeId: '',
      newValue: 15,
      reason: ''
    });
  };

  const filteredRegistry = companyLeaves.filter(req => {
    return req.name.toLowerCase().includes(registrySearch.toLowerCase()) ||
           req.type.toLowerCase().includes(registrySearch.toLowerCase()) ||
           req.reason.toLowerCase().includes(registrySearch.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Controls: Views toggle & Adjust balance action */}
      <div className="flex justify-between items-center bg-slate-50/40 p-4 rounded-2xl border border-slate-100 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubView('inbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
              subView === 'inbox'
                ? 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Pending Inbox ({leaveRequests.filter(r=>r.status==='Pending').length})
          </button>
          <button
            onClick={() => setSubView('registry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
              subView === 'registry'
                ? 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Company Registry ({companyLeaves.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {subView === 'inbox' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave Requests inbox (2/3 width) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-50 pb-2 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Leave Requests Inbox</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Approve or reject active employee requests</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded font-black uppercase">
                {leaveRequests.filter(r=>r.status==='Pending').length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {leaveRequests.map(req => (
                <div 
                  key={req.id}
                  className="p-3.5 border border-slate-150 rounded-2xl flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700">
                        {req.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <strong className="text-slate-805 block text-xs">{req.name}</strong>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase">{req.department} &bull; {req.type} Leave</span>
                      </div>
                    </div>
                    <p className="text-slate-550 text-xs italic font-semibold leading-normal">"Reason: {req.reason}"</p>
                    <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                      Duration: {req.startDate} to {req.endDate} ({req.days} days)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {req.status === 'Pending' ? (
                      <>
                        <button 
                          onClick={() => onRejectLeave(req.id)}
                          className="p-2 border border-slate-205 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all shadow-3xs"
                          title="Reject Request"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onApproveLeave(req.id)}
                          className="px-3.5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                      </>
                    ) : (
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded border ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>{req.status}</span>
                    )}
                  </div>
                </div>
              ))}

              {leaveRequests.length === 0 && (
                <div className="py-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                  <AlertCircle className="w-6 h-6 text-slate-350 mx-auto mb-2" />
                  No leave requests pending.
                </div>
              )}
            </div>
          </div>

          {/* Holiday Overlays / List (1/3 width) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-50 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Holiday Calendar</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Upcoming gazetted corporate holidays</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {holidaysList.map(hol => (
                <div key={hol.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-[8px] text-[#2484C6] font-bold uppercase">
                    <span>Gazetted Holiday</span>
                    <span>{hol.date}</span>
                  </div>
                  <strong className="font-black text-slate-755 block leading-normal">{hol.name}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Company registry log database */
        <Card title="Company-wide Leave Registry" subtitle="Review historical records, reason, and approval outcomes of all employee logs">
          <div className="space-y-4">
            {/* Search filter */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
              <input
                type="text"
                placeholder="Search registry by name or reason..."
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805"
              />
            </div>

            {/* Registry table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-450 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Dates Duration</th>
                    <th className="py-3 px-4">Reason Statement</th>
                    <th className="py-3 px-4 text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistry.map(req => (
                    <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">{req.name}</td>
                      <td className="py-3 px-4 text-slate-400 font-semibold uppercase text-[9px]">{req.department}</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{req.type}</td>
                      <td className="py-3 px-4 text-slate-600 font-bold">
                        {req.startDate} - {req.endDate} ({req.days} Days)
                      </td>
                      <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">"{req.reason}"</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          req.status === 'Cancelled' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{req.status}</span>
                      </td>
                    </tr>
                  ))}

                  {filteredRegistry.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                        No registry logs match the search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Adjust quota balance modal dialog */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Adjust Leave Quota</h4>
                <p className="text-[10px] text-slate-400 font-bold block mt-1">Directly adjust an employee's leave balance ledger</p>
              </div>
              <button 
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm p-1.5 hover:bg-slate-50 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs font-bold text-slate-550">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Select Employee</label>
                <select
                  required
                  value={adjustForm.targetUserId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, targetUserId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805 font-semibold"
                >
                  <option value="">Choose Staff Account</option>
                  {usersList.map(u => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name || u.firstName || u.email} ({typeof u.role === 'object' ? (u.role?.roleName || u.role?.roleCode || u.role?.name || 'Employee') : (u.role || 'Employee')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Leave Type</label>
                  <select
                    required
                    value={adjustForm.leaveTypeId}
                    onChange={(e) => setAdjustForm({ ...adjustForm, leaveTypeId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805 font-semibold"
                  >
                    <option value="">Select Category</option>
                    {leaveTypes.map(lt => (
                      <option key={lt._id} value={lt._id}>
                        {lt.name} ({lt.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">New Quota (Days)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="90"
                    value={adjustForm.newValue}
                    onChange={(e) => setAdjustForm({ ...adjustForm, newValue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Reason for Adjustment</label>
                <textarea 
                  required
                  placeholder="e.g. Compensatory credit for site weekend shifts or tenure adjustments..."
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  rows="3"
                  className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805 resize-none leading-normal font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border border-slate-205 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider text-[10px] font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl shadow-xs uppercase tracking-wider text-[10px] font-black"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
