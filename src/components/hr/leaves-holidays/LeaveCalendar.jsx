import React from 'react';
import ReusableCalendar from '../../common/ReusableCalendar';

export default function LeaveCalendar({ leaves = [], onRangeSelect }) {
  // Format real leave data into marked dates
  const markedDates = (Array.isArray(leaves) ? leaves : []).map(l => ({
    date: l.fromDate ? l.fromDate.split('T')[0] : (l.date ? l.date.split('T')[0] : ''),
    status: (l.status || 'PENDING').toUpperCase(),
    title: l.leaveTypeName || l.reason || 'Leave Request',
    code: l.status ? l.status.substring(0, 3).toUpperCase() : 'REQ'
  }));

  return (
    <ReusableCalendar 
      mode="leave"
      year={new Date().getFullYear()}
      markedDates={markedDates}
      onRangeSelect={onRangeSelect}
      title="Leave Calendar Planner"
      subtitle="Dynamic employee leave schedule & planner for current year"
    />
  );
}
