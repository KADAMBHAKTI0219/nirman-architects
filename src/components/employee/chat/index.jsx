import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Paperclip, MessageSquare, Users, Info, 
  Check, CheckCheck, Smile, Phone, Video, RefreshCw,
  CornerUpLeft, X, Search, MoreVertical, Lock, ChevronDown
} from 'lucide-react';
import Card from '../../common/Card';
import { getInternalProjectChat, sendInternalChatMessage } from '../../../service/chat';
import { getProjects } from '../../../service/project';
import { isMockSession } from '../../../service/auth';

export default function Chat() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfoDrawer, setShowInfoDrawer] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await getProjects();
      const hasRealProjects = res?.success && Array.isArray(res.projects) && res.projects.length > 0;
      
      if (hasRealProjects) {
        const roomList = res.projects.map((p, idx) => ({
          id: p._id || p.id || `proj-${idx + 1}`,
          name: p.projectName || p.name || 'Project Room',
          unread: 0,
          project: p.address || p.projectCategory || 'Architectural Workspace',
          members: ["Lead PM", "Staff Architect", "Client Contact"],
          avatar: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80`
        }));
        setRooms(roomList);
        if (roomList[0]) setActiveRoom(roomList[0]);
      } else if (isMockSession()) {
        const fallback = [
          { id: 'proj-1', name: "Central Office Tower", unread: 0, project: "Noida Sector 62", members: ["Lead PM", "Staff Architect"], avatar: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80` },
          { id: 'proj-2', name: "Smart City Mall", unread: 0, project: "Gurgaon Commercial", members: ["Lead PM", "Staff Architect"], avatar: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80` }
        ];
        setRooms(fallback);
        setActiveRoom(fallback[0]);
      } else {
        setRooms([]);
        setActiveRoom(null);
      }
    } catch (e) {
      console.warn("Failed to load project channels", e);
      if (isMockSession()) {
        const fallback = [
          { id: 'proj-1', name: "Central Office Tower", unread: 0, project: "Noida Sector 62", members: ["Lead PM", "Staff Architect"], avatar: `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=120&q=80` },
          { id: 'proj-2', name: "Smart City Mall", unread: 0, project: "Gurgaon Commercial", members: ["Lead PM", "Staff Architect"], avatar: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80` }
        ];
        setRooms(fallback);
        setActiveRoom(fallback[0]);
      } else {
        setRooms([]);
        setActiveRoom(null);
      }
    }
  };

  const fetchChatMessages = async (projectId) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getInternalProjectChat(projectId);
      if (res?.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.warn("Error loading chat history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRoom) {
      fetchChatMessages(activeRoom.id);
      setReplyToMsg(null);
    }
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [recipientRole, setRecipientRole] = useState('All Workspace Members');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const currentSenderName = currentUser.name || 'Team Member';
  const currentSenderRole = currentUser.designation || currentUser.role || 'Employee';

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeRoom) return;

    try {
      const payload = {
        messageText: newMsg,
        recipientRole,
        isInternal: isInternalNote,
        sender: `${currentSenderName} (${currentSenderRole})`,
        replyToMessageId: replyToMsg?._id || replyToMsg?.id || null
      };
      const res = await sendInternalChatMessage(activeRoom.id, payload);
      const addedMsg = res?.messageData || res?.messageObj || res?.data || {
        _id: 'msg-' + Date.now(),
        projectId: activeRoom.id,
        messageText: newMsg,
        senderName: `${currentSenderName} (${currentSenderRole})`,
        formattedAuthorName: `${currentSenderName} (${currentSenderRole})`,
        recipientRole,
        isInternal: isInternalNote,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, addedMsg]);
      setNewMsg('');
      setReplyToMsg(null);
    } catch (err) {
      alert("Failed to send internal chat message.");
    }
  };

  const normalizeMessage = (m) => {
    if (!m) return { sender: 'System', text: '', time: '', isSelf: false, replyTo: null };
    
    const userStr = localStorage.getItem('user');
    let currentUser = {};
    try {
      currentUser = userStr ? JSON.parse(userStr) : {};
    } catch (e) {}

    const sender = m.sender || m.senderName || m.formattedAuthorName || 'Unknown';
    const text = m.text || m.messageText || '';
    
    // Parse time
    let time = m.time || '';
    if (!time && m.createdAt) {
      try {
        time = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        time = '';
      }
    }

    // Determine isSelf
    const isSelf = m.isSelf || 
                   (m.senderName && currentUser.name && m.senderName === currentUser.name) || 
                   (m.authorId && currentUser.id && (m.authorId === currentUser.id || m.authorId._id === currentUser.id));

    // Resolve quoted message from messages loaded in memory
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
  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-125px)] border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-md animate-in fade-in duration-200">
      
      {/* 1. LEFT SIDEBAR: CHATROOMS LIST */}
      <div className="w-80 border-r border-[#e9edef] flex flex-col shrink-0 bg-white">
        
        {/* Sidebar Header */}
        <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#005c4b] to-[#00a884] flex items-center justify-center font-bold text-white shadow-2xs">
              EP
            </div>
            <div>
              <strong className="text-slate-905 font-bold text-xs block">Employee Portal</strong>
              <span className="text-[10px] text-emerald-600 font-black uppercase">Active Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#54656f]">
            <button 
              onClick={() => activeRoom && fetchChatMessages(activeRoom.id)} 
              className="hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer" 
              title="Refresh Workspace"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="hover:text-slate-900 transition-colors p-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer" title="Workspace Menu">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-2 bg-[#f0f2f5] border-b border-[#e9edef] shrink-0">
          <div className="relative bg-white rounded-lg flex items-center px-3 py-1.5 shadow-3xs">
            <Search className="w-4 h-4 text-[#54656f] shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search project channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-800 placeholder-[#54656f] bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Rooms Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {filteredRooms.map(room => {
            const isSelected = activeRoom?.id === room.id;
            return (
              <div 
                key={room.id}
                onClick={() => {
                  setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread: 0 } : r));
                  setActiveRoom({ ...room, unread: 0 });
                }}
                className={`px-4 py-3.5 cursor-pointer transition-all flex items-center gap-3 relative ${
                  isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
                }`}
              >
                {/* Channel Icon */}
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                    isSelected ? 'bg-[#00a884]' : 'bg-slate-400'
                  }`}>
                    {room.name.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                  </div>
                  {isSelected && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-white animate-pulse" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <strong className="text-slate-900 font-bold text-xs truncate">
                      {room.name}
                    </strong>
                  </div>
                  <p className="text-[10px] text-[#667781] truncate font-semibold uppercase leading-none">
                    {room.project}
                  </p>
                </div>

                {/* Unread Counter Badge */}
                {room.unread > 0 && (
                  <span className="w-5 h-5 bg-[#25d366] text-white font-bold text-[9px] rounded-full flex items-center justify-center shrink-0 ml-2 shadow-2xs">
                    {room.unread}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER PANEL: ACTIVE CHAT WINDOW */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#efeae2] relative">
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0 z-10">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfoDrawer(prev => !prev)}>
                <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center font-bold text-white text-xs shadow-2xs">
                  {activeRoom.name.split(' ').map(n=>n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 leading-tight">{activeRoom.name} Room</h4>
                  <span className="text-[11px] text-[#667781] block font-semibold uppercase leading-none mt-0.5">{activeRoom.project} &bull; Socket.io Live</span>
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

            {/* Chat Stream (Wallpaper Styled) */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#efeae2] bg-[radial-gradient(#dcd6cd_1px,transparent_1px)] [background-size:16px_16px] relative scrollbar-thin">
              
              {/* Encryption Banner */}
              <div className="bg-[#ffeecd] text-[#54656f] text-[11px] px-4 py-2 rounded-lg max-w-xl mx-auto text-center shadow-3xs font-medium flex items-center justify-center gap-1.5 border border-amber-250">
                <Lock className="w-3.5 h-3.5 text-[#54656f] shrink-0" />
                <span>Messages are end-to-end encrypted within this project workspace room channel.</span>
              </div>

              {/* Floating Date Badge */}
              <div className="text-center my-2">
                <span className="bg-white text-[#54656f] text-[10px] font-bold px-3 py-1 rounded-md shadow-3xs uppercase tracking-wider">
                  TODAY
                </span>
              </div>

              {/* Message Bubbles */}
              {messages.map((rawM, idx) => {
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
                      {/* Hover Reply Trigger */}
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

                      {/* Quoted Reply Block */}
                      {m.replyTo && (
                        <div className="p-2 rounded bg-black/5 border-l-4 border-[#2484C6] mb-1.5 text-[11px]">
                          <strong className="block font-bold text-[#2484C6]">{m.replyTo.sender}</strong>
                          <p className="truncate text-slate-600 italic">"{m.replyTo.text}"</p>
                        </div>
                      )}

                      {/* Text */}
                      <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap pr-12">
                        {m.text}
                      </p>

                      {/* Time & Read Ticks */}
                      <div className="flex items-center gap-1 text-[10px] text-[#667781] font-normal absolute bottom-1 right-2.5">
                        <span>{m.time}</span>
                        {m.isSelf && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#2484C6]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Quote Banner */}
            {replyToMsg && (
              <div className="bg-[#f0f2f5] px-4 py-2 border-t border-[#e9edef] shrink-0 z-10">
                <div className="p-2.5 bg-white border-l-4 border-[#008069] rounded-lg flex items-center justify-between gap-3 text-xs shadow-3xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#008069] block">
                      Replying to {replyToMsg.senderName || replyToMsg.sender || 'Message'}
                    </span>
                    <p className="text-slate-705 text-xs truncate max-w-md font-normal italic">
                      "{replyToMsg.messageText || replyToMsg.text || 'Message content'}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyToMsg(null)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-705 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Input Area */}
            <div className="bg-[#f0f2f5] px-4 py-2.5 border-t border-[#e9edef] shrink-0 z-10 space-y-2">
              {/* Recipient & Sender Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-white p-2 rounded-xl border border-slate-200 shadow-3xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Send To:</span>
                  <select
                    value={recipientRole}
                    onChange={(e) => setRecipientRole(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="All Workspace Members">All Workspace Members</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Lead Architect / Designer">Lead Architect / Designer</option>
                    <option value="Site Engineer">Site Engineer</option>
                    <option value="Client Contact">Client Contact</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInternalNote(prev => !prev)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                      isInternalNote 
                        ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-2xs' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {isInternalNote ? '🔒 Internal Staff Note' : '🌐 Public Channel'}
                  </button>

                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Sender: <strong className="text-slate-800">{currentSenderName}</strong> ({currentSenderRole})
                  </span>
                </div>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alert("Upload Attachment: blueprints & design files supported")}
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
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder={`Type a message to ${recipientRole}...`}
                  className="flex-1 text-xs border border-white rounded-lg px-4 py-2.5 bg-white focus:outline-none shadow-3xs text-slate-800 font-medium"
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
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">No project workspace room selected</p>
          </div>
        )}
      </div>

    </div>
  );
}
