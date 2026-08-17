import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Clock, XCircle, AlertCircle, Info, Sparkles, X
} from 'lucide-react';

/**
 * ReusableCalendar — Unified Calendar Engine for Nirman Architects
 * Handles Attendance (mode="attendance"), Leave Application (mode="leave"), and Leave Viewer (allowSelection=false)
 */
export default function ReusableCalendar({
  mode = 'leave', // 'leave' | 'attendance'
  allowSelection = false, // If false, calendar is read-only / interactive detail inspector (no range selection)
  showStats = true,
  year = new Date().getFullYear(),
  initialMonth = new Date().getMonth(),
  markedDates = [], // [{ date: 'YYYY-MM-DD', status: 'APPROVED'|'PENDING'|'REJECTED'|'HOLIDAY', title: 'Description' }]
  onRangeSelect,
  onDateClick,
  title,
  subtitle,
  compact = false
}) {
  const currentYear = year || new Date().getFullYear();
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // Range Selection State (only active when allowSelection is true)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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

  // Yearly Stats Summary derived safely from markedDates and past workdays
  const yearStats = useMemo(() => {
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    let holiday = 0;

    const processedDates = new Set();

    markedDates.forEach(m => {
      if (m.date) processedDates.add(m.date);
      const st = (m.status || '').toUpperCase();
      if (st === 'APPROVED' || st === 'PRESENT') approved++;
      else if (st === 'PENDING') pending++;
      else if (st === 'REJECTED' || st === 'ABSENT') rejected++;
      else if (st === 'HOLIDAY' || st === 'FESTIVAL' || st === 'OUTING') holiday++;
    });

    // Auto-count past workdays in current month that have no attendance/leave log as ABSENT
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      if (dateStr < todayStr) {
        const dateObj = new Date(currentYear, currentMonth, i);
        const dayOfWeek = dateObj.getDay();
        if (dayOfWeek !== 0 && !processedDates.has(dateStr)) {
          rejected++;
        }
      }
    }

    return { approved, pending, rejected, holiday };
  }, [markedDates, currentYear, currentMonth, todayStr]);

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

      // Check if day is disabled for selection
      let isDisabled = false;
      if (allowSelection) {
        if (mode === 'leave') isDisabled = isPast;
        else if (mode === 'attendance') isDisabled = isFuture;
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
  }, [currentYear, currentMonth, todayStr, mode, allowSelection, markedDates]);

  // Handle Day Click
  const handleDayClick = (dayItem) => {
    if (onDateClick) onDateClick(dayItem);
    setSelectedDayDetail(dayItem);

    if (allowSelection && mode === 'leave' && !dayItem.isDisabled) {
      if (!startDate || (startDate && endDate)) {
        setStartDate(dayItem.dateStr);
        setEndDate(null);
        if (onRangeSelect) onRangeSelect({ fromDate: dayItem.dateStr, toDate: '' });
      } else if (startDate && !endDate) {
        if (dayItem.dateStr < startDate) {
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
            <span>{title || 'Leave & Holiday Calendar Planner'}</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {subtitle || `Current Year ${currentYear} • Interactive leave tracking, company holidays, festivals & outings`}
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

      {/* 1.5 TOP STATS KPI CARDS (IF showStats IS TRUE) */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider block">Approved Leaves</span>
            <strong className="text-lg font-black text-emerald-900 block mt-0.5">{yearStats.approved} Days</strong>
          </div>
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider block">Pending Requests</span>
            <strong className="text-lg font-black text-amber-900 block mt-0.5">{yearStats.pending} Days</strong>
          </div>
          <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
            <span className="text-[9px] font-black text-rose-700 uppercase tracking-wider block">Rejected / Absent</span>
            <strong className="text-lg font-black text-rose-900 block mt-0.5">{yearStats.rejected} Days</strong>
          </div>
          <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
            <span className="text-[9px] font-black text-purple-700 uppercase tracking-wider block">Holidays & Outings</span>
            <strong className="text-lg font-black text-purple-900 block mt-0.5">{yearStats.holiday} Days</strong>
          </div>
        </div>
      )}

      {/* 2. LEAVE SELECTION PREVIEW BANNER (ONLY IF allowSelection IS TRUE) */}
      {allowSelection && mode === 'leave' && (startDate || endDate) && (
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
          const isStart = allowSelection && startDate === item.dateStr;
          const isEnd = allowSelection && endDate === item.dateStr;
          const isInRange = allowSelection && startDate && endDate && item.dateStr >= startDate && item.dateStr <= endDate;

          // Status badges styling
          const primaryLog = item.matchedLogs[0];
          let statusBg = 'bg-white border-slate-200 text-slate-800 hover:border-brand-primary hover:shadow-xs';
          let isAbsent = false;
          let badgeText = null;

          if (primaryLog) {
            const st = (primaryLog.status || '').toUpperCase();
            if (st === 'APPROVED' || st === 'PRESENT') {
              statusBg = 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold hover:bg-emerald-100 shadow-2xs';
              badgeText = primaryLog.code || 'LEAVE';
            } else if (st === 'PENDING') {
              statusBg = 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold hover:bg-amber-100 shadow-2xs';
              badgeText = 'PENDING';
            } else if (st === 'REJECTED' || st === 'ABSENT') {
              statusBg = 'bg-rose-50 text-rose-900 border-rose-300 font-extrabold hover:bg-rose-100 shadow-2xs';
              badgeText = 'ABSENT';
              isAbsent = true;
            } else if (st === 'CANCELLED') {
              statusBg = 'bg-slate-100 text-slate-600 border-slate-300';
            } else if (st === 'HOLIDAY' || st === 'FESTIVAL' || st === 'OUTING') {
              statusBg = 'bg-purple-50 text-purple-900 border-purple-300 font-extrabold hover:bg-purple-100 shadow-2xs';
              badgeText = st;
            }
          } else if (item.isPast && item.dayOfWeek !== 0) {
            // Past workday prior to today with no approved leave/holiday log = ABSENT (Red Mark)
            statusBg = 'bg-rose-50/70 text-rose-900 border-rose-250 font-extrabold hover:bg-rose-100/80 shadow-2xs';
            badgeText = 'ABSENT';
            isAbsent = true;
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
              title={primaryLog ? `${item.dateStr}: ${primaryLog.title || primaryLog.status}` : (isAbsent ? `${item.dateStr}: Unpunched / Absent Workday` : item.dateStr)}
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
                {badgeText ? (
                  <span className={`text-[8px] font-extrabold uppercase truncate block leading-none flex items-center gap-1 ${
                    isAbsent ? 'text-rose-700' : ''
                  }`}>
                    {isAbsent && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block shrink-0"></span>}
                    <span>{badgeText}</span>
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
          <span>Company Holiday / Festival / Outing</span>
        </div>
        {allowSelection && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary border border-brand-dark"></span>
            <span>Selected Range</span>
          </div>
        )}
      </div>

      {/* 5. DAY DETAILS INSPECTOR MODAL */}
      {selectedDayDetail && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {new Date(selectedDayDetail.dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  {selectedDayDetail.dayOfWeek === 0 ? 'Sunday Weekend OFF' : 'Standard Working Day'}
                </p>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-semibold">
              {selectedDayDetail.matchedLogs.length > 0 ? (
                selectedDayDetail.matchedLogs.map((log, idx) => {
                  const st = (log.status || '').toUpperCase();
                  let badgeStyle = 'bg-purple-50 text-purple-900 border-purple-200';
                  if (st === 'APPROVED' || st === 'PRESENT') badgeStyle = 'bg-emerald-50 text-emerald-900 border-emerald-200';
                  else if (st === 'PENDING') badgeStyle = 'bg-amber-50 text-amber-900 border-amber-200';
                  else if (st === 'REJECTED' || st === 'ABSENT') badgeStyle = 'bg-rose-50 text-rose-900 border-rose-200';

                  return (
                    <div key={idx} className={`p-3 rounded-2xl border ${badgeStyle} space-y-1`}>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase">
                        <span>{log.code || log.status}</span>
                        <span>{st}</span>
                      </div>
                      <p className="text-xs font-extrabold leading-snug">{log.title || 'Marked Event'}</p>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-center text-slate-500 text-xs font-medium">
                  {selectedDayDetail.dayOfWeek === 0 ? 'Weekly Sunday OFF' : 'Regular Work Day (No leaves or company holidays scheduled)'}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedDayDetail(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
