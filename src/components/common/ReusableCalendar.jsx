import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle, Info, Sparkles 
} from 'lucide-react';

/**
 * ReusableCalendar — Unified Calendar Engine for Nirman Architects
 * Handles both Attendance (mode="attendance") and Leave (mode="leave")
 *
 * Requirements:
 * 1. Current Year Only (e.g. 2026) — No year dropdown, no prev/next year navigation.
 * 2. Leave mode: Past dates disabled for selection; today & future dates in current year enabled;
 *    future months in current year selectable.
 * 3. Attendance mode: Past dates enabled for logs inspection; future attendance selection disabled.
 * 4. Marked dates: APPROVED (Emerald), PENDING (Amber), REJECTED (Rose), CANCELLED (Gray), HOLIDAY (Purple).
 */
export default function ReusableCalendar({
  mode = 'leave', // 'leave' | 'attendance'
  year = new Date().getFullYear(),
  initialMonth = new Date().getMonth(),
  markedDates = [], // [{ date: 'YYYY-MM-DD', status: 'APPROVED'|'PENDING'|'HOLIDAY', title: 'Casual Leave' }]
  onRangeSelect,
  onDateClick,
  title,
  subtitle,
  compact = false
}) {
  const currentYear = year || new Date().getFullYear();
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // Range Selection State for Leave Mode
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Month Navigation within CURRENT YEAR ONLY (0 = Jan, 11 = Dec)
  const canPrevMonth = currentMonth > 0;
  const canNextMonth = currentMonth < 11;

  const handlePrevMonth = () => {
    if (canPrevMonth) setCurrentMonth(prev => prev - 1);
  };

  const handleNextMonth = () => {
    if (canNextMonth) setCurrentMonth(prev => prev + 1);
  };

  // Generate calendar grid days for currentMonth & currentYear
  const calendarGrid = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dateObj = new Date(currentYear, currentMonth, i);
      const dayOfWeek = dateObj.getDay();

      const isToday = (dateStr === todayStr);
      const isPast = (dateStr < todayStr);
      const isFuture = (dateStr > todayStr);

      // Check if day is disabled for selection in current mode
      let isDisabled = false;
      if (mode === 'leave') {
        isDisabled = isPast; // Past dates disabled for new leave requests
      } else if (mode === 'attendance') {
        isDisabled = isFuture; // Future dates disabled for attendance log entry
      }

      // Find any matched leave / attendance / holiday log
      const matchedLogs = markedDates.filter(m => m.date === dateStr);

      days.push({
        day: i,
        dateStr,
        dateObj,
        dayOfWeek,
        isToday,
        isPast,
        isFuture,
        isDisabled,
        matchedLogs
      });
    }

    return { firstDayIndex, days };
  }, [currentYear, currentMonth, todayStr, mode, markedDates]);

  // Handle Day Click for Leave Range Selection
  const handleDayClick = (dayItem) => {
    if (onDateClick) onDateClick(dayItem);
    setSelectedDayDetail(dayItem);

    if (mode === 'leave' && !dayItem.isDisabled) {
      if (!startDate || (startDate && endDate)) {
        setStartDate(dayItem.dateStr);
        setEndDate(null);
        if (onRangeSelect) onRangeSelect({ fromDate: dayItem.dateStr, toDate: '' });
      } else if (startDate && !endDate) {
        if (dayItem.dateStr < startDate) {
          // If clicked date is before start date, reset start date
          setStartDate(dayItem.dateStr);
          setEndDate(null);
          if (onRangeSelect) onRangeSelect({ fromDate: dayItem.dateStr, toDate: '' });
        } else {
          setEndDate(dayItem.dateStr);
          if (onRangeSelect) onRangeSelect({ fromDate: startDate, toDate: dayItem.dateStr });
        }
      }
    }
  };

  const calculateDaysCount = (from, to) => {
    if (!from || !to) return 0;
    const diff = Math.abs(new Date(to) - new Date(from));
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-150 shadow-2xs space-y-4 font-sans text-slate-800">
      
      {/* 1. HEADER & MONTH NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-brand-dark" />
            <span>{title || (mode === 'leave' ? 'Leave Application Calendar' : 'Attendance & Presence Calendar')}</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {subtitle || (mode === 'leave' ? `Current Year ${currentYear} • Select dates for leave application` : `Current Year ${currentYear} • Work logs & attendance presence`)}
          </p>
        </div>

        {/* Month Switcher (Current Year Only) */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handlePrevMonth}
            disabled={!canPrevMonth}
            className={`p-1.5 rounded-xl border transition-all ${
              canPrevMonth 
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer' 
                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
            }`}
            title={canPrevMonth ? `Go to ${monthNames[currentMonth - 1]}` : 'Current year boundary'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3.5 py-1.5 bg-slate-900 font-black text-white text-xs rounded-xl shadow-2xs tracking-wide">
            {monthNames[currentMonth]} {currentYear}
          </span>

          <button
            onClick={handleNextMonth}
            disabled={!canNextMonth}
            className={`p-1.5 rounded-xl border transition-all ${
              canNextMonth 
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 cursor-pointer' 
                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
            }`}
            title={canNextMonth ? `Go to ${monthNames[currentMonth + 1]}` : 'Current year boundary'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. LEAVE SELECTION PREVIEW BANNER (IF LEAVE MODE) */}
      {mode === 'leave' && (startDate || endDate) && (
        <div className="p-3 bg-brand-soft border border-brand-secondary/40 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-dark shrink-0" />
            <div>
              <span className="font-extrabold text-slate-900 block">
                Selected Range: {startDate} {endDate ? `→ ${endDate}` : '(Select End Date)'}
              </span>
              {startDate && endDate && (
                <span className="text-[10px] text-slate-600 font-bold block">
                  Total Duration: {calculateDaysCount(startDate, endDate)} Days
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              if (onRangeSelect) onRangeSelect({ fromDate: '', toDate: '' });
            }}
            className="text-[10px] font-black uppercase text-rose-600 hover:underline cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* 3. CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div 
            key={d} 
            className={`py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
              d === 'Sun' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100/70 text-slate-500'
            }`}
          >
            {d}
          </div>
        ))}

        {/* Empty padding blocks for month start day */}
        {Array.from({ length: calendarGrid.firstDayIndex }).map((_, idx) => (
          <div key={`empty-${idx}`} className={`${compact ? 'h-12' : 'h-16'} bg-slate-50/40 rounded-2xl border border-slate-100 opacity-30`}></div>
        ))}

        {/* Actual Month Days */}
        {calendarGrid.days.map((item) => {
          const isStart = startDate === item.dateStr;
          const isEnd = endDate === item.dateStr;
          const isInRange = startDate && endDate && item.dateStr >= startDate && item.dateStr <= endDate;

          // Status badges styling
          const primaryLog = item.matchedLogs[0];
          let statusBg = 'bg-white border-slate-200 text-slate-800 hover:border-brand-primary';
          
          if (primaryLog) {
            const st = (primaryLog.status || '').toUpperCase();
            if (st === 'APPROVED' || st === 'PRESENT') {
              statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
            } else if (st === 'PENDING') {
              statusBg = 'bg-amber-50 text-amber-800 border-amber-300';
            } else if (st === 'REJECTED' || st === 'ABSENT') {
              statusBg = 'bg-rose-50 text-rose-800 border-rose-300';
            } else if (st === 'CANCELLED') {
              statusBg = 'bg-slate-100 text-slate-500 border-slate-300';
            } else if (st === 'HOLIDAY') {
              statusBg = 'bg-purple-50 text-purple-800 border-purple-300';
            }
          }

          if (item.isDisabled) {
            statusBg = 'bg-slate-50/70 text-slate-300 border-slate-100 cursor-not-allowed';
          }

          if (isInRange) {
            statusBg = 'bg-brand-primary/20 border-brand-primary text-slate-900 font-extrabold';
          }

          if (isStart || isEnd) {
            statusBg = 'bg-brand-primary border-brand-dark text-slate-950 font-black shadow-2xs';
          }

          return (
            <div
              key={item.day}
              onClick={() => handleDayClick(item)}
              className={`${compact ? 'h-12 p-1' : 'h-16 p-1.5'} rounded-2xl border flex flex-col justify-between text-left transition-all cursor-pointer ${statusBg} ${
                item.isToday ? 'ring-2 ring-brand-dark' : ''
              }`}
              title={primaryLog ? `${item.dateStr}: ${primaryLog.title || primaryLog.status}` : item.dateStr}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-black ${item.isToday ? 'text-brand-dark underline' : ''}`}>
                  {item.day}
                </span>
                {item.isToday && (
                  <span className="text-[7px] font-black uppercase tracking-wider px-1 py-0.2 bg-brand-dark text-white rounded">
                    Today
                  </span>
                )}
              </div>

              {/* Status / Log Badges */}
              <div className="truncate">
                {primaryLog ? (
                  <span className="text-[8px] font-extrabold uppercase truncate block leading-none">
                    {primaryLog.code || primaryLog.status || 'Marked'}
                  </span>
                ) : item.dayOfWeek === 0 ? (
                  <span className="text-[8px] font-bold text-rose-400 block leading-none">OFF</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. LEGEND FOOTER */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2 text-[10px] font-bold text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Approved Leave</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Pending Request</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Rejected / Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>Company Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-primary border border-brand-dark"></span>
          <span>Selected Range</span>
        </div>
      </div>

    </div>
  );
}
