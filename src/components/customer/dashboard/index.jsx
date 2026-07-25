import React, { useState } from 'react';
import { 
  CheckCircle, Clock, AlertTriangle, Send, FileText, 
  Image as ImageIcon, HelpCircle, ChevronRight, ChevronDown, Check, X, MessageSquare
} from 'lucide-react';
import Card from '../../common/Card';

const TIMELINE_PHASES = [
  { id: 1, name: "Concept Phase", status: "Done", notes: "Lobby layouts design and schematic material palettes finalized." },
  { id: 2, name: "Planning & Permits", status: "Done", notes: "Noida municipal authority site layout plan approvals signed off." },
  { id: 3, name: "Development & Casting", status: "In Progress", notes: "Excavation completed. Basement columns rebar reinforcement casting active." },
  { id: 4, name: "GFC Drawings Review", status: "Pending", notes: "Mechanical duct routing designs GFC locks scheduled for client signoff." }
];

export default function CustomerDashboard() {
  const [activeProject, setActiveProject] = useState('Central Office Tower');
  const [timeline, setTimeline] = useState(TIMELINE_PHASES);
  const [activePhaseId, setActivePhaseId] = useState(3);

  const [drawings, setDrawings] = useState([
    { id: 1, name: "Central Lobby 3D Architectural Render", version: "V2.1", date: "2026-07-22", status: "Awaiting Approval" },
    { id: 2, name: "L3 Electrical & Power Routing Blueprint", version: "V1.1", date: "2026-07-21", status: "Awaiting Approval" }
  ]);

  const [chats, setChats] = useState([
    { id: 1, sender: "Sarah Connor (PM)", text: "Hello Bruce, we uploaded the central lobby 3D renders. Let us know if the marble tiling materials fit your expectations.", time: "2 hours ago" },
    { id: 2, sender: "Me (Bruce)", text: "Checking them now. Facade work seems to be progressing on schedule.", time: "1 hour ago" }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleApprove = (id) => {
    setDrawings(prev => prev.filter(d => d.id !== id));
    alert("Drawing marked as Approved!");
  };

  const handleReject = (id) => {
    setDrawings(prev => prev.filter(d => d.id !== id));
    alert("Revisions requested for this drawing draft.");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChats([...chats, { id: Date.now(), sender: "Me (Bruce)", text: chatInput, time: "Just now" }]);
    setChatInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. GREETING + PROJECT SELECTOR */}
      <div className="bg-gradient-to-r from-blue-50/50 to-[#E5F0FA]/30 p-5 rounded-3xl border border-blue-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-3xs">
        <div>
          <h2 className="text-lg font-black text-slate-905 leading-none">Welcome, Bruce Wayne</h2>
          <p className="text-[10px] text-slate-405 font-bold block mt-1.5 uppercase tracking-wider">
            Customer Portal &bull; Real-time construction project monitoring
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Project:</label>
          <select
            value={activeProject}
            onChange={(e) => setActiveProject(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl bg-white font-semibold text-slate-705"
          >
            <option value="Central Office Tower">Central Office Tower</option>
            <option value="Smart City Mall">Smart City Mall</option>
            <option value="Oceanic Luxury Villas">Oceanic Luxury Villas</option>
          </select>
        </div>
      </div>

      {/* 2. SUMMARY STRIP CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Project Status</span>
            <strong className="text-xs font-black text-emerald-600 block mt-0.5">On Track</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Overall Progress</span>
            <strong className="text-xs font-black text-slate-750 block mt-0.5">38% Completed</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Approvals Needed</span>
            <strong className="text-xs font-black text-slate-750 block mt-0.5">{drawings.length} Drawings</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 text-[#2484C6] rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Open Queries</span>
            <strong className="text-xs font-black text-slate-750 block mt-0.5">1 Direct Query</strong>
          </div>
        </div>

      </div>

      {/* 3. TIMELINE & APPROVAL QUEUE MAIN WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Project Timeline Widget (2/3 width) */}
        <Card title="Construction Milestone Timeline" subtitle="Verify development phases and scheduled reviews" className="lg:col-span-2">
          
          <div className="space-y-4 pt-2 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-105">
            {timeline.map(phase => {
              const isExpanded = activePhaseId === phase.id;
              return (
                <div key={phase.id} className="relative pl-8">
                  
                  <div className={`absolute left-[7px] top-1.5 w-3 h-3 rounded-full border-2 bg-white -translate-x-1/2 ${
                    phase.status === 'Done' ? 'border-emerald-500' :
                    phase.status === 'In Progress' ? 'border-[#2484C6]' : 'border-slate-300'
                  }`}></div>

                  <div 
                    onClick={() => setActivePhaseId(isExpanded ? null : phase.id)}
                    className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:border-[#2484C6]/40 transition-all space-y-1.5"
                  >
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <strong className="text-slate-805 block text-xs">{phase.name}</strong>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                        phase.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        phase.status === 'In Progress' ? 'bg-blue-50 text-[#2484C6] border-blue-100' :
                        'bg-white text-slate-400 border-slate-100'
                      }`}>{phase.status}</span>
                    </div>

                    {isExpanded && (
                      <p className="text-[11px] text-slate-500 leading-normal italic font-semibold pt-1">
                        "{phase.notes}"
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </Card>

        {/* Approval Queue Widget (1/3 width) */}
        <Card title="Pending Approvals" subtitle="Drawings awaiting client review signoff">
          <div className="space-y-3 pt-2">
            {drawings.map(d => (
              <div key={d.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{d.version} &bull; {d.date}</span>
                  <strong className="text-slate-805 block text-[11px] leading-tight mt-0.5">{d.name}</strong>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(d.id)}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase text-center shadow-3xs flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(d.id)}
                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold uppercase text-center"
                  >
                    Revise
                  </button>
                </div>
              </div>
            ))}

            {drawings.length === 0 && (
              <div className="text-center text-slate-405 font-black uppercase text-[10px] py-6 border border-dashed border-slate-150 rounded-2xl bg-slate-50/50">
                All drawings approved!
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* 4. CHAT PREVIEW & PHOTOS GALLERY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Direct chat queries */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-col justify-between h-[280px]">
          <div className="border-b border-slate-50 pb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Direct Support Queries</span>
            <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Ask questions directly to design leads</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 my-3 pr-1 scrollbar-none">
            {chats.map(c => (
              <div 
                key={c.id} 
                className={`p-2.5 rounded-2xl text-xs space-y-1 ${
                  c.sender.includes('Me') 
                    ? 'bg-blue-50/50 border border-blue-150 text-slate-700 ml-6 rounded-tr-none' 
                    : 'bg-slate-50 text-slate-700 border border-slate-100 mr-6 rounded-tl-none'
                }`}
              >
                <strong className="font-black text-[9px] block uppercase opacity-85">{c.sender}</strong>
                <p className="font-semibold leading-normal">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-slate-50 pt-2.5">
            <input 
              type="text" 
              placeholder="Ask a question..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
            <button 
              type="submit"
              className="px-3.5 py-1.5 bg-brand-primary text-slate-905 rounded-xl text-xs font-black shadow-3xs"
            >
              Send
            </button>
          </form>
        </div>

        {/* Photos & renders gallery preview */}
        <Card title="Latest Project Photos" subtitle="Visual logs uploaded from building site" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              { title: "Central Lobby Main Entrance Render", date: "2026-07-22", type: "3D Render" },
              { title: "Basement Excavation Status", date: "2026-07-15", type: "Site Photo" }
            ].map((img, idx) => (
              <div key={idx} className="border border-slate-150 rounded-2xl overflow-hidden hover:shadow-3xs transition-all flex items-center gap-3 p-3">
                <div className="p-2.5 bg-slate-905 rounded-xl text-sky-400 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-slate-805 block text-xs truncate max-w-[180px]" title={img.title}>{img.title}</strong>
                  <span className="text-[9px] text-[#2484C6] block mt-1 font-bold uppercase">{img.type} &bull; {img.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}
