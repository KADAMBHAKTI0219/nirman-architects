import React from 'react';
import MetricCard from '../../common/MetricCard';

export default function Stats({ tasks = [], attendance = [], projectsList = [] }) {
  const activeTasks = tasks.filter(t => (t.status || '').toUpperCase() !== 'COMPLETED' && (t.status || '').toUpperCase() !== 'DONE').length;
  
  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    const isDone = (t.status || '').toUpperCase() === 'COMPLETED' || (t.status || '').toUpperCase() === 'DONE';
    if (isDone) return false;
    if (!t.due && !t.deadline) return false;
    return new Date(t.due || t.deadline) < now;
  }).length;

  const totalLogs = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'PRESENT' || a.clockInTime).length;
  const attendanceScore = totalLogs > 0 ? ((presentDays / totalLogs) * 100).toFixed(1) : 100;

  const projectNames = projectsList.slice(0, 2).map(p => p.name || p.projectName).join(', ') || 'Active Design Projects';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <MetricCard 
        title="Tasks Assigned to me" 
        value={`${activeTasks} Active Tasks`} 
        iconName="ClipboardList" 
        change={`${overdueTasks} Overdue`} 
        isPositive={overdueTasks === 0} 
        subtext={projectNames} 
      />
      <MetricCard 
        title="Attendance & Activity Score" 
        value={`${attendanceScore}%`} 
        iconName="Percent" 
        change={attendanceScore >= 90 ? "Highly Productive" : "Regular"} 
        isPositive={attendanceScore >= 80} 
        subtext={`Active logs: ${presentDays}/${totalLogs || 1} days`} 
      />
    </div>
  );
}
