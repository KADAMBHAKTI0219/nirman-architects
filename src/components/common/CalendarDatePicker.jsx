import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

/**
 * CalendarDatePicker — Interactive Popover Calendar Date Picker Component
 * Uses the custom ReusableCalendar engine for selecting Start & End/Completion Dates.
 */
export default function CalendarDatePicker({
  value = '',
  onChange,
  placeholder = 'dd-mm-yyyy',
  label = '',
  required = false,
  error = '',
  id = '',
  disabled = false,
  disablePast = false,
  disableFuture = false,
  minDate = '',
  maxDate = '',
  positionUp = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial selected date or default to current date
  const parseDateStr = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const initialDateObj = useMemo(() => parseDateStr(value), [value]);

  const [currentYear, setCurrentYear] = useState(() => initialDateObj ? initialDateObj.getFullYear() : new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => initialDateObj ? initialDateObj.getMonth() : new Date().getMonth());

  // Synchronize month/year if value changes externally
  useEffect(() => {
    if (initialDateObj) {
      setCurrentYear(initialDateObj.getFullYear());
      setCurrentMonth(initialDateObj.getMonth());
    }
  }, [value]);

  // Handle outside click to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const popoverRef = useRef(null);

  // Auto scroll popover into view smoothly when opened downwards
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (popoverRef.current) {
          popoverRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 60);
    }
  }, [isOpen]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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

  const handleSelectDay = (day) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const selectedDateStr = `${currentYear}-${monthStr}-${dayStr}`;

    if (onChange) {
      onChange(selectedDateStr);
    }
    setIsOpen(false);
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  const handleSelectToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, '0');
    const dayStr = String(today.getDate()).padStart(2, '0');
    const selectedDateStr = `${year}-${monthStr}-${dayStr}`;

    setCurrentYear(year);
    setCurrentMonth(today.getMonth());
    if (onChange) {
      onChange(selectedDateStr);
    }
    setIsOpen(false);
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
    setIsOpen(false);
  };

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

    // Previous month overflow days
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    const prevDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevDays.push({
        day: prevMonthDays - i,
        isCurrentMonth: false
      });
    }

    // Current month days
    const currentDays = [];
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isSelected = (value === dateStr);
      const isToday = (dateStr === todayStr);

      let isDisabled = false;
      if (disablePast || minDate === 'today') {
        if (dateStr < todayStr) isDisabled = true;
      } else if (minDate && dateStr < minDate) {
        isDisabled = true;
      }

      if (disableFuture) {
        if (dateStr > todayStr) isDisabled = true;
      } else if (maxDate && dateStr > maxDate) {
        isDisabled = true;
      }

      currentDays.push({
        day: i,
        dateStr,
        isCurrentMonth: true,
        isSelected,
        isToday,
        isDisabled
      });
    }

    // Next month overflow days
    const totalRendered = prevDays.length + currentDays.length;
    const remainingDays = (totalRendered % 7 === 0) ? 0 : (7 - (totalRendered % 7));
    const nextDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextDays.push({
        day: i,
        isCurrentMonth: false
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentYear, currentMonth, value, disablePast, disableFuture, minDate, maxDate]);

  // Format value for display (e.g., 2026-08-17 -> Today (17 Aug 2026) or 19 Aug 2026)
  const displayFormatted = useMemo(() => {
    if (!value) return '';
    const dateObj = parseDateStr(value);
    if (!dateObj) return value;
    const d = String(dateObj.getDate()).padStart(2, '0');
    const monthAbbrs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const shortMonth = monthAbbrs[dateObj.getMonth()];
    const y = dateObj.getFullYear();

    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    const dateStr = `${y}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${d}`;

    if (dateStr === todayStr) {
      return `Today (${d} ${shortMonth} ${y})`;
    }
    return `${d} ${shortMonth} ${y}`;
  }, [value]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          {label} {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
        </label>
      )}

      {/* Input Display Field - Fixed Height h-[42px] Standard Form Field */}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-[42px] px-3.5 text-xs font-semibold rounded-xl border flex items-center justify-between cursor-pointer transition-all bg-white shadow-2xs ${
          error ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20' : 'border-slate-200 hover:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20'
        } ${disabled ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
      >
        <div className="flex items-center gap-2 overflow-hidden my-auto">
          <CalendarIcon className="w-4 h-4 text-brand-primary shrink-0" />
          <span className="truncate text-xs leading-none">
            <span className={displayFormatted ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>
              {displayFormatted || placeholder}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-1.5 my-auto">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md transition-colors leading-none flex items-center justify-center"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Calendar Popover */}
      {isOpen && (
        <div ref={popoverRef} className={`absolute left-0 ${positionUp ? 'bottom-full mb-2' : 'top-full mt-2'} z-[9999] w-72 max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-150`}>
          {/* Header Month / Year Selector */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <span className="text-xs font-extrabold text-slate-800">
                {monthNames[currentMonth]}, {currentYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
              <span key={d} className={`text-[10px] font-bold uppercase ${i === 0 || i === 6 ? 'text-rose-400' : 'text-slate-400'}`}>
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return (
                  <div key={idx} className="h-8 flex items-center justify-center text-slate-300 text-xs font-medium">
                    {item.day}
                  </div>
                );
              }

              if (item.isDisabled) {
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled
                    className="h-8 w-8 mx-auto rounded-xl text-xs font-medium text-slate-300 bg-slate-50/50 cursor-not-allowed opacity-40 select-none"
                  >
                    {item.day}
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(item.day)}
                  className={`h-8 w-8 mx-auto rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    item.isSelected
                      ? 'bg-brand-primary text-white shadow-md scale-105'
                      : item.isToday
                      ? 'border-2 border-brand-primary text-brand-primary font-black bg-brand-soft/40'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs font-semibold">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-brand-primary hover:text-brand-secondary font-bold transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
