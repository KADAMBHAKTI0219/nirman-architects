import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Paperclip, MessageSquare, Users, Info, 
  Phone, Video, CheckCheck, Check, RefreshCw,
  CornerUpLeft, X, Search, MoreVertical, Lock, Smile
} from 'lucide-react';
import Card from '../../common/Card';
import { getInternalProjectChat, sendInternalChatMessage } from '../../../service/chat';
import { getProjects } from '../../../service/project';
import { isMockSession } from '../../../service/auth';

export default function ArchitectChats() {
  const [projectChannels, setProjectChannels] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMsgText, setNewMsgText] = useState('');
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoDrawer, setShowInfoDrawer] = useState(true);
  const messagesEndRef = useRef(null);

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      const hasRealProjects = res?.success && Array.isArray(res.projects) && res.projects.length > 0;

      if (hasRealProjects) {
        const roomList = res.projects.map((p, idx) => ({
          id: p._id || p.id || `proj-${idx + 1}`,
          name: p.projectName || p.name || 'Project Room',
          code: p.projectCode || `PROJ-00${idx + 1}`,
          project: p.address || p.projectCategory || 'Architectural Workspace',
          description: p.description || 'Architectural project currently in active planning and design validation.',
          members: ["Lead PM", "Staff Architect", "Client Contact"]
        }));
        setProjectChannels(roomList);
        setProjectId(roomList[0].id);
      } else if (isMockSession()) {
        const fallback = [
          { id: 'proj-1', name: 'Central Office Tower', code: 'PROJ-001', project: 'Noida Sector 62', description: 'Commercial office tower project currently in design phase.', members: ["Lead PM", "Staff Architect"] },
          { id: 'proj-2', name: 'Oceanic Luxury Villas', code: 'PROJ-002', project: 'Gurgaon Commercial', description: 'Luxury beachfront residential complex currently in design phase.', members: ["Lead PM", "Staff Architect"] }
        ];
        setProjectChannels(fallback);
        setProjectId(fallback[0].id);
      } else {
        setProjectChannels([]);
        setProjectId('');
      }
    } catch (e) {
      console.warn("Failed to load project channels", e);
      if (isMockSession()) {
        const fallback = [
          { id: 'proj-1', name: 'Central Office Tower', code: 'PROJ-001', project: 'Noida Sector 62', description: 'Commercial office tower project currently in design phase.', members: ["Lead PM", "Staff Architect"] },
          { id: 'proj-2', name: 'Oceanic Luxury Villas', code: 'PROJ-002', project: 'Gurgaon Commercial', description: 'Luxury beachfront residential complex currently in design phase.', members: ["Lead PM", "Staff Architect"] }
        ];
        setProjectChannels(fallback);
        setProjectId(fallback[0].id);
      } else {
        setProjectChannels([]);
        setProjectId('');
      }
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const fetchInternalChat = async () => {
    if (!projectId) return;
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
    setReplyToMsg(null);
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim() || !projectId) return;

    try {
      const payload = {
        messageText: newMsgText,
        replyToMessageId: replyToMsg?._id || replyToMsg?.id || null
      };
      const res = await sendInternalChatMessage(projectId, payload);
      if (res && (res.messageObj || res.message)) {
        const added = res.messageObj || res.message;
        setMessages(prev => [...prev, added]);
      } else {
        fetchInternalChat();
      }
      setNewMsgText('');
      setReplyToMsg(null);
    } catch (err) {
      alert(err.message || "Failed to send internal chat message.");
    }
  };

  const normalizeMessage = (m) => {
    if (!m) return { sender: 'System', text: '', time: '', isSelf: false, replyTo: null };
    
    const userStr = localStorage.getItem('user');
    let currentUser = {};
    try {
      currentUser = userStr ? JSON.parse(userStr) : {};
    } catch (e) {}

    const sender = m.formattedAuthorName || m.senderName || m.sender || 'Unknown';
    const text = m.messageText || m.text || '';
    
    // Parse time
    let time = '';
    const dateObj = m.createdAt || m.sentAt;
    if (dateObj) {
      try {
        time = new Date(dateObj).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {}
    } else {
      time = 'Just now';
    }

    // Determine isSelf (Architects/Employees are self here)
    const isSelf = m.isSelf || 
                   m.authorType === 'EMPLOYEE' ||
                   (m.senderName && currentUser.name && m.senderName === currentUser.name) ||
                   (m.authorId && currentUser.id && (m.authorId === currentUser.id || m.authorId._id === currentUser.id));

    // Resolve quoted message
    let replyTo = null;
    if (m.replyToMessageId) {
      const parentMsg = messages.find(x => String(x._id || x.id) === String(m.replyToMessageId));
      if (parentMsg) {
        replyTo = {
          sender: parentMsg.senderName || parentMsg.sender || 'Team Member',
          text: parentMsg.messageText || parentMsg.text || ''
        };
      } else {
        replyTo = {
          sender: 'Quoted Message',
          text: 'Referenced message'
        };
      }
    }

    return { sender, text, time, isSelf, replyTo };
  };

  // Filter channels based on search query
  const filteredChannels = projectChannels.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeChannel = projectChannels.find(p => p.id === projectId) || projectChannels[0];

  return (
    <div className="flex h-[calc(100vh-125px)] border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-md font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* 1. LEFT SIDEBAR: DESIGN CHANNELS */}
      <div className="w-80 border-r border-[#e9edef] flex flex-col shrink-0 bg-white">
        
        {/* Sidebar Header */}
        <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#005c4b] to-[#00a884] flex items-center justify-center font-bold text-white shadow-2xs">
              AC
            </div>
            <div>
              <strong className="text-slate-900 font-bold text-xs block font-sans">Architect Chats</strong>
              <span className="text-[10px] text-emerald-600 font-bold uppercase leading-none">Internal View</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#54656f]">
            <button 
              onClick={fetchInternalChat} 
              className="hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer" 
              title="Refresh Chat"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer" title="Menu">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-2 bg-[#f0f2f5] border-b border-[#e9edef] shrink-0">
          <div className="relative bg-white rounded-lg flex items-center px-3 py-1.5 shadow-3xs">
            <Search className="w-4 h-4 text-[#54656f] shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search design channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-800 placeholder-[#54656f] bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Channels list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {filteredChannels.map(p => {
            const isSelected = projectId === p.id;
            return (
              <div 
                key={p.id}
                onClick={() => setProjectId(p.id)}
                className={`px-4 py-3.5 cursor-pointer transition-all flex items-center gap-3 relative ${
                  isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
                }`}
              >
                {/* Icon */}
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                    isSelected ? 'bg-[#00a884]' : 'bg-slate-400'
                  }`}>
                    {p.name.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                  </div>
                  {isSelected && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-white animate-pulse" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <strong className="text-slate-900 font-bold text-xs truncate block">
                    {p.name}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">{p.code}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER PANEL: ACTIVE WHATSAPP CHAT STREAM */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#efeae2] relative">
        {activeChannel ? (
          <>
            {/* Header */}
            <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0 z-10">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfoDrawer(prev => !prev)}>
                <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold text-white text-xs shadow-2xs">
                  {activeChannel.name.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 leading-tight">{activeChannel.name} Workspace</h4>
                  <span className="text-[11px] text-[#667781] block font-mono leading-none mt-0.5">{activeChannel.code} &bull; Socket.io Live</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[#54656f]">
                <button className="hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer" title="Audio Call">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer" title="Video Meeting">
                  <Video className="w-4 h-4" />
                </button>
                <button className="hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer" title="Channel Info" onClick={() => setShowInfoDrawer(prev => !prev)}>
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat stream area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#efeae2] bg-[radial-gradient(#dcd6cd_1px,transparent_1px)] [background-size:16px_16px] relative scrollbar-thin">
              
              {/* Encryption Notice */}
              <div className="bg-[#ffeecd] text-[#54656f] text-[11px] px-4 py-2 rounded-lg max-w-xl mx-auto text-center shadow-3xs font-medium flex items-center justify-center gap-1.5 border border-amber-250">
                <Lock className="w-3.5 h-3.5 text-[#54656f] shrink-0" />
                <span>Messages are end-to-end encrypted within this project workspace room channel.</span>
              </div>

              {/* Date badge */}
              <div className="text-center my-2">
                <span className="bg-white text-[#54656f] text-[10px] font-bold px-3 py-1 rounded-md shadow-3xs uppercase tracking-wider">
                  TODAY
                </span>
              </div>

              {/* Message balloons */}
              {messages.length > 0 ? (
                messages.map((rawM, idx) => {
                  const m = normalizeMessage(rawM);
                  return (
                    <div
                      key={rawM._id || rawM.id || idx}
                      className={`flex flex-col group ${m.isSelf ? 'items-end' : 'items-start'}`}
                    >
                      {/* Speech Bubble */}
                      <div
                        className={`relative max-w-md px-3.5 py-2 rounded-lg shadow-3xs transition-all group/bubble text-xs ${
                          m.isSelf 
                            ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' 
                            : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
                        }`}
                      >
                        {/* Hover Reply Button */}
                        <button
                          type="button"
                          onClick={() => setReplyToMsg(rawM)}
                          className={`absolute top-1.5 p-1 rounded opacity-0 group-hover/bubble:opacity-100 transition-opacity cursor-pointer text-[#54656f] bg-white shadow-2xs border border-slate-100 ${
                            m.isSelf ? '-left-7' : '-right-7'
                          }`}
                          title="Reply"
                        >
                          <CornerUpLeft className="w-3 h-3" />
                        </button>

                        {/* Sender Tag */}
                        {!m.isSelf && (
                          <div className="text-[10px] font-bold mb-1 text-indigo-600">
                            {m.sender}
                          </div>
                        )}

                        {/* Quoted Message Render */}
                        {m.replyTo && (
                          <div className="p-2 rounded bg-black/5 border-l-4 border-[#2484C6] mb-1.5 text-[11px] text-left">
                            <strong className="block font-bold text-[#2484C6]">{m.replyTo.sender}</strong>
                            <p className="truncate text-slate-600 italic">"{m.replyTo.text}"</p>
                          </div>
                        )}

                        {/* Text */}
                        <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap pr-12 text-left">
                          {m.text}
                        </p>

                        {/* Bottom right info info */}
                        <div className="flex items-center gap-1 text-[10px] text-[#667781] font-normal absolute bottom-1 right-2.5">
                          <span>{m.time}</span>
                          {m.isSelf && (
                            <CheckCheck className="w-3.5 h-3.5 text-[#2484C6]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-1 bg-white/60 p-6 rounded-3xl max-w-sm mx-auto shadow-2xs">
                  <MessageSquare className="w-8 h-8 text-[#00a884] mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">No project chat messages yet.</p>
                  <p className="text-[11px] text-slate-500 font-normal">Type a message below to start communicating with the team.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quote Reply Banner */}
            {replyToMsg && (
              <div className="bg-[#f0f2f5] px-4 py-2 border-t border-[#e9edef] shrink-0 z-10">
                <div className="p-2.5 bg-white border-l-4 border-[#008069] rounded-lg flex items-center justify-between gap-3 text-xs shadow-3xs">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-[#008069] block">
                      Replying to {replyToMsg.senderName || replyToMsg.sender || 'Message'}
                    </span>
                    <p className="text-slate-750 text-xs truncate max-w-md font-normal italic">
                      "{replyToMsg.messageText || replyToMsg.text || 'Message content'}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyToMsg(null)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="bg-[#f0f2f5] px-4 py-2.5 border-t border-[#e9edef] shrink-0 z-10">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alert("Upload Attachment: Design blueprints and elevations supported")}
                  className="text-[#54656f] hover:text-slate-900 transition-colors p-1 cursor-pointer shrink-0"
                  title="Attach File"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  className="text-[#54656f] hover:text-slate-900 transition-colors p-1 cursor-pointer shrink-0"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  placeholder="Post internal message into project chat workspace..."
                  className="flex-1 text-xs border border-white rounded-lg px-4 py-2.5 bg-white focus:outline-none shadow-3xs"
                />

                <button 
                  type="submit"
                  className="p-2.5 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full transition-all shadow-md flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
            <MessageSquare className="w-10 h-10 opacity-30 animate-pulse text-[#00a884]" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">No project selected</p>
          </div>
        )}
      </div>

      {/* 3. RIGHT SIDEBAR: CHANNEL INFO */}
      {showInfoDrawer && activeChannel && (
        <div className="w-72 border-l border-[#e9edef] flex flex-col shrink-0 bg-white overflow-y-auto scrollbar-thin animate-in slide-in-from-right duration-250">
          <div className="h-16 bg-[#f0f2f5] border-b border-[#e9edef] px-4 flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setShowInfoDrawer(false)}
              className="text-[#54656f] hover:text-slate-800 p-1 rounded-full hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-slate-900 font-bold text-xs">Channel Information</span>
          </div>

          <div className="p-4 space-y-5">
            {/* Project Info Block */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Workspace Notes</span>
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                <h5 className="font-bold text-xs text-slate-900 mb-1 leading-tight">{activeChannel.name}</h5>
                <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                  {activeChannel.description}
                </p>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                Active Participants ({activeChannel.members?.length || 0})
              </span>
              <div className="space-y-2 pt-1">
                {(activeChannel.members || []).map(member => (
                  <div key={member} className="flex items-center gap-3 text-[11px] text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center font-bold text-[10px] text-[#2484C6]">
                      {member.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block leading-tight">{member}</strong>
                      <span className="text-[9px] text-slate-400 block font-semibold leading-none mt-0.5">Contributor</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
