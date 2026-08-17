import React, { useState, useEffect } from 'react';
import { 
  Archive, FileText, CheckCircle, Download, Search, 
  Layers, MessageSquare, Calendar, RefreshCw, Clock
} from 'lucide-react';
import Card from '../../common/Card';
import { getClientDashboard, getClientProjectTimeline } from '../../../service/crm/clientPortal';
import { getMyFeedbackHistory } from '../../../service/crm/feedback';
import { getMyClientTickets } from '../../../service/crm/ticket';
import { getProjectDrawings } from '../../../service/drawing';

export default function History() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const fetchDynamicAudits = async () => {
    setLoading(true);
    try {
      const auditList = [];

      // 1. Fetch Client Dashboard Projects
      const dashRes = await getClientDashboard().catch(() => null);
      const activeProjs = dashRes?.activeProjects || [];

      // 2. Fetch Feedback History
      const fbRes = await getMyFeedbackHistory().catch(() => null);
      const feedbacks = fbRes?.feedbacks || fbRes?.history || [];
      feedbacks.forEach(f => {
        auditList.push({
          id: `fb-${f._id || f.id}`,
          date: f.submittedAt ? new Date(f.submittedAt).toISOString().split('T')[0] : (f.createdAt ? new Date(f.createdAt).toISOString().split('T')[0] : '2026-08-15'),
          event: `Client Feedback Submitted (Rating: ${f.overallRating}/5 ⭐)${f.comments ? ` - "${f.comments}"` : ''}`,
          category: 'Sign-off',
          actor: f.formattedAuthorName || f.contactId?.name || 'Client Representative (You)'
        });
      });

      // 3. Fetch Tickets History
      const ticketRes = await getMyClientTickets().catch(() => null);
      const tickets = ticketRes?.tickets || [];
      tickets.forEach(t => {
        auditList.push({
          id: `tkt-${t._id || t.id}`,
          date: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '2026-08-10',
          event: `Support Ticket Raised: "${t.subject}"`,
          category: 'Compliance',
          actor: t.formattedRaisedBy || t.raisedBy?.name || 'Client Contact'
        });
      });

      // 4. Fetch Project Milestones & Drawings for linked projects
      for (const p of activeProjs) {
        const pId = p.projectId || p._id || p.id;
        if (pId) {
          const [dwgRes, tlRes] = await Promise.all([
            getProjectDrawings(pId).catch(() => null),
            getClientProjectTimeline(pId).catch(() => null)
          ]);

          const approvedDrawings = dwgRes?.approved || [];
          approvedDrawings.forEach(d => {
            auditList.push({
              id: `dwg-${d._id || d.id}`,
              date: d.updatedAt ? new Date(d.updatedAt).toISOString().split('T')[0] : '2026-08-01',
              event: `Drawing Approved: "${d.title || d.name || 'Architectural Plan'}" (v${d.currentVersion || 1})`,
              category: 'Sign-off',
              actor: 'Client Representative'
            });
          });

          const timelineEvents = tlRes?.timeline || [];
          timelineEvents.filter(m => m.isCompleted).forEach((m, idx) => {
            auditList.push({
              id: `tl-${pId}-${idx}`,
              date: m.date ? new Date(m.date).toISOString().split('T')[0] : '2026-07-20',
              event: `${m.title || 'Milestone Completed'} - ${p.projectName || p.name || 'Project'}`,
              category: 'Milestone',
              actor: 'Project Team'
            });
          });
        }
      }

      // Sort chronologically by date descending
      auditList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setAudits(auditList);
    } catch (err) {
      console.warn("Failed to fetch dynamic audit logs:", err);
      setAudits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDynamicAudits();
  }, []);

  const exportLedgerToCSV = () => {
    if (filteredAudits.length === 0) {
      alert("No audit records available to export.");
      return;
    }
    const headers = ["Logged Event", "Category", "Logged By", "Date"];
    const rows = filteredAudits.map(a => [
      `"${(a.event || '').replace(/"/g, '""')}"`,
      `"${(a.category || '').replace(/"/g, '""')}"`,
      `"${(a.actor || '').replace(/"/g, '""')}"`,
      `"${a.date || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `project_audits_history_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAudits = audits.filter(a => {
    const matchesSearch = String(a.event || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(a.actor || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === 'All' || a.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. FILTER CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-wrap items-center flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search historical ledger..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white font-semibold text-slate-700 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Sign-off">Sign-offs</option>
            <option value="Milestone">Milestones</option>
            <option value="Construction">Construction</option>
            <option value="Compliance">Compliance</option>
          </select>
        </div>

        <button
          onClick={exportLedgerToCSV}
          className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold uppercase transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Ledger
        </button>
      </div>

      {/* 2. LEDGER TABLE */}
      <Card title="Project Audits History Ledger" subtitle="Complete transparent historical log of construction and design milestones">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200/90">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
            <p className="text-xs font-normal">Loading audit history ledger...</p>
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2 bg-white rounded-3xl border border-slate-200/90 p-8 font-normal shadow-2xs">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No Audit History Found</p>
            <p className="text-xs text-slate-400">No historical sign-offs, milestone completions, or audit logs registered for your projects yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Logged Event</th>
                  <th className="px-4 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-4 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Logged By</th>
                  <th className="px-4 py-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAudits.map(audit => (
                  <tr key={audit.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5 align-middle">
                      <strong className="text-slate-800 block font-semibold">{audit.event}</strong>
                    </td>
                    <td className="px-4 py-3.5 align-middle">
                      <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600">
                        {audit.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold align-middle">{audit.actor}</td>
                    <td className="px-4 py-3.5 text-right text-slate-500 font-mono align-middle">{audit.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
}
