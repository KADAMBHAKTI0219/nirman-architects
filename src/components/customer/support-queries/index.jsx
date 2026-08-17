import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, MessageSquare, AlertCircle, CheckCircle2, Clock, 
  RefreshCw, Paperclip, Send, ChevronRight, X, User, ArrowLeft, ShieldAlert,
  FileText, Image as ImageIcon, CornerDownRight, Check
} from 'lucide-react';
import Card from '../../common/Card';
import { 
  createClientTicket, 
  getMyClientTickets, 
  getClientTicketDetail, 
  respondToClientTicket, 
  reopenClientTicket, 
  cancelClientTicket 
} from '../../../service/crm/ticket';
import { getClientDashboard } from '../../../service/crm/clientPortal';
import { useToast } from '../../../context/ToastContext';

export default function CustomerSupportQueries({ initialProjectId = null }) {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState(initialProjectId || 'ALL');

  // Raise Query Modal State
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [newQueryForm, setNewQueryForm] = useState({
    projectId: initialProjectId || '',
    category: 'Architecture',
    subject: '',
    description: '',
    priority: 'Medium',
    attachments: []
  });

  // Reply State inside Detail View
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Reopen Modal State
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  // Fetch Projects List for Dropdown
  const fetchProjects = async () => {
    try {
      const res = await getClientDashboard();
      if (res && res.activeProjects) {
        setProjectsList(res.activeProjects);
        if (!newQueryForm.projectId && res.activeProjects.length > 0) {
          setNewQueryForm(prev => ({ ...prev, projectId: res.activeProjects[0].projectId }));
        }
      }
    } catch (err) {
      console.warn("Failed to load projects for query form", err);
    }
  };

  // Fetch Customer Tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getMyClientTickets();
      if (res && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error("Failed to load customer support queries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTickets();
  }, []);

  // Fetch specific ticket detail when selected
  const handleOpenTicketDetail = async (ticketObj) => {
    setSelectedTicket(ticketObj);
    setTicketDetailsLoading(true);
    try {
      const res = await getClientTicketDetail(ticketObj._id || ticketObj.id);
      if (res && res.ticket) {
        setSelectedTicket({
          ...res.ticket,
          responses: res.responses || res.ticket.responses || []
        });
      }
    } catch (err) {
      console.warn("Notice loading ticket details:", err);
    } finally {
      setTicketDetailsLoading(false);
    }
  };

  // Filtered & Searched Tickets List
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const qId = (t._id || t.id || '').toLowerCase();
      const subj = (t.subject || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const projName = (t.projectName || t.projectId?.projectName || '').toLowerCase();
      const s = searchQuery.toLowerCase();

      const matchesSearch = !s || qId.includes(s) || subj.includes(s) || desc.includes(s) || projName.includes(s);
      const matchesStatus = statusFilter === 'ALL' || (t.status || 'OPEN').toUpperCase() === statusFilter.toUpperCase();
      const matchesPriority = priorityFilter === 'ALL' || (t.priority || 'Medium').toUpperCase() === priorityFilter.toUpperCase();
      const matchesProject = projectFilter === 'ALL' || (t.projectId?._id || t.projectId?.id || t.projectId) === projectFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, projectFilter]);

  // Dynamic KPI Stats derived safely from live list
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => (t.status || 'OPEN').toUpperCase() === 'OPEN').length;
    const inProgress = tickets.filter(t => (t.status || '').toUpperCase() === 'IN_PROGRESS').length;
    const waiting = tickets.filter(t => (t.status || '').toUpperCase() === 'WAITING_FOR_CLIENT' || (t.status || '').toUpperCase() === 'PENDING').length;
    const resolved = tickets.filter(t => (t.status || '').toUpperCase() === 'RESOLVED' || (t.status || '').toUpperCase() === 'CLOSED').length;
    return { total, open, inProgress, waiting, resolved };
  }, [tickets]);

  // Handle Form Submit: Raise Support Query
  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!newQueryForm.projectId) {
      showToast('Please select a project before submitting.', 'error');
      return;
    }
    if (!newQueryForm.subject.trim()) {
      showToast('Please enter a subject for your query.', 'error');
      return;
    }
    if (!newQueryForm.description.trim()) {
      showToast('Please enter a detailed description.', 'error');
      return;
    }

    setSubmittingQuery(true);
    try {
      const res = await createClientTicket(newQueryForm);
      if (res && res.success) {
        setIsRaiseModalOpen(false);
        setNewQueryForm({
          projectId: projectsList[0]?.projectId || '',
          category: 'Architecture',
          subject: '',
          description: '',
          priority: 'Medium',
          attachments: []
        });
        showToast('Support query raised successfully!', 'success');
        await fetchTickets();
        if (res.ticket) {
          handleOpenTicketDetail(res.ticket);
        }
      } else {
        showToast(res?.message || 'Failed to submit support query.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Error submitting query.', 'error');
    } finally {
      setSubmittingQuery(false);
    }
  };

  // Handle Reply to Support
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      showToast('Please enter a message before replying.', 'error');
      return;
    }
    if (!selectedTicket) return;

    setSendingReply(true);
    try {
      const ticketId = selectedTicket._id || selectedTicket.id;
      const res = await respondToClientTicket(ticketId, replyMessage.trim());
      if (res && res.success) {
        setReplyMessage('');
        showToast('Response sent to support team.', 'success');
        await handleOpenTicketDetail(selectedTicket);
        await fetchTickets();
      } else {
        showToast(res?.message || 'Failed to send response.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to send response.', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  // Handle Reopen Ticket Submit
  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setReopening(true);
    try {
      const ticketId = selectedTicket._id || selectedTicket.id;
      const res = await reopenClientTicket(ticketId, reopenReason.trim());
      if (res && res.success) {
        setIsReopenModalOpen(false);
        setReopenReason('');
        showToast('Support query reopened successfully.', 'success');
        await handleOpenTicketDetail(selectedTicket);
        await fetchTickets();
      } else {
        showToast(res?.message || 'Failed to reopen query.', 'error');
      }
    } catch (err) {
      showToast('Failed to reopen ticket: ' + err.message, 'error');
    } finally {
      setReopening(false);
    }
  };

  // Handle Cancel Ticket
  const handleCancelTicket = async () => {
    if (!selectedTicket) return;
    if (!window.confirm("Are you sure you want to cancel this support query?")) return;
    try {
      const ticketId = selectedTicket._id || selectedTicket.id;
      const res = await cancelClientTicket(ticketId);
      if (res && res.success) {
        showToast('Support query cancelled.', 'info');
        await handleOpenTicketDetail(selectedTicket);
        await fetchTickets();
      } else {
        showToast(res?.message || 'Failed to cancel query.', 'error');
      }
    } catch (err) {
      showToast('Failed to cancel query: ' + err.message, 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = (status || 'OPEN').toUpperCase();
    switch (s) {
      case 'OPEN':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WAITING_FOR_CLIENT':
      case 'PENDING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    const p = (priority || 'Medium').toLowerCase();
    if (p === 'high' || p === 'urgent' || p === 'critical') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (p === 'low') {
      return 'bg-slate-100 text-slate-600 border-slate-200';
    }
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 w-full max-w-[1400px] mx-auto pb-12">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Support Queries</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Raise and track support tickets, design clarifications & architectural queries for your active projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Queries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-dark' : ''}`} />
          </button>
          <button
            onClick={() => setIsRaiseModalOpen(true)}
            className="px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-2xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer border border-brand-secondary/40"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Raise Support Query</span>
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Total Queries</span>
          <strong className="text-xl font-black text-slate-900 block mt-1">{stats.total}</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs">
          <span className="text-[10px] font-black text-sky-600 block uppercase tracking-wider">Open</span>
          <strong className="text-xl font-black text-sky-700 block mt-1">{stats.open}</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs">
          <span className="text-[10px] font-black text-amber-600 block uppercase tracking-wider">In Progress</span>
          <strong className="text-xl font-black text-amber-700 block mt-1">{stats.inProgress}</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-2xs">
          <span className="text-[10px] font-black text-purple-600 block uppercase tracking-wider">Awaiting Action</span>
          <strong className="text-xl font-black text-purple-700 block mt-1">{stats.waiting}</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-black text-emerald-600 block uppercase tracking-wider">Resolved</span>
          <strong className="text-xl font-black text-emerald-700 block mt-1">{stats.resolved}</strong>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE VIEW (LIST OR DETAIL) */}
      {!selectedTicket ? (
        /* QUERY LISTING & FILTERING VIEW */
        <div className="space-y-4">
          
          {/* SEARCH & FILTER TOOLBAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
            
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Query ID, Subject, Project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-primary text-slate-800"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Projects</option>
                {projectsList.map(p => (
                  <option key={p.projectId} value={p.projectId}>
                    {p.name || p.projectName}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_CLIENT">Awaiting Action</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

          </div>

          {/* QUERY LIST CONTENT */}
          {loading ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-brand-dark" />
              <p className="text-xs font-bold text-slate-600">Loading your support queries...</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
              
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-5">Query ID</th>
                      <th className="py-3.5 px-5">Subject</th>
                      <th className="py-3.5 px-5">Project</th>
                      <th className="py-3.5 px-5">Priority</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Created</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(t => {
                      const tId = t._id || t.id;
                      const projName = t.projectName || t.projectId?.projectName || t.projectId?.name || 'Architectural Project';
                      const createdDate = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A';

                      return (
                        <tr 
                          key={tId} 
                          onClick={() => handleOpenTicketDetail(t)}
                          className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-5 font-mono text-[11px] font-extrabold text-slate-900">
                            #{tId.substring(tId.length - 6).toUpperCase()}
                          </td>
                          <td className="py-4 px-5 max-w-xs truncate font-bold text-slate-900">
                            {t.subject}
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-semibold">
                            {projName}
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${getPriorityBadgeClass(t.priority)}`}>
                              {t.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusBadgeClass(t.status)}`}>
                              {t.status || 'OPEN'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-400 font-medium">
                            {createdDate}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleOpenTicketDetail(t); }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-brand-primary text-slate-900 font-black text-[10px] uppercase rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Workspace</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredTickets.map(t => {
                  const tId = t._id || t.id;
                  const projName = t.projectName || t.projectId?.projectName || t.projectId?.name || 'Architectural Project';

                  return (
                    <div 
                      key={tId} 
                      onClick={() => handleOpenTicketDetail(t)}
                      className="p-4 space-y-2 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] font-black text-slate-400">
                          #{tId.substring(tId.length - 6).toUpperCase()}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusBadgeClass(t.status)}`}>
                          {t.status || 'OPEN'}
                        </span>
                      </div>
                      <strong className="text-sm font-black text-slate-900 block">{t.subject}</strong>
                      <p className="text-xs text-slate-500 font-medium">{projName}</p>
                      <div className="flex justify-between items-center pt-2 text-[10px] font-bold text-slate-400">
                        <span className={`px-2 py-0.5 rounded border ${getPriorityBadgeClass(t.priority)}`}>
                          {t.priority || 'Medium'}
                        </span>
                        <span>View Details &rarr;</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3 p-8">
              <AlertCircle className="w-9 h-9 text-slate-300 mx-auto" />
              <div>
                <h3 className="text-sm font-black text-slate-800">No support queries found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 font-medium">
                  Need help or structural clarification with your architectural project? Raise a support query and our engineering team will get back to you.
                </p>
              </div>
              <button
                onClick={() => setIsRaiseModalOpen(true)}
                className="px-4 py-2 bg-brand-primary text-slate-900 font-black text-xs rounded-xl shadow-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Raise Support Query</span>
              </button>
            </div>
          )}

        </div>
      ) : (
        /* DEDICATED QUERY DETAIL WORKSPACE & CONVERSATION THREAD */
        <div className="space-y-6 animate-in zoom-in-95 duration-150">
          
          {/* Back button header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTicket(null)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Queries List</span>
            </button>

            <div className="flex items-center gap-2">
              {((selectedTicket.status || '').toUpperCase() === 'RESOLVED' || (selectedTicket.status || '').toUpperCase() === 'CLOSED') && (
                <button
                  onClick={() => setIsReopenModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Reopen Query
                </button>
              )}

              {(selectedTicket.status || '').toUpperCase() !== 'CANCELLED' && (selectedTicket.status || '').toUpperCase() !== 'RESOLVED' && (
                <button
                  onClick={handleCancelTicket}
                  className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Cancel Query
                </button>
              )}
            </div>
          </div>

          {/* 2-Column Detail Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT 2-COLUMNS: QUERY INFO & DESCRIPTION */}
            <div className="lg:col-span-2 space-y-6">
              
              <Card 
                title={selectedTicket.subject} 
                subtitle={`Query ID: #${(selectedTicket._id || selectedTicket.id || '').substring((selectedTicket._id || selectedTicket.id || '').length - 6).toUpperCase()}`}
              >
                <div className="space-y-4 pt-2 text-xs">
                  
                  {/* Status & Priority Badges */}
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${getStatusBadgeClass(selectedTicket.status)}`}>
                      {selectedTicket.status || 'OPEN'}
                    </span>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-xl border ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority || 'Medium'} Priority
                    </span>
                  </div>

                  {/* Query Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Description</label>
                    <p className="text-slate-800 text-xs font-semibold leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Attachments if available */}
                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Attachments</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.attachments.map((att, idx) => (
                          <a
                            key={idx}
                            href={typeof att === 'string' ? att : att.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-brand-primary transition-all flex items-center gap-2"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-brand-dark" />
                            <span>Attachment #{idx + 1}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </Card>

              {/* CONVERSATION THREAD */}
              <Card title="Support Conversation Thread" subtitle="Communication history with engineering staff">
                <div className="space-y-4 pt-3">
                  
                  {/* Main Raised Query Bubble */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                      <span>Customer (Owner)</span>
                      <span>{selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'Original Request'}</span>
                    </div>
                    <p className="text-slate-800 font-semibold">{selectedTicket.description}</p>
                  </div>

                  {/* Response Bubbles */}
                  {ticketDetailsLoading ? (
                    <div className="py-6 text-center text-xs font-bold text-slate-400">
                      Loading conversation...
                    </div>
                  ) : selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                    selectedTicket.responses.map((resp, idx) => {
                      const isStaff = resp.isStaff || resp.senderRole === 'STAFF' || resp.role === 'Admin' || resp.role === 'PROJECT_MANAGER';

                      return (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-2xl border space-y-2 text-xs ${
                            isStaff 
                              ? 'bg-blue-50/40 border-blue-150 ml-4 sm:ml-8' 
                              : 'bg-slate-50 border-slate-150 mr-4 sm:mr-8'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                            <span className={isStaff ? 'text-blue-700 font-black' : 'text-slate-500'}>
                              {resp.senderName || resp.name || (isStaff ? 'Support Engineer' : 'Customer')}
                            </span>
                            <span className="text-slate-400 font-normal">
                              {resp.createdAt ? new Date(resp.createdAt).toLocaleString() : 'Just now'}
                            </span>
                          </div>
                          <p className="text-slate-800 font-semibold leading-relaxed">{resp.message}</p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 bg-amber-50/50 border border-amber-150 rounded-2xl text-amber-800 text-xs font-semibold text-center">
                      No staff responses yet. Our team will get back to you shortly.
                    </div>
                  )}

                  {/* REPLY COMPOSER FORM */}
                  {(selectedTicket.status || '').toUpperCase() !== 'CANCELLED' && (
                    <form onSubmit={handleSendReply} noValidate className="space-y-3 pt-3 border-t border-slate-100">
                      <textarea
                        placeholder="Write your reply or provide additional details..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows="3"
                        className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-primary"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={sendingReply}
                          className="px-4.5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-black text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{sendingReply ? 'Sending...' : 'Send Response'}</span>
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: METADATA & CONTEXT */}
            <div className="space-y-4">
              
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 text-xs font-semibold text-slate-700">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">
                  Query Overview
                </span>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Associated Project</span>
                    <strong className="text-slate-900 font-black text-xs block mt-0.5">
                      {selectedTicket.projectName || selectedTicket.projectId?.projectName || selectedTicket.projectId?.name || 'Architectural Project'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Created Date</span>
                    <span className="text-slate-700 block mt-0.5">
                      {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Last Updated</span>
                    <span className="text-slate-700 block mt-0.5">
                      {selectedTicket.updatedAt ? new Date(selectedTicket.updatedAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 4. RAISE NEW QUERY MODAL */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 z-[99999] overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full shadow-2xl p-6 sm:p-7 space-y-5 my-auto">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Raise Support Query</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Submit technical or billing inquiry</p>
              </div>
              <button 
                onClick={() => setIsRaiseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-sm p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRaiseSubmit} noValidate className="space-y-4 text-xs font-bold text-slate-700">
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Select Project <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newQueryForm.projectId}
                  onChange={(e) => setNewQueryForm({ ...newQueryForm, projectId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-900 focus:outline-none focus:border-brand-primary"
                >
                  {projectsList.length > 0 ? (
                    projectsList.map(p => (
                      <option key={p.projectId} value={p.projectId}>
                        {p.name || p.projectName}
                      </option>
                    ))
                  ) : (
                    <option value="">No Active Projects Available</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={newQueryForm.category}
                    onChange={(e) => setNewQueryForm({ ...newQueryForm, category: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="Architecture">Architecture Design</option>
                    <option value="Structural">Structural & Rebar</option>
                    <option value="MEP">MEP & Utilities</option>
                    <option value="Billing">Billing & Milestones</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Priority</label>
                  <select
                    value={newQueryForm.priority}
                    onChange={(e) => setNewQueryForm({ ...newQueryForm, priority: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-900 focus:outline-none"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Briefly describe your issue (e.g. Clarification on Column C3 rebar drawing...)"
                  value={newQueryForm.subject}
                  onChange={(e) => setNewQueryForm({ ...newQueryForm, subject: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Describe your query in detail..."
                  value={newQueryForm.description}
                  onChange={(e) => setNewQueryForm({ ...newQueryForm, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-900 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuery}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-black text-xs rounded-xl shadow-2xs uppercase tracking-wider cursor-pointer"
                >
                  {submittingQuery ? 'Submitting...' : 'Submit Query'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 5. REOPEN QUERY MODAL */}
      {isReopenModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900">Reopen Support Query</h3>
            <form onSubmit={handleReopenSubmit} noValidate className="space-y-4 text-xs font-bold text-slate-700">
              <textarea
                placeholder="Reason for reopening (optional)..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows="3"
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsReopenModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reopening}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs uppercase cursor-pointer"
                >
                  {reopening ? 'Reopening...' : 'Confirm Reopen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
