import React from 'react';
import { Clock, CheckCircle2, UserX, Palmtree, Calendar } from 'lucide-react';
import { StatsKpiCard } from '../../common';

export default function LeaveStats({ pendingCount = 3, approvedCount = 12, offTodayCount = 2 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-sans text-slate-800">
      <StatsKpiCard
        title="Leave Balance"
        value="18 Days"
        subtext="Annual quota allocation"
        icon={Palmtree}
        iconBg="bg-sky-50 text-sky-600"
      />
      <StatsKpiCard
        title="Pending Review"
        value={`${pendingCount} Requests`}
        subtext="Requires HR Sign-off"
        icon={Clock}
        badge="Needs Sign-off"
        badgeColor="bg-amber-50 text-amber-700"
        iconBg="bg-amber-50 text-amber-600"
      />
      <StatsKpiCard
        title="Approved (Month)"
        value={`${approvedCount} Leaves`}
        subtext="Processed by HR"
        icon={CheckCircle2}
        iconBg="bg-emerald-50 text-emerald-600"
      />
      <StatsKpiCard
        title="Off Today"
        value={`${offTodayCount} Staff`}
        subtext="Currently on leave"
        icon={UserX}
        iconBg="bg-indigo-50 text-indigo-600"
      />
      <StatsKpiCard
        title="Upcoming Holidays"
        value="2 Days"
        subtext="Next: Independence Day"
        icon={Calendar}
        iconBg="bg-purple-50 text-purple-600"
      />
    </div>
  );
}
