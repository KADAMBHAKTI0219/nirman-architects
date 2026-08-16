import React, { useMemo } from 'react';
import ReusableCalendar from './ReusableCalendar';

export function generateMonthAttendanceData(employeeName = 'Employee', month = 7, year = 2026, backendLogs = []) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  
  const logsList = Array.isArray(backendLogs) 
    ? backendLogs 
    : (backendLogs && typeof backendLogs === 'object' ? Object.values(backendLogs).filter(x => typeof x === 'object' && x && x.date) : []);

  const records = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dateObj = new Date(year, month, i);
    const dayOfWeek = dateObj.getDay();

    const matchedLog = logsList.find(l => {
      if (!l) return false;
      const logDate = l.date || (l.clockInTime ? l.clockInTime.split('T')[0] : null);
      return logDate === dateStr;
    });

    let status = 'PRESENT';
    let label = 'Present';
    let code = 'P';
    let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let timeIn = '09:00 AM';
    let timeOut = '06:00 PM';
    let hours = '8.0 hrs';

    if (matchedLog) {
      status = matchedLog.status || 'COMPLETED';
      timeIn = matchedLog.clockInTime ? new Date(matchedLog.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
      timeOut = matchedLog.clockOutTime ? new Date(matchedLog.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (matchedLog.autoClosed ? 'Auto-Closed' : 'Active');
      hours = `${matchedLog.workingHours || 0} hrs`;

      if (matchedLog.status === 'AUTO_CLOSED' || matchedLog.autoClosed) {
        label = 'Auto-Closed';
        code = 'AC';
        badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      } else {
        label = 'Present';
        code = 'P';
        badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
    } else if (dayOfWeek === 0) {
      status = 'SUNDAY';
      label = 'Sunday (OFF)';
      code = 'SUN';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 shadow-3xs font-extrabold';
      timeIn = 'Weekly OFF';
      timeOut = 'Weekly OFF';
      hours = '0.0 hrs';
    } else if (new Date(dateStr) > new Date()) {
      status = 'PENDING';
      label = 'Upcoming';
      code = '-';
      badgeColor = 'bg-slate-50 text-slate-400 border-slate-100';
      timeIn = '-';
      timeOut = '-';
      hours = '0.0 hrs';
    } else {
      status = 'ABSENT';
      label = 'Absent / LOP';
      code = 'A';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
      timeIn = 'Unexcused';
      timeOut = 'Unexcused';
      hours = '0.0 hrs';
    }

    records.push({
      day: i,
      dateStr,
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek],
      status,
      label,
      code,
      badgeColor,
      timeIn,
      timeOut,
      hours,
      rawLog: matchedLog || null
    });
  }

  return { firstDayIndex, records };
}

export default function AttendanceCalendar({ 
  employeeName = 'All Staff Members',
  employeeRole = 'Software & Architect Team',
  month = new Date().getMonth(),
  year = new Date().getFullYear(),
  logs = [],
  onDateSelect
}) {
  const markedDates = useMemo(() => {
    const logsList = Array.isArray(logs) ? logs : [];
    return logsList.map(l => ({
      date: l.date || (l.clockInTime ? l.clockInTime.split('T')[0] : ''),
      status: (l.status || 'PRESENT').toUpperCase(),
      title: `${employeeName} - ${l.status || 'Present'}`,
      code: l.status === 'AUTO_CLOSED' ? 'AC' : 'P'
    }));
  }, [logs, employeeName]);

  return (
    <ReusableCalendar
      mode="attendance"
      year={year}
      initialMonth={month}
      markedDates={markedDates}
      onDateClick={(dayItem) => {
        if (onDateSelect) onDateSelect(dayItem);
      }}
      title={`${employeeName} — Attendance & Presence Calendar`}
      subtitle={`${employeeRole} &bull; Presence audit for current year ${year}`}
    />
  );
}
