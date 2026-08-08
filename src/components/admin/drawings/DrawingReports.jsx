import React from 'react';
import Card from '../../common/Card';

export default function DrawingReports({ drawings = [] }) {
  
  // 1. Process Status Distribution
  const statusCounts = {};
  drawings.forEach(d => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
  });
  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  // 2. Process Category Breakdown
  const categoryCounts = {};
  drawings.forEach(d => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }));

  // 3. Project-wise Drawing Count
  const projectCounts = {};
  drawings.forEach(d => {
    projectCounts[d.project] = (projectCounts[d.project] || 0) + 1;
  });
  const projectData = Object.keys(projectCounts).map(key => ({
    name: key,
    value: projectCounts[key]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Card title="Blueprint Approval Distribution" subtitle="Sign-offs, pending drafts and GFC locked ratio">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-2">Approval Status</th>
                <th className="px-4 py-2">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {statusData.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                  <td className="px-4 py-2.5 font-semibold text-blue-600">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Drawings by Category" subtitle="File volume by discipline types">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Total Files</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryData.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-600">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Drawings volume by Project" subtitle="Total uploaded contracts per structural site">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-2">Project Name</th>
                <th className="px-4 py-2">Drawing Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectData.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                  <td className="px-4 py-2.5 font-semibold text-indigo-600">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
