import React, { useState, useEffect } from 'react';
import { 
  Clock, FileText, CheckSquare, Bell, MessageSquare, Eye, Download, 
  AlertTriangle, Filter, ChevronRight, X, RefreshCw, Inbox 
} from 'lucide-react';
import Card from '../../common/Card';
import { getTasks } from '../../../service/task';
import { getProjectDrawings } from '../../../service/drawing';
import { getEmployeeDocuments } from '../../../service/document';
import { getMyAttendance } from '../../../service/hrm/attendance';
import { getUnreadCounts } from '../../../service/chat';
import { getProjects } from '../../../service/project';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [drawings, setDrawings] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
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

      // 2. Fetch Drawings
      const dwgRes = await getProjectDrawings('proj-1');
      if (dwgRes?.allDrawings && Array.isArray(dwgRes.allDrawings)) {
        setDrawings(dwgRes.allDrawings);
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

      // 5. Fetch Projects
      const projRes = await getProjects();
      if (projRes?.success && Array.isArray(projRes.projects)) {
        setProjectsList(projRes.projects);
      } else {
        setProjectsList([]);
      }
    } catch (err) {
      console.warn("Failed to load studio analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

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
    { name: 'Approved', value: approvedCount },
    { name: 'Under Review', value: underReviewCount },
    { name: 'Correction Needed', value: correctionCount }
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

  const renderSparkline = (color = '#2484C6') => (
    <svg className="w-12 h-6" viewBox="0 0 50 25">
      <path
        d="M 0,20 L 10,15 L 20,18 L 30,10 L 40,12 L 50,5"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. GREETING HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Studio Design Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Live sync with studio backend databases</p>
        </div>

        <button 
          onClick={loadDashboardData}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          title="Refresh Dynamic Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. KPI CARDS WITH DYNAMIC METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Open Tasks</span>
            <strong className="text-base font-black text-slate-800 block mt-0.5">{openTasksCount} Tasks</strong>
          </div>
          {renderSparkline('#2484C6')}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Drawings</span>
            <strong className="text-base font-black text-slate-800 block mt-0.5">{pendingDrawingsCount} Plans</strong>
          </div>
          {renderSparkline('#8B5CF6')}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Logged Hours</span>
            <strong className="text-base font-black text-emerald-600 block mt-0.5">{totalLoggedHours} hrs</strong>
          </div>
          {renderSparkline('#10B981')}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Overdue Items</span>
            <strong className="text-base font-black text-rose-500 block mt-0.5">{overdueCount} Items</strong>
          </div>
          {renderSparkline('#EF4444')}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Unread Chats</span>
            <strong className="text-base font-black text-slate-700 block mt-0.5">{unreadCount} Chats</strong>
          </div>
          {renderSparkline('#F59E0B')}
        </div>

      </div>

      {/* 3. CENTER HERO AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Project Roster Workload */}
        <Card title="Roster Workload Split" subtitle="Active tasks breakdown by project name" className="lg:col-span-2">
          {workloadSplit.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="px-4 py-2">Project</th>
                    <th className="px-4 py-2">Tasks Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workloadSplit.map((row) => (
                    <tr key={row.project} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-800">{row.project}</td>
                      <td className="px-4 py-2.5 font-semibold text-indigo-600">{row.workload} tasks</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Inbox className="w-6 h-6 mx-auto mb-1 text-slate-300" />
              <span>No project tasks found in system.</span>
            </div>
          )}
        </Card>

        {/* Right side alerts list */}
        <Card title="Activity & Approvals" subtitle="Live feed of GFC approvals and revisions">
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 pt-2 scrollbar-thin">
            {liveActivities.length > 0 ? (
              liveActivities.map((al, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5 text-xs font-bold text-slate-700 leading-normal">
                  {al.type === 'success' && <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                  {al.type === 'info' && <MessageSquare className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                  {al.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                  <div>
                    <span>{al.text}</span>
                    <span className="text-[9px] text-slate-400 block font-semibold mt-1">{al.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                <span>No recent activity events.</span>
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* 4. SIDE WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Card title="Phase Log Breakdown" subtitle="Time distribution across design phases">
          {phaseBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="px-4 py-2">Phase</th>
                    <th className="px-4 py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {phaseBreakdown.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                      <td className="px-4 py-2.5 font-semibold text-blue-600">{row.value}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <span>No phase breakdown data.</span>
            </div>
          )}
        </Card>

        <Card title="Drawing Status Split" subtitle="CAD blueprints verification status">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drawingStatusSplit.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{row.name}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-600">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* 5. BOTTOM ROW */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Recent Tasks registry */}
        <Card title="Active Task Assignments" subtitle="Current design targets and deadlines">
          {tasks.length > 0 ? (
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
                  {tasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 align-middle">
                        <strong className="text-slate-800 block font-bold">{t.title}</strong>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{t.project}</td>
                      <td className="px-4 py-3.5 text-slate-500 align-middle font-medium">{t.due}</td>
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
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Inbox className="w-6 h-6 mx-auto mb-1 text-slate-300" />
              <span>No active task assignments found.</span>
            </div>
          )}
        </Card>

      </div>

    </div>
  );
}
