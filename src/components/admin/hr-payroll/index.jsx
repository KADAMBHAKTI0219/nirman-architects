import React, { useState } from 'react';
import HROverview from './HROverview';
import HRLeaves from './HRLeaves';
import HRShifts from './HRShifts';
import HRPayrollOps from './HRPayrollOps';
import HRPerformance from './HRPerformance';

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

export default function HRPayroll() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, leaves, shifts, payroll, performance

  // Leaves state
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE_REQUESTS);
  
  // Shift swap requests state
  const [swapRequests, setSwapRequests] = useState(INITIAL_SWAP_REQUESTS);

  // Payroll state
  const [payrollRecords, setPayrollRecords] = useState(INITIAL_PAYROLL);
  const [payrollApproved, setPayrollApproved] = useState(false);

  // Performance state
  const [performanceRecords, setPerformanceRecords] = useState(INITIAL_PERFORMANCE);

  const handleApproveLeave = (reqId) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === reqId ? { ...req, status: 'Approved' } : req
    ));
    alert("Leave request approved successfully!");
  };

  const handleRejectLeave = (reqId) => {
    setLeaveRequests(prev => prev.map(req => 
      req.id === reqId ? { ...req, status: 'Rejected' } : req
    ));
    alert("Leave request rejected successfully.");
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
    { id: 'shifts', label: 'Shift planner' },
    { id: 'payroll', label: 'Payroll Center' },
    { id: 'performance', label: 'Performance score' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-2 flex-wrap gap-4 bg-slate-50/20 p-2 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                activeTab === t.id
                  ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                  : 'bg-white border-slate-205 text-slate-550 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Admin HR Operations
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
            leaveBalances={LEAVE_BALANCES}
            holidaysList={HOLIDAYS}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
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
          <HRPayrollOps 
            payrollRecords={payrollRecords}
            onCalculatePayroll={handleCalculatePayroll}
            payrollApproved={payrollApproved}
            onApprovePayroll={handleApprovePayroll}
          />
        )}

        {activeTab === 'performance' && (
          <HRPerformance 
            performanceRecords={performanceRecords}
            onUpdateNotes={handleUpdatePerformanceNotes}
          />
        )}
      </div>

    </div>
  );
}
