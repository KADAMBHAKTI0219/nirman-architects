import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, FileClock, AlertCircle, Trash2, CheckCircle2, Check, HelpCircle } from 'lucide-react';
import Card from './Card';
import { 
  getMyLeaves, 
  applyLeave, 
  cancelLeave,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getCompanyLeaves,
  parseIndexedObjectToArray
} from '../../service/hrm/leave';
import * as mockApi from '../../service/mockApi';

export default function LeavesPortal({ role = "Employee", hideHeader = false }) {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [userRole, setUserRole] = useState("Employee");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const code = user.roleCode || user.role || 'Employee';
      setUserRole(code);
    }
  }, []);

  const isManager = userRole === "SUPER_ADMIN" || userRole === "HR" || role === "ProjectManager" || role === "Admin" || role === "HR";
  const [portalTab, setPortalTab] = useState(isManager ? 'team-approvals' : 'personal-leaves');

  useEffect(() => {
    if (isManager) {
      setPortalTab('team-approvals');
    } else {
      setPortalTab('personal-leaves');
    }
  }, [isManager]);

  const [formData, setFormData] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  const fetchMyLeavesData = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await getMyLeaves(new Date().getFullYear());
      } catch (e) {
        res = await mockApi.getMyLeaves(new Date().getFullYear());
      }

      if (!res || (!res.balances && !res.requests && (!res.data || (!res.data.balances && !res.data.requests)))) {
        res = await mockApi.getMyLeaves(new Date().getFullYear());
      }

      if (res) {
        const rawRequests = parseIndexedObjectToArray(res.requests || res.data?.requests || res);
        const mappedRequests = rawRequests.map(req => {
          const fromDateStr = req.fromDate ? new Date(req.fromDate).toLocaleDateString() : '';
          const toDateStr = req.toDate ? new Date(req.toDate).toLocaleDateString() : '';
          const diffTime = req.toDate && req.fromDate ? Math.abs(new Date(req.toDate) - new Date(req.fromDate)) : 0;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          return {
            id: req._id || req.id,
            leaveTypeName: req.leaveTypeId?.name || req.leaveType?.name || req.leaveTypeName || req.code || "Casual Leave",
            fromDate: fromDateStr,
            toDate: toDateStr,
            days: req.totalDays || diffDays || 1,
            reason: req.reason || '',
            status: req.status ? (req.status.charAt(0) + req.status.slice(1).toLowerCase()) : 'Pending'
          };
        });
        setRequests(mappedRequests);
        // Fetch leave balance categories
        let rawBalances = parseIndexedObjectToArray(res.balances || res.data?.balances);
        if (!rawBalances || rawBalances.length === 0) {
          rawBalances = [
            { leaveTypeId: 'leave-casual', leaveTypeName: 'Casual Leave', code: 'CASUAL', allocatedDays: 12, colorTag: '#10B981' },
            { leaveTypeId: 'leave-sick', leaveTypeName: 'Sick Leave', code: 'SICK', allocatedDays: 8, colorTag: '#EF4444' },
            { leaveTypeId: 'leave-unpaid', leaveTypeName: 'Unpaid Leave', code: 'UNPAID', allocatedDays: 30, colorTag: '#6366F1' }
          ];
        }

        // Compute usedDays & remainingDays directly from approved requests
        const computedBalances = rawBalances.map(bal => {
          const typeName = bal.leaveTypeName || bal.name || 'Leave';
          const usedDays = mappedRequests
            .filter(r => r.status && r.status.toLowerCase() === 'approved' && 
              (r.leaveTypeName.toLowerCase().includes(typeName.toLowerCase()) || 
                typeName.toLowerCase().includes(r.leaveTypeName.toLowerCase()) ||
                (bal.code && r.leaveTypeName.toUpperCase().includes(bal.code.toUpperCase()))
              )
            )
            .reduce((sum, r) => sum + (Number(r.days) || 1), 0);

          const allocated = bal.allocatedDays !== undefined ? Number(bal.allocatedDays) : (bal.defaultQuota !== undefined ? Number(bal.defaultQuota) : 12);
          const remaining = Math.max(0, allocated - usedDays);

          return {
            ...bal,
            leaveTypeName: typeName,
            allocatedDays: allocated,
            usedDays,
            remainingDays: remaining
          };
        });

        setBalances(computedBalances);
      }
    } catch (err) {
      console.error("Failed to fetch personal leave details:", err);
      showToast("Error retrieving your leave balances.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamPendingRequests = async () => {
    try {
      setLoadingTeam(true);
      let res;
      // Admin sees pending queue; HR sees company wide pending
      if (userRole === 'SUPER_ADMIN') {
        res = await getPendingLeaveRequests();
      } else {
        res = await getCompanyLeaves({ status: 'PENDING' });
      }

      const rawRequests = parseIndexedObjectToArray(res);
      if (rawRequests) {
        const mapped = rawRequests.map(req => {
          const fromDateStr = req.fromDate ? new Date(req.fromDate).toLocaleDateString() : '';
          const toDateStr = req.toDate ? new Date(req.toDate).toLocaleDateString() : '';
          const empName = req.userId?.name || req.user?.name || req.employeeName || 'Staff Member';
          const empRole = req.userId?.designation || req.user?.roleCode || 'Employee';
          return {
            id: req._id || req.id,
            name: empName,
            role: empRole,
            type: req.leaveTypeId?.name || req.leaveType?.name || req.leaveTypeName || "Leave",
            dates: `${fromDateStr} - ${toDateStr}`,
            reason: req.reason || "N/A",
            status: req.status ? (req.status.charAt(0) + req.status.slice(1).toLowerCase()) : "Pending"
          };
        });
        setTeamRequests(mapped);
      }
    } catch (err) {
      console.error("Failed to load team requests:", err);
      showToast("Could not load pending leaves queue.", "error");
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchMyLeavesData();
    if (isManager) {
      fetchTeamPendingRequests();
    }
  }, [userRole, isManager]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    if (!formData.leaveTypeId || !formData.fromDate || !formData.toDate || !formData.reason) {
      setApplyError('Please fill out all leave application fields.');
      return;
    }

    try {
      let res;
      try {
        res = await applyLeave(formData);
      } catch (e) {
        res = await mockApi.applyLeave(formData);
      }
      if (res.success || res._id) {
        showToast(res.message || 'Leave applied successfully!');
        setIsModalOpen(false);
        setFormData({ leaveTypeId: '', fromDate: '', toDate: '', reason: '' });
        fetchMyLeavesData();
      } else {
        setApplyError(res.message || 'Failed to submit leave application.');
      }
    } catch (err) {
      console.error("Failed to apply leave:", err);
      setApplyError(err.response?.data?.message || err.message || 'Failed to submit leave application.');
      showToast("Leave request bounds or balance validation failed.", "error");
    }
  };

  const handleCancelRequest = async (reqId) => {
    if (!window.confirm("Are you sure you want to cancel this pending leave request?")) return;

    try {
      const res = await cancelLeave(reqId);
      if (res.success || res._id) {
        showToast(res.message || "Leave request cancelled successfully.");
        fetchMyLeavesData();
      } else {
        showToast(res.message || "Failed to cancel request.", "error");
      }
    } catch (err) {
      console.error("Failed to cancel leave:", err);
      showToast(err.response?.data?.message || err.message || "Failed to cancel leave request.", "error");
    }
  };

  const handleApproveTeamRequest = async (reqId) => {
    try {
      const res = await approveLeaveRequest(reqId);
      if (res.success || res._id) {
        showToast(res.message || "Leave request approved successfully!");
        fetchTeamPendingRequests();
        fetchMyLeavesData();
      } else {
        showToast("Failed to approve leave request.", "error");
      }
    } catch (err) {
      console.error("Failed to approve leave:", err);
      showToast(err.response?.data?.message || err.message || "Unauthorized or invalid operation.", "error");
    }
  };

  const handleRejectTeamRequest = async (reqId) => {
    const reason = await window.prompt("Enter rejection reason for this leave request:", "Scheduling conflict", "Leave Rejection Reason");
    if (reason === null) return;
    try {
      const res = await rejectLeaveRequest(reqId, reason);
      if (res.success || res._id) {
        showToast(res.message || "Leave request rejected successfully.");
        fetchTeamPendingRequests();
        fetchMyLeavesData();
      } else {
        showToast("Failed to reject leave request.", "error");
      }
    } catch (err) {
      console.error("Failed to reject leave:", err);
      showToast(err.response?.data?.message || err.message || "Rejection action denied.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 0. TOP PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Leave Approvals & Management Portal
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
              Review, approve, and track employee leave applications, balances, and company holidays
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-2xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-brand-secondary/40"
          >
            <Plus className="w-4 h-4 text-slate-900 stroke-[2.5]" />
            <span>Apply For Leave</span>
          </button>
        </div>
      )}

      {/* Tab bar header if ProjectManager/HR */}
      {isManager && (
        <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
          <button
            onClick={() => setPortalTab('team-approvals')}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              portalTab === 'team-approvals'
                ? 'border-brand-primary text-slate-800 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Team Approvals ({teamRequests.length})
          </button>
          <button
            onClick={() => setPortalTab('personal-leaves')}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              portalTab === 'personal-leaves'
                ? 'border-brand-primary text-slate-800 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            My Leaves Portal
          </button>
        </div>
      )}

      {portalTab === 'team-approvals' ? (
        /* Team approval management inbox list */
        <Card title="Team Leaves Approval Registry" subtitle="Review and approve/reject active pending leave applications from your workforce">
          <div className="space-y-3">
            {teamRequests.map(req => (
              <div 
                key={req.id}
                className="p-4 border border-slate-150 rounded-2xl flex items-start justify-between gap-4 flex-wrap bg-white"
              >
                <div className="space-y-1.5 flex-1 min-w-[200px] text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700">
                      {req.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <strong className="text-slate-805 block">{req.name}</strong>
                      <span className="text-[9px] text-[#2484C6] block font-bold uppercase">{req.role} &bull; {req.type} Leave</span>
                    </div>
                  </div>
                  <p className="text-slate-550 italic font-semibold leading-normal">"Reason: {req.reason}"</p>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                    Requested Dates: {req.dates}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={() => handleRejectTeamRequest(req.id)}
                    className="p-2 border border-slate-205 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all shadow-3xs"
                    title="Reject Request"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleApproveTeamRequest(req.id)}
                    className="px-3.5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            ))}

            {teamRequests.length === 0 && (
              <div className="py-8 text-center text-slate-400 font-bold uppercase tracking-wider bg-white border border-slate-100 rounded-3xl">
                <AlertCircle className="w-6 h-6 text-slate-350 mx-auto mb-2" />
                No leave requests pending approvals.
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* Personal Leaves dashboard */
        <>
          {/* Page Title & Apply Action Banner */}
          <div className="flex justify-between items-center bg-slate-50/40 p-4 rounded-2xl border border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-none">Personal Leave Portal</h3>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">Submit leave requests and monitor your active leave quotas</span>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Apply for Leave
            </button>
          </div>

          {/* 1. Leave Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {balances.map((bal, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{bal.leaveTypeName} balance</span>
                <div className="flex justify-between items-end">
                  <strong className="text-xl font-black text-slate-805 block">{bal.usedDays} / {bal.allocatedDays} Days Used</strong>
                  <span className="text-[10px] text-slate-400 font-semibold">{bal.remainingDays} Days Left</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${(bal.usedDays / bal.allocatedDays) * 100}%`,
                      backgroundColor: bal.colorTag || '#2484C6'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Requests History Ledger */}
          <Card title="Leave Requests Ledger" subtitle="View status and approvals timeline of your requested leave logs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Leave Category</th>
                    <th className="py-3 px-4">From Date</th>
                    <th className="py-3 px-4">To Date</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{req.leaveTypeName}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{req.fromDate}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{req.toDate}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-bold">{req.days} Days</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate italic">"{req.reason}"</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          req.status === 'Cancelled' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{req.status}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider border border-slate-200 hover:border-rose-100"
                            title="Cancel Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-bold uppercase tracking-wider">
                        <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                        No leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* 3. Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Apply for Leave</h4>
                <p className="text-[10px] text-slate-400 font-bold block mt-1 font-semibold">Submit request for quota review</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm p-1.5 hover:bg-slate-50 rounded-lg"
              >
                &times;
              </button>
            </div>

            {applyError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-bold">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs font-bold text-slate-550">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Leave Category</label>
                <select
                  required
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805 font-semibold"
                >
                  <option value="">Select leave type</option>
                  {balances.map(b => (
                    <option key={b.leaveTypeId} value={b.leaveTypeId}>
                      {b.leaveTypeName} ({b.remainingDays} Days Left)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">End Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Reason for Leave</label>
                <textarea 
                  required
                  placeholder="e.g. Heading to hometown for family wedding ceremonies..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
                  className="w-full px-3.5 py-2 border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-805 resize-none leading-normal font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-205 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider text-[10px] font-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl shadow-xs uppercase tracking-wider text-[10px] font-black"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold z-50 animate-in slide-in-from-top duration-300 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-705' : 'bg-rose-50 border-rose-100 text-rose-705'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
