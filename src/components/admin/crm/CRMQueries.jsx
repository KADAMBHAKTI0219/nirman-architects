import React, { useState, useEffect } from 'react';
import { Search, Eye, AlertCircle, Check, Send, User, RefreshCw, LifeBuoy, Filter, ArrowRight, UserCheck, MessageSquare, Clock } from 'lucide-react';
import Card from '../../common/Card';
import {
  getAllTicketsInternal,
  respondToTicketStaff,
  updateTicketStatus,
  reassignTicket,
  getClientTicketDetail
} from '../../../service/ticket';
import { getUsersList } from '../../../service/auth';

export default function CRMQueries() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Selected Ticket Detail & Response Thread State
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketDetail, setTicketDetail] = useState(null);
  const [responses, setResponses] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [staffReplyInput, setStaffReplyInput] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Staff users for reassignment
  const [staffUsers, setStaffUsers] = useState([]);

  useEffect(() => {
    fetchTickets();
    fetchStaffUsers();
  }, [statusFilter, priorityFilter]);

  const fetchStaffUsers = async () => {
    try {
      const res = await getUsersList();
      const userList = Array.isArray(res) ? res : (res?.users || []);
      setStaffUsers(userList);
    } catch (err) {
      console.error("Failed to load staff list", err);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getAllTicketsInternal({
        status: statusFilter,
        priority: priorityFilter
      });
      if (res?.success) {
        const ticketList = res.tickets || [];
        setTickets(ticketList);
        if (ticketList.length > 0 && !selectedTicketId) {
          handleSelectTicket(ticketList[0]._id || ticketList[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticketId) => {
    setSelectedTicketId(ticketId);
    setDetailLoading(true);
    try {
      const res = await getClientTicketDetail(ticketId);
      if (res?.success) {
        setTicketDetail(res.ticket);
        setResponses(res.responses || []);
      }
    } catch (err) {
      console.error("Failed to load ticket detail", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStaffReplySubmit = async (e) => {
    e.preventDefault();
    if (!staffReplyInput.trim() || !selectedTicketId) return;

    setReplySubmitting(true);
    try {
      const res = await respondToTicketStaff(selectedTicketId, staffReplyInput.trim());
      if (res?.success) {
        setStaffReplyInput('');
        handleSelectTicket(selectedTicketId);
        fetchTickets();
      } else {
        alert(res?.message || 'Failed to dispatch staff reply.');
      }
    } catch (err) {
      alert("Error dispatching staff reply.");
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await updateTicketStatus(ticketId, newStatus);
      if (res?.success) {
        fetchTickets();
        if (selectedTicketId === ticketId) {
          handleSelectTicket(ticketId);
        }
      } else {
        alert(res?.message || 'Failed to update ticket status.');
      }
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const handleReassign = async (ticketId, targetUserId) => {
    if (!targetUserId) return;
    try {
      const res = await reassignTicket(ticketId, targetUserId);
      if (res?.success) {
        alert("Ticket reassigned successfully!");
        fetchTickets();
        if (selectedTicketId === ticketId) {
          handleSelectTicket(ticketId);
        }
      }
    } catch (err) {
      alert("Error reassigning ticket.");
    }
  };

  const filteredTickets = tickets.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.formattedRaisedBy && t.formattedRaisedBy.toLowerCase().includes(q)) ||
      (t.projectName && t.projectName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Client Support Tickets & Queries</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Internal PM & Staff Ticket Workspace: Address support queries, dispatch staff responses & track ticket lifecycles.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tickets by subject, client name or project..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs font-semibold bg-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-extrabold text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-extrabold text-slate-700 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main Split: Ticket Table (2/3) + Selected Ticket Detail & Thread (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Ledger Table (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-black uppercase text-[9px] tracking-wider">
                  <th className="px-4 py-3.5">Ticket Subject & Issue</th>
                  <th className="px-4 py-3.5">Client & Contact</th>
                  <th className="px-4 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Lifecycle Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map(t => {
                    const isSelected = selectedTicketId === (t._id || t.id);
                    return (
                      <tr 
                        key={t._id || t.id} 
                        onClick={() => handleSelectTicket(t._id || t.id)}
                        className={`hover:bg-amber-50/40 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50/80 border-l-4 border-l-amber-500' : ''}`}
                      >
                        <td className="px-4 py-3.5">
                          <strong className="text-slate-900 font-extrabold block text-xs truncate max-w-[200px]">
                            {t.subject}
                          </strong>
                          <span className="text-[10px] text-slate-500 block truncate max-w-[220px]">
                            "{t.description}"
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <strong className="text-slate-800 font-bold block">
                            {t.formattedRaisedBy || t.raisedBy?.name || 'Client Contact'}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            Assigned: {t.formattedAssignedTo || 'PM Team'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-slate-700">
                          {t.projectName || t.projectId?.name || 'Project'}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            (t.priority || '').toUpperCase().includes('HIGH') 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {t.priority || 'Medium'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={t.status || 'OPEN'}
                            onChange={(e) => handleStatusChange(t._id || t.id, e.target.value)}
                            className="text-[10px] font-black px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none cursor-pointer"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="CLOSED">CLOSED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => handleSelectTicket(t._id || t.id)}
                            className="p-1.5 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 rounded-xl text-slate-600 transition-colors"
                            title="Inspect Thread"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-slate-400 font-bold">
                      No client tickets found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Ticket Thread & Response Workspace (1/3 width) */}
        <div className="space-y-4">
          {ticketDetail ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block">
                    {ticketDetail.projectName || 'Project Workspace'}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-tight mt-0.5">
                    {ticketDetail.subject}
                  </h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  ticketDetail.status === 'OPEN' ? 'bg-amber-100 text-amber-800' :
                  ticketDetail.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  ticketDetail.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {ticketDetail.status}
                </span>
              </div>

              {/* Raised By & Reassign Dropdown */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px]">Raised By:</span>
                  <strong className="text-slate-900 font-bold">
                    {ticketDetail.formattedRaisedBy || ticketDetail.raisedBy?.name}
                  </strong>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 text-[10px]">Assigned Staff:</span>
                  <select
                    value={ticketDetail.assignedTo?._id || ticketDetail.assignedTo?.id || ''}
                    onChange={(e) => handleReassign(ticketDetail._id || ticketDetail.id, e.target.value)}
                    className="text-[10px] font-bold px-2 py-0.5 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none"
                  >
                    <option value="">Select Staff Owner</option>
                    {staffUsers.map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name} ({u.role || u.designation || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thread Responses List */}
              <div className="space-y-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Conversation Thread ({responses.length} Messages)
                </span>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {responses.map((resp, idx) => (
                    <div 
                      key={resp._id || idx}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        resp.authorType === 'EMPLOYEE'
                          ? 'bg-amber-50 border border-amber-200 text-amber-950 ml-4'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] font-bold">
                        <span className="uppercase text-amber-700">{resp.formattedAuthorName || 'Author'}</span>
                        <span className="text-slate-400 font-mono">
                          {resp.respondedAt ? new Date(resp.respondedAt).toLocaleTimeString() : 'Recent'}
                        </span>
                      </div>
                      <p className="font-medium leading-relaxed">"{resp.message}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              {['OPEN', 'IN_PROGRESS'].includes(ticketDetail.status) ? (
                <form onSubmit={handleStaffReplySubmit} className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    Post Internal Staff Reply
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Type official reply to client ticket..."
                      value={staffReplyInput}
                      onChange={(e) => setStaffReplyInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-xs font-medium bg-white"
                    />
                    <button
                      type="submit"
                      disabled={replySubmitting}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl shadow-2xs text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-600">
                  Ticket status is {ticketDetail.status}. Responses disabled.
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs text-center text-slate-400 text-xs font-bold h-64 flex flex-col items-center justify-center space-y-2">
              <LifeBuoy className="w-8 h-8 text-slate-300" />
              <span>Select a client ticket to inspect thread & dispatch staff replies.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
