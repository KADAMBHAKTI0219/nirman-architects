import React from 'react';
import MetricCard from '../../common/MetricCard';

export default function Stats({ checkInText, checkInStatus, isPositive }) {
  const stats = [
    { title: "Today Biometrics", value: checkInText, iconName: "Fingerprint", change: checkInStatus, isPositive: isPositive, subtext: "biometric gate sync" },
    { title: "My Assigned Tasks", value: "3 Tasks", iconName: "CheckSquare", change: "1 Nearing Deadline", isPositive: false, subtext: "Central Office layouts..." },
    { title: "Drawings Assigned", value: "2 blue prints", iconName: "DraftingCompass", change: "1 under review", isPositive: true, subtext: "revisions requested by PM" },
    { title: "Weekly Active Hours", value: "38.5 hrs", iconName: "Clock3", change: "Target: 40 hrs", isPositive: true, subtext: "productivity scorecard" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((s, idx) => (
        <MetricCard key={idx} {...s} />
      ))}
    </div>
  );
}
