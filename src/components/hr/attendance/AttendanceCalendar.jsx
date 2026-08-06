import React from 'react';
import CommonAttendanceCalendar from '../../common/AttendanceCalendar';

export default function AttendanceCalendar() {
  return (
    <CommonAttendanceCalendar 
      employeeName="All Staff Members & Department Roster"
      employeeRole="HR Company-wide Roster Audit"
      month={7}
      year={2026}
    />
  );
}
