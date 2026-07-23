import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import Card from '../../common/Card';

const COLORS_TYPE = ['#8FC9FF', '#A2D2FF', '#B0E0FE', '#D1E8FC', '#E5F0FA', '#34D399', '#FBBF24'];

export default function DocumentReports({ documents }) {
  
  // 1. Process project-wise document count
  const projectCounts = {};
  documents.forEach(d => {
    projectCounts[d.project] = (projectCounts[d.project] || 0) + 1;
  });
  const projectData = Object.keys(projectCounts).map(key => ({
    name: key,
    value: projectCounts[key]
  }));

  // 2. Process file type distribution
  const typeCounts = {};
  documents.forEach(d => {
    typeCounts[d.type] = (typeCounts[d.type] || 0) + 1;
  });
  const typeData = Object.keys(typeCounts).map(key => ({
    name: key,
    value: typeCounts[key]
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Chart 1: Project-wise Documents Count */}
      <Card title="Document Count by Project" subtitle="Volume of archived files inside project-wise repositories">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Bar dataKey="value" fill="#A2D2FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 2: File Type Distribution Donut Chart */}
      <Card title="Repository Format Types" subtitle="Distribution of PDF, DWG, XLSX, and ZIP files">
        <div className="h-64 flex flex-col justify-center items-center">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_TYPE[index % COLORS_TYPE.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Chart 3: Upload Timeline frequency */}
      <Card title="Document Upload trends" subtitle="Cumulative file upload velocity timeline">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <LineChart data={[
              { date: 'Jul 10', uploads: 1 },
              { date: 'Jul 15', uploads: 3 },
              { date: 'Jul 20', uploads: 5 },
              { date: 'Jul 23', uploads: documents.length }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Line type="monotone" dataKey="uploads" stroke="#2484C6" strokeWidth={3} name="Total Uploads" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Chart 4: Storage Allocation Ratio */}
      <Card title="Storage Allocation Ratio" subtitle="Current used storage MB ratio against capacity limits">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="105%">
            <BarChart data={[
              { name: 'Used Storage', value: documents.reduce((acc, d)=>acc+parseFloat(d.fileSize),0) },
              { name: 'Available Space', value: 100 * 1024 } // 100 GB in MB
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
              <Tooltip />
              <Bar dataKey="value" fill="#34D399" radius={[6, 6, 0, 0]} name="Storage (MB)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
