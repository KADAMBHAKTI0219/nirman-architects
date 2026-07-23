import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import Card from '../../common/Card';

const COLORS_PRIORITY = ['#FCA5A5', '#FBBF24', '#A2D2FF', '#E2E8F0'];
const COLORS_STATUS = ['#8FC9FF', '#A2D2FF', '#B0E0FE', '#E5F0FA', '#34D399'];

export default function TaskReports({ tasks }) {
  
  // 1. Process Task Status Counts
  const statusCounts = {
    'Pending': 0,
    'Accepted': 0,
    'In Progress': 0,
    'Review': 0,
    'Approved': 0,
    'Completed': 0
  };
  tasks.forEach(t => {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
  });
  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  // 2. Process Priority Distribution
  const priorityCounts = {
    'Critical': 0,
    'High': 0,
    'Medium': 0,
    'Low': 0
  };
  tasks.forEach(t => {
    if (priorityCounts[t.priority] !== undefined) {
      priorityCounts[t.priority]++;
    }
  });
  const priorityData = Object.keys(priorityCounts).map(key => ({
    name: key,
    value: priorityCounts[key]
  }));

  // 3. Department Wise Workload
  const deptWorkload = {};
  tasks.forEach(t => {
    if (!deptWorkload[t.dept]) {
      deptWorkload[t.dept] = { name: t.dept, estimated: 0, actual: 0 };
    }
    deptWorkload[t.dept].estimated += t.estTime || 0;
    deptWorkload[t.dept].actual += t.actualTime || 0;
  });
  const workloadData = Object.values(deptWorkload);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Chart 1: Status Distribution Bar Chart */}
      <Card title="Task Count by Stage" subtitle="Roster metrics of current task states">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Bar dataKey="value" fill="#A2D2FF" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2: Priority Donut Chart */}
      <Card title="Task Distribution by Priority" subtitle="SLA weighting of active issues">
        <div className="h-64 flex flex-col justify-center items-center">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_PRIORITY[index % COLORS_PRIORITY.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Chart 3: Estimated vs Actual Hours spent by Department */}
      <Card title="Hours Analysis by Department" subtitle="Estimated vs actual logged timesheets comparison">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <BarChart data={workloadData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Legend iconSize={10} iconType="circle" />
              <Bar dataKey="estimated" fill="#8FC9FF" name="Estimated Hours" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#A2D2FF" name="Actual Hours" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 4: Completion Wave line chart */}
      <Card title="Timesheet Completion Wave" subtitle="Average progress velocity matching active schedules">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <LineChart data={[
              { week: 'Week 1', completed: 2 },
              { week: 'Week 2', completed: 5 },
              { week: 'Week 3', completed: 8 },
              { week: 'Week 4', completed: tasks.filter(t => t.status === 'Completed').length }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#2484C6" strokeWidth={3} name="Completed Tasks" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
