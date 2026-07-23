import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line 
} from 'recharts';
import { 
  Clock, FileText, CheckSquare, Bell, MessageSquare, Eye, Download, 
  AlertTriangle, Filter, ChevronRight, X 
} from 'lucide-react';
import Card from '../../common/Card';
import { getMyAttendance } from '../../../services/attendance.api';

const TIME_LOGS = [
  { day: 'Mon', 'Noida Office': 4, 'Goa Beachfront': 2, 'Smart Mall': 2 },
  { day: 'Tue', 'Noida Office': 5, 'Goa Beachfront': 3, 'Smart Mall': 1 },
  { day: 'Wed', 'Noida Office': 3, 'Goa Beachfront': 4, 'Smart Mall': 2 },
  { day: 'Thu', 'Noida Office': 6, 'Goa Beachfront': 2, 'Smart Mall': 1 },
  { day: 'Fri', 'Noida Office': 4, 'Goa Beachfront': 4, 'Smart Mall': 2 }
];

const PHASE_BREAKDOWN = [
  { name: 'Concept Design', value: 30, color: '#2484C6' },
  { name: 'Schematic Phase', value: 25, color: '#38BDF8' },
  { name: 'GFC Drawings', value: 35, color: '#818CF8' },
  { name: 'Site Visits', value: 10, color: '#34D399' }
];

const DRAWING_STATUS = [
  { name: 'Approved', value: 12, color: '#10B981' },
  { name: 'Under Review', value: 4, color: '#F59E0B' },
  { name: 'Correction Needed', value: 1, color: '#EF4444' }
];

const WEEKLY_HOURS = [
  { week: 'Wk 1', hours: 38 },
  { week: 'Wk 2', hours: 42 },
  { week: 'Wk 3', hours: 40 },
  { week: 'Wk 4', hours: 44 }
];

const WORKLOAD_COMP = [
  { project: 'Noida Office', workload: 15 },
  { project: 'Goa Villas', workload: 12 },
  { project: 'Smart Mall', workload: 8 }
];

const RECENT_TASKS = [
  { id: "TSK-301", title: "Detail the staircase treads & balustrades blueprints", project: "Central Office Tower", priority: "High", status: "In Progress", due: "July 25" },
  { id: "TSK-302", title: "HVAC Duct Sizing & Layout Drafts", project: "Smart City Mall", priority: "Critical", status: "Review", due: "July 20" },
  { id: "TSK-303", title: "Facade Mockup Rendering revisions", project: "Central Office Tower", priority: "Low", status: "To Do", due: "July 30" }
];

export default function Dashboard() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [myAttendance, setMyAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMyAttendance = async () => {
      try {
        setLoading(true);
        const response = await getMyAttendance();
        if (response.success && Array.isArray(response.data)) {
          setMyAttendance(response.data);
        }
      } catch (err) {
        console.error('Failed to load my attendance data', err);
      } finally {
        setLoading(false);
      }
    };
    loadMyAttendance();
  }, []);

  const totalLoggedHours = myAttendance.reduce((acc, log) => {
    if (!log.clockInTime) return acc;
    const checkin = new Date(log.clockInTime);
    const checkout = log.clockOutTime ? new Date(log.clockOutTime) : new Date();
    const diffHours = (checkout - checkin) / (1000 * 60 * 60);
    return acc + Math.round(diffHours);
  }, 0) || 42;

  // Sparkline data helpers
  const renderSparkline = (data, strokeColor = '#2484C6') => (
    <div className="w-16 h-8 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="val" stroke={strokeColor} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. GREETING HEADER */}
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Studio Design Analytics</h2>
        <p className="text-xs text-slate-405">Track active project phases, time entries, drawing approval pipelines, and weekly hours streaks</p>
      </div>

      {/* 2. KPI CARDS WITH SPARKLINES */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Open Tasks</span>
            <strong className="text-base font-black text-slate-800 block mt-0.5">8 Tasks</strong>
          </div>
          {renderSparkline([{ val: 2 }, { val: 4 }, { val: 3 }, { val: 5 }, { val: 8 }], '#2484C6')}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Drawings</span>
            <strong className="text-base font-black text-slate-800 block mt-0.5">4 Plans</strong>
          </div>
          {renderSparkline([{ val: 1 }, { val: 2 }, { val: 2 }, { val: 3 }, { val: 4 }], '#818CF8')}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Logged Hours</span>
            <strong className="text-base font-black text-emerald-600 block mt-0.5">{totalLoggedHours} hrs</strong>
          </div>
          {renderSparkline([{ val: 6 }, { val: 8 }, { val: 7 }, { val: 8 }, { val: 8 }, { val: 5 }], '#10B981')}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Overdue Items</span>
            <strong className="text-base font-black text-rose-500 block mt-0.5">2 Items</strong>
          </div>
          {renderSparkline([{ val: 0 }, { val: 1 }, { val: 1 }, { val: 2 }, { val: 2 }], '#EF4444')}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Unread Chats</span>
            <strong className="text-base font-black text-slate-700 block mt-0.5">3 Chats</strong>
          </div>
          {renderSparkline([{ val: 0 }, { val: 2 }, { val: 1 }, { val: 2 }, { val: 3 }], '#64748B')}
        </div>

      </div>

      {/* 3. CENTER HERO AREA (Large Stacked Area Chart + Alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Large Stacked Area Chart */}
        <Card title="Project Time Log Allocation" subtitle="Daily hours logged across projects" className="lg:col-span-2">
          <div className="h-[320px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TIME_LOGS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNoida" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2484C6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2484C6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGoa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: '1px solid #E2E8F0' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Area type="monotone" dataKey="Noida Office" stroke="#2484C6" fillOpacity={1} fill="url(#colorNoida)" stackId="1" />
                <Area type="monotone" dataKey="Goa Beachfront" stroke="#818CF8" fillOpacity={1} fill="url(#colorGoa)" stackId="1" />
                <Area type="monotone" dataKey="Smart Mall" stroke="#34D399" fillOpacity={0} stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right side alerts list */}
        <Card title="Activity & Approvals" subtitle="Live feed of GFC approvals and revisions">
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 pt-2 scrollbar-thin">
            {[
              { text: "Ground Floor Wall Layout approved by PM Sarah Connor", time: "2 hours ago", type: "success" },
              { text: "Client Bruce Wayne requested elevation details sync", time: "4 hours ago", type: "info" },
              { text: "Correction needed on HVAC duct sizing blueprint", time: "1 day ago", type: "warning" }
            ].map((al, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5 text-xs font-bold text-slate-655 leading-normal">
                {al.type === 'success' && <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                {al.type === 'info' && <MessageSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                {al.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                <div>
                  <span>{al.text}</span>
                  <span className="text-[9px] text-slate-400 block font-semibold mt-1">{al.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* 4. SIDE WIDGETS (Donut & Status Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Time log Donut */}
        <Card title="Phase Log Breakdown" subtitle="Time distribution across design phases">
          <div className="h-[220px] flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={PHASE_BREAKDOWN} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={70} 
                  paddingAngle={3}
                  dataKey="value"
                >
                  {PHASE_BREAKDOWN.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 9, paddingLeft: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Drawing Status Donut */}
        <Card title="Drawing Status Split" subtitle="CAD blueprints verification status">
          <div className="h-[220px] flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={DRAWING_STATUS} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={70} 
                  paddingAngle={3}
                  dataKey="value"
                >
                  {DRAWING_STATUS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 9, paddingLeft: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Task Priority Bar Chart */}
        <Card title="Roster Workload Split" subtitle="Active tasks breakdown by project name">
          <div className="h-[220px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WORKLOAD_COMP} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="project" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                <Bar dataKey="workload" fill="#2484C6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* 5. BOTTOM ROW (Weekly hours + Workload comparison) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card title="Weekly Hours Streak" subtitle="Logged time sheet trends over weeks">
          <div className="h-[200px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_HOURS} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                <Line type="monotone" dataKey="hours" stroke="#2484C6" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Tasks registry */}
        <Card title="Active Task Assignments" subtitle="Current design targets and deadlines">
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Task Details</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {RECENT_TASKS.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/40">
                    <td className="px-4 py-3.5 align-middle">
                      <strong className="text-slate-805 block">{t.title}</strong>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{t.project}</td>
                    <td className="px-4 py-3.5 text-slate-450 align-middle">{t.due}</td>
                    <td className="px-4 py-3.5 text-right align-middle">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        t.status === 'Review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        t.status === 'In Progress' ? 'bg-blue-50 text-[#2484C6] border-blue-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

    </div>
  );
}
