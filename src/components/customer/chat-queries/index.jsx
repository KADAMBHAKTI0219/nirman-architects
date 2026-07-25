import React, { useState } from 'react';
import { 
  Send, Paperclip, MessageSquare, Users, Info, 
  Check, CheckCheck, Smile, Phone, Video, HelpCircle 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_THREADS = [
  { id: 1, subject: "Lobby Material Specs", project: "Central Office Tower", unread: 1, resolved: false, messages: [
    { sender: "Sarah Connor (Lead PM)", text: "Hello Bruce, we uploaded the central lobby 3D renders. Let us know if the marble tiling materials fit your expectations.", time: "2 hours ago", isSelf: false },
    { sender: "Bruce Wayne (You)", text: "The Italian white marble matches our specs. Please lock this selection.", time: "1 hour ago", isSelf: true }
  ]},
  { id: 2, subject: "Basement Waterlogging Status", project: "Central Office Tower", unread: 0, resolved: true, messages: [
    { sender: "Frank Castle (Site Engineer)", text: "Pumping operations completed. Slab concrete casting rescheduled for tomorrow morning.", time: "Yesterday", isSelf: false }
  ]}
];

export default function ChatQueries() {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeThread, setActiveThread] = useState(INITIAL_THREADS[0]);
  const [newMsg, setNewMsg] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const messageObj = {
      sender: "Bruce Wayne (You)",
      text: newMsg,
      time: "Just now",
      isSelf: true
    };

    const updatedMessages = [...activeThread.messages, messageObj];
    const updatedThread = { ...activeThread, messages: updatedMessages, unread: 0 };

    setThreads(prev => prev.map(t => t.id === activeThread.id ? updatedThread : t));
    setActiveThread(updatedThread);
    setNewMsg('');
  };

  const handleMarkResolved = (id) => {
    setThreads(prev => prev.map(t => t.id === id ? { ...t, resolved: true } : t));
    setActiveThread(prev => prev.id === id ? { ...prev, resolved: true } : prev);
    alert("Query marked as resolved!");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-[calc(100vh-140px)] animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: ACTIVE QUERIES */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-4 h-full shadow-2xs">
        <div>
          <h3 className="font-black text-slate-800 text-sm">Direct Support Queries</h3>
          <p className="text-[10px] text-slate-400 font-semibold">Direct channels with your design team</p>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {threads.map(thread => (
            <div 
              key={thread.id}
              onClick={() => {
                setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: 0 } : t));
                setActiveThread({ ...thread, unread: 0 });
              }}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1.5 ${
                activeThread.id === thread.id 
                  ? 'bg-blue-50/50 border-blue-150 shadow-3xs' 
                  : 'bg-slate-50/30 border-slate-100 hover:bg-slate-55'
              }`}
            >
              <div className="flex justify-between items-center">
                <strong className="text-slate-805 block text-xs">{thread.subject}</strong>
                {thread.unread > 0 && (
                  <span className="text-[8px] bg-[#2484C6] text-white px-1.5 py-0.5 rounded font-black uppercase">
                    New
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                <span className="uppercase">{thread.project}</span>
                <span className={thread.resolved ? 'text-emerald-600' : 'text-amber-500'}>
                  {thread.resolved ? 'Resolved' : 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER COLUMN: CONVERSATION THREAD */}
      <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between h-full shadow-2xs">
        
        <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
          <div>
            <strong className="text-slate-800 text-sm block">{activeThread.subject}</strong>
            <span className="text-[10px] text-[#2484C6] block font-bold uppercase">{activeThread.project}</span>
          </div>

          <div className="flex gap-2">
            {!activeThread.resolved && (
              <button 
                onClick={() => handleMarkResolved(activeThread.id)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase transition-all"
              >
                Mark Resolved
              </button>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-4 scrollbar-thin">
          {activeThread.messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`p-3.5 rounded-2xl max-w-lg border ${
                m.isSelf 
                  ? 'bg-blue-50/30 border-blue-100 ml-auto text-right text-slate-700' 
                  : 'bg-slate-50 border-slate-105 mr-auto text-slate-655'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1 text-[9px] font-black uppercase">
                <span>{m.sender}</span>
                <span className="text-slate-400">{m.time}</span>
              </div>
              <p className="text-xs leading-normal font-semibold">{m.text}</p>
              
              {m.isSelf && (
                <div className="flex justify-end mt-1 text-slate-400">
                  <CheckCheck className="w-3.5 h-3.5 text-[#2484C6]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-50 flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => alert("Upload file/screenshot attachment...")}
            className="p-2.5 bg-slate-50 border border-slate-205 text-slate-500 rounded-xl hover:bg-slate-100 transition-all"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message to project managers..."
            className="flex-1 text-xs border border-slate-205 rounded-xl px-4 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
          <button 
            type="submit"
            className="p-2.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl transition-all shadow-3xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* RIGHT COLUMN: PROJECT CONTEXT & RESPONSIBLE TEAM */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 flex flex-col gap-5 h-full shadow-2xs overflow-y-auto scrollbar-thin">
        <div>
          <h3 className="font-black text-slate-800 text-sm">Responsible Team</h3>
          <p className="text-[10px] text-slate-405 font-bold uppercase mt-1">Central Office Tower</p>
        </div>

        <div className="space-y-4 text-xs font-bold text-slate-655">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Project Info</span>
            <p className="font-semibold text-slate-705 leading-normal">
              Direct escalation channel for Bruce Wayne with lead project coordinators and architects.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Team Contacts</span>
            <div className="space-y-2.5 pt-1.5">
              {[
                { name: "Sarah Connor", role: "Lead Project Manager" },
                { name: "Bob Johnson", role: "Lead Architect" },
                { name: "Frank Castle", role: "Site Supervisor" }
              ].map(member => (
                <div key={member.name} className="flex items-center gap-2 text-[11px] text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center font-bold text-[9px] text-[#2484C6]">
                    {member.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <span className="block font-black leading-none">{member.name}</span>
                    <span className="text-[8px] text-slate-400 font-bold block mt-0.5 uppercase">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
