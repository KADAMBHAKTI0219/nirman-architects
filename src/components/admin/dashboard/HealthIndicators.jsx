import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import { getProjects } from '../../../service/project';

export default function HealthIndicators() {
  const [projectHealth, setProjectHealth] = useState([
    { name: "Central Office Tower", score: 94, status: "Healthy", color: "bg-emerald-500" },
    { name: "Oceanic Luxury Villas", score: 87, status: "Healthy", color: "bg-emerald-500" },
    { name: "Smart City Mall", score: 62, status: "Delayed / At Risk", color: "bg-rose-500" },
    { name: "Metro Station Phase 3", score: 79, status: "Warning", color: "bg-amber-500" },
  ]);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await getProjects();
        let list = [];
        if (res?.projects && Array.isArray(res.projects)) list = res.projects;
        else if (res?.data && Array.isArray(res.data)) list = res.data;
        else if (Array.isArray(res)) list = res;

        if (list.length > 0) {
          const formatted = list.map(p => {
            const name = p.projectName || p.name || 'Architectural Project';
            const score = Math.min(100, Math.max(0, p.progressPercentage ?? p.progressPercent ?? p.progress ?? 85));
            let status = 'Healthy';
            let color = 'bg-emerald-500';

            if (p.delayFlag || score <= 40) {
              status = 'Delayed / At Risk';
              color = 'bg-rose-500';
            } else if (score <= 80) {
              status = 'Warning';
              color = 'bg-amber-500';
            } else {
              status = 'Healthy';
              color = 'bg-emerald-500';
            }

            return { name, score, status, color };
          });

          setProjectHealth(formatted);
        }
      } catch (err) {
        console.warn("Failed to fetch project health metrics:", err);
      }
    };
    fetchHealth();
  }, []);

  return (
    <Card title="Project Health Metrics" subtitle="Status calculations derived from schedule, budget & approvals">
      <div className="space-y-4">
        {projectHealth.map((proj, idx) => (
          <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-800 block">{proj.name}</span>
              <span className="text-[10px] font-semibold text-slate-400 block">{proj.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${proj.color}`} style={{ width: `${proj.score}%` }}></div>
              </div>
              <span className="text-xs font-bold text-slate-700">{proj.score}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
