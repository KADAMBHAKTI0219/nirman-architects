import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import Card from '../../common/Card';

const COLORS_STATUS = ['#A2D2FF', '#34D399', '#8FC9FF', '#FBBF24'];
const COLORS_CATEGORY = ['#8FC9FF', '#A2D2FF', '#B0E0FE', '#D1E8FC', '#E5F0FA', '#34D399', '#FCA5A5'];

export default function DrawingReports({ drawings }) {
  
  // 1. Process Status Distribution
  const statusCounts = {};
  drawings.forEach(d => {
    statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
  });
  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  // 2. Process Category Breakdown
  const categoryCounts = {};
  drawings.forEach(d => {
    categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
  });
  const categoryData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }));

  // 3. Project-wise Drawing Count
  const projectCounts = {};
  drawings.forEach(d => {
    projectCounts[d.project] = (projectCounts[d.project] || 0) + 1;
  });
  const projectData = Object.keys(projectCounts).map(key => ({
    name: key,
    value: projectCounts[key]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Donut Chart: Status distribution */}
      <Card title="Blueprint Approval Distribution" subtitle="Sign-offs, pending drafts and GFC locked ratio">
        <div className="h-64 flex flex-col justify-center items-center">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Bar Chart: Drawings by Category */}
      <Card title="Drawings by Category" subtitle="File volume by discipline types">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Bar dataKey="value" fill="#8FC9FF" radius={[6, 6, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bar Chart: Project-wise Drawing Count */}
      <Card title="Drawings volume by Project" subtitle="Total uploaded contracts per structural site">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Bar dataKey="value" fill="#2484C6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Line Chart: Uploads timeline frequency */}
      <Card title="Blueprint Upload frequency" subtitle="Revision upload trends velocity over time">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <LineChart data={[
              { date: 'Jul 10', uploads: 2 },
              { date: 'Jul 15', uploads: 4 },
              { date: 'Jul 18', uploads: 6 },
              { date: 'Jul 20', uploads: drawings.length }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Line type="monotone" dataKey="uploads" stroke="#A2D2FF" strokeWidth={3} name="Cumulative Uploads" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
