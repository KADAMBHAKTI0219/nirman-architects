import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import Card from '../../common/Card';
import { getMyCorrections } from '../../../mockApi';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#64748B'];

export default function AttendanceReports({ logs }) {
  const [corrections, setCorrections] = useState([]);
  
  // Fetch personal correction logs on mount
  useEffect(() => {
    const fetchCorrections = async () => {
      try {
        const res = await getMyCorrections();
        if (res.success && res.corrections) {
          setCorrections(res.corrections);
        }
      } catch (err) {
        console.error("Failed to load personal corrections:", err);
      }
    };
    fetchCorrections();
  }, []);

  // Mock trend data
  const weeklyTrendData = [
    { name: 'Mon', hours: 8.5, target: 8.0 },
    { name: 'Tue', hours: 8.5, target: 8.0 },
    { name: 'Wed', hours: 8.6, target: 8.0 },
    { name: 'Thu', hours: 8.4, target: 8.0 },
    { name: 'Fri', hours: 8.7, target: 8.0 }
  ];

  // Mock status distribution
  const statusData = [
    { name: 'Present', value: 20 },
    { name: 'Late Arrival', value: 2 },
    { name: 'Absent', value: 1 }
  ];

  // Mock office vs site ratio
  const ratioData = [
    { name: 'Week 1', office: 5, site: 0 },
    { name: 'Week 2', office: 4, site: 1 },
    { name: 'Week 3', office: 3, site: 2 },
    { name: 'Week 4', office: 4, site: 1 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Line Chart: Attendance Shift hours trend */}
        <Card title="Shift Hours Velocity Trend" subtitle="Daily logged working hours against standard 8.0h shift targets">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="105%">
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                <Tooltip />
                <Legend fontSize={9} />
                <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={3} name="Logged Hours" />
                <Line type="monotone" dataKey="target" stroke="#64748B" strokeDasharray="5 5" name="Target Shift" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart: Status Distribution */}
        <Card title="Shift Status Distribution" subtitle="Monthly present, late arrival, and absent ratios">
          <div className="h-64 flex flex-col justify-center items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" layout="horizontal" iconSize={8} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Stacked Bar Chart: Office vs Site attendance */}
        <Card title="Office vs Site Check-In Ratio" subtitle="Weekly distribution of office laptop boots vs mobile GPS check-ins">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="105%">
              <BarChart data={ratioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                <Tooltip />
                <Legend />
                <Bar dataKey="office" stackId="a" fill="#A2D2FF" name="Office Laptop" />
                <Bar dataKey="site" stackId="a" fill="#34D399" name="Site GPS Mobile" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Export & Download Data panel */}
        <Card title="Attendance Timesheet Ledger" subtitle="Export authenticated biometric logs for payroll submission">
          <div className="space-y-4 pt-4 flex flex-col justify-center items-center h-48">
            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              All check-ins, timestamps, verified locations, and face validation tokens are archived securely.
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => alert("Downloading PDF Timesheet Report...")}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-805 text-white rounded-xl text-xs font-black uppercase shadow-3xs"
              >
                Export PDF
              </button>
              <button
                onClick={() => alert("Downloading Excel Spreadsheet Ledger...")}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase shadow-3xs"
              >
                Export Excel
              </button>
              <button
                onClick={() => alert("Downloading raw CSV data logs...")}
                className="px-4 py-2 border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase shadow-3xs"
              >
                Export CSV
              </button>
            </div>
          </div>
        </Card>

      </div>

      {/* Corrections Ledger Card */}
      <Card title="My Attendance Correction Requests" subtitle="Monitor the status of your submitted manual punch corrections">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Request Details</th>
                <th className="py-3 px-4">Requested Clock-In</th>
                <th className="py-3 px-4">Requested Clock-Out</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {corrections.length > 0 ? (
                corrections.map((item) => (
                  <tr key={item.id || item._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      ID: {(item.id || item._id).substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-650">
                      {item.requestedClockIn ? new Date(item.requestedClockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-650">
                      {item.requestedClockOut ? new Date(item.requestedClockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {item.reason}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        item.status === 'APPROVED' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : item.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {item.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                    No attendance correction requests submitted.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
