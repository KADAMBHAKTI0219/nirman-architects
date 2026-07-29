import React, { useState, useEffect } from 'react';
import LeaveStats from './LeaveStats';
import LeaveCalendar from './LeaveCalendar';
import LeaveRequestsInbox from './LeaveRequestsInbox';
import LeaveHistoryTable from './LeaveHistoryTable';
import LeavesPortal from '../../common/LeavesPortal';
import { useNavigate } from 'react-router-dom';
import { Edit3 } from 'lucide-react';
import {
  getPendingLeaveRequests,
  getCompanyLeaves,
  approveLeaveRequest,
  rejectLeaveRequest,
  adjustLeaveBalance,
  getAllLeaveTypes,
  parseIndexedObjectToArray
} from '../../../service/leave';
import { getUsersList } from '../../../service/auth';

const INITIAL_REQUESTS = [
  { id: 1, name: "Alice Smith", role: "Jr Architect", dept: "Architecture", type: "Annual", dates: "July 29 - Aug 04", days: 6, reason: "Family trip and rest days", status: "Pending" },
  { id: 2, name: "Bob Johnson", role: "Site Engineer", dept: "Engineering", type: "Sick", dates: "July 25 - July 26", days: 1, reason: "Medical consultation check", status: "Pending" },
  { id: 3, name: "Charlie Brown", role: "Drafter", dept: "Architecture", type: "Casual", dates: "Aug 02 - Aug 09", days: 7, reason: "Annual vacation and rest", status: "Pending" }
];

export default function LeavesHolidays({ defaultTab = 'company' }) {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState(defaultTab); // company, personal

  useEffect(() => {
    setActiveSubTab(defaultTab);
  }, [defaultTab]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [allCompanyRequests, setAllCompanyRequests] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  const [adjustForm, setAdjustForm] = useState({
    targetUserId: '',
    leaveTypeId: '',
    newValue: 15,
    reason: ''
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await getPendingLeaveRequests();
      const list = parseIndexedObjectToArray(res);
      if (list) {
        const mapped = list.map(req => {
          const fromDateStr = req.fromDate ? new Date(req.fromDate).toLocaleDateString() : '';
          const toDateStr = req.toDate ? new Date(req.toDate).toLocaleDateString() : '';
          return {
            id: req._id || req.id,
            name: req.userId?.name || req.user?.name || req.employeeName || "Nirman Staff",
            role: req.userId?.designation || req.user?.role || "Staff",
            type: req.leaveTypeId?.name || req.leaveType?.name || req.leaveTypeName || "Leave",
            dates: `${fromDateStr} - ${toDateStr}`,
            reason: req.reason || "N/A",
            status: req.status ? (req.status.charAt(0) + req.status.slice(1).toLowerCase()) : "Pending"
          };
        });
        setLeaveRequests(mapped);
      }
    } catch (err) {
      console.error("Failed to load pending leaves from backend", err);
    }
  };

  const fetchCompanyLeavesList = async () => {
    try {
      const res = await getCompanyLeaves();
      const list = parseIndexedObjectToArray(res);
      if (list) {
        const mapped = list.map(req => {
          const fromDateStr = req.fromDate ? new Date(req.fromDate).toLocaleDateString() : '';
          const toDateStr = req.toDate ? new Date(req.toDate).toLocaleDateString() : '';
          return {
            id: req._id || req.id,
            name: req.userId?.name || req.user?.name || req.employeeName || "Nirman Staff",
            role: req.userId?.designation || req.user?.role || "Staff",
            type: req.leaveTypeId?.name || req.leaveType?.name || req.leaveTypeName || "Leave",
            dates: `${fromDateStr} - ${toDateStr}`,
            reason: req.reason || "N/A",
            status: req.status ? (req.status.charAt(0) + req.status.slice(1).toLowerCase()) : "Pending"
          };
        });
        setAllCompanyRequests(mapped);
      }
    } catch (err) {
      console.error("Failed to load company-wide leaves from backend", err);
    }
  };

  const fetchUsersAndTypes = async () => {
    try {
      const usersRes = await getUsersList();
      const uList = parseIndexedObjectToArray(usersRes);
      if (uList) {
        setUsersList(uList);
      }
      
      const typesRes = await getAllLeaveTypes();
      const tList = parseIndexedObjectToArray(typesRes);
      if (tList) {
        setLeaveTypes(tList);
      }
    } catch (err) {
      console.error("Failed to load users or leave types", err);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'company') {
      fetchPendingLeaves();
      fetchCompanyLeavesList();
      fetchUsersAndTypes();
    }
  }, [activeSubTab]);

  const handleApprove = async (id) => {
    try {
      const res = await approveLeaveRequest(id);
      if (res.success || res._id) {
        showToast("Leave request approved successfully!");
        fetchPendingLeaves();
        fetchCompanyLeavesList();
      } else {
        showToast("Failed to approve leave request.", "error");
      }
    } catch (err) {
      console.error("Backend approval error", err);
      showToast(err.response?.data?.message || err.message || "Approval action denied.", "error");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason for this leave request:", "Scheduling conflict");
    if (reason === null) return;
    try {
      const res = await rejectLeaveRequest(id, reason);
      if (res.success || res._id) {
        showToast("Leave request rejected successfully.");
        fetchPendingLeaves();
        fetchCompanyLeavesList();
      } else {
        showToast("Failed to reject leave request.", "error");
      }
    } catch (err) {
      console.error("Backend rejection error", err);
      showToast(err.response?.data?.message || err.message || "Rejection action denied.", "error");
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustForm.targetUserId || !adjustForm.leaveTypeId || !adjustForm.reason) {
      showToast("Please fill out all balance adjustment fields.", "error");
      return;
    }
    try {
      const res = await adjustLeaveBalance({
        targetUserId: adjustForm.targetUserId,
        leaveTypeId: adjustForm.leaveTypeId,
        newValue: parseInt(adjustForm.newValue) || 0,
        reason: adjustForm.reason
      });
      if (res.success || res._id) {
        showToast("Employee leave balance adjusted successfully!");
        setIsAdjustModalOpen(false);
        setAdjustForm({ targetUserId: '', leaveTypeId: '', newValue: 15, reason: '' });
        fetchCompanyLeavesList();
      } else {
        showToast("Failed to adjust leave balance.", "error");
      }
    } catch (err) {
      console.error("Backend adjust balance error", err);
      showToast(err.response?.data?.message || err.message || "Error adjusting leave balance.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Sub-tab Navigation */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-1 flex-wrap gap-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => navigate('/hr/leaves/company')}
            className={`pb-2 text-xs font-bold tracking-wide transition-all relative ${
              activeSubTab === 'company'
                ? 'text-slate-900 font-black'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            Company Approvals
            {activeSubTab === 'company' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => navigate('/hr/leaves/personal')}
            className={`pb-2 text-xs font-bold tracking-wide transition-all relative ${
              activeSubTab === 'personal'
                ? 'text-slate-900 font-black'
                : 'text-slate-400 hover:text-slate-600 font-semibold'
            }`}
          >
            My Personal Leaves
            {activeSubTab === 'personal' && (
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-full" />
            )}
          </button>
        </div>
      </div>

      {activeSubTab === 'company' ? (
        <>
          {/* 1. TOP SUMMARY ROW */}
          <LeaveStats />

          {/* 2. MIDDLE AREA (Calendar & Inbox) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <LeaveCalendar />
            </div>
            <div>
              <LeaveRequestsInbox 
                leaveRequests={leaveRequests}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>
          </div>

          {/* 3. BOTTOM AREA (Leave history grid) */}
          <LeaveHistoryTable 
            leaveRequests={allCompanyRequests}
          />
        </>
      ) : (
        <LeavesPortal role="Employee" />
      )}

      {/* Adjust quota balance modal dialog */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
              <div>
                <h4 className="text-sm font-black text-slate-805 uppercase tracking-wider">Adjust Leave Quota</h4>
                <p className="text-[10px] text-slate-400 font-bold block mt-1">Directly adjust an employee's leave balance ledger</p>
              </div>
              <button 
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm p-1.5 hover:bg-slate-50 rounded-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs font-bold text-slate-555">
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
                      {u.name || u.firstName || u.email} ({u.role})
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
