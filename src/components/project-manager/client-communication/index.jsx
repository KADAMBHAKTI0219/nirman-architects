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
    <div className="bg-slate-50 rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden h-[680px] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* LEFT PANEL: CHAT DIRECTORY CHANNELS */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200/90 flex flex-col h-full shrink-0">
        
        {/* Search & Header */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-accent" />
              <span>Client Communications</span>
            </h3>
            <span className="px-2.5 py-0.5 bg-brand-soft text-slate-800 text-[10px] font-medium rounded-full">
              Live Channel
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels by project or client..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-slate-50 font-normal"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-[11px] pt-1">
            {['All', 'Unread'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filterTab === tab 
                    ? 'bg-brand-primary text-slate-900 shadow-2xs' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Project Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80">
          {loadingChats ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
              <p className="text-xs font-normal">Loading project channels...</p>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map(c => {
              const isActive = activeChat && activeChat.id === c.id;
              const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectChat(c)}
                  className={`p-3.5 flex items-start gap-3 transition-all cursor-pointer ${
                    isActive ? 'bg-brand-soft/60 border-l-4 border-brand-accent' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-brand-primary text-slate-900 font-semibold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {c.project ? c.project.substring(0, 2).toUpperCase() : 'PR'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 truncate">{c.project}</span>
                      {lastMsg && <span className="text-[10px] text-slate-400 font-mono">{lastMsg.time}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">{c.client} ({c.code})</p>
                    {lastMsg ? (
                      <p className="text-[11px] text-slate-600 truncate mt-1 font-normal">
                        {lastMsg.isInternal && <span className="text-amber-600 font-medium">[Internal Note] </span>}
                        {lastMsg.text}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic mt-1">No messages yet</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 p-4">
              <p className="text-xs font-normal">No active channels found.</p>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT PANEL: LIVE MESSAGING AREA */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full bg-white relative">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-brand-primary text-slate-900 font-semibold flex items-center justify-center text-xs shadow-2xs">
                {activeChat.project ? activeChat.project.substring(0, 2).toUpperCase() : 'PR'}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{activeChat.project}</h4>
                <p className="text-[11px] text-slate-500 font-normal">Client: {activeChat.client} &bull; {activeChat.code}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsInternalMode(!isInternalMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isInternalMode
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>{isInternalMode ? 'Internal Team Note' : 'Client Mode'}</span>
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8FAFC]">
            {loadingMessages ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                <p className="text-xs font-normal">Fetching live conversation messages...</p>
              </div>
            ) : activeChat.messages && activeChat.messages.length > 0 ? (
              activeChat.messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs shadow-2xs space-y-1 ${
                      m.isInternal
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : m.isMe
                          ? 'bg-brand-primary text-slate-900 border border-brand-secondary/40'
                          : 'bg-white text-slate-800 border border-slate-200/80'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-4 text-[10px] text-slate-500 pb-1 border-b border-slate-200/40">
                      <span className="font-medium text-slate-700">{m.sender}</span>
                      <span className="font-mono text-slate-400">{m.time}</span>
                    </div>

                    {/* Quoted Message */}
                    {m.replyTo && (
                      <div className="p-2 bg-black/5 rounded-lg text-[11px] border-l-2 border-slate-400 space-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-600 block">{m.replyTo.sender}</span>
                        <p className="text-slate-700 italic truncate font-normal">{m.replyTo.text}</p>
                      </div>
                    )}

                    {/* Message Body */}
                    <p className="text-slate-800 font-normal leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-400 space-y-1">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No conversation history for this project channel yet.</p>
                <p className="text-[11px] text-slate-400 font-normal">Type a message below to start communicating with the client.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white space-y-2">
            {replyingTo && (
              <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="truncate">
                  <span className="font-semibold text-slate-700">Replying to {replyingTo.sender}:</span>
                  <p className="text-slate-500 truncate font-normal text-[11px]">{replyingTo.text}</p>
                </div>
                <button type="button" onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder={isInternalMode ? "Type internal PM team note (hidden from client)..." : "Type message to client..."}
                className={`flex-1 px-4 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-2 font-normal ${
                  isInternalMode 
                    ? 'border-amber-300 bg-amber-50/50 focus:ring-amber-300 text-amber-900' 
                    : 'border-slate-200 bg-slate-50 focus:ring-brand-primary/30 text-slate-800'
                }`}
              />

              <button
                type="submit"
                disabled={!newMsg.trim()}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                  isInternalMode
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-brand-primary hover:bg-brand-secondary text-slate-900 border border-brand-secondary/40'
                }`}
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 bg-white text-slate-400">
          <p className="text-xs font-normal">Select a project channel to start messaging.</p>
        </div>
      )}

    </div>
  );
}
