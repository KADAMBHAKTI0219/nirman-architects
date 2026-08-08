import React, { useState, useEffect } from 'react';
import { 
  Send, Paperclip, MessageSquare, Users, Info, 
  Phone, Video, CheckCheck, Check, RefreshCw 
} from 'lucide-react';
import Card from '../../common/Card';
import { getInternalProjectChat, sendInternalChatMessage } from '../../../service/chat';

export default function ArchitectChats() {
  const [projectId, setProjectId] = useState('proj-1');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMsgText, setNewMsgText] = useState('');

  const fetchInternalChat = async () => {
    setLoading(true);
    try {
      const res = await getInternalProjectChat(projectId);
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error("Failed to load internal project chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternalChat();
  }, [projectId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    try {
      const res = await sendInternalChatMessage(projectId, { messageText: newMsgText });
      if (res && (res.messageObj || res.message)) {
        const added = res.messageObj || res.message;
        setMessages(prev => [...prev, added]);
      }
      setNewMsgText('');
    } catch (err) {
      alert(err.message || "Failed to send internal chat message.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-[calc(100vh-140px)] font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: DESIGN CHANNELS */}
      <div className="xl:col-span-1 bg-white border border-slate-200/90 rounded-3xl p-4 flex flex-col gap-4 h-full shadow-2xs">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Internal Project Chat</h3>
            <p className="text-[10px] text-slate-500 font-medium">Unified client & team workspace</p>
          </div>
          <button 
            onClick={fetchInternalChat}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {[
            { id: 'proj-1', name: 'Central Office Tower', code: 'PROJ-001' },
            { id: 'proj-2', name: 'Oceanic Luxury Villas', code: 'PROJ-002' }
          ].map(p => (
            <div 
              key={p.id}
              onClick={() => setProjectId(p.id)}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all flex flex-col gap-1 ${
                projectId === p.id 
                  ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs' 
                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100/60'
              }`}
            >
              <strong className="text-slate-900 block text-xs font-extrabold">{p.name}</strong>
              <span className="text-[10px] text-slate-400 font-mono">{p.code}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER COLUMN: MESSAGE THREAD */}
      <div className="xl:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-5 flex flex-col justify-between h-full shadow-2xs">
        
        <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
          <div>
            <strong className="text-slate-900 text-sm block font-extrabold">Project Chat History (Internal View)</strong>
            <span className="text-[10px] text-indigo-600 block font-bold uppercase tracking-wider">Channel: Central Office Tower</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-4">
          {messages.length > 0 ? (
            messages.map((m, idx) => {
              const isEmployee = m.authorType === 'EMPLOYEE' || m.formattedAuthorName?.includes('Architect') || m.formattedAuthorName?.includes('Team');
              const authorName = m.formattedAuthorName || (m.authorId?.name ? `${m.authorId.name} (${m.authorId.designation || 'Staff'})` : 'Team Member');

              return (
                <div 
                  key={m._id || idx} 
                  className={`p-3.5 rounded-2xl max-w-lg border space-y-1 ${
                    isEmployee 
                      ? 'bg-indigo-50/60 border-indigo-100 ml-auto text-slate-900' 
                      : 'bg-slate-50 border-slate-200 mr-auto text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase text-slate-400">
                    <span className="text-indigo-600">{authorName}</span>
                    <span className="font-mono">{m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : 'Just now'}</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">{m.messageText}</p>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-1">
              <MessageSquare className="w-8 h-8 text-slate-300 mb-1" />
              <p className="text-xs font-semibold text-slate-700">No project chat messages yet.</p>
              <p className="text-[11px] text-slate-400">Type a message below to start communicating with the team.</p>
            </div>
          )}
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={newMsgText}
            onChange={(e) => setNewMsgText(e.target.value)}
            placeholder="Post internal message into project chat workspace..."
            className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900"
          />
          <button 
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs uppercase"
          >
            <Send className="w-4 h-4" /> Send
          </button>
        </form>

      </div>

      {/* RIGHT COLUMN: CHANNEL INFO */}
      <div className="xl:col-span-1 bg-white border border-slate-200/90 rounded-3xl p-5 flex flex-col gap-4 h-full shadow-2xs overflow-y-auto">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">Channel Information</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Central Office Tower</p>
        </div>

        <div className="space-y-4 text-xs font-medium text-slate-700">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Workspace Notes</span>
            <p className="text-[11px] text-slate-600 leading-normal font-semibold">
              Unified channel linking client contacts with architects and project managers.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
