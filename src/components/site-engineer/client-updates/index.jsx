import React, { useState } from 'react';
import { 
  Plus, Send, FileText, Image as ImageIcon, MapPin, 
  CheckCheck, Clock, Archive 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_UPDATES = [
  { id: 1, date: "2026-07-22", site: "Metro Station Tunnel Excavation", title: "Tunnel excavation finished", description: "All site excavation finished ahead of schedule. Preparing GFC layout checks and scaffolding.", status: "Sent to Client", photos: 2 },
  { id: 2, date: "2026-07-20", site: "Smart City Mall Foundations", title: "Concrete pouring completed", description: "Grade M30 concrete pouring finished on basement slab section A. Focus shifts to Column structural rebar bindings.", status: "Sent to Client", photos: 1 },
  { id: 3, date: "2026-07-15", site: "Oceanic Villas Block C Slab", title: "Rough-ins finalized", description: "Plumbing piping rough-ins finalized for Block C Ground Floor toilets. Pressure testing completed successfully.", status: "Draft", photos: 0 }
];

export default function ClientUpdates() {
  const [updates, setUpdates] = useState(INITIAL_UPDATES);
  const [newTitle, setNewTitle] = useState('');
  const [newSite, setNewSite] = useState('Smart City Mall Foundations');
  const [newDesc, setNewDesc] = useState('');

  const handlePostUpdate = (status = 'Sent to Client') => {
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newUpdate = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      site: newSite,
      title: newTitle,
      description: newDesc,
      status: status,
      photos: 0
    };

    setUpdates([newUpdate, ...updates]);
    setNewTitle('');
    setNewDesc('');
    alert(status === 'Sent to Client' ? "Update dispatched to Client Portal!" : "Update saved as draft.");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-in fade-in duration-200">
      
      {/* LEFT/CENTER CHRONOLOGICAL TIMELINE (2/3 width) */}
      <div className="xl:col-span-2 space-y-6">
        
        <Card title="Client Dispatch Timeline" subtitle="Historical record of structural updates shared with client dashboard">
          
          <div className="space-y-6 pt-3 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-105">
            {updates.map(upd => (
              <div key={upd.id} className="relative pl-8 space-y-2">
                
                {/* Timeline node dot indicator */}
                <div className={`absolute left-[7px] top-1.5 w-3 h-3 rounded-full border-2 bg-white -translate-x-1/2 ${
                  upd.status === 'Sent to Client' ? 'border-[#2484C6]' : 'border-slate-400'
                }`}></div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold">{upd.date}</span>
                      <strong className="text-slate-805 block text-xs mt-0.5">{upd.title}</strong>
                    </div>

                    <div className="flex gap-2">
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        upd.status === 'Sent to Client' ? 'bg-blue-50 text-[#2484C6] border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>{upd.status}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-655 leading-relaxed font-semibold">{upd.description}</p>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2.5 border-t border-slate-100/50">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {upd.site}
                    </span>
                    
                    {upd.photos > 0 && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {upd.photos} Photos Attached
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </Card>

      </div>

      {/* RIGHT COLUMN: DISPATCH FORM (1/3 width) */}
      <Card title="Compose Client Update" subtitle="Broadcast site construction metrics">
        <div className="space-y-4 text-xs font-semibold text-slate-550">
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block uppercase">Update Title *</label>
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Completed foundations check"
              className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-705 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block uppercase">Site Location</label>
            <select 
              value={newSite} 
              onChange={(e) => setNewSite(e.target.value)}
              className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-700 font-semibold"
            >
              <option value="Smart City Mall Foundations">Smart City Mall Foundations</option>
              <option value="Metro Station Tunnel Excavation">Metro Station Tunnel Excavation</option>
              <option value="Oceanic Villas Block C Slab">Oceanic Villas Block C Slab</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 block uppercase">Brief Description *</label>
            <textarea 
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe physical milestones completed, materials received, or crew numbers..."
              className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-705 font-semibold h-24 focus:outline-none"
            />
          </div>

          <div 
            onClick={() => alert("Upload photo attachments...")}
            className="p-4 border border-dashed border-slate-205 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
          >
            <ImageIcon className="w-5 h-5 text-slate-400" />
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Attach Site Photo</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handlePostUpdate('Sent to Client')}
              className="flex-1 py-2 bg-brand-primary text-slate-905 rounded-xl font-black uppercase text-center shadow-3xs flex items-center justify-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              Send Client
            </button>
            <button
              onClick={() => handlePostUpdate('Draft')}
              className="px-4 py-2 border border-slate-205 text-slate-655 hover:bg-slate-55 rounded-xl font-bold uppercase"
            >
              Draft
            </button>
          </div>
        </div>
      </Card>

    </div>
  );
}
