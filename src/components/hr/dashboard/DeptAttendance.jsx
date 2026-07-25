import React from 'react';
import Card from '../../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const deptAttendanceData = [
  { name: 'Architecture', Office: 18, Site: 0, Leave: 2 },
  { name: 'Engineering', Office: 8, Site: 22, Leave: 1 },
  { name: 'Project Mgmt', Office: 12, Site: 4, Leave: 0 },
  { name: 'Admin & HR', Office: 6, Site: 0, Leave: 1 },
  { name: 'Site Operatives', Office: 0, Site: 28, Leave: 2 },
];

export default function DeptAttendance() {
  return (
    <Card title="Department Attendance Breakdown" subtitle="Staff distribution in Office, Site, or Leaves">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={deptAttendanceData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Office" fill="#8FC9FF" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Site" fill="#A2D2FF" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Leave" fill="#FCA5A5" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
