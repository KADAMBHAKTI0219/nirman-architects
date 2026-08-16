import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, FileText, CheckCircle2, MessageSquare, AlertCircle, 
  ChevronRight, RefreshCw, Inbox, FileCheck, PieChart, Layers, 
  ClipboardList, Users, ClipboardCheck, ChevronDown
} from 'lucide-react';
import Card from '../../common/Card';
import { getTasks } from '../../../service/task';
import { getProjectDrawings } from '../../../service/drawing';
import { getMyAttendance } from '../../../service/hrm/attendance';
import { getUnreadCounts } from '../../../service/chat';
import { getProjects } from '../../../service/project';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [monthFilter, setMonthFilter] = useState('This Month');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 0. Fetch User Assigned Projects
      let pId = '';
      try {
        const projRes = await getProjects();
        if (projRes?.projects && Array.isArray(projRes.projects) && projRes.projects.length > 0) {
          setProjectsList(projRes.projects);
          pId = projRes.projects[0]._id || projRes.projects[0].id || '';
        }
      } catch (e) {}

      // 1. Fetch Tasks
      const taskRes = await getTasks();
      let rawTasks = [];
      if (taskRes?.success && Array.isArray(taskRes.tasks)) {
        rawTasks = taskRes.tasks.map((t, idx) => ({
          id: t._id ? `TSK-${t._id.slice(-5).toUpperCase()}` : `TSK-${idx + 301}`,
          _id: t._id,
          title: t.taskName || t.title || 'Architectural Task',
          project: (typeof t.projectId === 'object' ? t.projectId?.projectName : t.project) || 'General Project',
          priority: t.priority || 'Medium',
          status: t.status || 'In Progress',
          due: t.deadline ? new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due Date',
          phase: t.category || 'GFC Drawings',
          estHours: t.estimatedTime || 0,
          loggedHours: t.totalWorkingTimeMinutes ? Math.round(t.totalWorkingTimeMinutes / 60) : 0
        }));
      }
      setTasks(rawTasks);

      // 2. Fetch Drawings for Assigned Project
      const dwgRes = await getProjectDrawings(pId);
      if (dwgRes?.allDrawings && Array.isArray(dwgRes.allDrawings)) {
        setDrawings(dwgRes.allDrawings);
      } else if (dwgRes?.drawings && Array.isArray(dwgRes.drawings)) {
        setDrawings(dwgRes.drawings);
      } else {
        setDrawings([]);
      }

      // 3. Fetch Attendance
      const attRes = await getMyAttendance();
      if (attRes?.success && Array.isArray(attRes.data)) {
        setMyAttendance(attRes.data);
      } else {
        setMyAttendance([]);
      }

      // 4. Fetch Unread Chats
      const chatRes = await getUnreadCounts();
      if (chatRes?.unreadCounts) {
        const total = Object.values(chatRes.unreadCounts).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0);
        setUnreadCount(total);
      } else {
        setUnreadCount(0);
      }
    } catch (err) {
      console.warn("Failed to load studio analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = loadDashboardData;

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Dynamic KPI Metrics
  const openTasksCount = tasks.filter(t => t.status !== 'Completed' && t.status !== 'APPROVED').length;
  const pendingDrawingsCount = drawings.filter(d => d.status === 'PENDING_CLIENT_APPROVAL' || d.status === 'UNDER_REVIEW' || d.status === 'Review').length;
  
  const totalLoggedHours = myAttendance.reduce((acc, log) => {
    if (!log.clockInTime && !log.time) return acc;
    const checkin = new Date(log.clockInTime || log.time);
    const checkout = log.clockOutTime ? new Date(log.clockOutTime) : new Date();
    const diffHours = (checkout - checkin) / (1000 * 60 * 60);
    return acc + Math.max(0, Math.round(diffHours));
  }, 0);

  const overdueCount = tasks.filter(t => t.due && t.due !== 'No Due Date' && new Date(t.due) < new Date() && t.status !== 'Completed').length;

  // Dynamic Phase Breakdown
  const phaseMap = {};
  tasks.forEach(t => {
    const pName = t.phase || 'General';
    phaseMap[pName] = (phaseMap[pName] || 0) + (t.loggedHours || 1);
  });
  const totalPhaseHours = Object.values(phaseMap).reduce((a, b) => a + b, 0) || 1;
  const phaseBreakdown = Object.keys(phaseMap).map(pName => ({
    name: pName,
    value: Math.round((phaseMap[pName] / totalPhaseHours) * 100)
  }));

  // Dynamic Drawing Status Split
  const approvedCount = drawings.filter(d => d.status === 'APPROVED').length;
  const underReviewCount = drawings.filter(d => d.status === 'PENDING_CLIENT_APPROVAL' || d.status === 'UNDER_REVIEW').length;
  const correctionCount = drawings.filter(d => d.status === 'CHANGES_REQUESTED' || d.status === 'REJECTED').length;
  
  const drawingStatusSplit = [
    { name: 'Approved', value: approvedCount, color: 'bg-emerald-500' },
    { name: 'Under Review', value: underReviewCount, color: 'bg-blue-500' },
    { name: 'Correction Needed', value: correctionCount, color: 'bg-rose-500' }
  ];

  // Dynamic Workload Split by Project
  const workloadMap = {};
  tasks.forEach(t => {
    const pName = t.project || 'General Project';
    workloadMap[pName] = (workloadMap[pName] || 0) + 1;
  });
  const workloadSplit = Object.keys(workloadMap).map(pName => ({
    project: pName,
    workload: workloadMap[pName]
  }));

  // Dynamic Live Feed Activity
  const liveActivities = [];
  drawings.forEach(dwg => {
    if (dwg.status === 'APPROVED') {
      liveActivities.push({ text: `Blueprint '${dwg.title}' approved by PM / Client`, time: 'Recently', type: 'success' });
    } else if (dwg.status === 'CHANGES_REQUESTED') {
      liveActivities.push({ text: `Correction requested on '${dwg.title}' blueprint`, time: 'Recently', type: 'warning' });
    } else {
      liveActivities.push({ text: `Revision uploaded for '${dwg.title}' pending review`, time: 'Recently', type: 'info' });
    }
  });

  const renderSparkline = (color = '#3B82F6') => (
    <svg className="w-14 h-7" viewBox="0 0 50 25">
      <path
        d="M 0,20 L 10,14 L 20,17 L 30,8 L 40,11 L 50,4"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. GREETING & SYNC HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Studio Design Analytics</h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Live sync with studio backend databases</p>
        </div>

        <button 
          onClick={loadDashboardData}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-blue-600 rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
          title="Refresh Dynamic Analytics"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. TOP ROW: 5 SPARKLINE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* Open Tasks Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3 hover:border-blue-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Open Tasks</span>
              <strong className="text-base font-black text-slate-900 block mt-0.5">{openTasksCount} Tasks</strong>
            </div>
          </div>
          {renderSparkline('#3B82F6')}
        </div>

        {/* Pending Drawings Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3 hover:border-purple-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending Drawings</span>
              <strong className="text-base font-black text-slate-900 block mt-0.5">{pendingDrawingsCount} Plans</strong>
            </div>
          </div>
          {renderSparkline('#8B5CF6')}
        </div>

        {/* Logged Hours Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Logged Hours</span>
              <strong className="text-base font-black text-slate-900 block mt-0.5">{totalLoggedHours} hrs</strong>
            </div>
          </div>
          {renderSparkline('#10B981')}
        </div>

        {/* Overdue Items Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3 hover:border-rose-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Overdue Items</span>
              <strong className="text-base font-black text-slate-900 block mt-0.5">{overdueCount} Items</strong>
            </div>
          </div>
          {renderSparkline('#EF4444')}
        </div>

        {/* Unread Chats Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3 hover:border-amber-200 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Unread Chats</span>
              <strong className="text-base font-black text-slate-900 block mt-0.5">{unreadCount} Chats</strong>
            </div>
          </div>
          {renderSparkline('#F59E0B')}
        </div>

      </div>

      {/* 3. ROW 2: WORKLOAD SPLIT & ACTIVITY FEED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Roster Workload Split */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Roster Workload Split</h3>
                <p className="text-[11px] font-medium text-slate-400">Active tasks breakdown by project name</p>
              </div>
            </div>

            <div className="relative">
              <select 
                value={projectFilter} 
                onChange={(e) => setProjectFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 pr-8 focus:outline-none cursor-pointer"
              >
                <option value="All Projects">All Projects</option>
                {projectsList.map(p => (
                  <option key={p._id || p.id} value={p.projectName || p.name}>{p.projectName || p.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {workloadSplit.length > 0 ? (
            <div className="space-y-3 pt-2">
              {workloadSplit.map((row) => (
                <div key={row.project} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-800">{row.project}</span>
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {row.workload} tasks
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6 text-blue-500" />
              </div>
              <strong className="text-xs font-bold text-slate-700 block">No project tasks found in system.</strong>
              <p className="text-[11px] text-slate-400 font-medium">Tasks assigned to projects will appear here.</p>
            </div>
          )}
        </div>

        {/* Activity & Approvals */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Activity & Approvals</h3>
                <p className="text-[11px] font-medium text-slate-400">Live feed of GFC approvals and revisions</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/architect/drawings')}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {liveActivities.length > 0 ? (
            <div className="space-y-3 pt-1 max-h-[220px] overflow-y-auto pr-1">
              {liveActivities.map((al, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5 text-xs font-bold text-slate-700">
                  <FileCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span>{al.text}</span>
                    <span className="text-[9px] text-slate-400 block font-medium mt-0.5">{al.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                <FileCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <strong className="text-xs font-bold text-slate-700 block">No recent activity events.</strong>
              <p className="text-[11px] text-slate-400 font-medium">Approval and revision updates will appear here.</p>
            </div>
          )}
        </div>

      </div>

      {/* 4. ROW 3: PHASE LOG BREAKDOWN & DRAWING STATUS SPLIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Phase Log Breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                <PieChart className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Phase Log Breakdown</h3>
                <p className="text-[11px] font-medium text-slate-400">Time distribution across design phases</p>
              </div>
            </div>

            <div className="relative">
              <select 
                value={monthFilter} 
                onChange={(e) => setMonthFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 pr-8 focus:outline-none cursor-pointer"
              >
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="Quarterly">Quarterly</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {phaseBreakdown.length > 0 ? (
            <div className="space-y-3 pt-2">
              {phaseBreakdown.map((row) => (
                <div key={row.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{row.name}</span>
                  <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                    {row.value}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center mx-auto">
                <PieChart className="w-6 h-6 text-purple-500" />
              </div>
              <strong className="text-xs font-bold text-slate-700 block">No phase breakdown data.</strong>
              <p className="text-[11px] text-slate-400 font-medium">Time logs across phases will be shown here.</p>
            </div>
          )}
        </div>

        {/* Drawing Status Split */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Drawing Status Split</h3>
                <p className="text-[11px] font-medium text-slate-400">CAD blueprints verification status</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/architect/drawings')}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>View Details</span>
            </button>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-black tracking-wider border-y border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drawingStatusSplit.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${row.color}`}></span>
                      <span>{row.name}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 5. ROW 4: ACTIVE TASK ASSIGNMENTS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Active Task Assignments</h3>
              <p className="text-[11px] font-medium text-slate-400">Current design targets and deadlines</p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/architect/time-tracking')}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tasks</span>
          </button>
        </div>

        {tasks.length > 0 ? (
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50 uppercase text-[10px] font-black text-slate-400 tracking-wider">
                  <th className="px-4 py-2.5">Task Details</th>
                  <th className="px-4 py-2.5">Project</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-800">{t.title}</td>
                    <td className="px-4 py-3 font-semibold text-slate-500">{t.project}</td>
                    <td className="px-4 py-3 font-medium text-slate-500">{t.due}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        t.status === 'Review' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        t.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
              <ClipboardCheck className="w-6 h-6 text-blue-500" />
            </div>
            <strong className="text-xs font-bold text-slate-700 block">No active task assignments found.</strong>
            <p className="text-[11px] text-slate-400 font-medium">Active tasks with deadlines will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
