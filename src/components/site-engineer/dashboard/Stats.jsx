import React from 'react';
import MetricCard from '../../common/MetricCard';

export default function Stats({ crewCount }) {
  const stats = [
    { title: "My Assigned Sites", value: "3 Active Sites", iconName: "Landmark", change: "Metro Station Phase 3...", isPositive: true, subtext: "currently under site work" },
    { title: "Today Site Crew", value: `${crewCount} Present`, iconName: "UserCheck", change: "Biometric checked at gate", isPositive: true, subtext: "updated real-time" },
    { title: "Issues Raised", value: "2 Critical Blocks", iconName: "AlertOctagon", change: "1 resolved today", isPositive: false, subtext: "requires PM inspection" },
    { title: "Latest Updates", value: "Concreting finished", iconName: "FileCheck", change: "1 hour ago", isPositive: true, subtext: "logged by engineer" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((s, idx) => (
        <MetricCard key={idx} {...s} />
      ))}
    </div>
  );
}
