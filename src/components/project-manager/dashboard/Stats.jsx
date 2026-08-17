import React from 'react';

export default function Stats({ projectsList = [], tasksList = [], drawingsList = [], pmAttendance = [], usersList = [] }) {
  const totalProjects = projectsList.length;
  const activeProjects = projectsList.filter(p => (p.status || '').toUpperCase() !== 'COMPLETED' && (p.status || '').toUpperCase() !== 'ARCHIVED').length;
  const delayedProjects = projectsList.filter(p => p.delayFlag || (p.status || '').toUpperCase() === 'DELAYED').length;
  
  const pendingApprovals = drawingsList.filter(d => {
    const s = (d.status || '').toUpperCase();
    return s.includes('PENDING') || s.includes('AWAITING') || s === 'OPEN';
  }).length;

  const totalTeam = usersList.length || 1;
  const presentCount = pmAttendance.filter(a => a.status === 'PRESENT' || a.clockInTime).length || Math.min(totalTeam, pmAttendance.length);

  const now = new Date();
  const overdueTasks = tasksList.filter(t => {
    const isDone = (t.status || '').toUpperCase() === 'COMPLETED' || (t.status || '').toUpperCase() === 'DONE';
    if (isDone) return false;
    if (!t.deadline && !t.dueDate) return false;
    return new Date(t.deadline || t.dueDate) < now;
  }).length;

  const drawingReviews = drawingsList.length;

  const stats = [
    { title: "Total Projects", value: `${totalProjects}`, sub: "Registered Master" },
    { title: "Active Projects", value: `${activeProjects} Active`, sub: "Currently Ongoing" },
    { title: "Delayed Projects", value: `${delayedProjects} Delayed`, sub: "Milestone Flagged" },
    { title: "Pending Approvals", value: `${pendingApprovals} Approvals`, sub: "Awaiting Actions" },
    { title: "Total Team", value: `${totalTeam} Members`, sub: "Assigned Project Team" },
    { title: "Overdue Tasks", value: `${overdueTasks} Overdue`, sub: "Escalated to PM" },
    { title: "Drawing Reviews", value: `${drawingReviews} Reviews`, sub: "Blueprints Uploads" },
    { title: "Team Checked-In", value: `${presentCount} Online`, sub: "Active Checked-In" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
      {stats.map((s, idx) => (
        <div
          key={idx}
          className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-200/80 shadow-3xs text-center hover:shadow-2xs hover:border-blue-200 transition-all"
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase block leading-tight tracking-wider">{s.title}</span>
          <strong className="text-sm font-black text-slate-800 block mt-1.5 leading-tight">{s.value}</strong>
          <span className="text-[8px] text-slate-400 block mt-1 font-semibold leading-tight">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}
