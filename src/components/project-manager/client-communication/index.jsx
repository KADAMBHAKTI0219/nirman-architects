import React, { useState } from 'react';
import { 
  Send, Users, FileText, CheckCircle, MessageSquare, AlertCircle, 
  MapPin, Check, Info, ShieldAlert, Award, FileUp 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_CHATS = [
  { id: 1, client: "Bruce Wayne", company: "Wayne Enterprises", project: "Oceanic Beachfront Villas", unread: 2, messages: [
    { sender: "Bruce Wayne (Client)", text: "Checking GFC progress for Goa beachfront villas.", time: "10:00 AM", isInternal: false },
    { sender: "Sarah Connor (Lead PM)", text: "Yes Bruce, elevations V2.1 are currently in the PM drawing approvals queue.", time: "10:05 AM", isInternal: false },
    { sender: "Sarah Connor (Internal)", text: "Team, we need to expedite Wayne's drawing review before today's site engineer shift ends.", time: "10:06 AM", isInternal: true }
  ]},
  { id: 2, client: "Clark Kent", company: "Daily Planet", project: "Central Office Tower", unread: 0, messages: [
    { sender: "Clark Kent (Client)", text: "Could you check if the HVAC blueprints are approved yet?", time: "09:30 AM", isInternal: false },
    { sender: "Sarah Connor (Lead PM)", text: "Reviewing them with our service engineer right now, Clark.", time: "09:35 AM", isInternal: false }
  ]},
  { id: 3, client: "Diana Prince", company: "Themyscira Corp", project: "Smart City Mall", unread: 1, messages: [
    { sender: "Diana Prince (Client)", text: "We need the structural layout file uploaded to the client portal.", time: "08:15 AM", isInternal: false }
  ]}
];

export default function ClientCommunication() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState(INITIAL_CHATS[0]);
  const [newMsg, setNewMsg] = useState('');
  const [isInternalMode, setIsInternalMode] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const messageObj = {
      sender: isInternalMode ? "Sarah Connor (Internal Note)" : "Sarah Connor (Lead PM)",
      text: newMsg,
      time: "Just now",
      isInternal: isInternalMode
    };

    const updatedMessages = [...activeChat.messages, messageObj];
    const updatedChat = { ...activeChat, messages: updatedMessages, unread: 0 };

    setChats(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c));
    setActiveChat(updatedChat);
    setNewMsg('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-[calc(100vh-140px)] animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: CLIENT INBOX LIST */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-4 h-full shadow-2xs">
        <div>
          <h3 className="font-black text-slate-800 text-sm">Communication Inbox</h3>
          <p className="text-[10px] text-slate-400 font-semibold">Direct customer support chat channels</p>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => {
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                setActiveChat({ ...chat, unread: 0 });
              }}
              className={`p-3 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1.5 ${
                activeChat.id === chat.id 
                  ? 'bg-blue-50/50 border-blue-150 shadow-3xs' 
                  : 'bg-slate-50/30 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <strong className="text-slate-805 block text-xs">{chat.client}</strong>
                {chat.unread > 0 && (
                  <span className="text-[8px] bg-[#2484C6] text-white px-1.5 py-0.5 rounded font-black uppercase">
                    {chat.unread} New
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">{chat.project}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER COLUMN: ACTIVE CHAT WINDOW */}
      <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between h-full shadow-2xs">
        
        {/* Chat header */}
        <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
          <div>
            <strong className="text-slate-800 text-sm block">{activeChat.client} Chat</strong>
            <span className="text-[10px] text-[#2484C6] block font-bold uppercase">{activeChat.project} &bull; {activeChat.company}</span>
          </div>
          
          {/* Toggle button */}
          <button
            onClick={() => setIsInternalMode(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
              isInternalMode 
                ? 'bg-amber-50 border-amber-100 text-amber-600 font-extrabold'
                : 'bg-blue-50 border-blue-100 text-[#2484C6] font-extrabold'
            }`}
          >
            {isInternalMode ? 'Mode: Internal Note' : 'Mode: Client-Facing'}
          </button>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-4 scrollbar-thin">
          {activeChat.messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`p-3.5 rounded-2xl max-w-lg border ${
                m.isInternal 
                  ? 'bg-amber-50/50 border-amber-100 mx-auto text-amber-900 w-[95%]' 
                  : (m.sender.includes('PM')
                      ? 'bg-blue-50/30 border-blue-100 ml-auto text-right text-slate-700' 
                      : 'bg-slate-50 border-slate-100 mr-auto text-slate-655')
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1 text-[9px] font-black uppercase">
                <span>{m.sender}</span>
                <span className="text-slate-400">{m.time}</span>
              </div>
              <p className="text-xs leading-normal font-semibold">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-50 flex items-center gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder={isInternalMode ? "Write an internal team note (client won't see this)..." : "Reply to client..."}
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

      {/* RIGHT COLUMN: CLIENT & LINKED PROJECT INFO */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 flex flex-col gap-5 h-full shadow-2xs overflow-y-auto scrollbar-thin">
        <div>
          <h3 className="font-black text-slate-800 text-sm">Channel Context</h3>
          <p className="text-[10px] text-slate-405 font-bold uppercase mt-1">Bruce Wayne &bull; Wayne Enterprises</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-400 uppercase">Project Progress</span>
              <span className="font-black text-emerald-600">88%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '88%' }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Pending Client Approvals</span>
            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-650 font-bold flex items-center gap-1.5 leading-normal">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>V2.1 Elevations Signoff Awaiting</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Shared Project Files</span>
            <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-700">Elevations_V2.1.dwg</span>
              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1 rounded uppercase">Sent</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
