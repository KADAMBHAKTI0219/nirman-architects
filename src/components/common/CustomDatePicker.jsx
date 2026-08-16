import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

/**
 * CustomDatePicker Component
 * Provides a custom, modern date picker popup matching the Nirman Architects theme.
 * Enforces date boundaries (minDate, maxDate) and current-year rules.
 */
export default function CustomDatePicker({
  value = '',
  onChange,
  label = '',
  placeholder = 'Select Date',
  minDate = new Date().toISOString().split('T')[0],
  maxDate = `${new Date().getFullYear()}-12-31`,
  disabled = false,
  required = false,
  alignRight = false,
  align = 'left'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  // Current view month & year in popover
  const selectedDateObj = value ? new Date(value) : todayObj;
  const [viewYear, setViewYear] = useState(selectedDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDateObj.getMonth()); // 0-indexed
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowYearDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      // Don't allow going to previous year if outside current year boundary
      if (viewYear > new Date().getFullYear()) {
        setViewMonth(11);
        setViewYear(prev => prev - 1);
      }
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < new Date().getFullYear()) {
        setViewMonth(0);
        setViewYear(prev => prev + 1);
      }
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Days matrix for viewMonth & viewYear
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0

  const daysList = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const isDisabled = (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate);
    const isToday = (dateStr === todayStr);
    const isSelected = (dateStr === value);

    daysList.push({
      day: i,
      dateStr,
      isDisabled,
      isToday,
      isSelected
    });
  }

  const handleSelectDate = (dateStr, isDisabled) => {
    if (isDisabled) return;
    if (onChange) onChange(dateStr);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    if (minDate && todayStr < minDate) return;
    if (onChange) onChange(todayStr);
    setViewYear(todayObj.getFullYear());
    setViewMonth(todayObj.getMonth());
    setIsOpen(false);
  };

  // Format date display: e.g., 15 Aug 2026 or DD-MM-YYYY
  const formatDisplay = (dStr) => {
    if (!dStr) return '';
    const [y, m, d] = dStr.split('-');
    return `${d}-${m}-${y}`;
  };

  return (
    <div className="relative w-full font-sans" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Input Bar */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-2xl flex items-center justify-between transition-all cursor-pointer select-none ${
          disabled 
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
            : isOpen 
            ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-xs' 
            : 'border-slate-200 hover:border-slate-300 text-slate-800'
        }`}
      >
        <span className={`text-xs font-extrabold ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* Popover Calendar Card */}
      {isOpen && (
        <div className={`absolute top-full ${alignRight || align === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'} mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-3xl border border-slate-200/90 shadow-2xl z-[100000] p-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800 space-y-3`}>
          
          {/* Header Month / Year Selector */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-900">
                {monthNames[viewMonth]}
              </span>
              <button
                type="button"
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>{viewYear}</span>
                <span className="text-[8px]">▼</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Year / Month Dropdown Overlay if clicked */}
          {showYearDropdown && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 animate-in fade-in duration-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Select Month</div>
              <div className="grid grid-cols-4 gap-1">
                {shortMonthNames.map((mName, idx) => (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      setViewMonth(idx);
                      setShowYearDropdown(false);
                    }}
                    className={`py-1 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                      viewMonth === idx ? 'bg-brand-primary text-slate-900' : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {mName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day Headers (MON to SUN) */}
          <div className="grid grid-cols-7 text-center gap-1">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
              <span key={d} className="text-[9px] font-black text-slate-400 uppercase tracking-wider py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 text-center gap-1">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {daysList.map(item => {
              let btnStyle = 'text-slate-700 hover:bg-slate-100 font-bold';

              if (item.isDisabled) {
                btnStyle = 'text-slate-300 cursor-not-allowed opacity-40';
              } else if (item.isSelected) {
                btnStyle = 'bg-brand-primary text-slate-900 font-black shadow-2xs scale-105';
              } else if (item.isToday) {
                btnStyle = 'bg-blue-100 text-brand-dark font-black ring-2 ring-brand-primary';
              }

              return (
                <button
                  key={item.day}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={() => handleSelectDate(item.dateStr, item.isDisabled)}
                  className={`h-8 w-full rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSelectToday}
              disabled={minDate && todayStr < minDate}
              className={`px-3 py-1 bg-brand-soft border border-brand-secondary/30 text-brand-dark rounded-xl text-[11px] font-black hover:bg-brand-primary/30 transition-colors ${
                minDate && todayStr < minDate ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              Today ({formatDisplay(todayStr)})
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-black text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
