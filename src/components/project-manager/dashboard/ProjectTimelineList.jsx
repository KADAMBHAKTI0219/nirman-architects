import React from 'react';
import Card from '../../common/Card';

const pmProjects = [
  { id: 1, name: "Central Office Tower", progress: 75, deadline: "2026-09-15", status: "On Track", color: "bg-emerald-500" },
  { id: 2, name: "Oceanic Luxury Villas", progress: 62, deadline: "2026-10-30", status: "On Track", color: "bg-emerald-500" },
  { id: 3, name: "Smart City Mall", progress: 48, deadline: "2026-08-20", status: "Delayed / At Risk", color: "bg-rose-500" },
  { id: 4, name: "Metro Station Phase 3", progress: 92, deadline: "2026-07-30", status: "Nearing Completion", color: "bg-blue-500" }
];

export default function ProjectTimelineList() {
  return (
    <Card title="Active Projects & Timelines" subtitle="Track milestones, progress percentage, and deadlines">
      <div className="space-y-5">
        {pmProjects.map((p, idx) => (
          <div key={idx} className="space-y-2 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
            <div className="flex justify-between items-center text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 text-sm block">{p.name}</span>
                <span className="text-[10px] text-slate-450 font-medium">Deadline: {p.deadline}</span>
              </div>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                p.status.includes('On Track') ? 'bg-emerald-50 text-emerald-600' :
                p.status.includes('Delayed') ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {p.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${p.color}`} style={{ width: `${p.progress}%` }}></div>
              </div>
              <span className="text-xs font-bold text-slate-700">{p.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
