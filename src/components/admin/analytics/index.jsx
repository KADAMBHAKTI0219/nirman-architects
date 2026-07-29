import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { 
  Search, BarChart3, Download, Calendar, Users, Building, 
  CheckSquare, FileText, CheckCircle2, Clock 
} from 'lucide-react';
import Card from '../../common/Card';
import { exportLeaveReport } from '../../../mockApi';

const COLORS = ['#8FC9FF', '#A2D2FF', '#34D399', '#EF4444'];

export default function Analytics({ defaultTab = 'projects' }) {
  const navigate = useNavigate();
  const [activeReportTab, setActiveReportTab] = useState(defaultTab); // projects, productivity, drawings, attendance, leaves

  useEffect(() => {
    setActiveReportTab(defaultTab);
  }, [defaultTab]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveReportList, setLeaveReportList] = useState([]);
  const [loadingLeaveReport, setLoadingLeaveReport] = useState(false);

  const fetchLeaveReport = async () => {
    try {
      setLoadingLeaveReport(true);
      const res = await exportLeaveReport();
      if (res && res.success && Array.isArray(res.data)) {
        setLeaveReportList(res.data);
      } else {
        setLeaveReportList([
          { name: "Alice Smith", department: "Architecture", type: "Annual", days: 6, status: "Approved", reason: "Family trip and rest days" },
          { name: "Bob Johnson", department: "Engineering", type: "Sick", days: 1, status: "Approved", reason: "Medical consultation check" },
          { name: "John Wick", department: "Management", type: "Casual", days: 1, status: "Rejected", reason: "Product launch overlay" }
        ]);
      }
    } catch (err) {
      console.warn("Failed to fetch leave report, using mock data", err);
      setLeaveReportList([
        { name: "Alice Smith", department: "Architecture", type: "Annual", days: 6, status: "Approved", reason: "Family trip and rest days" },
        { name: "Bob Johnson", department: "Engineering", type: "Sick", days: 1, status: "Approved", reason: "Medical consultation check" },
        { name: "John Wick", department: "Management", type: "Casual", days: 1, status: "Rejected", reason: "Product launch overlay" }
      ]);
    } finally {
      setLoadingLeaveReport(false);
    }
  };

  useEffect(() => {
    if (activeReportTab === 'leaves') {
      fetchLeaveReport();
    }
  }, [activeReportTab]);

  // 1. Mock Projects Report Data
  const projectsReportData = [
    { projectName: "Central Office Tower", progress: 75, completedTasks: 45, pendingTasks: 15, budget: "$150k" },
    { projectName: "Oceanic Luxury Villas", progress: 65, completedTasks: 28, pendingTasks: 8, budget: "$95k" },
    { projectName: "Smart City Mall", progress: 60, completedTasks: 32, pendingTasks: 22, budget: "$280k" }
  ];

  // 2. Mock Productivity Report Data
  const productivityReportData = [
    { name: "Alice Smith", role: "Junior Architect", completionRate: 92, focusHours: 36, delaysCount: 0 },
    { name: "Bob Johnson", role: "Site Engineer", completionRate: 95, focusHours: 42, delaysCount: 0 },
    { name: "John Wick", role: "Project Manager", completionRate: 88, focusHours: 32, delaysCount: 1 }
  ];

  // 3. Mock Drawings Report Data
  const drawingsReportData = [
    { name: "Ground Floor Wall Layout", category: "Working Drawings", version: "V2.1", status: "Approved", date: "2026-07-20" },
    { name: "First Floor Plan Draft Schema", category: "Concept Drawings", version: "V1.1", status: "GFC Locked", date: "2026-07-21" },
    { name: "Mechanical HVAC Duct Plan", category: "MEP Plans", version: "V1.0", status: "Under Review", date: "2026-07-22" }
  ];

  // 4. Mock Attendance Report Data
  const attendanceReportData = [
    { name: "Alice Smith", presentDays: 20, lateArrivals: 1, leavesCount: 1, hoursLogged: 168 },
    { name: "Bob Johnson", presentDays: 22, lateArrivals: 0, leavesCount: 0, hoursLogged: 182 },
    { name: "John Wick", presentDays: 19, lateArrivals: 2, leavesCount: 1, hoursLogged: 155 }
  ];

  const handleExport = (type) => {
    alert(`Exporting ${activeReportTab.toUpperCase()} report as ${type}... Successful.`);
  };

  const reportTabs = [
    { id: 'projects', label: 'Project Progress' },
    { id: 'productivity', label: 'Productivity Logs' },
    { id: 'drawings', label: 'Drawing Status' },
    { id: 'attendance', label: 'Attendance Registry' },
    { id: 'leaves', label: 'Leave Summary Reports' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-1 flex-wrap gap-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none pb-1">
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'projects') navigate('/admin/reports/projects');
                else if (tab.id === 'productivity') navigate('/admin/reports/productivity');
                else if (tab.id === 'drawings') navigate('/admin/reports/drawings');
                else if (tab.id === 'attendance') navigate('/admin/reports/attendance');
                else if (tab.id === 'leaves') navigate('/admin/reports/leaves');
              }}
              className={`pb-2 text-xs font-bold tracking-wide transition-all relative ${
                activeReportTab === tab.id
                  ? 'text-slate-900 font-black'
                  : 'text-slate-400 hover:text-slate-600 font-semibold'
              }`}
            >
              {tab.label}
              {activeReportTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pb-1">
          <button
            onClick={() => handleExport('PDF')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-805 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-3xs"
          >
            PDF Export
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm"
          >
            Excel Export
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE REPORT CATEGORY */}
      {activeReportTab === 'projects' && (
        <div className="space-y-6">
          {/* Recharts progress bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Projects Progress comparison" subtitle="Average milestone completions ratio across projects" className="lg:col-span-2">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="105%">
                  <BarChart data={projectsReportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="projectName" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                    <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#8FC9FF" radius={[4, 4, 0, 0]} name="Progress (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Total Milestones stats" subtitle="Accumulated project workload distribution">
              <div className="h-60 flex flex-col justify-center items-center">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed Tasks', value: 105 },
                          { name: 'Pending Tasks', value: 45 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#34D399" />
                        <Cell fill="#A2D2FF" />
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" align="center" iconSize={8} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>

          {/* Table */}
          <Card title="Project Progress Registry Table" subtitle="Detailed audit values for linked tasks, budgets, and milestones">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Project Name</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Milestones progress</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tasks Done</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tasks Pending</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Budget Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projectsReportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-805">{row.projectName}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#2484C6] w-8">{row.progress}%</span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="bg-brand-primary h-full" style={{ width: `${row.progress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-emerald-600 font-bold align-middle">{row.completedTasks} Tasks</td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{row.pendingTasks} Tasks</td>
                      <td className="px-4 py-3.5 text-right font-black text-slate-705 align-middle">{row.budget}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeReportTab === 'productivity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Task Completion Rate comparison" subtitle="Staff completion ratios mapped against milestones deadlines" className="lg:col-span-2">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="105%">
                  <BarChart data={productivityReportData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                    <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#34D399" radius={[4, 4, 0, 0]} name="Completion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Focus Hours summary" subtitle="Total focus hours logged inside projects tasks">
              <div className="h-60">
                <ResponsiveContainer width="100%" height="105%">
                  <LineChart data={[
                    { name: 'Alice', hours: 36 },
                    { name: 'Bob', hours: 42 },
                    { name: 'John', hours: 32 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                    <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" />
                    <Tooltip />
                    <Line type="monotone" dataKey="hours" stroke="#8FC9FF" strokeWidth={3} name="Hours" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card title="Staff Productivity register" subtitle="Productivity scores linked to deadline checkpoints">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Staff Name</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Completion rate</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Focus Hours</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Delay exception alerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {productivityReportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-805">{row.name}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{row.role}</td>
                      <td className="px-4 py-3.5 text-emerald-600 font-black align-middle">{row.completionRate}%</td>
                      <td className="px-4 py-3.5 text-slate-705 font-bold align-middle">{row.focusHours} Hours</td>
                      <td className="px-4 py-3.5 text-right align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          row.delaysCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>{row.delaysCount} Alerts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeReportTab === 'drawings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="Approval status breakdown" subtitle="Segmentation of blueprint GFC reviews" className="lg:col-span-3">
              <div className="h-48 flex justify-around items-center">
                {[
                  { name: 'Approved GFC', count: 12, color: 'bg-emerald-500' },
                  { name: 'Under Review', count: 4, color: 'bg-amber-500' },
                  { name: 'Revisions Requested', count: 2, color: 'bg-rose-500' }
                ].map((item, idx) => (
                  <div key={idx} className="text-center p-4 bg-slate-50 border border-slate-100 rounded-3xl w-40">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">{item.name}</span>
                    <strong className="text-2xl font-black text-slate-805 block mt-2">{item.count} Blueprints</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card title="Assigned Blueprints status report" subtitle="Blueprints categories versions, GFC locks, and release dates">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Blueprint schema name</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Version</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Release Date</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {drawingsReportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-805">{row.name}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{row.category}</td>
                      <td className="px-4 py-3.5 text-slate-705 font-bold align-middle">{row.version}</td>
                      <td className="px-4 py-3.5 text-slate-450 font-semibold align-middle">{row.date}</td>
                      <td className="px-4 py-3.5 text-right align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          row.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          row.status === 'GFC Locked' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeReportTab === 'attendance' && (
        <div className="space-y-6">
          <Card title="Attendance Registry summaries" subtitle="Weekly present log sheets, hours logged, and exception metrics">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Name</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Present Days</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Late Arrivals</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Leaves count</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Hours Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendanceReportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-805">{row.name}</td>
                      <td className="px-4 py-3.5 text-emerald-600 font-black align-middle">{row.presentDays} Days</td>
                      <td className="px-4 py-3.5 text-amber-650 font-bold align-middle">{row.lateArrivals} Delays</td>
                      <td className="px-4 py-3.5 text-rose-505 font-bold align-middle">{row.leavesCount} Days</td>
                      <td className="px-4 py-3.5 text-right font-black text-slate-705 align-middle">{row.hoursLogged} Hours</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeReportTab === 'leaves' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card title="Leave Utilization Report Dataset" subtitle="Company-wide dataset for leave planning, resource load balancing and auditing">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Name</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Leave Type</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration (Days)</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Reason / Notes</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaveReportList.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-805">{row.name || row.employeeName}</td>
                      <td className="px-4 py-3.5 text-slate-405 font-bold uppercase text-[9px] align-middle">{row.department || "Staff"}</td>
                      <td className="px-4 py-3.5 text-slate-650 font-bold align-middle">{row.type}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-extrabold align-middle">{row.days} Days</td>
                      <td className="px-4 py-3.5 text-slate-500 italic align-middle">"{row.reason}"</td>
                      <td className="px-4 py-3.5 text-right align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border leading-none ${
                          row.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          row.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}

                  {leaveReportList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-bold uppercase">
                        No leave records found in the report dataset.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
