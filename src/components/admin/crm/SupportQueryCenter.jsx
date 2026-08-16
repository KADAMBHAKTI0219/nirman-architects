import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, RefreshCw, MessageSquare, AlertCircle, CheckCircle2, 
  Clock, UserCheck, ShieldAlert, ArrowLeft, Send, Paperclip, ChevronRight, X, User
} from 'lucide-react';
import Card from '../../common/Card';
import { 
  getAllTicketsInternal, 
  respondToTicketStaff, 
  updateTicketStatus, 
  reassignTicket,
  getClientTicketDetail
} from '../../../service/crm/ticket';
import { getProjects } from '../../../service/project';

export default function SupportQueryCenter() {
  const [tickets, setTickets] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState('ALL');

  // Staff Response Form State
  const [staffReplyText, setStaffReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [replyNotice, setReplyNotice] = useState('');

  // Reassignment State
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [reassigning, setReassigning] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getAllTicketsInternal();
      if (res && res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      console.error("Failed to load staff support query list:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      if (res && res.projects) {
        setProjectsList(res.projects);
      }
    } catch (err) {
      console.warn("Failed to load projects list for support filter:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchProjects();
  }, []);

  const handleOpenDetail = async (tObj) => {
    setSelectedTicket(tObj);
    setDetailLoading(true);
    try {
      const ticketId = tObj._id || tObj.id;
      const res = await getClientTicketDetail(ticketId);
      if (res && res.ticket) {
        setSelectedTicket({
          ...res.ticket,
          responses: res.responses || res.ticket.responses || []
        });
      }
    } catch (err) {
      console.warn("Notice loading ticket detail for staff:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const qId = (t._id || t.id || '').toLowerCase();
      const subj = (t.subject || '').toLowerCase();
      const customerName = (t.raisedBy?.name || t.clientName || t.customerName || '').toLowerCase();
      const projName = (t.projectName || t.projectId?.projectName || t.projectId?.name || '').toLowerCase();
      const s = searchQuery.toLowerCase();

      const matchesSearch = !s || qId.includes(s) || subj.includes(s) || customerName.includes(s) || projName.includes(s);
      const matchesStatus = statusFilter === 'ALL' || (t.status || 'OPEN').toUpperCase() === statusFilter.toUpperCase();
      const matchesPriority = priorityFilter === 'ALL' || (t.priority || 'Medium').toUpperCase() === priorityFilter.toUpperCase();
      const matchesProject = projectFilter === 'ALL' || (t.projectId?._id || t.projectId?.id || t.projectId) === projectFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, projectFilter]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => (t.status || 'OPEN').toUpperCase() === 'OPEN').length;
    const inProgress = tickets.filter(t => (t.status || '').toUpperCase() === 'IN_PROGRESS').length;
    const waiting = tickets.filter(t => (t.status || '').toUpperCase() === 'WAITING_FOR_CLIENT' || (t.status || '').toUpperCase() === 'PENDING').length;
    const resolved = tickets.filter(t => (t.status || '').toUpperCase() === 'RESOLVED' || (t.status || '').toUpperCase() === 'CLOSED').length;
    return { total, open, inProgress, waiting, resolved };
  }, [tickets]);

  const handleSendStaffReply = async (e) => {
    e.preventDefault();
    if (!staffReplyText.trim() || !selectedTicket) return;

    setSendingReply(true);
    setReplyNotice('');
    try {
      const ticketId = selectedTicket._id || selectedTicket.id;
      const res = await respondToTicketStaff(ticketId, staffReplyText.trim(), isInternalNote);
      if (res && res.success) {
        setStaffReplyText('');
        setIsInternalNote(false);
        setReplyNotice('Response logged successfully!');
        setTimeout(() => setReplyNotice(''), 3500);
        await handleOpenDetail(selectedTicket);
        await fetchTickets();
      }
    } catch (err) {
      alert("Notice sending staff response: " + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusTransition = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const ticketId = selectedTicket._id || selectedTicket.id;
      const res = await updateTicketStatus(ticketId, newStatus);
      if (res && res.success) {
        await handleOpenDetail(selectedTicket);
        await fetchTickets();
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Support Query Operations</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Centralized support ticket management, staff responses, status updates & project issue resolutions.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 transition-colors cursor-pointer flex items-center gap-2 font-bold text-xs"
          title="Refresh Support Hub"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-dark' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Total Client Queries</span>
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
          <span className="text-[10px] font-black text-purple-600 block uppercase tracking-wider">Pending Staff Action</span>
          <strong className="text-xl font-black text-purple-700 block mt-1">{stats.waiting}</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-black text-emerald-600 block uppercase tracking-wider">Resolved</span>
          <strong className="text-xl font-black text-emerald-700 block mt-1">{stats.resolved}</strong>
        </div>
      </div>

      {/* 3. WORKSPACE (LIST VS DETAIL) */}
      {!selectedTicket ? (
        <div className="space-y-4">
          
          {/* SEARCH & FILTER TOOLBAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Query ID, Subject, Customer, Project..."
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
                  <option key={p._id || p.id} value={p._id || p.id}>
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

          {/* MASTER TICKETS TABLE */}
          {loading ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-brand-dark" />
              <p className="text-xs font-bold text-slate-600">Loading support query roster...</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-5">Query ID</th>
                      <th className="py-3.5 px-5">Customer</th>
                      <th className="py-3.5 px-5">Project</th>
                      <th className="py-3.5 px-5">Subject</th>
                      <th className="py-3.5 px-5">Priority</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(t => {
                      const tId = t._id || t.id;
                      const custName = t.raisedBy?.name || t.clientName || t.customerName || 'Client Representative';
                      const projName = t.projectName || t.projectId?.projectName || t.projectId?.name || 'Architectural Project';

                      return (
                        <tr 
                          key={tId} 
                          onClick={() => handleOpenDetail(t)}
                          className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-5 font-mono text-[11px] font-extrabold text-slate-900">
                            #{tId.substring(tId.length - 6).toUpperCase()}
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900">
                            {custName}
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-semibold">
                            {projName}
                          </td>
                          <td className="py-4 px-5 max-w-xs truncate font-semibold text-slate-800">
                            {t.subject}
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
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenDetail(t); }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Manage</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 space-y-2 p-8">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No support tickets match your filter parameters.</p>
            </div>
          )}

        </div>
      ) : (
        /* DETAIL & STAFF RESPONSE WORKSPACE */
        <div className="space-y-6 animate-in zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTicket(null)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tickets Roster</span>
            </button>

            {/* STATUS TRANSITION BUTTONS */}
            <div className="flex items-center gap-2">
              {(selectedTicket.status || '').toUpperCase() !== 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusTransition('IN_PROGRESS')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Mark In Progress
                </button>
              )}

              {(selectedTicket.status || '').toUpperCase() !== 'RESOLVED' && (
                <button
                  onClick={() => handleStatusTransition('RESOLVED')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  Resolve Query
                </button>
              )}

              {(selectedTicket.status || '').toUpperCase() === 'RESOLVED' && (
                <button
                  onClick={() => handleStatusTransition('OPEN')}
                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Reopen Query
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* LEFT 2-COLUMNS: QUERY DETAILS & THREAD */}
            <div className="lg:col-span-2 space-y-6">
              
              <Card 
                title={selectedTicket.subject}
                subtitle={`Ticket ID: #${(selectedTicket._id || selectedTicket.id || '').substring((selectedTicket._id || selectedTicket.id || '').length - 6).toUpperCase()}`}
              >
                <div className="space-y-4 pt-2 text-xs font-semibold text-slate-800">
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${getStatusBadgeClass(selectedTicket.status)}`}>
                      {selectedTicket.status || 'OPEN'}
                    </span>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-xl border ${getPriorityBadgeClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority || 'Medium'} Priority
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase block">Customer Description</span>
                    <p className="p-4 bg-slate-50 rounded-2xl border border-slate-150 leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>
                </div>
              </Card>

              {/* CONVERSATION THREAD */}
              <Card title="Query Discussion & Staff Notes" subtitle="Communication history with client">
                <div className="space-y-4 pt-2">
                  
                  {/* Original Customer Message */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                      <span>Customer ({selectedTicket.raisedBy?.name || 'Client Representative'})</span>
                      <span>{selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'Original Request'}</span>
                    </div>
                    <p className="text-slate-800 font-semibold">{selectedTicket.description}</p>
                  </div>

                  {/* Responses */}
                  {detailLoading ? (
                    <div className="py-6 text-center text-xs font-bold text-slate-400">Loading conversation thread...</div>
                  ) : selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                    selectedTicket.responses.map((resp, idx) => (
                      <div 
                        key={idx}
                        className={`p-4 rounded-2xl border space-y-1.5 text-xs ${
                          resp.isInternalNote
                            ? 'bg-purple-50/50 border-purple-200'
                            : resp.isStaff || resp.senderRole === 'STAFF'
                            ? 'bg-blue-50/40 border-blue-150 ml-4 sm:ml-8'
                            : 'bg-slate-50 border-slate-150 mr-4 sm:mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                          <span className={resp.isInternalNote ? 'text-purple-700' : resp.isStaff ? 'text-blue-700' : 'text-slate-600'}>
                            {resp.senderName || resp.name || 'Staff Member'} {resp.isInternalNote && '(Internal Note)'}
                          </span>
                          <span className="text-slate-400 font-normal">
                            {resp.createdAt ? new Date(resp.createdAt).toLocaleString() : 'Recently'}
                          </span>
                        </div>
                        <p className="text-slate-800 font-semibold leading-relaxed">{resp.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-xs font-semibold text-center">
                      No responses logged yet.
                    </div>
                  )}

                  {/* STAFF REPLY FORM */}
                  <form onSubmit={handleSendStaffReply} className="space-y-3 pt-3 border-t border-slate-100 text-xs font-semibold">
                    {replyNotice && (
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                        {replyNotice}
                      </div>
                    )}

                    <textarea
                      required
                      rows="3"
                      placeholder="Write staff response to client or log internal note..."
                      value={staffReplyText}
                      onChange={(e) => setStaffReplyText(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-slate-900"
                    />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="internalNoteCheck"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="internalNoteCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                          Internal Note (Visible to staff only)
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={sendingReply}
                        className="px-4.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingReply ? 'Logging...' : 'Post Response'}</span>
                      </button>
                    </div>
                  </form>

                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: METADATA & CUSTOMER INFO */}
            <div className="space-y-4">
              
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 text-xs font-semibold text-slate-700">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-2">
                  Client & Project Context
                </span>

                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Customer / Client</span>
                    <strong className="text-slate-900 font-black text-xs block mt-0.5">
                      {selectedTicket.raisedBy?.name || selectedTicket.clientName || 'Client Representative'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Project Name</span>
                    <span className="text-slate-800 font-bold block mt-0.5">
                      {selectedTicket.projectName || selectedTicket.projectId?.projectName || selectedTicket.projectId?.name || 'Architectural Project'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase block">Submitted Date</span>
                    <span className="text-slate-600 block mt-0.5">
                      {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
