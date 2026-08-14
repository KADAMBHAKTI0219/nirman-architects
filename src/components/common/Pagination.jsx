import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Universal Reusable Pagination Component
 * Standardizes 10-item pagination across all Nirman Architects dashboards.
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange = null,
  pageSizeOptions = [10, 25, 50, 100]
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  // Generate page numbers array (with ellipsis if totalPages > 7)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200/80 rounded-b-2xl font-sans text-xs text-slate-600">
      
      {/* Items Summary & Page Size Select */}
      <div className="flex items-center gap-3 flex-wrap">
        <span>
          Showing <strong className="font-extrabold text-slate-900">{startItem}</strong> to{' '}
          <strong className="font-extrabold text-slate-900">{endItem}</strong> of{' '}
          <strong className="font-extrabold text-slate-900">{totalItems}</strong> entries
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
            <span className="text-slate-400 font-medium">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2 py-1 font-bold focus:outline-none focus:border-brand-secondary"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((page, idx) => (
            typeof page === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[28px] h-7 px-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-brand-primary text-slate-900 shadow-2xs border border-[#8FC9FF]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400 font-bold">...</span>
            )
          ))}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
