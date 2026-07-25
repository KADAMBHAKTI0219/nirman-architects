import React from 'react';
import MetricCard from '../../common/MetricCard';

export default function Stats() {
  const stats = [
    { title: "Project Overall Progress", value: "75%", iconName: "Building2", change: "Milestone: Foundation Completed", isPositive: true, subtext: "Central Office Tower, Block A" },
    { title: "Milestone Stage", value: "Phase 3: Facade Work", iconName: "Milestone", change: "Next: Interior Fit-out", isPositive: true, subtext: "scheduled for Aug 10" },
    { title: "Approved Blueprints", value: "8 Drawings", iconName: "FileCheck", change: "2 pending client review", isPositive: true, subtext: "uploaded by lead architect" },
    { title: "Open Support Queries", value: "1 Active", iconName: "HelpCircle", change: "Reply from PM: 2 hrs ago", isPositive: true, subtext: "direct project manager channel" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((s, idx) => (
        <MetricCard key={idx} {...s} />
      ))}
    </div>
  );
}
