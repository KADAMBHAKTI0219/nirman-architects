import React from 'react';
import MetricCard from '../../common/MetricCard';

export default function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <MetricCard title="Tasks Assigned to me" value="5 Active Tasks" iconName="ClipboardList" change="1 Overdue" isPositive={false} subtext="Central Office, Smart Mall" />
      <MetricCard title="Biometric Activity Score" value="92.4 %" iconName="Percent" change="Highly Productive" isPositive={true} subtext="avg active: 7.4 hrs/day" />
    </div>
  );
}
