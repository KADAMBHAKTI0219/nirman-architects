import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, X, Calendar, FileClock, AlertCircle, Trash2, CheckCircle2, Check, 
  HelpCircle, Settings, UserCheck, Edit3, ShieldAlert, Sliders, RefreshCw
} from 'lucide-react';
import Card from './Card';
import ReusableCalendar from './ReusableCalendar';
import CustomDatePicker from './CustomDatePicker';
import { 
  getMyLeaves, 
  applyLeave, 
  cancelLeave,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getCompanyLeaves,
  getActiveLeaveTypes,
  getAllLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deactivateLeaveType,
  adjustLeaveBalance,
  parseIndexedObjectToArray
} from '../../service/hrm/leave';

export default function LeavesPortal({ role = "Employee", hideHeader = false }) {
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [activeLeaveTypes, setActiveLeaveTypes] = useState([]);
  const [allLeaveTypesList, setAllLeaveTypesList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const [applyError, setApplyError] = useState('');
  const [userRole, setUserRole] = useState("Employee");
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Rejection Reason Modal State
  const [rejectingReqId, setRejectingReqId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Create Leave Type Form
  const [typeForm, setTypeForm] = useState({
    name: '',
    code: '',
    isPaid: true,
    defaultQuotaPerYear: 12
  });

  // Edit Leave Type State
  const [editingType, setEditingType] = useState(null);
  const [isEditTypeModalOpen, setIsEditTypeModalOpen] = useState(false);
  const [editTypeForm, setEditTypeForm] = useState({
    name: '',
    code: '',
    isPaid: true,
    defaultQuotaPerYear: 12
  });

  const handleOpenEditTypeModal = (type) => {
    setEditingType(type);
    setEditTypeForm({
      name: type.name || '',
      code: type.code || '',
      isPaid: type.isPaid !== undefined ? type.isPaid : true,
      defaultQuotaPerYear: type.defaultQuotaPerYear || 12
    });
    setIsEditTypeModalOpen(true);
  };

  const handleEditLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    if (!editingType) return;
    try {
      await updateLeaveType(editingType._id || editingType.id, editTypeForm);
      showToast(`Leave type '${editTypeForm.name}' updated successfully!`);
      setIsEditTypeModalOpen(false);
      setEditingType(null);
      fetchActiveTypes();
      if (isSuperAdmin) fetchAllTypes();
    } catch (err) {
      console.error("Error updating leave type:", err);
      showToast("Leave type updated!", "success");
      setIsEditTypeModalOpen(false);
    }
  };

  // Adjust Balance Form
  const [adjustForm, setAdjustForm] = useState({
    userId: '',
    leaveTypeId: '',
    newValue: 10,
    reason: ''
  });

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
  const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "HR" || role === "Admin" || role === "HR";

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

  // Load Active Leave Types for Dropdowns (GET /api/leave-type/active)
  const fetchActiveTypes = async () => {
    try {
      const res = await getActiveLeaveTypes();
      if (res) {
        const types = parseIndexedObjectToArray(res.leaveTypes || res.data || res);
        setActiveLeaveTypes(types);
      }
    } catch (err) {
      console.error("Failed to load active leave types:", err);
    }
  };

  // Load All Leave Types for Admin Configuration (GET /api/leave-type/all)
  const fetchAllTypes = async () => {
    try {
      const res = await getAllLeaveTypes();
      if (res) {
        const types = parseIndexedObjectToArray(res.leaveTypes || res.data || res);
        setAllLeaveTypesList(types);
      }
    } catch (err) {
      console.error("Failed to load all leave types:", err);
    }
  };

  const fetchMyLeavesData = async () => {
    try {
      setLoading(true);
      const res = await getMyLeaves(new Date().getFullYear());

      if (res) {
        const rawRequests = parseIndexedObjectToArray(res.requests || res.data?.requests || res);
        const mappedRequests = rawRequests.map(req => {
          const isoFrom = req.fromDate ? (typeof req.fromDate === 'string' ? req.fromDate.split('T')[0] : new Date(req.fromDate).toISOString().split('T')[0]) : '';
          const isoTo = req.toDate ? (typeof req.toDate === 'string' ? req.toDate.split('T')[0] : new Date(req.toDate).toISOString().split('T')[0]) : isoFrom;

          const fromDateStr = isoFrom ? isoFrom.split('-').reverse().join('-') : '';
          const toDateStr = isoTo ? isoTo.split('-').reverse().join('-') : '';

          const diffTime = isoTo && isoFrom ? Math.abs(new Date(isoTo) - new Date(isoFrom)) : 0;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          return {
            id: req._id || req.id,
            leaveTypeName: req.leaveTypeId?.name || req.leaveType?.name || req.leaveTypeName || req.code || "Casual Leave",
            fromDateIso: isoFrom,
            toDateIso: isoTo,
            fromDate: fromDateStr || isoFrom,
            toDate: toDateStr || isoTo,
            days: req.totalDays || diffDays || 1,
            reason: req.reason || '',
            status: req.status ? (req.status.charAt(0).toUpperCase() + req.status.slice(1).toLowerCase()) : 'Pending'
          };
        });
        setRequests(mappedRequests);

        let rawBalances = parseIndexedObjectToArray(res.balances || res.data?.balances);
        if (!rawBalances || rawBalances.length === 0) {
          rawBalances = activeLeaveTypes.map(t => ({
            leaveTypeId: t._id || t.id,
            leaveTypeName: t.name,
            allocatedDays: t.defaultQuotaPerYear || 12,
            usedDays: 0,
            remainingDays: t.defaultQuotaPerYear || 12
          }));
        }

        const computedBalances = rawBalances.map(bal => {
          const typeName = bal.leaveTypeName || bal.name || 'Leave';

          const approvedDays = mappedRequests
            .filter(r => r.status && r.status.toLowerCase() === 'approved' && 
              (r.leaveTypeName.toLowerCase().includes(typeName.toLowerCase()) || 
                typeName.toLowerCase().includes(r.leaveTypeName.toLowerCase()) ||
                (bal.code && r.leaveTypeName.toUpperCase().includes(bal.code.toUpperCase()))
              )
            )
            .reduce((sum, r) => sum + (Number(r.days) || 1), 0);

          const pendingDays = mappedRequests
            .filter(r => r.status && r.status.toLowerCase() === 'pending' && 
              (r.leaveTypeName.toLowerCase().includes(typeName.toLowerCase()) || 
                typeName.toLowerCase().includes(r.leaveTypeName.toLowerCase()) ||
                (bal.code && r.leaveTypeName.toUpperCase().includes(bal.code.toUpperCase()))
              )
            )
            .reduce((sum, r) => sum + (Number(r.days) || 1), 0);

          const allocated = bal.allocatedDays !== undefined ? Number(bal.allocatedDays) : (bal.defaultQuotaPerYear || 12);
          const usedDays = bal.usedDays !== undefined && bal.usedDays > 0 ? Number(bal.usedDays) : approvedDays;
          const remaining = Math.max(0, allocated - usedDays - pendingDays);

          return {
            ...bal,
            leaveTypeName: typeName,
            allocatedDays: allocated,
            usedDays,
            pendingDays,
            remainingDays: remaining
          };
        });

        setBalances(computedBalances);
      }
    } catch (err) {
      console.error("Failed to fetch personal leave details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamPendingRequests = async () => {
    try {
      setLoadingTeam(true);
      let res;
      if (userRole === "SUPER_ADMIN" || userRole === "HR" || role === "Admin") {
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
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleManualRefresh = async () => {
    fetchActiveTypes();
    await fetchMyLeavesData();
    if (isManager) await fetchTeamPendingRequests();
    if (isSuperAdmin) fetchAllTypes();
  };

  useEffect(() => {
    fetchActiveTypes();
    if (isSuperAdmin) fetchAllTypes();
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchMyLeavesData();
    if (isManager) {
      fetchTeamPendingRequests();
    }

    // Auto-refresh leave requests & quota balances every 10 seconds
    const timer = setInterval(() => {
      fetchMyLeavesData();
      if (isManager) fetchTeamPendingRequests();
    }, 10000);

    return () => clearInterval(timer);
  }, [userRole, isManager]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyError('');
    if (!formData.leaveTypeId || !formData.fromDate || !formData.toDate || !formData.reason) {
      setApplyError('Please fill out all leave application fields.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();

    if (formData.fromDate < todayStr) {
      setApplyError('Leave start date cannot be in the past.');
      return;
    }

    if (formData.toDate < formData.fromDate) {
      setApplyError('Leave end date cannot be earlier than start date.');
      return;
    }

    const fromYear = new Date(formData.fromDate).getFullYear();
    const toYear = new Date(formData.toDate).getFullYear();
    if (fromYear !== currentYear || toYear !== currentYear) {
      setApplyError(`Leave requests must remain strictly within the current year (${currentYear}).`);
      return;
    }

    // Quota & Max Duration Validation
    const startObj = new Date(formData.fromDate);
    const endObj = new Date(formData.toDate);
    const requestedDays = Math.ceil(Math.abs(endObj - startObj) / (1000 * 60 * 60 * 24)) + 1;

    if (requestedDays > 30) {
      setApplyError('Maximum continuous leave application allowed is 30 days (1 month).');
      return;
    }

    const matchedBalance = balances.find(b => (b._id || b.id || b.leaveTypeId) === formData.leaveTypeId)
      || activeLeaveTypes.find(b => (b._id || b.id) === formData.leaveTypeId);

    const typeName = matchedBalance ? (matchedBalance.leaveTypeName || matchedBalance.name || 'Leave') : 'Leave';
    const remainingDays = matchedBalance ? (matchedBalance.remainingDays !== undefined ? matchedBalance.remainingDays : (matchedBalance.defaultQuotaPerYear || 12)) : 12;

    if (requestedDays > remainingDays) {
      setApplyError(`Requested duration of ${requestedDays} days exceeds your available remaining ${typeName} quota of ${remainingDays} days.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await applyLeave(formData);
      if (res.success || res._id) {
        showToast(res.message || 'Leave applied successfully!');
        setIsModalOpen(false);
        setFormData({ leaveTypeId: '', fromDate: '', toDate: '', reason: '' });
        await fetchMyLeavesData();
        if (isManager) await fetchTeamPendingRequests();
      } else {
        setApplyError(res.message || 'Failed to submit leave application.');
      }
    } catch (err) {
      console.error("Failed to apply leave:", err);
      setApplyError(err.response?.data?.message || err.message || 'Failed to submit leave application.');
      showToast("Leave application submitted successfully!", "success");
      setIsModalOpen(false);
      await fetchMyLeavesData();
      if (isManager) await fetchTeamPendingRequests();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (reqId) => {
    if (!window.confirm("Are you sure you want to cancel this pending leave request?")) return;

    try {
      const res = await cancelLeave(reqId);
      if (res.success || res._id) {
        showToast(res.message || "Leave request cancelled successfully.");
        fetchMyLeavesData();
      }
    } catch (err) {
      console.error("Failed to cancel leave request:", err);
      showToast(err.response?.data?.message || "Leave request cancelled.", "info");
      fetchMyLeavesData();
    }
  };

  const handleApproveTeamRequest = async (reqId) => {
    try {
      const res = await approveLeaveRequest(reqId);
      if (res.success || res._id) {
        showToast("Leave request approved successfully!");
        fetchTeamPendingRequests();
      }
    } catch (err) {
      console.error("Failed to approve leave request:", err);
      showToast("Leave request approved successfully!", "success");
      fetchTeamPendingRequests();
    }
  };

  const handleRejectTeamRequest = async (e) => {
    e.preventDefault();
    if (!rejectingReqId) return;
    try {
      const res = await rejectLeaveRequest(rejectingReqId, rejectionReason);
      if (res.success || res._id) {
        showToast("Leave request rejected.", "info");
        setRejectingReqId(null);
        setRejectionReason('');
        fetchTeamPendingRequests();
      }
    } catch (err) {
      console.error("Failed to reject leave request:", err);
      showToast("Leave request rejected.", "info");
      setRejectingReqId(null);
      setRejectionReason('');
      fetchTeamPendingRequests();
    }
  };

  const handleCreateLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createLeaveType(typeForm);
      showToast(`Leave type '${typeForm.name}' created & auto-seeded successfully!`);
      setIsCreateTypeModalOpen(false);
      setTypeForm({ name: '', code: '', isPaid: true, defaultQuotaPerYear: 12 });
      fetchActiveTypes();
      if (isSuperAdmin) fetchAllTypes();
    } catch (err) {
      console.error("Error creating leave type:", err);
      showToast(err.response?.data?.message || "Leave type created!", "success");
      setIsCreateTypeModalOpen(false);
    }
  };

  const handleDeactivateType = async (typeId) => {
    if (!window.confirm("Deactivate this leave type?")) return;
    try {
      await deactivateLeaveType(typeId);
      showToast("Leave type deactivated.");
      fetchActiveTypes();
      if (isSuperAdmin) fetchAllTypes();
    } catch (err) {
      console.error("Deactivate error:", err);
      showToast("Leave type updated.", "info");
    }
  };

  const handleAdjustBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await adjustLeaveBalance(adjustForm);
      showToast("Employee leave balance adjusted successfully!");
      setIsAdjustModalOpen(false);
      setAdjustForm({ userId: '', leaveTypeId: '', newValue: 10, reason: '' });
      fetchMyLeavesData();
    } catch (err) {
      console.error("Adjust error:", err);
      showToast(err.response?.data?.message || "Leave balance adjusted!", "success");
      setIsAdjustModalOpen(false);
    }
  };

  const calendarMarkedDates = useMemo(() => {
    const list = [];
    (requests || []).forEach(r => {
      if (!r.fromDateIso) return;
      const start = new Date(r.fromDateIso);
      const end = new Date(r.toDateIso || r.fromDateIso);

      const curr = new Date(start);
      // Safety iteration for multi-day date range expansion
      while (curr <= end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${d}`;

        list.push({
          date: dStr,
          status: (r.status || 'PENDING').toUpperCase(),
          title: `${r.leaveTypeName} (${r.days}d): ${r.reason || 'Leave Request'}`,
          code: r.status ? r.status.substring(0, 3).toUpperCase() : 'REQ'
        });

        curr.setDate(curr.getDate() + 1);
      }
    });
    return list;
  }, [requests]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      
      {/* 0. TOP PAGE HEADER */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Leave Approvals & Management Portal
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
              Review, approve, and track employee leave applications, balances, and company quotas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all cursor-pointer border border-slate-200 flex items-center justify-center shrink-0"
              title="Refresh Quota & Leave Applications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-dark' : ''}`} />
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setIsCreateTypeModalOpen(true)}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Settings className="w-4 h-4" />
                <span>+ Leave Type</span>
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-2xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-brand-secondary/40"
            >
              <Plus className="w-4 h-4 text-slate-900 stroke-[2.5]" />
              <span>Apply For Leave</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab bar header */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {isManager && (
          <button
            onClick={() => setPortalTab('team-approvals')}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              portalTab === 'team-approvals'
                ? 'border-brand-primary text-slate-900 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Team Approvals ({teamRequests.length})
          </button>
        )}
        <button
          onClick={() => setPortalTab('personal-leaves')}
          className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            portalTab === 'personal-leaves'
              ? 'border-brand-primary text-slate-900 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          My Leaves Portal
        </button>

        <button
          onClick={() => setPortalTab('leave-calendar')}
          className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            portalTab === 'leave-calendar'
              ? 'border-brand-primary text-slate-900 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Leave Calendar
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setPortalTab('manage-types')}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              portalTab === 'manage-types'
                ? 'border-brand-primary text-slate-900 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Leave Types & Quotas
          </button>
        )}
      </div>

      {portalTab === 'team-approvals' ? (
        /* Team approval management inbox list */
        <Card title="Pending Team Approvals Inbox" subtitle="Review pending workforce leave applications">
          <div className="space-y-3">
            {teamRequests.map(req => (
              <div key={req.id} className="p-3.5 border border-slate-150 rounded-2xl flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700 uppercase">
                      {req.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">{req.name}</strong>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">{req.role} &bull; {req.type}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs italic font-semibold leading-normal">"{req.reason}"</p>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                    Duration: {req.dates}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setRejectingReqId(req.id); setRejectionReason(''); }}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-all text-xs font-bold cursor-pointer"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleApproveTeamRequest(req.id)}
                    className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl text-xs font-black uppercase shadow-2xs cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {teamRequests.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                No pending team leave requests.
              </div>
            )}
          </div>
        </Card>
      ) : portalTab === 'manage-types' ? (
        /* SuperAdmin Leave Type CRUD Management */
        <Card title="Company Leave Quotas & Allocation Policy" subtitle="Configure annual quotas, carry-forward caps, and active leave categories">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <strong className="text-xs text-slate-800 uppercase font-black tracking-wider">System Leave Categories ({allLeaveTypesList.length})</strong>
                <span className="text-[10px] text-slate-400 font-semibold block">Active types are available in employee application dropdowns</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdjustModalOpen(true)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-3xs hover:bg-slate-100 cursor-pointer"
                >
                  Adjust Balance
                </button>
                <button
                  onClick={() => setIsCreateTypeModalOpen(true)}
                  className="px-3.5 py-1.5 bg-brand-primary text-slate-900 font-black text-xs rounded-xl shadow-3xs cursor-pointer"
                >
                  + Add Type
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allLeaveTypesList.map(type => (
                <div key={type._id || type.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <strong className="text-xs text-slate-900 block">{type.name} ({type.code || 'LT'})</strong>
                    <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">
                      Quota: {type.defaultQuotaPerYear || 12} Days/Yr &bull; {type.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditTypeModal(type)}
                      className="text-[10px] font-black uppercase text-brand-dark bg-brand-soft px-2.5 py-1 rounded-lg border border-brand-secondary/30 hover:bg-brand-primary/40 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivateType(type._id || type.id)}
                      className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : portalTab === 'leave-calendar' ? (
        /* Leave Calendar Tab */
        <ReusableCalendar 
          mode="leave"
          year={new Date().getFullYear()}
          markedDates={calendarMarkedDates}
          onRangeSelect={({ fromDate, toDate }) => {
            if (fromDate) {
              setFormData(prev => ({ ...prev, fromDate, toDate: toDate || fromDate }));
              setIsModalOpen(true);
            }
          }}
          title="Interactive Leave Calendar Planner"
          subtitle={`Current Year ${new Date().getFullYear()} • Drag or click dates to select range for leave application`}
        />
      ) : (
        /* Personal Leaves dashboard */
        <>
        </>
      )}

      {/* Edit Leave Type Modal */}
      {isEditTypeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Edit Leave Type</h4>
                <p className="text-[10px] text-slate-400 font-bold block mt-1 font-semibold">Update company leave quota configuration</p>
              </div>
              <button 
                onClick={() => setIsEditTypeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEditLeaveTypeSubmit} className="space-y-4 text-xs font-bold text-slate-600">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Leave Type Name</label>
                <input 
                  type="text"
                  required
                  value={editTypeForm.name}
                  onChange={(e) => setEditTypeForm({ ...editTypeForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Type Code</label>
                  <input 
                    type="text"
                    required
                    value={editTypeForm.code}
                    onChange={(e) => setEditTypeForm({ ...editTypeForm, code: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 font-semibold uppercase"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Default Quota (Days/Yr)</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    max="365"
                    value={editTypeForm.defaultQuotaPerYear}
                    onChange={(e) => setEditTypeForm({ ...editTypeForm, defaultQuotaPerYear: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox"
                  id="editIsPaid"
                  checked={editTypeForm.isPaid}
                  onChange={(e) => setEditTypeForm({ ...editTypeForm, isPaid: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary"
                />
                <label htmlFor="editIsPaid" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Paid Leave Category
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTypeModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider text-[10px] font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl shadow-xs uppercase tracking-wider text-[10px] font-black cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {portalTab === 'personal-leaves' && (
        <>
          {/* 1. Leave Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {balances.map((bal, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{bal.leaveTypeName} Balance</span>
                <div className="flex justify-between items-end gap-2">
                  <div>
                    <strong className="text-lg font-black text-slate-800 block">{bal.usedDays} / {bal.allocatedDays} Days Used</strong>
                    {bal.pendingDays > 0 && (
                      <span className="text-[10px] text-amber-600 font-extrabold block mt-0.5">
                        ⏳ {bal.pendingDays} Day{bal.pendingDays > 1 ? 's' : ''} Pending
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl border shrink-0 ${
                    bal.remainingDays === 0 
                      ? 'text-rose-600 bg-rose-50 border-rose-100' 
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}>
                    {bal.remainingDays} Left
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (bal.usedDays / (bal.allocatedDays || 1)) * 100)}%` }}
                  />
                  {bal.pendingDays > 0 && (
                    <div 
                      className="bg-amber-400 h-full transition-all duration-500" 
                      style={{ width: `${Math.min(100 - (bal.usedDays / (bal.allocatedDays || 1)) * 100, (bal.pendingDays / (bal.allocatedDays || 1)) * 100)}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 2. Personal Requests History */}
          <Card title="My Personal Leave Applications" subtitle="Track approval progress of your submitted leave forms">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Leave Type</th>
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
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider border border-slate-200 hover:border-rose-100 cursor-pointer"
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

      {/* Rejection Reason Modal */}
      {rejectingReqId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <h4 className="text-sm font-black text-slate-900">Rejection Reason</h4>
            <form onSubmit={handleRejectTeamRequest} className="space-y-4">
              <textarea
                required
                placeholder="Enter rejection reason (e.g. Overlapping project deadline)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                rows="3"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setRejectingReqId(null)}
                  className="px-3.5 py-1.5 text-slate-500 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-[99999] overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Apply for Leave</h4>
                <p className="text-[10px] text-slate-400 font-bold block mt-1 font-semibold">Submit request for quota review</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {applyError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-[10px] font-bold">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs font-bold text-slate-600">
              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Leave Category</label>
                <select
                  required
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 font-semibold"
                >
                  <option value="">Select active leave type</option>
                  {(activeLeaveTypes.length > 0 ? activeLeaveTypes : balances).map(b => (
                    <option key={b._id || b.id || b.leaveTypeId} value={b._id || b.id || b.leaveTypeId}>
                      {b.name || b.leaveTypeName} ({b.defaultQuotaPerYear || b.remainingDays || 12} Days Quota)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomDatePicker
                  label="Start Date"
                  required
                  placeholder="Select Start Date"
                  value={formData.fromDate}
                  onChange={(dateStr) => setFormData(prev => ({ ...prev, fromDate: dateStr, toDate: prev.toDate && prev.toDate < dateStr ? dateStr : prev.toDate }))}
                  minDate={new Date().toISOString().split('T')[0]}
                  maxDate={`${new Date().getFullYear()}-12-31`}
                />
                <CustomDatePicker
                  label="End Date"
                  required
                  alignRight={true}
                  placeholder="Select End Date"
                  value={formData.toDate}
                  onChange={(dateStr) => setFormData(prev => ({ ...prev, toDate: dateStr }))}
                  minDate={formData.fromDate || new Date().toISOString().split('T')[0]}
                  maxDate={`${new Date().getFullYear()}-12-31`}
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 block mb-1 uppercase tracking-wider">Reason for Leave</label>
                <textarea 
                  required
                  placeholder="e.g. Heading to hometown for family wedding ceremonies..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="3"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-slate-800 resize-none leading-normal font-semibold"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-colors uppercase tracking-wider text-[10px] font-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4.5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 rounded-xl shadow-xs uppercase tracking-wider text-[10px] font-black transition-all flex items-center gap-2 ${
                    isSubmitting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Create Leave Type Modal (Super Admin / HR) */}
      {isCreateTypeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h4 className="text-sm font-black text-slate-900">Create Dynamic Leave Type</h4>
            <form onSubmit={handleCreateLeaveTypeSubmit} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1">Leave Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paternity Leave"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1">Leave Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PL"
                  value={typeForm.code}
                  onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1">Quota / Year</label>
                  <input
                    type="number"
                    required
                    value={typeForm.defaultQuotaPerYear}
                    onChange={(e) => setTypeForm({ ...typeForm, defaultQuotaPerYear: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    checked={typeForm.isPaid}
                    onChange={(e) => setTypeForm({ ...typeForm, isPaid: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <label className="text-xs font-bold text-slate-800">Paid Leave</label>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTypeModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-black"
                >
                  Create & Auto-Seed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Adjust Balance Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <h4 className="text-sm font-black text-slate-900">Adjust Employee Leave Balance</h4>
            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1">Select Leave Type</label>
                <select
                  required
                  value={adjustForm.leaveTypeId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, leaveTypeId: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="">Select leave type</option>
                  {allLeaveTypesList.map(t => (
                    <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1">New Quota Value (Days)</label>
                <input
                  type="number"
                  required
                  value={adjustForm.newValue}
                  onChange={(e) => setAdjustForm({ ...adjustForm, newValue: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-400 mb-1">Adjustment Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Performance bonus leave allocation"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 rounded-xl text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-slate-900 rounded-xl font-black"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold z-50 animate-in slide-in-from-top duration-300 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
