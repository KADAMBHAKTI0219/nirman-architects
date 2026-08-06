import React, { useState, useEffect } from 'react';
import { Send, ArrowRight, MessageSquare, AlertCircle, Clock, CheckCircle2, RefreshCw, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../common/Card';
import { getAllTicketsInternal, respondToTicketStaff, updateTicketStatus } from '../../../service/crm/ticket';

export default function ClientQueriesPanel() {
  const navigate = useNavigate();
  const [replies, setReplies] = useState({});
  const [sentStatus, setSentStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await getAllTicketsInternal();
      if (res?.success) {
        setTickets(res.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load tickets in PM dashboard panel", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (ticketId) => {
    const text = replies[ticketId];
    if (!text || !text.trim()) return;

    try {
      const res = await respondToTicketStaff(ticketId, text);
      if (res?.success) {
        setSentStatus(prev => ({ ...prev, [ticketId]: true }));
        setTimeout(() => {
          setSentStatus(prev => ({ ...prev, [ticketId]: false }));
        }, 3000);
        setReplies(prev => ({ ...prev, [ticketId]: '' }));
        fetchTickets();
      } else {
        alert(res?.message || 'Failed to send reply.');
      }
    } catch (err) {
      alert("Error sending ticket reply.");
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await updateTicketStatus(ticketId, newStatus);
      if (res?.success) {
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <Card
      title="Client Support Tickets & Queries"
      subtitle="Client Portal support tickets assigned to PM team"
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/project-manager/chats')}
            className="text-xs font-black text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open Ticket Hub</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {tickets.length > 0 ? (
          tickets.map((t) => (
            <div
              key={t._id || t.id}
              className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between space-y-3 hover:bg-white hover:border-sky-300 hover:shadow-xs transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-100 font-extrabold text-sky-800 text-xs flex items-center justify-center ring-2 ring-sky-200 shrink-0">
                      {(t.raisedBy?.name || 'C')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-extrabold text-xs">
                          {t.formattedRaisedBy || t.raisedBy?.name || 'Client Contact'}
                        </strong>
                      </div>
                      <span className="text-[9px] uppercase font-black text-sky-600 tracking-wider block truncate max-w-[180px]">
                        {t.projectName || t.projectId?.name || 'Project'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      (t.priority || '').toUpperCase().includes('HIGH') 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    }`}>
                      {t.priority || 'MEDIUM'}
                    </span>
                    <select
                      value={t.status || 'OPEN'}
                      onChange={(e) => handleStatusChange(t._id || t.id, e.target.value)}
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 focus:outline-none"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200/70 text-xs text-slate-700 font-medium leading-relaxed shadow-3xs relative space-y-1">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400 absolute top-2.5 right-2.5 opacity-50" />
                  <strong className="text-slate-900 font-extrabold block">{t.subject}</strong>
                  <p className="text-slate-600 text-[11px]">"{t.description}"</p>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                {sentStatus[t._id || t.id] && (
                  <div className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Staff reply sent & ticket updated to IN_PROGRESS!</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replies[t._id || t.id] || ''}
                    onChange={(e) => setReplies({ ...replies, [t._id || t.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply(t._id || t.id);
                    }}
                    placeholder="Type staff response to client ticket..."
                    className="flex-1 text-xs border border-slate-200/90 rounded-xl px-3.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-medium placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => handleSendReply(t._id || t.id)}
                    className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-all shadow-xs cursor-pointer font-bold text-xs flex items-center gap-1.5 shrink-0"
                    title="Send Staff Response"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-400 font-bold">
            No pending client support tickets.
          </div>
        )}
      </div>
    </Card>
  );
}


