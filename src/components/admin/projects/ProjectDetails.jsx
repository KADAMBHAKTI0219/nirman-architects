import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area
} from 'recharts';
import {
  ArrowLeft, Calendar, MapPin, Users, ShieldAlert, FileText, CheckCircle2,
  Clock, Send, HelpCircle, Building, Eye, EyeOff, Plus, Trash2, Link as LinkIcon, RefreshCw, UserCheck, Check
} from 'lucide-react';
import Card from '../../common/Card';
import ClientCommunication from '../../project-manager/client-communication/index';
import { getProjectTeamLeaves } from '../../../service/mockApi';
import {
  getLinksByProject,
  createClientProjectLink,
  toggleProjectLinkVisibility,
  unlinkProject,
  getClients
} from '../../../service/client';

export default function ProjectDetails({
  project,
  onBack,
  onUpdateProject,
  onApproveDrawing,
  defaultTab = 'overview'
}) {
  const [activeTab, setActiveTab] = useState(defaultTab); // overview, timeline, tasks, drawings, team, documents, chat, approvals, reports, clients
  const [chatInput, setChatInput] = useState('');
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loadingTeamLeaves, setLoadingTeamLeaves] = useState(false);

  // CRM Module 3: Client-Project Linkage State
  const [clientLinks, setClientLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [allClients, setAllClients] = useState([]);
  const [showAddClientLinkModal, setShowAddClientLinkModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [linkVisibility, setLinkVisibility] = useState(true);
  const [linkSubmitting, setLinkSubmitting] = useState(false);

  const projectId = project ? (project.id || project._id || project.code || 'proj-1') : null;

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (activeTab === 'team') {
      loadTeamLeaves();
    } else if (activeTab === 'clients') {
      fetchProjectClientLinks();
      fetchAvailableClients();
    }
  }, [activeTab, projectId]);

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

  const fetchProjectClientLinks = async () => {
    if (!projectId) return;
    setLoadingLinks(true);
    try {
      const res = await getLinksByProject(projectId);
      if (res?.success) {
        setClientLinks(res.links || []);
      }
    } catch (err) {
      console.error("Error fetching project client links:", err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const fetchAvailableClients = async () => {
    try {
      const res = await getClients({});
      if (res?.success) {
        setAllClients(res.clients || []);
        if ((res.clients || []).length > 0) {
          setSelectedClientId(res.clients[0]._id || res.clients[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching clients list:", err);
    }
  };

  const handleCreateLinkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClientId) return;
    setLinkSubmitting(true);
    try {
      const selectedClientObj = allClients.find(c => (c._id === selectedClientId || c.id === selectedClientId));
      const res = await createClientProjectLink({
        clientId: selectedClientId,
        projectId: projectId,
        projectName: project.name,
        visibleToClient: linkVisibility
      });
      if (res?.success) {
        alert(res.message || "Project successfully linked to Client account.");
        setShowAddClientLinkModal(false);
        fetchProjectClientLinks();
      } else {
        alert(res?.message || "Failed to link client.");
      }
    } catch (err) {
      alert(err.message || "Error linking client.");
    } finally {
      setLinkSubmitting(false);
    }
  };

  const handleToggleLinkVisibility = async (linkId, currentVis) => {
    try {
      const res = await toggleProjectLinkVisibility(linkId, !currentVis);
      if (res?.success) {
        fetchProjectClientLinks();
      } else {
        alert(res?.message || "Failed to toggle visibility.");
      }
    } catch (err) {
      alert(err.message || "Error toggling visibility.");
    }
  };

  const handleUnlinkProject = async (linkId, clientName) => {
    const notes = await window.prompt(`Unlink Client "${clientName}" from project "${project.name}"?\nEnter audit reason/notes:`, "", "Unlink Project Audit");
    if (notes === null) return;
    try {
      const res = await unlinkProject(linkId, notes);
      if (res?.success) {
        alert(res.message || "Client unlinked successfully.");
        fetchProjectClientLinks();
      } else {
        alert(res?.message || "Failed to unlink client.");
      }
    } catch (err) {
      alert(err.message || "Error unlinking client.");
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const updatedChats = [
      ...(project.chats || []),
      { sender: "Super Admin", message: chatInput, time: "Just now" }
    ];
    onUpdateProject({ ...project, chats: updatedChats });
    setChatInput('');
  };

  const handleWorkflowApprove = (dwgCode) => {
    onApproveDrawing(dwgCode);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans text-slate-800">

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
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${project.delayFlag ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
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
          { id: 'clients', label: `Linked Clients (${clientLinks.length})` },
          { id: 'team', label: 'Team Matrix' },
          { id: 'documents', label: 'Documents' },
          { id: 'chat', label: 'Client Chat' },
          { id: 'approvals', label: `Approvals (${project.pendingApprovals || 0})` },
          { id: 'reports', label: 'Visual Reports' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`pb-2.5 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === t.id
              ? 'border-brand-primary text-slate-900 font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-700'
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
                    The {project.name} is a marquee development designed to client specifications. Operations span planning, engineering, architectural sign-off, and interior fitouts. This project adheres strictly to standard regulatory policies.
                  </p>
                  {project.delayFlag && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-rose-900 font-black block">Schedule Risk Warning</strong>
                        <p className="text-rose-700 mt-0.5 leading-normal">
                          Milestone target dates are experiencing delays due to pending client drawing approvals or site material inspections.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

            </div>

            {/* Quick Metrics */}
            <div className="space-y-6">
              <Card title="Project Health Metrics">
                <div className="space-y-4 text-xs font-bold">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Overall Progress</span>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-slate-900">{project.progress || 68}%</span>
                      <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-primary h-full" style={{ width: `${project.progress || 68}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase">Assigned Project Manager</span>
                    <strong className="text-slate-900 block text-xs">{project.manager || 'Sarah Connor'}</strong>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* CRM MODULE 3: LINKED CLIENTS PANEL */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex justify-between items-center flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Linked Client Accounts (CRM Module 3)</h3>
                <p className="text-xs text-slate-500">Manage client access, visibility controls, and multi-client project links</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchProjectClientLinks}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  title="Refresh Client Links"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLinks ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowAddClientLinkModal(true)}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-brand-dark" /> Link Client Account
                </button>
              </div>
            </div>

            {/* Client Links Ledger Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider whitespace-nowrap">
                      <th className="px-5 py-4">Client Account Name</th>
                      <th className="px-5 py-4">Company Name</th>
                      <th className="px-5 py-4">Contact Email</th>
                      <th className="px-5 py-4">Linked Date</th>
                      <th className="px-5 py-4">Portal Visibility</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {loadingLinks ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                          <span>Loading linked client accounts...</span>
                        </td>
                      </tr>
                    ) : clientLinks.length > 0 ? (
                      clientLinks.map(link => {
                        const clientObj = link.clientId || {};
                        const clientName = clientObj.name || link.clientName || 'Shah Enterprises';
                        const companyName = clientObj.companyName || 'Shah Group';
                        const clientEmail = clientObj.email || 'info@shah.com';

                        return (
                          <tr key={link._id || link.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="px-5 py-4 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 border border-indigo-100">
                                  <Building className="w-4 h-4" />
                                </div>
                                <strong className="text-slate-900 font-extrabold text-xs block">{clientName}</strong>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-slate-700 font-bold align-middle whitespace-nowrap">
                              {companyName}
                            </td>

                            <td className="px-5 py-4 text-slate-500 font-mono text-[11px] align-middle whitespace-nowrap">
                              {clientEmail}
                            </td>

                            <td className="px-5 py-4 text-slate-500 font-mono text-[11px] align-middle whitespace-nowrap">
                              {link.linkedAt ? new Date(link.linkedAt).toISOString().split('T')[0] : '2026-08-01'}
                            </td>

                            {/* Visibility Toggle Switch */}
                            <td className="px-5 py-4 align-middle whitespace-nowrap">
                              <button
                                onClick={() => handleToggleLinkVisibility(link._id || link.id, link.visibleToClient)}
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer ${link.visibleToClient
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                  }`}
                                title="Click to toggle Client Portal visibility"
                              >
                                {link.visibleToClient ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                {link.visibleToClient ? 'Visible to Client' : 'Hidden from Client'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-4 text-right align-middle whitespace-nowrap">
                              <button
                                onClick={() => handleUnlinkProject(link._id || link.id, clientName)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all border border-rose-200 cursor-pointer"
                                title="Unlink Project (Admin / PM)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                          No Client accounts currently linked to this project. Click "Link Client Account" to grant access.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CLIENT CHAT PANEL (WhatsApp Style Client Communication Hub) */}
        {activeTab === 'chat' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">WhatsApp-Style Client Communication Hub</h3>
                <p className="text-xs text-slate-500">Real-time messaging stream, swipe-to-reply, quoted messages & PM team notes</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase rounded-full border border-emerald-200">
                Live Sync Channel
              </span>
            </div>
            <ClientCommunication defaultProjectId={projectId} />
          </div>
        )}

        {/* TIMELINE & MILESTONES PANEL */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Project Execution Timeline & Milestones</h3>
                  <p className="text-xs text-slate-500">Track key milestone targets, phase releases, and handover dates</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase rounded-full border border-indigo-200">
                  Target Phase 3 / 5
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Phase 1: Architectural GFC Release", status: "COMPLETED", date: "2026-06-15", progress: 100 },
                  { name: "Phase 2: Structural Column & Slab Casting", status: "IN_PROGRESS", date: "2026-08-30", progress: 75 },
                  { name: "Phase 3: MEP Schematics & Handover", status: "UPCOMING", date: "2026-10-15", progress: 20 }
                ].map((m, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-900">{m.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          m.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-500'
                        }`}>
                        {m.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Target: {m.date}</span>
                      <strong>{m.progress}%</strong>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-primary h-full rounded-full" style={{ width: `${m.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TASKS PANEL */}
        {activeTab === 'tasks' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Project Action Items & Work Tasks</h3>
                <p className="text-xs text-slate-500">Active tasks assigned across Architecture, Site Engineering, and MEP</p>
              </div>
              <button onClick={() => alert("Task creation feature available in PM Tasks view")} className="px-4 py-2 bg-brand-primary text-brand-dark font-extrabold text-xs rounded-xl shadow-xs">
                + Add Task
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              {[
                { title: "Review GFC Foundation Beam DWG", dept: "Architecture", priority: "HIGH", assignee: "Sarah Connor", status: "IN_PROGRESS" },
                { title: "Perform Site Soil Bearing Capacity Audit", dept: "Engineering", priority: "HIGH", assignee: "Bob Johnson", status: "TODO" },
                { title: "Client Material Sample Selection Signoff", dept: "Interior", priority: "NORMAL", assignee: "Alice Smith", status: "COMPLETED" }
              ].map((t, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-black text-[9px] uppercase rounded">
                      {t.dept}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${t.priority === 'HIGH' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {t.priority}
                    </span>
                  </div>
                  <strong className="text-slate-900 block text-xs font-extrabold">{t.title}</strong>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>Assigned: <strong>{t.assignee}</strong></span>
                    <span className="font-bold text-slate-700">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRAWINGS & GFC PANEL */}
        {activeTab === 'drawings' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Project Drawings & GFC Blueprints</h3>
                <p className="text-xs text-slate-500">Cloudinary uploaded blueprints, version history, and client approval status</p>
              </div>
              <button onClick={() => alert("Upload new drawing blueprint via Designer/Architect upload portal")} className="px-4 py-2 bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-xs">
                + Upload Drawing File
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              {[
                { name: "Ground Floor Architectural Plan AR-001", ver: "V2.1", status: "PENDING_CLIENT_APPROVAL", date: "2026-07-20" },
                { name: "Master Structural Beam Section ST-002", ver: "V1.0", status: "APPROVED", date: "2026-07-18" }
              ].map((d, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <strong className="text-slate-900 font-extrabold text-xs block">{d.name}</strong>
                    <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                      <span>Ver: {d.ver}</span>
                      <span>Date: {d.date}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase ${d.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TEAM MATRIX PANEL */}
        {activeTab === 'team' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Project Team Allocation & Shift Matrix</h3>
                <p className="text-xs text-slate-500">Personnel assigned to site, office shifts, and leave records</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              {[
                { name: "Sarah Connor", role: "Lead Project Manager", status: "On Duty / Office", phone: "+91 98765 10001" },
                { name: "Bob Johnson", role: "Site Engineer", status: "On Site A", phone: "+91 98765 10003" },
                { name: "Alice Smith", role: "Jr Architect", status: "On Duty / Office", phone: "+91 98765 10002" }
              ].map((member, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <strong className="text-slate-900 font-extrabold text-xs block">{member.name}</strong>
                  <span className="text-[11px] text-slate-500 font-bold block">{member.role}</span>
                  <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-200/60">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded uppercase">{member.status}</span>
                    <span className="text-slate-500 font-mono">{member.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS PANEL */}
        {activeTab === 'documents' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Project Documents & Repository (CRM Module 6)</h3>
                <p className="text-xs text-slate-500">Shared PDF contracts, approved drawing sets, invoices, and photo archives</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              {[
                { name: "Client Agreement & Architectural Contract V1.pdf", folder: "Contracts", size: "4.2 MB" },
                { name: "Approved GFC Structural Plan Set.pdf", folder: "Approved Drawings PDFs", size: "12.5 MB" },
                { name: "Milestone 2 Foundation Stage Invoice #INV-2026-04.pdf", folder: "Invoices", size: "1.8 MB" }
              ].map((doc, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <strong className="text-slate-900 font-extrabold text-xs block">{doc.name}</strong>
                    <span className="text-[10px] text-indigo-600 font-bold uppercase">{doc.folder} &bull; {doc.size}</span>
                  </div>
                  <button onClick={() => alert(`Previewing ${doc.name}`)} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPROVALS PANEL */}
        {activeTab === 'approvals' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Pending Client & Internal Approvals</h3>
                <p className="text-xs text-slate-500">Audit list of drawings and design revisions awaiting client sign-off</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="space-y-1">
                <strong className="text-amber-900 font-extrabold block">Ground Floor Architectural Layout Plan V2</strong>
                <p className="text-amber-700 text-[11px]">Submitted to Client (Wayne Enterprises) for approval on 2026-07-20</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 font-black rounded-full text-[10px] uppercase">
                Awaiting Client Response
              </span>
            </div>
          </div>
        )}

        {/* REPORTS PANEL */}
        {activeTab === 'reports' && (
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">Visual Operational Reports & Analytics</h3>
                <p className="text-xs text-slate-500">Project velocity, milestone progress, and budget tracking</p>
              </div>
            </div>

            <div className="h-64 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-black text-slate-600 uppercase">Project Milestone Velocity</span>
              <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden my-auto">
                <div className="bg-brand-primary h-full rounded-full" style={{ width: `${project.progress || 68}%` }}></div>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Phase 1 (100%)</span>
                <span>Phase 2 (75%)</span>
                <span>Phase 3 (20%)</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: LINK CLIENT ACCOUNT (CRM Module 3 POST /api/client-project-links/create) */}
      {showAddClientLinkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Link Client Account to Project</h3>
                <p className="text-xs text-slate-500">Select target Client account to authorize project portal visibility</p>
              </div>
              <button onClick={() => setShowAddClientLinkModal(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <form onSubmit={handleCreateLinkSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Client Account *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-extrabold text-slate-800"
                  required
                >
                  {allClients.map(c => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.name} ({c.companyName || c.email || 'Client'})
                    </option>
                  ))}
                  {allClients.length === 0 && (
                    <option value="cli-103">Shah Enterprises (info@shah.com)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Visibility Status</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    id="visCheck"
                    checked={linkVisibility}
                    onChange={(e) => setLinkVisibility(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="visCheck" className="text-slate-800 font-bold cursor-pointer">
                    Visible to Client Portal (`visibleToClient: true`)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClientLinkModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkSubmitting}
                  className="px-5 py-2 bg-brand-primary text-brand-dark font-extrabold rounded-xl shadow-xs"
                >
                  {linkSubmitting ? 'Linking...' : 'Confirm Linkage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
