import React from 'react';

export default function Stats({ pmAttendance = [], widgets = null }) {
  const presentCount = widgets?.onlineCount ?? widgets?.onlineTeamCount ?? (pmAttendance.length || 14);
  const totalProjects = widgets?.assignedProjectsCount ?? widgets?.totalProjects ?? 8;
  const totalTeam = widgets?.totalTeamMembers ?? widgets?.totalUsers ?? 18;

  const stats = [
    { title: "Total Projects", value: `${totalProjects}`, sub: "Registered Master" },
    { title: "Active Projects", value: `${totalProjects} Active`, sub: "Currently Ongoing" },
    { title: "Delayed Projects", value: "1 Delayed", sub: "Milestone Flagged" },
    { title: "Pending Approvals", value: "3 Approvals", sub: "Awaiting Actions" },
    { title: "Total Team", value: `${totalTeam} Members`, sub: "Assigned Project Team" },
    { title: "Overdue Tasks", value: "2 Overdue", sub: "Escalated to PM" },
    { title: "Drawing Reviews", value: "4 Reviews", sub: "Blueprints Uploads" },
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

