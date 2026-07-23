import React, { useState } from 'react';
import { 
  Send, Paperclip, MessageSquare, Users, Info, 
  Phone, Video, CheckCheck, Check, Smile 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_CHATS = [
  { id: 1, name: "Central Office Tower", project: "Noida Sector 62", unread: 1, members: ["Sarah Connor (PM)", "Bob Johnson (Architect)", "Alice Smith (You)"], messages: [
    { sender: "Sarah Connor (PM)", text: "Verify the column spacing revisions on section 2.1 before client presentation.", time: "11:00 AM", isSelf: false },
    { sender: "Bob Johnson (Architect)", text: "Yes Sarah, I updated the DWG layout draft V1.2. Uploaded to drawings module.", time: "11:15 AM", isSelf: true }
  ]},
  { id: 2, name: "Smart City Mall", project: "Gurgaon Commercial", unread: 0, members: ["Sarah Connor (PM)", "Bob Johnson (Architect)"], messages: [
    { sender: "Sarah Connor (PM)", text: "Is the HVAC draft completed?", time: "09:30 AM", isSelf: false }
  ]}
];

export default function Chats() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState(INITIAL_CHATS[0]);
  const [newMsg, setNewMsg] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const messageObj = {
      sender: "Bob Johnson (Architect)",
      text: newMsg,
      time: "Just now",
      isSelf: true
    };

    const updatedMessages = [...activeChat.messages, messageObj];
    const updatedChat = { ...activeChat, messages: updatedMessages, unread: 0 };

    setChats(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c));
    setActiveChat(updatedChat);
    setNewMsg('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-[calc(100vh-140px)] animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: CHATROOMS LIST */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-4 h-full shadow-2xs">
        <div>
          <h3 className="font-black text-slate-800 text-sm">Design Channels</h3>
          <p className="text-[10px] text-slate-400 font-semibold">Discuss blueprints with PM & team</p>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => {
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
                setActiveChat({ ...chat, unread: 0 });
              }}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1.5 ${
                activeChat.id === chat.id 
                  ? 'bg-blue-50/50 border-blue-150 shadow-3xs' 
                  : 'bg-slate-50/30 border-slate-100 hover:bg-slate-55'
              }`}
            >
              <div className="flex justify-between items-center">
                <strong className="text-slate-805 block text-xs">{chat.name}</strong>
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

      {/* CENTER COLUMN: MESSAGE THREAD */}
      <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between h-full shadow-2xs">
        
        <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
          <div>
            <strong className="text-slate-800 text-sm block">{activeChat.name}</strong>
            <span className="text-[10px] text-[#2484C6] block font-bold uppercase">{activeChat.project}</span>
          </div>

          <div className="flex gap-2 text-slate-400">
            <button className="p-1.5 hover:bg-slate-50 rounded-xl transition-all" title="Call">
              <Phone className="w-4 h-4 text-slate-450" />
            </button>
            <button className="p-1.5 hover:bg-slate-50 rounded-xl transition-all" title="Video Meeting">
              <Video className="w-4 h-4 text-slate-450" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-4 scrollbar-thin">
          {activeChat.messages.map((m, idx) => (
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
            onClick={() => alert("Upload schematic draft attachment...")}
            className="p-2.5 bg-slate-50 border border-slate-205 text-slate-500 rounded-xl hover:bg-slate-100 transition-all"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message to design team..."
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

      {/* RIGHT COLUMN: CHANNEL INFORMATION & PARTICIPANTS */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 flex flex-col gap-5 h-full shadow-2xs overflow-y-auto scrollbar-thin">
        <div>
          <h3 className="font-black text-slate-800 text-sm">Channel Info</h3>
          <p className="text-[10px] text-slate-405 font-bold uppercase mt-1">{activeChat.name}</p>
        </div>

        <div className="space-y-4 text-xs font-bold text-slate-655">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Project Info</span>
            <p className="font-semibold text-slate-705 leading-normal">
              Collaboration and design check stream for column layouts, MEP ducting and structural coordinates verification.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Designers List ({activeChat.members.length})</span>
            <div className="space-y-2 pt-1">
              {activeChat.members.map(member => (
                <div key={member} className="flex items-center gap-2.5 text-[11px] text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center font-bold text-[9px] text-[#2484C6]">
                    {member.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <span>{member}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
