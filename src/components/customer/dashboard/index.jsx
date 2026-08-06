import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, AlertTriangle, Send, FileText, 
  Image as ImageIcon, HelpCircle, ChevronRight, ChevronDown, Check, X, MessageSquare, 
  Building, RefreshCw, UserCheck, ShieldCheck, Calendar, MapPin, Phone, User, Edit, Layers, Star, Plus, LifeBuoy, Lock
} from 'lucide-react';
import Card from '../../common/Card';
import { clientChangePassword } from '../../../service/client';
import { 
  getClientDashboard, 
  getClientProjectDetail, 
  getClientProjectTimeline, 
  updateClientProfile, 
  logClientSessionLogin, 
  sendClientSessionHeartbeat 
} from '../../../service/clientPortal';
import {
  getPendingFeedbackPrompts,
  submitClientFeedback,
  skipFeedbackPrompt,
  getActiveFeedbackCategories
} from '../../../service/feedback';
import {
  createClientTicket,
  getMyClientTickets,
  respondToClientTicket,
  reopenClientTicket,
  cancelClientTicket
} from '../../../service/ticket';

export default function CustomerDashboard() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const [dashboardData, setDashboardData] = useState({
    activeProjects: [],
    pastProjects: [],
    totalProjectsCount: 0,
    contactPermissionLevel: user.permissionLevel || 'OWNER'
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [projectTab, setProjectTab] = useState('active'); // 'active' or 'past'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  
  // Selected Project Details & Timeline State
  const [projectDetail, setProjectDetail] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Edit Profile Modal State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user.name || '', phone: user.phone || '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change Password Modal State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState('');
  const [updatingPwd, setUpdatingPwd] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');

    if (pwdForm.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    setUpdatingPwd(true);
    try {
      const res = await clientChangePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      });

      if (res?.success) {
        alert("Password updated successfully!");
        setShowChangePasswordModal(false);
        setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwdError(res?.message || 'Failed to update password.');
      }
    } catch (err) {
      setPwdError(err.message || 'Error updating password.');
    } finally {
      setUpdatingPwd(false);
    }
  };

  // Chat queries state
  const [chats, setChats] = useState([
    { id: 1, sender: "Sarah Connor (Senior PM)", text: "Hello! We uploaded the latest basement concrete casting renders for review.", time: "2 hours ago" },
    { id: 2, sender: `Me (${(user.name || 'Client').split(' ')[0]})`, text: "Checking them now. Facade work seems on schedule.", time: "1 hour ago" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // CRM Module 9 Feedback State
  const [pendingPrompts, setPendingPrompts] = useState([]);
  const [activePrompt, setActivePrompt] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // CRM Module 8 Support Tickets State
  const [showTicketsModal, setShowTicketsModal] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [newTicketForm, setNewTicketForm] = useState({ subject: '', description: '', priority: 'Medium' });
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);

  // 1. Log Session Login & Mount Dashboard Data
  useEffect(() => {
    logClientSessionLogin('WEB').catch(() => {});
    fetchDashboardData();
    fetchPendingPrompts();
    fetchTicketsList();

    // Heartbeat ping every 60 seconds
    const interval = setInterval(() => {
      sendClientSessionHeartbeat().catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchPendingPrompts = async () => {
    try {
      const res = await getPendingFeedbackPrompts();
      if (res?.success && res.prompts && res.prompts.length > 0) {
        setPendingPrompts(res.prompts);
        setActivePrompt(res.prompts[0]);
      }
    } catch (e) {
      console.error("Failed to load pending prompts", e);
    }
  };

  const fetchTicketsList = async () => {
    try {
      const res = await getMyClientTickets();
      if (res?.success) {
        setMyTickets(res.tickets || []);
      }
    } catch (e) {
      console.error("Failed to load client tickets", e);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!activePrompt) return;
    setSubmittingFeedback(true);
    try {
      const res = await submitClientFeedback(activePrompt._id || activePrompt.id, {
        overallRating: feedbackRating,
        comments: feedbackComments
      });
      if (res?.success) {
        alert("Thank you for your feedback rating!");
        setActivePrompt(null);
        fetchPendingPrompts();
      }
    } catch (err) {
      alert("Error submitting feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleSkipPrompt = async () => {
    if (!activePrompt) return;
    try {
      await skipFeedbackPrompt(activePrompt._id || activePrompt.id);
      setActivePrompt(null);
      fetchPendingPrompts();
    } catch (e) {
      console.error("Error skipping feedback prompt", e);
    }
  };

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    const isViewOnly = (dashboardData.contactPermissionLevel || '').toUpperCase() === 'VIEW_ONLY';
    if (isViewOnly) {
      alert("HTTP 403 Forbidden: View Only permission level cannot create support tickets.");
      return;
    }
    setCreatingTicket(true);
    try {
      const res = await createClientTicket({
        projectId: selectedProjectId || 'proj-1',
        ...newTicketForm
      });
      if (res?.success) {
        alert("Support ticket raised successfully!");
        setNewTicketForm({ subject: '', description: '', priority: 'Medium' });
        setShowCreateTicketModal(false);
        fetchTicketsList();
      } else {
        alert(res?.message || 'Failed to create support ticket.');
      }
    } catch (err) {
      alert("Error raising support ticket.");
    } finally {
      setCreatingTicket(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoadingDashboard(true);
    try {
      const res = await getClientDashboard();
      if (res?.success) {
        setDashboardData({
          activeProjects: res.activeProjects || [],
          pastProjects: res.pastProjects || [],
          totalProjectsCount: res.totalProjectsCount || 0,
          contactPermissionLevel: res.contactPermissionLevel || user.permissionLevel || 'OWNER'
        });

        // Set default selected project ID
        const firstActive = (res.activeProjects || [])[0];
        if (firstActive) {
          setSelectedProjectId(firstActive.projectId);
          fetchProjectDetailsAndTimeline(firstActive.projectId);
        }
      }
    } catch (err) {
      console.error("Error fetching client dashboard:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchProjectDetailsAndTimeline = async (projId) => {
    if (!projId) return;
    setLoadingDetails(true);
    try {
      const [detailRes, timelineRes] = await Promise.all([
        getClientProjectDetail(projId),
        getClientProjectTimeline(projId)
      ]);

      if (detailRes?.success) setProjectDetail(detailRes.project);
      if (timelineRes?.success) setTimelineEvents(timelineRes.timeline || []);
    } catch (err) {
      console.error("Error fetching project details/timeline:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleProjectSelect = (e) => {
    const projId = e.target.value;
    setSelectedProjectId(projId);
    fetchProjectDetailsAndTimeline(projId);
  };

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await updateClientProfile(profileForm);
      if (res?.success) {
        const updatedContact = res.contact;
        const updatedUser = { ...user, name: updatedContact.name, phone: updatedContact.phone };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("Profile updated successfully!");
        setShowEditProfile(false);
      } else {
        alert(res?.message || 'Failed to update profile.');
      }
    } catch (err) {
      alert(err.message || 'Error updating profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChats([
      ...chats,
      { id: Date.now(), sender: `Me (${(user.name || 'Client').split(' ')[0]})`, text: chatInput.trim(), time: "Just now" }
    ]);
    setChatInput('');
  };

  const displayedProjects = projectTab === 'active' ? dashboardData.activeProjects : dashboardData.pastProjects;
  const currentProjectObj = dashboardData.activeProjects.find(p => p.projectId === selectedProjectId) || dashboardData.activeProjects[0] || {};
  const clientName = user.name || 'Valued Client';
  const companyName = user.clientName || 'Client Workspace';

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200 w-full">
      
      {/* 1. TOP PAGE HEADER (Matches Admin Dashboard Executive Header) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Client Project Workspace
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-brand-accent inline" />
            <span>Welcome, {clientName} • {companyName}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-700 uppercase tracking-wider">
              {dashboardData.contactPermissionLevel}
            </span>
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setProfileForm({ name: clientName, phone: user.phone || '' }); setShowEditProfile(true); }}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Change Password</span>
          </button>
          <button
            onClick={() => setShowTicketsModal(true)}
            className="px-4 py-2 bg-brand-primary text-slate-900 font-extrabold text-xs rounded-xl shadow-2xs hover:bg-brand-secondary transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <LifeBuoy className="w-4 h-4 text-slate-900" />
            <span>Support Tickets ({myTickets.length})</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY STAT CARDS (Matches Admin Stats .premium-stat-box Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* CARD 1: Total Linked Projects */}
        <div className="premium-stat-box p-5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Linked Projects</span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{dashboardData.totalProjectsCount} Projects</h3>
            </div>
            <div className="p-2.5 bg-brand-tint rounded-xl text-slate-700">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full tracking-wider uppercase">
              {dashboardData.activeProjects.length} Active
            </span>
          </div>
        </div>

        {/* CARD 2: Overall Progress */}
        <div className="premium-stat-box p-5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Overall Progress</span>
              <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{currentProjectObj.progressPercent || 68}% Completed</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full tracking-wider uppercase">
              On Schedule
            </span>
          </div>
        </div>

        {/* CARD 3: Next Milestone */}
        <div className="premium-stat-box p-5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Next Milestone</span>
              <h3 className="text-base font-black text-slate-800 tracking-tight truncate max-w-[150px]" title={currentProjectObj.nextMilestone?.title}>
                {currentProjectObj.nextMilestone ? currentProjectObj.nextMilestone.title : 'Basement Signoff'}
              </h3>
            </div>
            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-black px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full tracking-wider uppercase">
              Upcoming
            </span>
          </div>
        </div>

        {/* CARD 4: Portal Permission */}
        <div className="premium-stat-box p-5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Portal Permission</span>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{dashboardData.contactPermissionLevel}</h3>
            </div>
            <div className="p-2.5 bg-brand-soft rounded-xl text-indigo-600">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full tracking-wider uppercase truncate max-w-[160px]">
              {companyName}
            </span>
          </div>
        </div>

      </div>



      {/* 3. PROJECT FILTER STRIP & DROPDOWN SELECTOR (Matches Admin Dashboard Filter Bar) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 rounded-xl flex gap-1 text-[11px] font-bold">
            <button
              onClick={() => setProjectTab('active')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                projectTab === 'active' ? 'bg-white text-slate-900 font-extrabold shadow-3xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({dashboardData.activeProjects.length})
            </button>
            <button
              onClick={() => setProjectTab('past')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                projectTab === 'past' ? 'bg-white text-slate-900 font-extrabold shadow-3xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({dashboardData.pastProjects.length})
            </button>
          </div>
        </div>

        <select
          value={selectedProjectId || ''}
          onChange={handleProjectSelect}
          className="px-4 py-2 text-xs border border-slate-200 rounded-xl bg-white font-extrabold text-slate-800 focus:ring-2 focus:ring-brand-secondary shadow-3xs w-full sm:w-auto"
        >
          {displayedProjects.map((p, idx) => (
            <option key={idx} value={p.projectId}>
              {p.name}
            </option>
          ))}
          {displayedProjects.length === 0 && (
            <option value="">No {projectTab} projects</option>
          )}
        </select>
      </div>

      {/* 4. SECURITY ISOLATION LINK CARD */}
      {projectDetail && (
        <Card title={projectDetail.name} subtitle="Security Isolation Verified Link" actions={
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200 uppercase">
            {projectDetail.status}
          </span>
        }>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Project Manager</span>
              <strong className="text-slate-900 block mt-0.5">{projectDetail.projectManager?.name || 'Sarah Connor'}</strong>
              <span className="text-[10px] text-slate-500 font-mono block">{projectDetail.projectManager?.email || 'sarah.pm@nirman.com'}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Site Location</span>
              <strong className="text-slate-900 block mt-0.5">{projectDetail.siteLocation?.address || 'Site A, Bopal, Ahmedabad'}</strong>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Completion</span>
              <strong className="text-slate-900 block mt-0.5 font-mono">{projectDetail.estimatedCompletion || '2026-11-30'}</strong>
            </div>
          </div>
        </Card>
      )}

      {/* 5. TIMELINE & DIRECT CHAT QUERIES WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Project Timeline Widget (2/3 width) */}
        <Card title="Formatted Project Timeline Events" subtitle="Verify development milestones, site kickoff and completion dates" className="lg:col-span-2">
          {loadingDetails ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-brand-secondary" />
              <span>Fetching project timeline...</span>
            </div>
          ) : (
            <div className="space-y-4 pt-2 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
              {timelineEvents.map((evt, idx) => (
                <div key={idx} className="relative pl-8">
                  
                  <div className={`absolute left-[7px] top-1.5 w-3 h-3 rounded-full border-2 bg-white -translate-x-1/2 ${
                    evt.isCompleted ? 'border-emerald-500' :
                    evt.type === 'START' ? 'border-indigo-600' : 'border-indigo-400'
                  }`}></div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <strong className="text-slate-900 block text-xs font-extrabold">{evt.title}</strong>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        evt.isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {evt.isCompleted ? 'Completed' : 'Scheduled'}
                      </span>
                    </div>
                    {evt.description && (
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        "{evt.description}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono block">Target Date: {evt.date}</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Support Queries Widget (1/3 width) */}
        <Card title="Direct Support Queries" subtitle="Communicate directly with your design lead">
          <div className="flex flex-col justify-between h-[300px]">
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1 scrollbar-none">
              {chats.map(c => (
                <div 
                  key={c.id} 
                  className={`p-3 rounded-2xl text-xs space-y-1 ${
                    c.sender.includes('Me') 
                      ? 'bg-brand-soft border border-brand-secondary/40 text-slate-900 ml-6 rounded-tr-none' 
                      : 'bg-slate-50 text-slate-800 border border-slate-200 mr-6 rounded-tl-none'
                  }`}
                >
                  <strong className="font-black text-[9px] block uppercase opacity-85">{c.sender}</strong>
                  <p className="font-semibold leading-normal">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-100 pt-3">
              <input 
                type="text" 
                placeholder="Ask a question..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary text-xs font-medium bg-white text-slate-800"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-brand-primary text-slate-900 rounded-xl text-xs font-extrabold hover:bg-brand-secondary transition-all shadow-3xs cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </Card>

      </div>

      {/* MODAL: EDIT PROFILE */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Update Profile Details</h3>
              <button onClick={() => setShowEditProfile(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
            </div>

            <form onSubmit={handleProfileUpdateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary bg-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary bg-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditProfile(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={updatingProfile} className="px-5 py-2 bg-brand-primary text-slate-900 font-extrabold rounded-xl shadow-xs hover:bg-brand-secondary transition-all">
                  {updatingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CLIENT SUPPORT TICKETS LIST & THREAD RESPONSES */}
      {showTicketsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-indigo-600" />
                Client Support Tickets Hub
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateTicketModal(true)}
                  className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Raise Support Ticket</span>
                </button>
                <button onClick={() => setShowTicketsModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">&times;</button>
              </div>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {myTickets.length > 0 ? (
                myTickets.map(t => (
                  <div key={t._id || t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="font-extrabold text-slate-900 text-xs">{t.subject}</strong>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        t.status === 'OPEN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-slate-600 font-medium">"{t.description}"</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Priority: <strong className="text-slate-700">{t.priority}</strong></span>
                      <span>Assigned PM: <strong className="text-slate-700">{t.formattedAssignedTo || 'Sarah Connor (Senior PM)'}</strong></span>
                    </div>

                    {/* Actions: Reopen / Cancel */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      {t.status === 'CLOSED' && (
                        <button
                          onClick={async () => {
                            const reason = await window.prompt("Enter reason for reopening ticket:", "", "Reopen Ticket");
                            if (reason && reason.trim()) {
                              const res = await reopenClientTicket(t._id || t.id, reason.trim());
                              if (res?.success) fetchTicketsList();
                            }
                          }}
                          className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Reopen Ticket (14-day grace)
                        </button>
                      )}
                      {['OPEN', 'IN_PROGRESS'].includes(t.status) && (
                        <button
                          onClick={async () => {
                            if (window.confirm("Cancel this ticket?")) {
                              const res = await cancelClientTicket(t._id || t.id);
                              if (res?.success) fetchTicketsList();
                            }
                          }}
                          className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Cancel Ticket
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs font-bold">
                  No active support tickets found for your client account.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW SUPPORT TICKET */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">Raise New Support Ticket</h3>
              <button onClick={() => setShowCreateTicketModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">&times;</button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drawing discrepancy on Column C3"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Priority</label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary bg-white font-bold"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Issue Description *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Describe your query or issue in detail..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary bg-white font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateTicketModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={creatingTicket} className="px-5 py-2 bg-brand-primary text-slate-900 font-extrabold rounded-xl shadow-2xs hover:bg-brand-secondary transition-all cursor-pointer">
                  {creatingTicket ? 'Submitting...' : 'Submit Support Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL FOR CLIENT CONTACT */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 font-sans text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Change Client Password</h3>
                  <p className="text-xs text-slate-500">Update temporary or current login password</p>
                </div>
              </div>
              <button onClick={() => setShowChangePasswordModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            {pwdError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
                {pwdError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Current / Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={pwdForm.oldPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, oldPassword: e.target.value })}
                  placeholder="Enter current or temporary password"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Secure Password *</label>
                <input
                  type="password"
                  required
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPwd}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-xs"
                >
                  {updatingPwd ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
