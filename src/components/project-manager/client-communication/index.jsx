import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Search, Paperclip, Mic, CornerUpLeft, X, CheckCheck, Check, 
  ShieldAlert, FileText, Lock, Building, Phone, Mail, ChevronRight, 
  UserCheck, Plus, Sparkles, Filter, Info, Circle, MessageSquare, 
  MoreVertical, RefreshCw
} from 'lucide-react';
import { 
  getProjectChat, 
  sendClientChatMessage, 
  sendInternalChatMessage, 
  markChatAsRead 
} from '../../../service/chat';
import { getProjects } from '../../../service/project';

export default function ClientCommunication({ defaultProjectId = null }) {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [newMsg, setNewMsg] = useState('');
  const [isInternalMode, setIsInternalMode] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Load project list dynamically from backend API
  useEffect(() => {
    const loadProjectChannels = async () => {
      setLoadingChats(true);
      try {
        const res = await getProjects();
        if (res && res.success && Array.isArray(res.projects) && res.projects.length > 0) {
          const dynamicChats = res.projects.map(p => ({
            id: p._id || p.id || p.code,
            projectId: p._id || p.id || p.code,
            client: p.clientInformation || p.client || "Client Representative",
            company: p.clientInformation || p.client || "Client Organization",
            project: p.name || p.projectName || "Project Channel",
            code: p.code || "PRJ",
            unread: p.pendingApprovals || 0,
            phone: "+91 98765 00000",
            email: "client@nirman.com",
            status: "Online",
            messages: []
          }));
          setChats(dynamicChats);

          if (defaultProjectId) {
            const match = dynamicChats.find(c => c.projectId === defaultProjectId || c.id === defaultProjectId);
            if (match) setActiveChat(match);
            else setActiveChat(dynamicChats[0]);
          } else {
            setActiveChat(dynamicChats[0]);
          }
        } else {
          setChats([]);
          setActiveChat(null);
        }
      } catch (err) {
        console.warn("Error fetching projects for chat hub:", err);
        setChats([]);
      } finally {
        setLoadingChats(false);
      }
    };
    loadProjectChannels();
  }, [defaultProjectId]);

  // Fetch live chat messages for active chat
  useEffect(() => {
    if (!activeChat || !activeChat.projectId) return;

    const fetchChatMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await getProjectChat(activeChat.projectId);
        let msgList = [];
        if (res && (res.messages || (res.data && res.data.messages))) {
          msgList = res.messages || res.data.messages;
        } else if (Array.isArray(res)) {
          msgList = res;
        }

        const formatted = msgList.map(m => ({
          id: m._id || m.id || (Date.now() + Math.random()),
          sender: m.formattedAuthorName || m.senderName || m.sender || activeChat.client,
          text: m.messageText || m.text || '',
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "Just now",
          isInternal: Boolean(m.isInternal),
          isMe: m.authorType === 'EMPLOYEE' || (m.sender && m.sender.includes('PM')),
          replyTo: m.replyToMessageId ? { sender: 'Quoted Message', text: 'Previous note' } : null,
          status: 'read'
        }));

        setActiveChat(prev => (prev ? { ...prev, messages: formatted } : null));
      } catch (err) {
        console.warn("Failed to fetch backend chat messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchChatMessages();
  }, [activeChat?.id, activeChat?.projectId]);

  const handleSelectChat = (chat) => {
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
    setActiveChat({ ...chat, unread: 0 });
    setReplyingTo(null);
    try {
      markChatAsRead(chat.projectId);
    } catch (e) {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const messageObj = {
      id: Date.now(),
      sender: isInternalMode ? "Project Manager (Internal Note)" : "Project Manager",
      text: newMsg.trim(),
      time: currentTime,
      isInternal: isInternalMode,
      isMe: true,
      replyTo: replyingTo ? { sender: replyingTo.sender, text: replyingTo.text } : null,
      status: 'read'
    };

    try {
      if (isInternalMode) {
        await sendInternalChatMessage(activeChat.projectId, { 
          messageText: newMsg,
          replyToMessageId: replyingTo?.id || null 
        });
      } else {
        await sendClientChatMessage(activeChat.projectId, { 
          messageText: newMsg,
          replyToMessageId: replyingTo?.id || null 
        });
      }
    } catch (err) {
      console.warn("Chat API send warning:", err.message);
    }

    const updatedMessages = [...(activeChat.messages || []), messageObj];
    const updatedChat = { ...activeChat, messages: updatedMessages, unread: 0 };

    setChats(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c));
    setActiveChat(updatedChat);
    setNewMsg('');
    setReplyingTo(null);
  };

  const filteredChats = chats.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.project.toLowerCase().includes(q) || 
                          c.client.toLowerCase().includes(q) ||
                          c.code.toLowerCase().includes(q);
    if (filterTab === 'Unread') return matchesSearch && c.unread > 0;
    return matchesSearch;
  });

  return (
    <div className="bg-[#efeae2] rounded-3xl border border-slate-200 shadow-xl overflow-hidden h-[720px] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* LEFT PANEL: WHATSAPP SIDEBAR CHANNELS */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
        
        {/* WhatsApp Sidebar Header */}
        <div className="bg-[#f0f2f5] p-3.5 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#00a884] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                WA
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>WhatsApp Client Hub</span>
                </h3>
                <span className="text-[10px] text-[#008069] font-medium flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-[#00a884] text-[#00a884]" /> Live Channel
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#e7fce3] text-[#008069] border border-[#00a884]/30 rounded-full text-[10px] font-bold">
                Online
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or start new chat..."
              className="w-full pl-9 pr-3 py-2 text-xs border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a884]/30 bg-white shadow-3xs font-normal text-slate-800"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {['All', 'Unread'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  filterTab === tab 
                    ? 'bg-[#00a884] text-white shadow-2xs' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* WhatsApp Channel List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {loadingChats ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#00a884]" />
              <p className="text-xs font-normal">Loading WhatsApp channels...</p>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map(c => {
              const isActive = activeChat && activeChat.id === c.id;
              const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectChat(c)}
                  className={`p-3 flex items-start gap-3 transition-all cursor-pointer relative ${
                    isActive ? 'bg-[#f0f2f5] border-l-4 border-[#00a884]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#075e54] to-[#00a884] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    {c.project ? c.project.substring(0, 2).toUpperCase() : 'PR'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{c.project}</span>
                      {lastMsg && <span className="text-[10px] text-[#667781] font-medium">{lastMsg.time}</span>}
                    </div>
                    <p className="text-[11px] text-[#667781] truncate mt-0.5 font-medium">{c.client} &bull; {c.code}</p>
                    {lastMsg ? (
                      <p className="text-[11px] text-slate-600 truncate mt-1 font-normal flex items-center gap-1">
                        {lastMsg.isMe && <CheckCheck className="w-3.5 h-3.5 text-[#34b7f1] inline shrink-0" />}
                        {lastMsg.isInternal && <span className="text-amber-600 font-bold">[Note] </span>}
                        <span>{lastMsg.text}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic mt-1">Tap to chat with client</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 p-4">
              <p className="text-xs font-normal">No active chats found.</p>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT PANEL: WHATSAPP CHAT STREAM */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full bg-[#efeae2] relative">
          
          {/* WhatsApp Header */}
          <div className="p-3 bg-[#f0f2f5] border-b border-slate-200 flex items-center justify-between shrink-0 shadow-3xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#075e54] to-[#00a884] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                {activeChat.project ? activeChat.project.substring(0, 2).toUpperCase() : 'PR'}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{activeChat.project}</h4>
                <p className="text-[11px] text-[#008069] font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse"></span>
                  <span>Client: {activeChat.client} &bull; Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternalMode(!isInternalMode)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 shadow-3xs ${
                  isInternalMode
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>{isInternalMode ? 'Internal Team Note' : 'Client Mode'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Chat Wallpaper Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#efeae2] bg-[radial-gradient(#d1c7bd_1px,transparent_1px)] [background-size:16px_16px]">
            
            {/* Today Banner */}
            <div className="flex justify-center my-2">
              <span className="px-3 py-1 bg-white/90 text-[#667781] text-[10px] font-bold rounded-lg shadow-3xs uppercase tracking-wider">
                TODAY
              </span>
            </div>

            {loadingMessages ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#00a884]" />
                <p className="text-xs font-medium">Decrypting WhatsApp messages...</p>
              </div>
            ) : activeChat.messages && activeChat.messages.length > 0 ? (
              activeChat.messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2.5 rounded-2xl text-xs shadow-2xs space-y-1 relative ${
                      m.isInternal
                        ? 'bg-[#fff3cd] text-[#664d03] border border-amber-300 rounded-tr-none'
                        : m.isMe
                          ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-none'
                          : 'bg-white text-[#111b21] rounded-tl-none border border-slate-200/60'
                    }`}
                  >
                    {/* Header info for incoming / internal */}
                    {(!m.isMe || m.isInternal) && (
                      <div className="flex items-center justify-between gap-4 text-[10px] pb-0.5 border-b border-black/5">
                        <span className={`font-bold ${m.isInternal ? 'text-amber-800' : 'text-[#008069]'}`}>
                          {m.sender}
                        </span>
                      </div>
                    )}

                    {/* Quoted Message */}
                    {m.replyTo && (
                      <div className="p-2 bg-black/5 rounded-lg text-[11px] border-l-3 border-[#00a884] space-y-0.5">
                        <span className="text-[10px] font-bold text-[#008069] block">{m.replyTo.sender}</span>
                        <p className="text-slate-700 italic truncate font-normal">{m.replyTo.text}</p>
                      </div>
                    )}

                    {/* Message Text */}
                    <p className="text-[#111b21] font-normal leading-relaxed whitespace-pre-wrap pr-12">{m.text}</p>

                    {/* Bottom Right Timestamp & Double Ticks */}
                    <div className="flex items-center justify-end gap-1 text-[9px] text-[#667781] font-medium pt-1 -mt-1">
                      <span>{m.time}</span>
                      {m.isMe && !m.isInternal && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      )}
                      {m.isInternal && (
                        <Lock className="w-3 h-3 text-amber-700" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-1 bg-white/60 p-6 rounded-3xl max-w-sm mx-auto shadow-2xs">
                <MessageSquare className="w-8 h-8 text-[#00a884] mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">End-to-End Encrypted Client Channel</p>
                <p className="text-[11px] text-slate-500 font-normal">Messages sent here are synced live with the client portal.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Footer Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#f0f2f5] border-t border-slate-200 space-y-2 shrink-0">
            {replyingTo && (
              <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-xl text-xs shadow-3xs">
                <div className="truncate">
                  <span className="font-bold text-[#008069]">Replying to {replyingTo.sender}:</span>
                  <p className="text-slate-600 truncate font-normal text-[11px]">{replyingTo.text}</p>
                </div>
                <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-all cursor-pointer"
                title="Attach Document or Drawing"
              >
                <Paperclip className="w-5 h-5 text-[#54656f]" />
              </button>

              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder={isInternalMode ? "Type internal PM note (hidden from client)..." : "Type a message..."}
                className={`flex-1 px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:ring-2 font-normal shadow-3xs ${
                  isInternalMode 
                    ? 'border border-amber-300 bg-[#fff9e6] focus:ring-amber-400 text-amber-900' 
                    : 'border-0 bg-white focus:ring-[#00a884]/30 text-slate-800'
                }`}
              />

              <button
                type="submit"
                disabled={!newMsg.trim()}
                className={`p-2.5 rounded-full text-white transition-all shadow-md flex items-center justify-center cursor-pointer ${
                  isInternalMode
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[#00a884] hover:bg-[#008069]'
                }`}
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 bg-[#efeae2] text-slate-400">
          <p className="text-xs font-normal">Select a WhatsApp project channel to start messaging.</p>
        </div>
      )}

    </div>
  );
}
