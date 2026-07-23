import React from 'react';

export default function Stats({ pmAttendance = [], widgets = null }) {
  const presentCount = widgets ? widgets.onlineTeamCount : (pmAttendance.length || 2);
  const totalProjects = widgets ? widgets.assignedProjectsCount : "8";
  const totalTeam = widgets ? widgets.totalTeamMembers : "18";
  
  const stats = [
    { title: "Total Projects", value: totalProjects, sub: "Registered Master" },
    { title: "Active Projects", value: `${totalProjects} Active`, sub: "Currently Ongoing" },
    { title: "Delayed Projects", value: "1 Delayed", sub: "Milestone Flagged" },
    { title: "Pending Approvals", value: "3 Approvals", sub: "Awaiting Actions" },
    { title: "Total Team", value: `${totalTeam} Members`, sub: "Assigned Project Team" },
    { title: "Overdue Tasks", value: "2 Overdue", sub: "Escalated to PM" },
    { title: "Drawing Reviews", value: "4 Reviews", sub: "Blueprints Uploads" },
    { title: "Team Checked-In", value: `${presentCount} Online`, sub: "Active Checked-In" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
      {stats.map((s, idx) => (
        <div key={idx} className="bg-blue-50/30 p-3.5 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">{s.title}</span>
          <strong className="text-sm font-black text-slate-800 block mt-1 leading-none">{s.value}</strong>
          <span className="text-[8px] text-slate-455 block mt-0.5 font-semibold leading-none">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}
