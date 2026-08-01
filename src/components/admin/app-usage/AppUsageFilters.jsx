import React, { useState } from 'react';
import { Calendar, Filter, RotateCcw, ChevronDown, X, Check } from 'lucide-react';

export default function AppUsageFilters({
  employees = [],
  selectedUserId,
  setSelectedUserId,
  dateRange,
  setDateRange,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  selectedDepartment,
  setSelectedDepartment,
  selectedDevice,
  setSelectedDevice,
  onApplyFilters,
  onResetFilters
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(fromDate || '2025-05-19');
  const [tempToDate, setTempToDate] = useState(toDate || '2025-05-25');

  const handleApplyCustomDates = () => {
    if (tempFromDate && tempToDate) {
      setFromDate(tempFromDate);
      setToDate(tempToDate);
      
      const fromObj = new Date(tempFromDate);
      const toObj = new Date(tempToDate);
      const fromFormatted = fromObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const toFormatted = toObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      setDateRange(`${fromFormatted} – ${toFormatted}`);
    }
    setShowDatePicker(false);
    onApplyFilters();
  };

  const handlePresetSelect = (presetKey) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (presetKey === 'today') {
      setFromDate(todayStr);
      setToDate(todayStr);
      setDateRange(`Today (${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`);
    } else if (presetKey === 'yesterday') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().split('T')[0];
      setFromDate(yestStr);
      setToDate(yestStr);
      setDateRange(`Yesterday (${yest.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`);
    } else if (presetKey === 'week') {
      setFromDate('2025-05-19');
      setToDate('2025-05-25');
      setDateRange('May 19 – May 25, 2025');
    } else if (presetKey === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setFromDate(firstDay);
      setToDate(todayStr);
      setDateRange('This Month');
    }

    setShowDatePicker(false);
    onApplyFilters();
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-end justify-between gap-4 relative">
      <div className="flex flex-wrap items-center gap-4 flex-1 min-w-[280px]">
        {/* 1. Employee Selector */}
        <div className="flex-1 min-w-[170px] space-y-1.5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            EMPLOYEE
          </label>
          <div className="relative">
            <select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                onApplyFilters();
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 cursor-pointer"
            >
              {employees.length > 0 ? (
                employees.map(emp => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>
                    {emp.name}
                  </option>
                ))
              ) : (
                <option value="Bhakti Kadam">Bhakti Kadam</option>
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 2. Date Range Selector (Exact UI Matching Image Snippet) */}
        <div className="flex-1 min-w-[220px] space-y-1.5 relative">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            DATE RANGE
          </label>

          <div
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100/70 transition-all select-none min-h-[42px]"
          >
            <Calendar className="w-4.5 h-4.5 text-brand-dark flex-shrink-0" />
            <div className="px-3 py-1 bg-brand-soft border border-brand-secondary rounded-full text-brand-dark font-extrabold text-xs tracking-tight shadow-2xs">
              {dateRange || 'May 19 – May 25, 2025'}
            </div>
          </div>

          {/* Date Picker Popover */}
          {showDatePicker && (
            <div className="absolute left-0 top-16 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 p-4 w-80 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-xs text-slate-900">Select Date Range</span>
                <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={() => handlePresetSelect('today')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-brand-soft text-slate-700 hover:text-brand-dark rounded-lg text-[11px] border border-slate-200 text-left transition-all"
                >
                  Today
                </button>
                <button
                  onClick={() => handlePresetSelect('yesterday')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-brand-soft text-slate-700 hover:text-brand-dark rounded-lg text-[11px] border border-slate-200 text-left transition-all"
                >
                  Yesterday
                </button>
                <button
                  onClick={() => handlePresetSelect('week')}
                  className="px-2.5 py-1.5 bg-brand-soft text-brand-dark rounded-lg text-[11px] border border-brand-secondary text-left font-extrabold"
                >
                  May 19 – May 25
                </button>
                <button
                  onClick={() => handlePresetSelect('month')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-brand-soft text-slate-700 hover:text-brand-dark rounded-lg text-[11px] border border-slate-200 text-left transition-all"
                >
                  This Month
                </button>
              </div>

              {/* Custom Date Pickers */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">From Date</label>
                  <input
                    type="date"
                    value={tempFromDate}
                    onChange={(e) => setTempFromDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-800 mt-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">To Date</label>
                  <input
                    type="date"
                    value={tempToDate}
                    onChange={(e) => setTempToDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold text-slate-800 mt-0.5"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyCustomDates}
                className="w-full py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-brand-dark" />
                Apply Date Range
              </button>
            </div>
          )}
        </div>

        {/* 3. Department Selector */}
        <div className="flex-1 min-w-[160px] space-y-1.5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            DEPARTMENT
          </label>
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                onApplyFilters();
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary appearance-none pr-8 cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              <option value="Architecture">Architecture</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Executive">Executive</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 4. Device Selector */}
        <div className="flex-1 min-w-[150px] space-y-1.5">
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            DEVICE
          </label>
          <div className="relative">
            <select
              value={selectedDevice}
              onChange={(e) => {
                setSelectedDevice(e.target.value);
                onApplyFilters();
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary appearance-none pr-8 cursor-pointer"
            >
              <option value="All Devices">All Devices</option>
              <option value="Workstation PC">Workstation PC</option>
              <option value="Laptop">Laptop</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onApplyFilters}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          Apply Filters
        </button>
        <button
          onClick={onResetFilters}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
          title="Reset Filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
