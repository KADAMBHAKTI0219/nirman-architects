import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import CustomSelect from '../../common/CustomSelect';

export default function PayrollToolbar({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departmentsList = [],
  selectedStatus,
  onStatusChange
}) {
  const hasActiveFilters = searchQuery || selectedDepartment || selectedStatus;

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by employee name, email, department, designation..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Department Filter */}
        <div className="min-w-[170px]">
          <CustomSelect
            value={selectedDepartment}
            onChange={(val) => onDepartmentChange(val)}
            placeholder="All Departments"
            variant="filter"
            options={[
              { value: '', label: 'All Departments' },
              ...departmentsList.map(dept => ({ value: dept, label: dept }))
            ]}
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-[150px]">
          <CustomSelect
            value={selectedStatus}
            onChange={(val) => onStatusChange(val)}
            placeholder="All Statuses"
            variant="filter"
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'GENERATED', label: 'Generated' },
              { value: 'NOT_GENERATED', label: 'Not Generated' }
            ]}
          />
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              onSearchChange('');
              onDepartmentChange('');
              onStatusChange('');
            }}
            className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
