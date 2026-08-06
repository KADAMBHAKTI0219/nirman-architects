import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, 
  ChevronLeft, ChevronRight, User, Info, FileText, MapPin, Laptop, ShieldCheck, Download
} from 'lucide-react';
import Card from './Card';

// Generate comprehensive calendar data with leaves, check-ins, and shift details for any given month
export function generateMonthAttendanceData(employeeName = 'Employee', month = 7, year = 2026) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  
  const records = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dateObj = new Date(year, month, i);
    const dayOfWeek = dateObj.getDay();

    let status = 'PRESENT';
    let label = 'Present';
    let code = 'P';
    let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    let timeIn = '09:00 AM';
    let timeOut = '06:00 PM';
    let hours = '9.0 hrs';
    let leaveReason = null;
    let mode = 'Office Desktop';

    // Weekend check
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = 'WEEKEND';
      label = 'Weekend';
      code = 'W';
      badgeColor = 'bg-slate-100 text-slate-500 border-slate-200';
      timeIn = 'N/A';
      timeOut = 'N/A';
      hours = '0.0 hrs';
    } 
    // Specific leaves and statuses for mock calendar data
    else if (i === 5) {
      status = 'CASUAL_LEAVE';
      label = 'Casual Leave';
      code = 'CL';
      badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      timeIn = 'On Leave';
      timeOut = 'On Leave';
      hours = '0.0 hrs';
      leaveReason = 'Personal / Family Event (Approved by HR)';
    } else if (i === 12) {
      status = 'SICK_LEAVE';
      label = 'Sick Leave';
      code = 'SL';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      timeIn = 'On Leave';
      timeOut = 'On Leave';
      hours = '0.0 hrs';
      leaveReason = 'Medical Doctor Consultation (Approved)';
    } else if (i === 15) {
      status = 'HOLIDAY';
      label = 'Public Holiday';
      code = 'H';
      badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
      timeIn = 'N/A';
      timeOut = 'N/A';
      hours = '0.0 hrs';
      leaveReason = 'Independence Day Public Holiday';
    } else if (i === 19) {
      status = 'HALF_DAY';
      label = 'Half Day';
      code = 'HD';
      badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
      timeIn = '09:00 AM';
      timeOut = '01:30 PM';
      hours = '4.5 hrs';
      leaveReason = 'First Half Leave - Dental Appointment';
    } else if (i === 24) {
      status = 'ABSENT';
      label = 'Absent / LOP';
      code = 'A';
      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
      timeIn = 'Unexcused';
      timeOut = 'Unexcused';
      hours = '0.0 hrs';
      leaveReason = 'Uninformed Absence (Loss of Pay)';
    } else if (i % 7 === 1) {
      status = 'LATE';
      label = 'Late Check-in';
      code = 'L';
      badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
      timeIn = '09:42 AM';
      timeOut = '06:15 PM';
      hours = '8.55 hrs';
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
      leaveReason,
      mode
    });
  }

  return { firstDayIndex, records };
}

export default function AttendanceCalendar({ 
  employeeName = 'All Staff Members',
  employeeRole = 'Software & Architect Team',
  month = 7, // 0-indexed (7 = August)
  year = 2026,
  onDateSelect
}) {
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);
  const [selectedDay, setSelectedDay] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calendarData = useMemo(() => {
    return generateMonthAttendanceData(employeeName, currentMonth, currentYear);
  }, [employeeName, currentMonth, currentYear]);

  // Calculate summary counts
  const summaryStats = useMemo(() => {
    let present = 0;
    let leaves = 0;
    let halfDays = 0;
    let absents = 0;
    let totalHours = 0;

    calendarData.records.forEach(r => {
      if (r.status === 'PRESENT' || r.status === 'LATE') present++;
      if (r.status === 'CASUAL_LEAVE' || r.status === 'SICK_LEAVE') leaves++;
      if (r.status === 'HALF_DAY') halfDays++;
      if (r.status === 'ABSENT') absents++;
      
      const parsed = parseFloat(r.hours);
      if (!isNaN(parsed)) totalHours += parsed;
    });

    return { present, leaves, halfDays, absents, totalHours: totalHours.toFixed(1) };
  }, [calendarData]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* 1. MONTHLY STATS SUMMARY RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Days Present</span>
          <strong className="text-lg font-black text-emerald-800">{summaryStats.present} Days</strong>
        </div>

        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Approved Leaves</span>
          <strong className="text-lg font-black text-indigo-800">{summaryStats.leaves} Days</strong>
        </div>

        <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] font-black text-sky-600 uppercase tracking-wider block">Half Days</span>
          <strong className="text-lg font-black text-sky-800">{summaryStats.halfDays} Days</strong>
        </div>

        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">Absences (LOP)</span>
          <strong className="text-lg font-black text-rose-800">{summaryStats.absents} Days</strong>
        </div>

        <div className="p-3.5 bg-brand-soft border border-brand-secondary/40 rounded-2xl text-center space-y-0.5 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Total Work Hours</span>
          <strong className="text-lg font-black text-indigo-900">{summaryStats.totalHours} hrs</strong>
        </div>
      </div>

      {/* 2. CALENDAR HEADER & MONTH SWITCHER */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-600" />
              <span>{employeeName} — Attendance & Leave Roster</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{employeeRole} &bull; Monthly Presence Audit</p>
          </div>

          {/* Month Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-4 py-1.5 bg-slate-100 font-extrabold text-slate-800 text-xs rounded-xl border border-slate-200">
              {monthNames[currentMonth]} {currentYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. CALENDAR GRID */}
        <div className="grid grid-cols-7 gap-2 pt-2 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1.5 bg-slate-100/70 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-wider">
              {d}
            </div>
          ))}

          {/* Empty padding blocks for month start day */}
          {Array.from({ length: calendarData.firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-20 bg-slate-50/30 rounded-2xl border border-slate-100 opacity-40"></div>
          ))}

          {/* Actual Calendar Days */}
          {calendarData.records.map((dayRec) => (
            <div
              key={dayRec.day}
              onClick={() => {
                setSelectedDay(dayRec);
                if (onDateSelect) onDateSelect(dayRec);
              }}
              className={`h-20 p-2 rounded-2xl border flex flex-col justify-between text-left transition-all cursor-pointer hover:shadow-3xs ${dayRec.badgeColor} ${
                selectedDay?.day === dayRec.day ? 'ring-2 ring-indigo-500 font-bold' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-black">{dayRec.day}</span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/70 backdrop-blur-xs">
                  {dayRec.code}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-bold block truncate">{dayRec.label}</span>
                {dayRec.hours !== '0.0 hrs' && (
                  <span className="text-[8px] font-mono opacity-80 block">{dayRec.hours}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 4. CODE LEGEND FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2 text-[10px] font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>P: Present / On Time</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>CL: Casual Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>SL: Sick Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>HD: Half Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>A: Absent (LOP)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>H: Holiday</span>
          </div>
        </div>

      </div>

      {/* 5. INSPECTED DATE DETAILS MODAL */}
      {selectedDay && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase font-mono">{selectedDay.dateStr}</span>
              <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{selectedDay.label} Details</h4>
            </div>
            <button 
              onClick={() => setSelectedDay(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Clock In</span>
              <strong className="text-slate-900 font-bold block">{selectedDay.timeIn}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Clock Out</span>
              <strong className="text-slate-900 font-bold block">{selectedDay.timeOut}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Hours Logged</span>
              <strong className="text-slate-900 font-bold block">{selectedDay.hours}</strong>
            </div>
          </div>

          {selectedDay.leaveReason && (
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-xs space-y-1">
              <span className="text-[9px] font-black text-indigo-600 uppercase block">Leave Request / Audit Note</span>
              <p className="text-indigo-950 font-semibold leading-relaxed">
                "{selectedDay.leaveReason}"
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
