import React from 'react';
import Card from '../../common/Card';

export default function TaskReports({ tasks = [] }) {
  
  // 1. Process Task Status Counts
  const statusCounts = {
    'Pending': 0,
    'Accepted': 0,
    'In Progress': 0,
    'Review': 0,
    'Approved': 0,
    'Completed': 0
  };
  tasks.forEach(t => {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
  });
  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  // 2. Process Priority Distribution
  const priorityCounts = {
    'Critical': 0,
    'High': 0,
    'Medium': 0,
    'Low': 0
  };
  tasks.forEach(t => {
    if (priorityCounts[t.priority] !== undefined) {
      priorityCounts[t.priority]++;
    }
  });
  const priorityData = Object.keys(priorityCounts).map(key => ({
    name: key,
    value: priorityCounts[key]
  }));

  // 3. Department Wise Workload
  const deptWorkload = {};
  tasks.forEach(t => {
    if (!deptWorkload[t.dept]) {
      deptWorkload[t.dept] = { name: t.dept, estimated: 0, actual: 0 };
    }
    deptWorkload[t.dept].estimated += t.estTime || 0;
    deptWorkload[t.dept].actual += t.actualTime || 0;
  });
  const workloadData = Object.values(deptWorkload);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Card title="Task Count by Stage" subtitle="Roster metrics of current task states">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-2">Stage</th>
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

      <Card title="Task Distribution by Priority" subtitle="SLA weighting of active issues">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priorityData.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                  <td className="px-4 py-2.5 font-semibold text-rose-600">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Hours Analysis by Department" subtitle="Estimated vs actual logged timesheets comparison">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
              <tr>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Estimated (hrs)</th>
                <th className="px-4 py-2">Actual (hrs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workloadData.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                  <td className="px-4 py-2.5 font-semibold text-blue-600">{row.estimated}</td>
                  <td className="px-4 py-2.5 font-semibold text-emerald-600">{row.actual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
