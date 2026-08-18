import React from 'react';
import { Search, Filter, RefreshCw, List, LayoutGrid, Kanban } from 'lucide-react';
import CustomSelect from './CustomSelect';

/**
 * Common Reusable SearchFilterBar Component
 * Standardizes search inputs, dropdown filters, view mode switchers, and action buttons.
 * 
 * @param {string} searchQuery - Active search text
 * @param {function} onSearchChange - Search input change callback
 * @param {string} searchPlaceholder - Input placeholder text
 * @param {Array<string|object>} filterOptions - Array of filter choices
 * @param {string} selectedFilter - Active selected filter choice
 * @param {function} onFilterChange - Filter selection change callback
 * @param {string} viewMode - Current view mode ('table' | 'grid' | 'kanban')
 * @param {function} onViewModeChange - View mode toggle callback
 * @param {function} onRefresh - Refresh action callback
 * @param {boolean} loading - Loading state for refresh spinner
 * @param {React.ReactNode} actions - Extra custom action buttons
 */
export default function SearchFilterBar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterOptions = [],
  selectedFilter = 'All',
  onFilterChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  loading = false,
  actions,
  className = ''
}) {
  return (
    <div className={`bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between ${className}`}>
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 min-w-[220px]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-semibold text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Controls: Filters, View Mode, Refresh & Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Dropdown Filter */}
        {filterOptions.length > 0 && (
          <div className="min-w-[150px]">
            <CustomSelect
              value={selectedFilter}
              onChange={(val) => onFilterChange && onFilterChange(val)}
              options={filterOptions.map(opt => ({
                value: typeof opt === 'object' ? opt.value : opt,
                label: typeof opt === 'object' ? opt.label : opt
              }))}
              variant="filter"
              placeholder="Filter..."
            />
          </div>
        )}

        {/* View Mode Switcher */}
        {viewMode && onViewModeChange && (
          <div className="p-1 bg-slate-100 rounded-xl flex gap-1 border border-slate-200/80">
            <button
              onClick={() => onViewModeChange('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all border border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-3xs"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-accent' : ''}`} />
          </button>
        )}

        {actions}
      </div>
    </div>
  );
}
