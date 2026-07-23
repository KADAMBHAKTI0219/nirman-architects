import React, { useState } from 'react';
import { 
  Camera, Plus, Check, X, AlertTriangle, Eye, Image as ImageIcon, Tag 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_PHOTOS = [
  { id: 1, site: "Smart City Mall Foundations", uploadedBy: "Bob Vance", time: "10:15 AM", tag: "progress", src: "foundations" },
  { id: 2, site: "Oceanic Villas Block C Slab", uploadedBy: "Frank Castle", time: "Yesterday", tag: "defect", src: "slab" },
  { id: 3, site: "Metro Station Tunnel Excavation", uploadedBy: "Alice Cooper", time: "2 days ago", tag: "safety", src: "safety" }
];

const INITIAL_ISSUES = [
  { id: 101, title: "Waterlogging in basement block B after heavy rain", site: "Smart City Mall Foundations", priority: "Critical", assignee: "Bob Vance", status: "Open", dueDate: "2026-07-25", photoId: 1 },
  { id: 102, title: "Cracks observed in concrete curing column 3B", site: "Oceanic Villas Block C Slab", priority: "High", assignee: "Frank Castle", status: "Open", dueDate: "2026-07-28", photoId: 2 },
  { id: 103, title: "Malfunctioning gas detector at Gate 2 tunnel", site: "Metro Station Tunnel Excavation", priority: "Medium", assignee: "Alice Cooper", status: "Resolved", dueDate: "2026-07-19", photoId: 3 }
];

export default function PhotosIssues() {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState(INITIAL_ISSUES[0]);
  const [detailsOpen, setDetailsOpen] = useState(true);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newSite, setNewSite] = useState('Smart City Mall Foundations');
  const [newPriority, setNewPriority] = useState('High');

  const handleRaiseIssue = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newIssue = {
      id: 100 + issues.length + 1,
      title: newTitle,
      site: newSite,
      priority: newPriority,
      assignee: "Self (Site Engineer)",
      status: "Open",
      dueDate: new Date().toISOString().split('T')[0],
      photoId: null
    };

    setIssues([newIssue, ...issues]);
    setSelectedIssue(newIssue);
    setNewTitle('');
    alert("New issue reported successfully!");
  };

  const handleResolve = (id) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: 'Resolved' } : i));
    alert("Issue status updated to Resolved.");
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'progress':
        return 'bg-blue-50 text-[#2484C6] border-blue-100';
      case 'defect':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'safety':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start animate-in fade-in duration-200">
      
      {/* LEFT/CENTER MAIN ZONE (3/4 width) */}
      <div className="xl:col-span-3 space-y-6">
        
        {/* Photo Gallery Grid */}
        <Card title="Today's Site Photos" subtitle="Visual logs uploaded directly from physical construction fields">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {photos.map(p => (
              <div key={p.id} className="border border-slate-150 rounded-2xl overflow-hidden hover:shadow-3xs transition-all">
                {/* Simulated Photo image placeholder */}
                <div className="bg-slate-900 h-28 flex items-center justify-center relative select-none">
                  <ImageIcon className="w-10 h-10 text-slate-600" />
                  <span className="absolute bottom-2 left-2 text-[8px] bg-slate-900/60 px-1.5 py-0.5 rounded text-slate-350 uppercase">
                    {p.time}
                  </span>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase truncate max-w-[120px]">{p.site}</span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${getTagColor(p.tag)}`}>
                      {p.tag}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-505 block leading-none">Uploaded by: {p.uploadedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Issue Ledger list */}
        <Card title="Active Incident Tracker" subtitle="Log safety delays, structural warning logs, and material bottlenecks">
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left table-auto">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Issue Details</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Assignee</th>
                  <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {issues.map(issue => (
                  <tr 
                    key={issue.id} 
                    onClick={() => {
                      setSelectedIssue(issue);
                      setDetailsOpen(true);
                    }}
                    className={`hover:bg-slate-50/40 cursor-pointer ${
                      selectedIssue?.id === issue.id ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3 align-middle">
                      <strong className="text-slate-805 block">{issue.title}</strong>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{issue.site}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        issue.priority === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        issue.priority === 'High' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>{issue.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-505 font-bold align-middle">{issue.assignee}</td>
                    <td className="px-4 py-3 text-right align-middle">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>{issue.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* RIGHT COLUMN: INSPECTOR & REPORT FORM (1/4 width) */}
      <div className="space-y-6">
        
        {/* Issue Details Panel */}
        {detailsOpen && selectedIssue && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex justify-between items-start border-b border-slate-50 pb-2">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incident Details</span>
                <strong className="text-slate-805 block text-xs mt-1">Issue #{selectedIssue.id}</strong>
              </div>
              <button onClick={() => setDetailsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-bold text-slate-550">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Site Location</span>
                <span className="text-slate-700 block mt-0.5">{selectedIssue.site}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase">Assignee & Target Date</span>
                <span className="text-slate-700 block mt-0.5">{selectedIssue.assignee} &bull; {selectedIssue.dueDate}</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
                <span className="text-[8px] text-slate-405 block uppercase">Incident Description</span>
                <p className="font-semibold text-slate-700 leading-normal">{selectedIssue.title}</p>
              </div>

              {selectedIssue.status === 'Open' && (
                <button
                  onClick={() => handleResolve(selectedIssue.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase text-center shadow-3xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        )}

        {/* Raise Issue Form */}
        <Card title="Report New Incident" subtitle="Submit physical site bottlenecks to design team">
          <form onSubmit={handleRaiseIssue} className="space-y-4 text-xs font-semibold text-slate-550">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block uppercase">Incident Title *</label>
              <input 
                type="text" 
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Concrete slab casting delay"
                className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-705 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block uppercase">Select Site</label>
                <select 
                  value={newSite} 
                  onChange={(e) => setNewSite(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-700"
                >
                  <option value="Smart City Mall Foundations">Smart City Mall Foundations</option>
                  <option value="Metro Station Tunnel Excavation">Metro Station Tunnel Excavation</option>
                  <option value="Oceanic Villas Block C Slab">Oceanic Villas Block C Slab</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block uppercase">Priority</label>
                <select 
                  value={newPriority} 
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-700"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-brand-primary text-slate-905 rounded-xl font-black uppercase text-center shadow-3xs flex items-center justify-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              Submit Incident
            </button>
          </form>
        </Card>

      </div>

    </div>
  );
}
