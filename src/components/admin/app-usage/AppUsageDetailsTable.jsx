import React, { useState } from 'react';
import { LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORY_COLORS = {
  Browser: 'bg-brand-soft text-brand-dark border-brand-secondary',
  Development: 'bg-sky-50 text-sky-700 border-sky-200',
  Design: 'bg-amber-50 text-amber-700 border-amber-200',
  Communication: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Productivity: 'bg-brand-light text-brand-dark border-brand-secondary',
  Entertainment: 'bg-orange-50 text-orange-700 border-orange-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200'
};

const DEFAULT_APP_DETAILS = [
  { id: 1, name: 'Google Chrome', category: 'Browser', activeTime: '6h 15m', totalTime: '6h 45m', percent: '41.8%', status: 'Active', trendColor: '#10B981' },
  { id: 2, name: 'VS Code', category: 'Development', activeTime: '3h 20m', totalTime: '3h 45m', percent: '22.3%', status: 'Active', trendColor: '#10B981' },
  { id: 3, name: 'Figma', category: 'Design', activeTime: '2h 10m', totalTime: '2h 30m', percent: '14.6%', status: 'Active', trendColor: '#10B981' },
  { id: 4, name: 'Slack', category: 'Communication', activeTime: '1h 25m', totalTime: '1h 40m', percent: '9.5%', status: 'Active', trendColor: '#10B981' },
  { id: 5, name: 'Microsoft Excel', category: 'Productivity', activeTime: '1h 10m', totalTime: '1h 20m', percent: '7.8%', status: 'Active', trendColor: '#10B981' },
  { id: 6, name: 'YouTube', category: 'Entertainment', activeTime: '30m', totalTime: '45m', percent: '3.2%', status: 'Idle', trendColor: '#F59E0B' },
  { id: 7, name: 'Autodesk Revit', category: 'Development', activeTime: '25m', totalTime: '35m', percent: '2.5%', status: 'Active', trendColor: '#10B981' },
  { id: 8, name: 'AutoCAD', category: 'Development', activeTime: '20m', totalTime: '30m', percent: '2.1%', status: 'Active', trendColor: '#10B981' },
  { id: 9, name: 'Microsoft Teams', category: 'Communication', activeTime: '18m', totalTime: '25m', percent: '1.8%', status: 'Active', trendColor: '#10B981' },
  { id: 10, name: 'Notion', category: 'Productivity', activeTime: '15m', totalTime: '20m', percent: '1.5%', status: 'Active', trendColor: '#10B981' },
  { id: 11, name: 'Adobe Illustrator', category: 'Design', activeTime: '12m', totalTime: '18m', percent: '1.2%', status: 'Active', trendColor: '#10B981' },
  { id: 12, name: 'Adobe Photoshop', category: 'Design', activeTime: '10m', totalTime: '15m', percent: '1.0%', status: 'Active', trendColor: '#10B981' },
  { id: 13, name: 'Zoom', category: 'Communication', activeTime: '08m', totalTime: '12m', percent: '0.9%', status: 'Idle', trendColor: '#F59E0B' },
  { id: 14, name: 'Spotify', category: 'Entertainment', activeTime: '06m', totalTime: '10m', percent: '0.7%', status: 'Idle', trendColor: '#F59E0B' },
  { id: 15, name: 'Microsoft Word', category: 'Productivity', activeTime: '05m', totalTime: '08m', percent: '0.6%', status: 'Active', trendColor: '#10B981' },
  { id: 16, name: 'Postman', category: 'Development', activeTime: '04m', totalTime: '06m', percent: '0.5%', status: 'Active', trendColor: '#10B981' },
  { id: 17, name: 'GitHub Desktop', category: 'Development', activeTime: '03m', totalTime: '05m', percent: '0.4%', status: 'Active', trendColor: '#10B981' },
  { id: 18, name: 'Others', category: 'Other', activeTime: '02m', totalTime: '04m', percent: '0.3%', status: 'Idle', trendColor: '#F59E0B' }
];

export default function AppUsageDetailsTable({ appList = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const fullList = appList || [];
  const totalCount = fullList.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Paginated Slicing
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedApps = fullList.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-brand-dark" />
          <h3 className="font-extrabold text-slate-900 text-sm">Application Usage Details</h3>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <th className="py-3 px-4">Application</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Active Time</th>
              <th className="py-3 px-4">Total Time</th>
              <th className="py-3 px-4">% Usage</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {paginatedApps.length > 0 ? (
              paginatedApps.map((app) => (
                <tr key={app.id || app.name} className="hover:bg-slate-50/80 transition-colors">
                  {/* Application Name & Icon */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs">
                      {(app.name || 'A')[0]}
                    </div>
                    <span>{app.name}</span>
                  </td>

                  {/* Category Badge */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${CATEGORY_COLORS[app.category] || CATEGORY_COLORS.Other}`}>
                      {app.category}
                    </span>
                  </td>

                  {/* Active Time */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    {app.activeTime}
                  </td>

                  {/* Total Time */}
                  <td className="py-3.5 px-4 font-semibold text-slate-500">
                    {app.totalTime}
                  </td>

                  {/* % Usage */}
                  <td className="py-3.5 px-4 font-extrabold text-slate-800">
                    {app.percent}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {app.status === 'Active' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded-full border border-emerald-200 text-[10px] inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-extrabold rounded-full border border-amber-200 text-[10px] inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Idle
                      </span>
                    )}
                  </td>

                  {/* Sparkline Trend Graph */}
                  <td className="py-3.5 px-4 text-right">
                    <svg className="w-16 h-6 inline-block" viewBox="0 0 60 20" fill="none">
                      <path
                        d={app.status === 'Active' ? "M 0 15 Q 15 5 30 12 T 60 4" : "M 0 6 Q 15 14 30 8 T 60 16"}
                        stroke={app.trendColor || (app.status === 'Active' ? '#10B981' : '#F59E0B')}
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <LayoutGrid className="w-8 h-8 text-slate-300 mx-auto" />
                    <span className="text-xs font-bold text-slate-600">No Application Usage Data Recorded</span>
                    <span className="text-[11px] text-slate-400">No desktop activity logs found for this employee and date range.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
        <div>
          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, totalCount)} of {totalCount} applications
        </div>

        <div className="flex items-center gap-1">
          {/* Previous Page */}
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Number Buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === page ? 'bg-brand-primary text-brand-dark font-extrabold shadow-2xs' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Page */}
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
