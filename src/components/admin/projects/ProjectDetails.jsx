import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  AreaChart, Area 
} from 'recharts';
import { 
  ArrowLeft, Calendar, MapPin, Users, ShieldAlert, FileText, CheckCircle2, 
  Clock, Send, HelpCircle 
} from 'lucide-react';
import Card from '../../common/Card';
import { getProjectTeamLeaves } from '../../../service/mockApi';

export default function ProjectDetails({
  project,
  onBack,
  onUpdateProject,
  onApproveDrawing,
  defaultTab = 'overview'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab); // overview, timeline, tasks, drawings, team, documents, chat, approvals, reports

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  const [chatInput, setChatInput] = useState('');
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loadingTeamLeaves, setLoadingTeamLeaves] = useState(false);

  const loadTeamLeaves = async () => {
    try {
      setLoadingTeamLeaves(true);
      const res = await getProjectTeamLeaves(project.id || project._id || project.code || 'PRJ-CP-101');
      if (res && res.success && Array.isArray(res.leaves)) {
        setTeamLeaves(res.leaves);
      } else {
        setTeamLeaves([
          { name: "Alice Smith", type: "Annual Leave", fromDate: "2026-07-29", toDate: "2026-08-04", status: "Approved" }
        ]);
      }
    } catch (err) {
      console.warn("Failed to load project team leaves, using fallback mock status", err);
      setTeamLeaves([
        { name: "Alice Smith", type: "Annual Leave", fromDate: "2026-07-29", toDate: "2026-08-04", status: "Approved" }
      ]);
    } finally {
      setLoadingTeamLeaves(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeamLeaves();
    }
  }, [activeTab]);

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const updatedChats = [
      ...project.chats,
      { sender: "Super Admin", message: chatInput, time: "Just now" }
    ];
    onUpdateProject({ ...project, chats: updatedChats });
    setChatInput('');
  };

  const handleWorkflowApprove = (dwgCode) => {
    onApproveDrawing(dwgCode);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header breadcrumb bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-slate-150 bg-white border border-slate-200 text-slate-600 rounded-xl transition-all shadow-3xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{project.code}</span>
            <h2 className="text-base font-black text-slate-900 tracking-tight leading-none mt-0.5">{project.name}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
            project.delayFlag ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {project.delayFlag ? 'At Risk / Delayed' : 'Active / On Schedule'}
          </span>
        </div>
      </div>

      {/* Detail Tab Navigation bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'timeline', label: 'Timeline & Milestones' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'drawings', label: 'Drawings & GFC' },
          { id: 'team', label: 'Team Matrix' },
          { id: 'documents', label: 'Documents' },
          { id: 'chat', label: 'Client Chat' },
          { id: 'approvals', label: `Approvals (${project.pendingApprovals})` },
          { id: 'reports', label: 'Visual Reports' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-brand-primary text-slate-800 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              <Card title="Executive Project Summary" subtitle="Overview of scope and general contractor charter">
                <div className="space-y-4 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    The {project.name} is a marquee development designed to client specifications. Under current project manager {project.manager}, operations span planning, engineering, architectural sign-off, and interior fitouts. This project adheres strictly to standard regulatory policies.
                  </p>
                  {project.delayFlag && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-rose-805 text-xs font-bold block">Delay Flag Activated</strong>
                        <p className="text-[11px] text-rose-750 leading-relaxed mt-0.5">{project.delayReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Client Corporate Contact" subtitle="Accounts relationship and notification rules">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Corporate Client</span>
                    <span className="font-extrabold text-slate-700">{project.client}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Email Address</span>
                    <span className="font-semibold text-slate-700">{project.clientEmail}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Contact Number</span>
                    <span className="font-semibold text-slate-700">{project.clientPhone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Payment Billing Mode</span>
                    <span className="font-semibold text-slate-700">Milestone Stage Payments (Net-15)</span>
                  </div>
                </div>
              </Card>

              <Card title="Site Coordinates & Location" subtitle="GPS location and logistics portal">
                <div className="flex items-start gap-3.5 text-xs">
                  <div className="p-3 bg-brand-tint rounded-xl text-brand-dark">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-slate-800 font-bold block">Physical Address</strong>
                    <span className="text-slate-500 block mt-0.5">{project.location}</span>
                    <span className="text-[10px] text-slate-400 mt-2 block font-semibold">Logistical Route: Standard Transit Corridor Zone</span>
                  </div>
                </div>
              </Card>

            </div>

            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
                <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Responsible PM</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary text-slate-905 font-black flex items-center justify-center text-xs shadow-xs">
                    {project.manager.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <strong className="text-xs font-black text-slate-805 block">{project.manager}</strong>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 block">Lead Project Manager</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
                <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Budget Utilization</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Allocated Budget</span>
                      <span className="text-sm font-black text-slate-800">${(project.budget).toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Spent Details</span>
                      <span className="text-sm font-extrabold text-slate-650">${(project.spent).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-primary h-full rounded-full transition-all"
                      style={{ width: `${(project.spent / project.budget) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                    <span>Utilization Rate</span>
                    <span className="font-extrabold text-slate-700">{((project.spent / project.budget) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4">
                <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-widest block border-b border-slate-55 pb-2">Pending Action Counters</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[20px] font-black text-amber-500 block">{project.pendingApprovals}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">Approvals</span>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[20px] font-black text-indigo-500 block">{project.pendingTasks}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">Tasks</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TIMELINE PANEL */}
        {activeTab === 'timeline' && (
          <Card title="Gantt Milestone Chronology" subtitle="Tracking planned schedule against actual completion logs">
            <div className="space-y-6 pt-3">
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/40 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-2.5">
                  <span className="text-slate-400">Milestone Stage</span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Completed</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-brand-primary inline-block"></span> Active</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block"></span> Planned</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {project.milestones.map((m, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between text-xs gap-3">
                      <div className="w-48 flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          m.status === 'Completed' ? 'bg-emerald-500' :
                          m.status === 'In Progress' ? 'bg-brand-primary animate-pulse' : 'bg-slate-250'
                        }`}></div>
                        <span className="font-extrabold text-slate-705">{m.name}</span>
                      </div>
                      <div className="flex-1 max-w-md h-3 bg-slate-100 rounded-full relative overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          m.status === 'Completed' ? 'w-full bg-emerald-450' :
                          m.status === 'In Progress' ? 'w-[45%] bg-brand-primary' : 'w-0'
                        }`}></div>
                      </div>
                      <div className="w-48 text-right text-[11px] font-semibold text-slate-500">
                        <span>Target: {m.date}</span>
                        {m.actualDate !== 'N/A' && (
                          <span className="block text-[9px] text-emerald-600 font-bold">Actual: {m.actualDate}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* TASKS PANEL */}
        {activeTab === 'tasks' && (
          <Card title="Task Responsibility Matrix" subtitle="Detailed task board and department tracking details">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="px-4 py-3">Task Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {project.tasks.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-bold text-slate-800">{t.name}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold">{t.dept}</td>
                      <td className="px-4 py-3.5 text-slate-650 font-bold">{t.assignee}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          t.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                          t.status === 'In Progress' ? 'bg-brand-tint text-brand-dark' : 'bg-rose-50 text-rose-600'
                        }`}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* DRAWINGS PANEL */}
        {activeTab === 'drawings' && (
          <Card title="Blueprints & Drawings Directory" subtitle="All construction drafts, mechanical plans, and GFC releases">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="px-4 py-3">DWG Code</th>
                    <th className="px-4 py-3">Drawing Title</th>
                    <th className="px-4 py-3">Category Type</th>
                    <th className="px-4 py-3">Rev Version</th>
                    <th className="px-4 py-3">Workflow status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {project.drawings.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/40">
                      <td className="px-4 py-3.5 font-black text-slate-500 uppercase">{d.code}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-800">{d.name}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold">{d.type}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-650">{d.version}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          d.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-605'
                        }`}>{d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TEAM MATRIX PANEL */}
        {activeTab === 'team' && (
          <Card title="Team Roster Matrix" subtitle="Management roles and engineering assignments">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {project.team.map((m, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 text-xs justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-tint border border-white flex items-center justify-center font-black text-[10px] text-slate-700 shadow-3xs">
                        {m.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <strong className="text-slate-800 font-bold block">{m.name}</strong>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{m.role}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase bg-white border border-slate-150 px-2.5 py-1 rounded-lg">
                      {m.dept}
                    </span>
                  </div>
                ))}
              </div>

              {/* Display Active/Approved Leave Status in Roster */}
              {teamLeaves.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Team Leave Schedules</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamLeaves.map((tl, index) => (
                      <div key={index} className="p-3 bg-rose-50/40 border border-rose-100/50 rounded-2xl flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                          <div>
                            <strong className="text-slate-800 font-bold block">{tl.name}</strong>
                            <span className="text-[9px] text-slate-400 block font-bold">{tl.type} &bull; {tl.fromDate} to {tl.toDate}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-lg border border-rose-200">
                          {tl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* DOCUMENTS PANEL */}
        {activeTab === 'documents' && (
          <Card title="Attachments & File Vault" subtitle="Corporate legal files and project sign-off attachments">
            <div className="space-y-3 pt-2">
              {project.documents.map((doc, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-white border border-slate-150 rounded-lg">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </span>
                    <div>
                      <strong className="text-slate-805 block">{doc.name}</strong>
                      <span className="text-[10px] text-slate-400 mt-0.5 block font-bold">File Size: {doc.size}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Downloading attachment: ${doc.name}`)}
                    className="px-3.5 py-1.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] font-black uppercase transition-all shadow-3xs"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CHAT PANEL */}
        {activeTab === 'chat' && (
          <Card title="Live Project Chat Stream" subtitle="Encrypted client-PM message history and logs">
            <div className="space-y-4 pt-2">
              <div className="h-64 overflow-y-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-end">
                {project.chats.map((c, idx) => (
                  <div 
                    key={idx} 
                    className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                      c.sender === 'Super Admin' 
                        ? 'bg-brand-primary text-slate-905 self-end rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-105 self-start rounded-tl-none'
                    }`}
                  >
                    <strong className="font-black text-[9px] block uppercase leading-none opacity-80">{c.sender}</strong>
                    <p className="font-semibold leading-relaxed">{c.message}</p>
                    <span className="text-[8px] block opacity-60 text-right">{c.time}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChatMessage} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type a corporate message..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-xs font-semibold bg-white"
                />
                <button 
                  type="submit"
                  className="px-4 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs flex items-center gap-1"
                >
                  Send Message
                </button>
              </form>
            </div>
          </Card>
        )}

        {/* APPROVALS PANEL */}
        {activeTab === 'approvals' && (
          <Card title="Workflow Sign-off Queue" subtitle="Drawings and procurement actions pending admin signoff">
            <div className="space-y-4 pt-2">
              {project.drawings.filter(d => d.status.includes('Pending')).map((d, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs flex-wrap gap-3">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.code}</span>
                    <h5 className="font-bold text-slate-805 mt-0.5">{d.name}</h5>
                    <span className="text-[10px] text-slate-400 mt-1 block font-semibold">{d.type} | Version {d.version}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWorkflowApprove(d.code)}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-3xs"
                    >
                      Approve Sign-off
                    </button>
                  </div>
                </div>
              ))}
              {project.drawings.filter(d => d.status.includes('Pending')).length === 0 && (
                <div className="py-8 text-center bg-white border border-slate-100 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-xs font-black text-slate-805">No pending workflow items left!</h4>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* REPORTS PANEL */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Milestone Progress Trend" subtitle="Daily completion velocity wave over time">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { date: 'Jan', progress: 0 },
                    { date: 'Mar', progress: 15 },
                    { date: 'May', progress: 30 },
                    { date: 'Jul', progress: project.progress }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                    <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                    <Tooltip />
                    <Line type="monotone" dataKey="progress" stroke="#2484C6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Budget Allocation Wave" subtitle="Project spent vs remaining budget ratio">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Allocated', value: project.budget },
                    { name: 'Spent', value: project.spent }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                    <YAxis stroke="#94A3B8" fontSize={10} fontWeight="bold" />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8FC9FF" fill="#E5F0FA" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
