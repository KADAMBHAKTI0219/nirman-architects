import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HROverview from './HROverview';
import HRLeaves from './HRLeaves';
import HRShifts from './HRShifts';
import HRPayrollOps from './HRPayrollOps';
import HRPerformance from './HRPerformance';
import LeaveMaster from './LeaveMaster';
import {
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  createLeaveType,
  getAllLeaveTypes,
  deactivateLeaveType,
  getCompanyLeaves,
  adjustLeaveBalance,
  parseIndexedObjectToArray
} from '../../../service/hrm/leave';
import { getUsersList } from '../../../service/auth';

// Mock DB Initial Data
const MOCK_STATS = {
  total: 28,
  onLeave: 2,
  pendingLeaves: 2,
  exceptions: 1,
  pendingReviews: 1
};

const DEPT_DISTRIBUTION = [
  { name: 'Architecture', value: 12 },
  { name: 'Engineering', value: 8 },
  { name: 'Project Mgmt', value: 6 },
  { name: 'HR & Admin', value: 2 }
];

const LEAVE_TRENDS = [
  { month: 'May', leaves: 10 },
  { month: 'June', leaves: 15 },
  { month: 'July', leaves: 12 }
];

const ATTENDANCE_EXCEPTIONS = [
  { id: 1, name: "Alice Smith", reason: "Late Check-in Exception", date: "2026-07-22", time: "11:05 AM" }
];

const INITIAL_LEAVE_REQUESTS = [
  { id: 1, name: "Alice Smith", department: "Architecture", type: "Annual", reason: "Family trip and rest days", startDate: "2026-07-29", endDate: "2026-08-04", days: 6, status: "Pending" },
  { id: 2, name: "Bob Johnson", department: "Engineering", type: "Sick", reason: "Medical checkup consultation", startDate: "2026-07-25", endDate: "2026-07-26", days: 1, status: "Pending" }
];

const LEAVE_BALANCES = [
  { type: "Annual", used: 5, total: 15 },
  { type: "Sick", used: 2, total: 10 },
  { type: "Casual", used: 1, total: 7 }
];

const HOLIDAYS = [
  { id: 1, name: "Independence Day Holiday", date: "2026-08-15" },
  { id: 2, name: "Ganesh Chaturthi Festivities", date: "2026-09-10" }
];

const SHIFT_CONFIGS = [
  { id: 1, name: "General Shift A", start: "09:00 AM", end: "05:30 PM", buffer: 15, staffCount: 18 },
  { id: 2, name: "Mid Shift B", start: "11:00 AM", end: "07:30 PM", buffer: 15, staffCount: 8 },
  { id: 3, name: "Night Shift C", start: "08:00 PM", end: "04:30 AM", buffer: 20, staffCount: 2 }
];

const INITIAL_SWAP_REQUESTS = [
  { id: 1, employeeName: "Alice Smith", date: "2026-07-24", currentShift: "General Shift A", requestedShift: "Mid Shift B" }
];

const INITIAL_PAYROLL = [
  { id: 1, name: "Alice Smith", role: "Junior Architect", base: 4500, allowance: 500, deduction: 100, delayPenalty: 0, bonus: 300, netPay: 5200 },
  { id: 2, name: "Bob Johnson", role: "Site Engineer", base: 5200, allowance: 600, deduction: 150, delayPenalty: 0, bonus: 400, netPay: 6050 },
  { id: 3, name: "John Wick", role: "Project Manager", base: 7000, allowance: 800, deduction: 200, delayPenalty: 120, bonus: 0, netPay: 7480 }
];

const INITIAL_PERFORMANCE = [
  { id: "EMP-101", name: "Alice Smith", role: "Junior Architect", productivity: 88, taskCompletion: 92, attendanceScore: 96, delaysCount: 0, reviewNotes: "Consistently uploads detailed staircase and balustrade blueprints with accurate headroom sizes.", score: 88 },
  { id: "EMP-102", name: "Bob Johnson", role: "Site Engineer", productivity: 92, taskCompletion: 95, attendanceScore: 94, delaysCount: 0, reviewNotes: "Excellent site geofence compaction checks. Verified foundations compaction rates logs.", score: 92 },
  { id: "EMP-103", name: "John Wick", role: "Project Manager", productivity: 85, taskCompletion: 88, attendanceScore: 82, delaysCount: 1, reviewNotes: "Great leadership on tower structures. Late check-in recorded on boot timelines.", score: 85 }
];

export default function HRPayroll({ defaultTab = 'overview' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Leaves state
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [companyLeaves, setCompanyLeaves] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  
  // Shift swap requests state
  const [swapRequests, setSwapRequests] = useState(INITIAL_SWAP_REQUESTS);

  // Payroll state
  const [payrollRecords, setPayrollRecords] = useState(INITIAL_PAYROLL);
  const [payrollApproved, setPayrollApproved] = useState(false);

  // Performance state
  const [performanceRecords, setPerformanceRecords] = useState(INITIAL_PERFORMANCE);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const fetchPendingLeaves = async () => {
    try {
      setLoadingLeaves(true);
      const res = await getPendingLeaveRequests();
      const list = parseIndexedObjectToArray(res);
      if (list) {
        const mapped = list.map(req => {
          const fromDateStr = req.fromDate ? new Date(req.fromDate).toLocaleDateString() : '';
          const toDateStr = req.toDate ? new Date(req.toDate).toLocaleDateString() : '';
          const diffTime = req.toDate && req.fromDate ? Math.abs(new Date(req.toDate) - new Date(req.fromDate)) : 0;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          return {
            id: req._id || req.id,
            name: req.userId?.name || req.user?.name || req.employeeName || "Nirman Staff",
            department: req.userId?.department || req.department || "Staff",
            type: req.leaveTypeId?.name || req.leaveType?.name || req.leaveTypeName || "Leave",
            reason: req.reason || "N/A",
            startDate: fromDateStr || req.fromDate,
            endDate: toDateStr || req.toDate,
            days: req.totalDays || diffDays || 1,
            status: req.status ? (req.status.charAt(0) + req.status.slice(1).toLowerCase()) : "Pending"
          };
        });
        setLeaveRequests(mapped);
      }
    } catch (err) {
      console.error("Failed to load pending leaves from backend", err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  const fetchCompanyLeaves = async () => {
    try {
      const res = await getCompanyLeaves();
      const list = parseIndexedObjectToArray(res);
      if (list) {
        const mapped = list.map(req => {
          const fromDateStr = req.fromDate ? new Date(req.fromDate).toLocaleDateString() : '';
          const toDateStr = req.toDate ? new Date(req.toDate).toLocaleDateString() : '';
          const diffTime = req.toDate && req.fromDate ? Math.abs(new Date(req.toDate) - new Date(req.fromDate)) : 0;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          return {
            id: req._id || req.id,
            name: req.userId?.name || req.user?.name || req.employeeName || "Nirman Staff",
            department: req.userId?.department || req.department || "Staff",
            type: req.leaveTypeId?.name || req.leaveType?.name || req.leaveTypeName || "Leave",
            reason: req.reason || "N/A",
            startDate: fromDateStr || req.fromDate,
            endDate: toDateStr || req.toDate,
            days: req.totalDays || diffDays || 1,
            status: req.status ? (req.status.charAt(0) + req.status.slice(1).toLowerCase()) : "Pending"
          };
        });
        setCompanyLeaves(mapped);
      }
    } catch (err) {
      console.error("Failed to load company-wide leaves", err);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await getUsersList();
      const list = parseIndexedObjectToArray(res);
      if (list) {
        setUsersList(list);
      }
    } catch (err) {
      console.error("Failed to fetch users list", err);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      setLoadingTypes(true);
      const res = await getAllLeaveTypes();
      const list = parseIndexedObjectToArray(res);
      if (list) {
        setLeaveTypes(list);
      }
    } catch (err) {
      console.error("Failed to load leave types", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaves') {
      fetchPendingLeaves();
      fetchCompanyLeaves();
      fetchUsersList();
      fetchLeaveTypes();
    } else if (activeTab === 'leave-master') {
      fetchLeaveTypes();
    }
  }, [activeTab]);

  const handleApproveLeave = async (reqId) => {
    try {
      const res = await approveLeaveRequest(reqId);
      if (res.success || res._id) {
        showToast("Leave request approved successfully!");
        fetchPendingLeaves();
        fetchCompanyLeaves();
      } else {
        showToast("Failed to approve leave request.", "error");
      }
    } catch (err) {
      console.error("Backend approval error", err);
      showToast(err.response?.data?.message || err.message || "Approval action denied.", "error");
    }
  };

  const handleRejectLeave = async (reqId, reason = "Scheduling conflict") => {
    try {
      const res = await rejectLeaveRequest(reqId, reason);
      if (res.success || res._id) {
        showToast("Leave request rejected successfully.");
        fetchPendingLeaves();
        fetchCompanyLeaves();
      } else {
        showToast("Failed to reject leave request.", "error");
      }
    } catch (err) {
      console.error("Backend rejection error", err);
      showToast(err.response?.data?.message || err.message || "Rejection action denied.", "error");
    }
  };

  const handleRejectLeavePrompt = async (reqId) => {
    const reason = await window.prompt("Enter rejection reason for this leave request:", "Scheduling conflict / staffing shortage", "Reject Leave Request");
    if (reason === null) return;
    handleRejectLeave(reqId, reason);
  };

  const handleCreateLeaveType = async (typeData) => {
    try {
      const res = await createLeaveType(typeData);
      if (res.success || res._id) {
        showToast("Leave type created successfully!");
        fetchLeaveTypes();
      } else {
        showToast("Failed to create leave type.", "error");
      }
    } catch (err) {
      console.error("Backend leave type creation error", err);
      showToast(err.response?.data?.message || err.message || "Error creating leave type.", "error");
    }
  };

  const handleDeactivateLeaveType = async (id) => {
    try {
      const res = await deactivateLeaveType(id);
      if (res.success || res._id) {
        showToast("Leave type deactivated successfully.");
        fetchLeaveTypes();
      } else {
        showToast("Failed to deactivate leave type.", "error");
      }
    } catch (err) {
      console.error("Backend leave type deactivation error", err);
      showToast(err.response?.data?.message || err.message || "Error deactivating leave type.", "error");
    }
  };

  const handleAdjustLeaveBalance = async (adjustmentData) => {
    try {
      const res = await adjustLeaveBalance(adjustmentData);
      if (res.success || res._id) {
        showToast("Employee leave balance adjusted successfully!");
        fetchCompanyLeaves();
      } else {
        showToast("Failed to adjust leave balance.", "error");
      }
    } catch (err) {
      console.error("Backend adjust balance error", err);
      showToast(err.response?.data?.message || err.message || "Error adjusting leave balance.", "error");
    }
  };

  const handleApproveSwap = (reqId) => {
    setSwapRequests(prev => prev.filter(r => r.id !== reqId));
    alert("Shift swap request approved successfully!");
  };

  const handleRejectSwap = (reqId) => {
    setSwapRequests(prev => prev.filter(r => r.id !== reqId));
    alert("Shift swap request rejected.");
  };

  const handleCalculatePayroll = () => {
    alert("Biometric attendance sync complete. Calculations updated.");
  };

  const handleApprovePayroll = () => {
    setPayrollApproved(true);
    alert("Monthly payroll approved and payslips generated!");
  };

  const handleUpdatePerformanceNotes = (empId, newNotes) => {
    setPerformanceRecords(prev => prev.map(rec => 
      rec.id === empId ? { ...rec, reviewNotes: newNotes } : rec
    ));
  };

  const tabs = [
    { id: 'overview', label: 'HR Overview' },
    { id: 'leaves', label: 'Leave Management' },
    { id: 'leave-master', label: 'Leave Master' },
    { id: 'shifts', label: 'Shift planner' },
    { id: 'payroll', label: 'Payroll Center' },
    { id: 'performance', label: 'Performance score' }
  ];

  const getTabHeader = () => {
    switch (activeTab) {
      case 'leaves':
        return { title: 'Leave Management', subtitle: 'Review, approve, and track employee leave applications and leave balances' };
      case 'leave-master':
        return { title: 'Leave Master & Quotas', subtitle: 'Configure company leave types, annual quotas, and carry-forward policies' };
      case 'shifts':
        return { title: 'Shift Planner & Rota', subtitle: 'Assign work shifts, site rotas, and monitor active employee shifts' };
      case 'payroll':
        return { title: 'Payroll Processing Center', subtitle: 'Calculate salaries, deductions, overtime, and generate monthly payslips' };
      case 'performance':
        return { title: 'Performance Scores & Reviews', subtitle: 'Evaluate staff performance scores, ratings, and review notes' };
      default:
        return { title: 'HR & Payroll Overview', subtitle: 'Monitor workforce capacity, department distributions, attendance exceptions & HR metrics' };
    }
  };
  const currentHeader = getTabHeader();

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {currentHeader.title}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {currentHeader.subtitle}
          </p>
        </div>
      </div>

      {/* Render selected HR module section */}
      <div>
        {activeTab === 'overview' && (
          <HROverview 
            stats={MOCK_STATS}
            distributionData={DEPT_DISTRIBUTION}
            leaveTrendData={LEAVE_TRENDS}
            exceptions={ATTENDANCE_EXCEPTIONS}
          />
        )}

        {activeTab === 'leaves' && (
          <HRLeaves 
            leaveRequests={leaveRequests}
            companyLeaves={companyLeaves}
            usersList={usersList}
            leaveTypes={leaveTypes}
            holidaysList={HOLIDAYS}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeavePrompt}
            onAdjustBalance={handleAdjustLeaveBalance}
          />
        )}

        {activeTab === 'leave-master' && (
          <LeaveMaster 
            leaveTypes={leaveTypes}
            onDeactivate={handleDeactivateLeaveType}
            onCreate={handleCreateLeaveType}
          />
        )}

        {activeTab === 'shifts' && (
          <HRShifts 
            shiftList={SHIFT_CONFIGS}
            swapRequests={swapRequests}
            onApproveSwap={handleApproveSwap}
            onRejectSwap={handleRejectSwap}
          />
        )}

        {activeTab === 'payroll' && (
          <HRPayrollOps />
        )}

        {activeTab === 'performance' && (
          <HRPerformance 
            performanceRecords={performanceRecords}
            onUpdateNotes={handleUpdatePerformanceNotes}
          />
        )}
      </div>

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
