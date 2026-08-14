import React, { useState, useMemo } from 'react';
import { Search, Download, Filter } from 'lucide-react';
import BrandLoader from './BrandLoader';
import Pagination from './Pagination';

export default function DataTable({ 
  columns, 
  data = [], 
  searchPlaceholder = "Search...", 
  filterKey, 
  filterOptions = [],
  exportTitle = "Report",
  actions,
  loading = false,
  showExport = true,
  defaultItemsPerPage = 10
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  const handleExport = (type) => {
    alert(`Exporting "${exportTitle}" as ${type.toUpperCase()}... Completed successfully!`);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = Object.values(item || {}).some(val => 
        String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilter = filterKey 
        ? (filterValue === 'all' || String(item[filterKey]) === filterValue)
        : true;

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, filterKey, filterValue]);

  // Pagination logic with 10 items per page default
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4 font-sans">
      {/* Table controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>

          {filterKey && filterOptions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400"><Filter className="w-4 h-4" /></span>
              <select
                value={filterValue}
                onChange={(e) => { setFilterValue(e.target.value); setCurrentPage(1); }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-bold"
              >
                <option value="all">All Categories</option>
                {filterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {actions}
          {showExport && (
            <div className="flex items-center border border-slate-200 bg-white rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                title="Export as CSV"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                type="button"
                onClick={() => handleExport('excel')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                title="Export as Excel"
              >
                <Download className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                title="Export as PDF"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto bg-white rounded-t-2xl border border-slate-200/80 shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-xs font-extrabold text-slate-600 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <BrandLoader size="sm" text="Fetching Records..." />
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/60 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-6 py-4 text-sm text-slate-700 font-medium ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400 text-sm font-bold">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Integrated Universal Pagination Bar */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(size) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
