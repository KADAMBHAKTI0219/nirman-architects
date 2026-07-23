import React, { useState } from 'react';
import { 
  Send, Paperclip, MessageSquare, Users, Info, 
  Check, CheckCheck, Smile, Phone, Video 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_ROOMS = [
  { id: 1, name: "Central Office Tower", unread: 2, project: "Noida Sector 62", members: ["Sarah Connor (PM)", "Alice Smith (You)", "Bob Johnson"], messages: [
    { sender: "Sarah Connor (PM)", text: "Team, please verify the wall thickness revisions in the blueprints before submitting to client review.", time: "10:30 AM", isSelf: false },
    { sender: "Sarah Connor (PM)", text: "Also check the riser dimensions on the staircase treads.", time: "10:32 AM", isSelf: false },
    { sender: "Alice Smith (You)", text: "Yes Sarah, I am coordinating riser dimensions with MEP shafts plan now.", time: "10:35 AM", isSelf: true }
  ]},
  { id: 2, name: "Smart City Mall", unread: 0, project: "Gurgaon Commercial", members: ["Sarah Connor (PM)", "Alice Smith (You)", "Frank Castle"], messages: [
    { sender: "Sarah Connor (PM)", text: "Has the HVAC duct sizing draft been completed?", time: "09:00 AM", isSelf: false },
    { sender: "Alice Smith (You)", text: "Yes, uploaded the layout draft V1.0 to the drawings module.", time: "09:15 AM", isSelf: true }
  ]},
  { id: 3, name: "Oceanic Luxury Villas", unread: 1, project: "Goa Beachfront", members: ["John Wick (PM)", "Alice Smith (You)"], messages: [
    { sender: "John Wick (PM)", text: "Let's review the first floor plan concept drawings today.", time: "Yesterday", isSelf: false }
  ]}
];

export default function Chat() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [activeRoom, setActiveRoom] = useState(INITIAL_ROOMS[0]);
  const [newMsg, setNewMsg] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const messageObj = {
      sender: "Alice Smith (You)",
      text: newMsg,
      time: "Just now",
      isSelf: true
    };

    const updatedMessages = [...activeRoom.messages, messageObj];
    const updatedRoom = { ...activeRoom, messages: updatedMessages, unread: 0 };

    setRooms(prev => prev.map(r => r.id === activeRoom.id ? updatedRoom : r));
    setActiveRoom(updatedRoom);
    setNewMsg('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-[calc(100vh-140px)] animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: ACTIVE CHATROOMS */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 flex flex-col gap-4 h-full shadow-2xs">
        <div>
          <h3 className="font-black text-slate-800 text-sm">Project Channels</h3>
          <p className="text-[10px] text-slate-400 font-semibold">Discuss designs with your team</p>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {rooms.map(room => (
            <div 
              key={room.id}
              onClick={() => {
                setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread: 0 } : r));
                setActiveRoom({ ...room, unread: 0 });
              }}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1.5 ${
                activeRoom.id === room.id 
                  ? 'bg-blue-50/50 border-blue-150 shadow-3xs' 
                  : 'bg-slate-50/30 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <strong className="text-slate-805 block text-xs">{room.name}</strong>
                {room.unread > 0 && (
                  <span className="text-[8px] bg-[#2484C6] text-white px-1.5 py-0.5 rounded font-black uppercase">
                    {room.unread} New
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none">{room.project}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER COLUMN: ACTIVE CHAT THREAD */}
      <div className="xl:col-span-2 bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between h-full shadow-2xs">
        
        {/* Chat header */}
        <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
          <div>
            <strong className="text-slate-800 text-sm block">{activeRoom.name} Room</strong>
            <span className="text-[10px] text-[#2484C6] block font-bold uppercase">{activeRoom.project}</span>
          </div>

          <div className="flex gap-2 text-slate-400">
            <button className="p-1.5 hover:bg-slate-50 rounded-xl transition-all" title="Audio Call">
              <Phone className="w-4 h-4 text-slate-450" />
            </button>
            <button className="p-1.5 hover:bg-slate-50 rounded-xl transition-all" title="Video Meeting">
              <Video className="w-4 h-4 text-slate-450" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-4 scrollbar-thin">
          {activeRoom.messages.map((m, idx) => (
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
              
              {/* Read receipt mock */}
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
            onClick={() => alert("Attachment selection triggered...")}
            className="p-2.5 bg-slate-50 border border-slate-205 text-slate-500 rounded-xl hover:bg-slate-100 transition-all"
            title="Attach File"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Message active room..."
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

      {/* RIGHT COLUMN: PROJECT CONTEXT & MEMBERS */}
      <div className="xl:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 flex flex-col gap-5 h-full shadow-2xs overflow-y-auto scrollbar-thin">
        <div>
          <h3 className="font-black text-slate-800 text-sm">Channel Context</h3>
          <p className="text-[10px] text-slate-405 font-bold uppercase mt-1">Central Office Tower</p>
        </div>

        <div className="space-y-4 text-xs font-bold text-slate-655">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1.5">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Project Info</span>
            <p className="font-semibold text-slate-705 leading-normal">
              Commercial office tower project currently in foundational blueprint phase.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 block uppercase">Active Participants ({activeRoom.members.length})</span>
            <div className="space-y-2 pt-1">
              {activeRoom.members.map(member => (
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
