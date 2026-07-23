import React, { useState } from 'react';
import LeaveStats from './LeaveStats';
import LeaveCalendar from './LeaveCalendar';
import LeaveRequestsInbox from './LeaveRequestsInbox';
import LeaveHistoryTable from './LeaveHistoryTable';

const INITIAL_REQUESTS = [
  { id: 1, name: "Alice Smith", role: "Jr Architect", dept: "Architecture", type: "Annual", dates: "July 29 - Aug 04", days: 6, reason: "Family trip and rest days", status: "Pending" },
  { id: 2, name: "Bob Johnson", role: "Site Engineer", dept: "Engineering", type: "Sick", dates: "July 25 - July 26", days: 1, reason: "Medical consultation check", status: "Pending" },
  { id: 3, name: "Charlie Brown", role: "Drafter", dept: "Architecture", type: "Casual", dates: "Aug 02 - Aug 09", days: 7, reason: "Annual vacation and rest", status: "Pending" }
];

export default function LeavesHolidays() {
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_REQUESTS);

  const handleApprove = (id) => {
    setLeaveRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'Approved' } : r
    ));
    alert("Leave request approved!");
  };

  const handleReject = (id) => {
    setLeaveRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'Rejected' } : r
    ));
    alert("Leave request rejected.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
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
        leaveRequests={leaveRequests}
      />

    </div>
  );
}
