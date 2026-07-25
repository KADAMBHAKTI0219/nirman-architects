import React from 'react';
import MetricCard from '../../common/MetricCard';

export default function HRStats({ attendanceRate }) {
  const stats = [
    { title: "Active Employees", value: "104", iconName: "Users", change: "+4 this month", isPositive: true, subtext: "across 5 offices" },
    { title: "Today Attendance", value: "94 / 104", iconName: "Fingerprint", change: `${attendanceRate} present`, isPositive: true, subtext: "4 late, 6 absent" },
    { title: "Pending Leaves", value: "3 requests", iconName: "CalendarDays", change: "2 urgent leaves", isPositive: false, subtext: "requires review" },
    { title: "Next Appraisal Cycle", value: "Aug 2026", iconName: "Award", change: "15 reviews pending", isPositive: true, subtext: "annual review prep" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((s, idx) => (
        <MetricCard key={idx} {...s} />
      ))}
    </div>
  );
}
