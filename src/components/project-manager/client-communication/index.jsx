import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Search, Paperclip, Mic, CornerUpLeft, X, CheckCheck, Check, 
  ShieldAlert, FileText, Lock, Building, Phone, Mail, ChevronRight, 
  UserCheck, Plus, Sparkles, Filter, Info, Moon, Circle, MessageSquare, 
  MoreVertical, ChevronDown, Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getProjectChat, 
  sendClientChatMessage, 
  sendInternalChatMessage, 
  markChatAsRead 
} from '../../../service/chat';

const INITIAL_CHATS = [
  { 
    id: 1, 
    projectId: "proj-1", 
    client: "John Smith", 
    company: "Wayne Enterprises", 
    project: "Central Office Tower", 
    unread: 5, 
    phone: "+91 98765 43210",
    email: "john@smith.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    status: "Online",
    messages: [
      { id: 101, sender: "John Smith", text: "Can you send me that file?", time: "08:58", isInternal: false, isMe: false, status: 'read' },
      { id: 102, sender: "Sarah Connor (PM)", text: "sure.", time: "09:01", isInternal: false, isMe: true, status: 'read' },
      { id: 103, sender: "John Smith", text: "Yet another message here..", time: "09:05", isInternal: false, isMe: false, status: 'read' },
      { id: 104, sender: "Sarah Connor (PM)", text: "What time should we meet?", time: "12:30", isInternal: false, isMe: true, status: 'read' },
      { id: 105, sender: "John Smith", text: "Can you send me that file?", time: "15:42", isInternal: false, isMe: false, status: 'read' },
      { id: 106, sender: "Sarah Connor (PM)", text: "I'll be there in 10 minutes.", time: "10:12", isInternal: false, isMe: true, status: 'read' },
      { id: 107, sender: "John Smith", text: "Let's meet at the coffee shop.", time: "18:03", isInternal: false, isMe: false, status: 'read' },
      { id: 108, sender: "Sarah Connor (PM)", text: "Sorry, I can't make it today.", time: "13:25", isInternal: false, isMe: true, status: 'read' },
      { id: 109, sender: "John Smith", text: "No problem, we can reschedule.", time: "16:08", isInternal: false, isMe: false, status: 'read' }
    ]
  },
  { 
    id: 2, 
    projectId: "proj-2", 
    client: "Jane Doe", 
    company: "Metropolis Corp", 
    project: "Oceanic Luxury Villas", 
    unread: 2, 
    phone: "+91 98765 00001",
    email: "jane@doe.com",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    status: "Online",
    messages: [
      { id: 201, sender: "Jane Doe", text: "Hello there!", time: "12:15", isInternal: false, isMe: false, status: 'read' }
    ]
  },
  { 
    id: 3, 
    projectId: "proj-3", 
    client: "Bob Johnson", 
    company: "Johnson Infra", 
    project: "Smart City Mall", 
    unread: 0, 
    phone: "+91 98765 11111",
    email: "bob@johnson.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    status: "Offline",
    messages: [
      { id: 301, sender: "Bob Johnson", text: "How are you?", time: "06:47", isInternal: false, isMe: false, status: 'read' }
    ]
  },
  { 
    id: 4, 
    projectId: "proj-4", 
    client: "Samantha Lee", 
    company: "Lee Architecture", 
    project: "Heights Residency", 
    unread: 0, 
    phone: "+91 98765 22222",
    email: "samantha@lee.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    status: "Online",
    messages: [
      { id: 401, sender: "Samantha Lee", text: "See you tomorrow!", time: "09:35", isInternal: false, isMe: false, status: 'read' }
    ]
  },
  { 
    id: 5, 
    projectId: "proj-5", 
    client: "William Chen", 
    company: "Chen Design", 
    project: "Tech Park Phase 1", 
    unread: 0, 
    phone: "+91 98765 33333",
    email: "william@chen.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    status: "Offline",
    messages: [
      { id: 501, sender: "William Chen", text: "Thanks for your help!", time: "05:22", isInternal: false, isMe: false, status: 'read' }
    ]
  },
  { 
    id: 6, 
    projectId: "proj-6", 
    client: "Emily Kim", 
    company: "Kim Interiors", 
    project: "Green Valley Residency", 
    unread: 0, 
    phone: "+91 98765 44444",
    email: "emily@kim.com",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
    status: "Online",
    messages: [
      { id: 601, sender: "Emily Kim", text: "Are you free tonight?", time: "04:10", isInternal: false, isMe: false, status: 'read' }
    ]
  }
];

export default function ClientCommunication({ defaultProjectId = null }) {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState(() => {
    if (defaultProjectId) {
      const match = INITIAL_CHATS.find(c => c.projectId === defaultProjectId);
      if (match) return match;
    }
    return INITIAL_CHATS[0];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [newMsg, setNewMsg] = useState('');
  const [isInternalMode, setIsInternalMode] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showBanner, setShowBanner] = useState(true);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages]);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const res = await getProjectChat(activeChat.projectId || 'proj-1');
        if (res && res.success && res.data && res.data.messages) {
          const formatted = res.data.messages.map(m => ({
            id: m._id || Date.now() + Math.random(),
            sender: m.formattedAuthorName || m.senderName || activeChat.client,
            text: m.messageText || m.text,
            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "09:00",
            isInternal: Boolean(m.isInternal),
            isMe: m.authorType === 'EMPLOYEE' || (m.sender && m.sender.includes('PM')),
            replyTo: m.replyToMessageId ? { sender: 'Quoted Message', text: 'Previous message' } : null,
            status: 'read'
          }));
          if (formatted.length > 0) {
            setActiveChat(prev => ({ ...prev, messages: formatted }));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch real chat messages:", err);
      }
    };
    fetchChatData();
  }, [activeChat.id]);

  const handleSelectChat = (chat) => {
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
    setActiveChat({ ...chat, unread: 0 });
    setReplyingTo(null);
    try {
      markChatAsRead(chat.projectId || 'proj-1');
    } catch (e) {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const messageObj = {
      id: Date.now(),
      sender: isInternalMode ? "Sarah Connor (Internal PM Note)" : "Sarah Connor (PM)",
      text: newMsg.trim(),
      time: currentTime,
      isInternal: isInternalMode,
      isMe: true,
      replyTo: replyingTo ? { sender: replyingTo.sender, text: replyingTo.text } : null,
      status: 'read'
    };

    try {
      if (isInternalMode) {
        await sendInternalChatMessage(activeChat.projectId || 'proj-1', { 
          messageText: newMsg,
          replyToMessageId: replyingTo?.id || null 
        });
      } else {
        await sendClientChatMessage(activeChat.projectId || 'proj-1', { 
          messageText: newMsg,
          replyToMessageId: replyingTo?.id || null 
        });
      }
    } catch (err) {
      console.warn("Chat API send warning:", err.message);
    }

    const updatedMessages = [...activeChat.messages, messageObj];
    const updatedChat = { ...activeChat, messages: updatedMessages, unread: 0 };

    setChats(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c));
    setActiveChat(updatedChat);
    setNewMsg('');
    setReplyingTo(null);
  };

  const filteredChats = chats.filter(c => {
    const matchesSearch = c.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = filterTab === 'All' || (filterTab === 'Unread' ? c.unread > 0 : true);
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans text-slate-800">
      {/* 0. TOP PAGE HEADER MATCHING DRAWINGS VAULT MANAGEMENT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Client Communication & Live Messaging
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Seamless real-time chat with clients, internal project discussions, and query sign-offs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-extrabold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Realtime Gateway Active
          </span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-190px)] rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg bg-[#f0f2f5] font-sans text-slate-800 antialiased">
      
      {/* 1. WHATSAPP WEB LEFT SIDEBAR */}
      <div className="w-80 md:w-96 bg-white border-r border-[#e9edef] flex flex-col shrink-0">
        
        {/* Sidebar Top Header (User Profile & Action Icons) */}
        <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef]">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="My Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-4 text-[#54656f]">
            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Dark Mode Toggle">
              <Moon className="w-5 h-5" />
            </button>
            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Status">
              <Circle className="w-5 h-5" />
            </button>
            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="New Chat">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Menu">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dismissible Contacts Banner */}
        {showBanner && (
          <div className="bg-[#d9f2fc] px-4 py-3 flex items-start justify-between border-b border-[#bde4f7] text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#53bdeb] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ⚡
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">No Contacts</strong>
                <span className="text-[#3b4a54] text-[11px]">You can import Contacts from Google <a href="#" className="underline font-semibold text-sky-700">Learn more.</a></span>
              </div>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-[#54656f] hover:text-slate-900 p-0.5 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-2 bg-[#f0f2f5] border-b border-[#e9edef]">
          <div className="relative bg-white rounded-lg flex items-center px-3 py-1.5 shadow-2xs">
            <Search className="w-4 h-4 text-[#54656f] shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search or start a new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-slate-800 placeholder-[#54656f] bg-transparent focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 px-3 py-2 bg-white border-b border-[#f0f2f5] text-[11px] font-bold">
          {['All', 'Unread'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                filterTab === tab 
                  ? 'bg-[#e7fce3] text-[#008069] border border-[#a3e49b]' 
                  : 'bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5] bg-white">
          {filteredChats.map((chat) => {
            const isSelected = activeChat.id === chat.id;
            const lastMsg = chat.messages[chat.messages.length - 1];

            return (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`px-4 py-3 cursor-pointer transition-all flex items-center gap-3 relative ${
                  isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
                }`}
              >
                {/* Contact Profile Picture */}
                <div className="relative shrink-0">
                  <img
                    src={chat.avatar}
                    alt={chat.client}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.status === 'Online' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-white" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <strong className="text-slate-900 font-semibold text-sm truncate">
                      {chat.client}
                    </strong>
                    <span className="text-[11px] text-[#8696a0] font-normal shrink-0 ml-1">
                      {lastMsg ? lastMsg.time : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[#667781] truncate flex items-center gap-1 font-normal">
                      {lastMsg?.isMe && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                      )}
                      <span className="truncate">
                        {lastMsg ? (lastMsg.isInternal ? `🔒 [Internal]: ${lastMsg.text}` : lastMsg.text) : 'No messages'}
                      </span>
                    </p>

                    {/* Green Circular Unread Counter Badge */}
                    {chat.unread > 0 && (
                      <span className="w-5 h-5 bg-[#25d366] text-white font-bold text-[10px] rounded-full flex items-center justify-center shrink-0 ml-2 shadow-2xs">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* 2. MAIN WHATSAPP WEB CHAT CONTAINER */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#efeae2] relative">
        
        {/* Chat Top Header */}
        <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0 z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfoDrawer(prev => !prev)}>
            <img
              src={activeChat.avatar}
              alt={activeChat.client}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-sm text-slate-900 leading-tight">{activeChat.client}</h4>
              <span className="text-[11px] text-[#667781] block">{activeChat.project} &bull; {activeChat.status}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[#54656f]">
            {/* Mode Switcher Badge */}
            <button
              onClick={() => setIsInternalMode(prev => !prev)}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                isInternalMode 
                  ? 'bg-amber-500 text-slate-950 shadow-xs' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {isInternalMode ? <Lock className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isInternalMode ? 'Internal Note' : 'Client Public'}</span>
            </button>

            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Search Message">
              <Search className="w-5 h-5" />
            </button>
            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Menu" onClick={() => setShowInfoDrawer(prev => !prev)}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Stream (WhatsApp Light Beige Pattern Wallpaper `#efeae2`) */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#efeae2] bg-[radial-gradient(#dcd6cd_1px,transparent_1px)] [background-size:16px_16px] relative">
          
          {/* End-to-End Encryption Notice Banner */}
          <div className="bg-[#ffeecd] text-[#54656f] text-[11px] px-4 py-2 rounded-lg max-w-xl mx-auto text-center shadow-2xs font-medium flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#54656f] shrink-0" />
            <span>Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Click to learn more.</span>
          </div>

          {/* Floating Date Badge */}
          <div className="text-center my-2">
            <span className="bg-white text-[#54656f] text-[11px] font-semibold px-3 py-1 rounded-md shadow-2xs uppercase tracking-wider">
              TODAY
            </span>
          </div>

          {/* Message Stream */}
          {activeChat.messages.map((m) => {
            const isMe = m.isMe;

            return (
              <div
                key={m.id}
                className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Speech Bubble */}
                <div
                  className={`relative max-w-md px-3.5 py-2 rounded-lg shadow-2xs transition-all group/bubble text-xs ${
                    m.isInternal 
                      ? 'bg-amber-100 text-amber-950 border border-amber-300 w-full max-w-lg mx-auto text-center' 
                      : (isMe 
                          ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' 
                          : 'bg-white text-slate-900 rounded-tl-none')
                  }`}
                >
                  {/* Quick Reply Button */}
                  <button
                    onClick={() => setReplyingTo({ id: m.id, sender: m.sender, text: m.text })}
                    className={`absolute top-1.5 p-1 rounded opacity-0 group-hover/bubble:opacity-100 transition-opacity cursor-pointer ${
                      isMe ? '-left-7 text-[#54656f] bg-white shadow-2xs' : '-right-7 text-[#54656f] bg-white shadow-2xs'
                    }`}
                    title="Reply"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Quoted Message */}
                  {m.replyTo && (
                    <div className="p-2 rounded bg-black/5 border-l-4 border-[#008069] mb-1.5 text-[11px]">
                      <strong className="block font-bold text-[#008069]">{m.replyTo.sender}</strong>
                      <p className="truncate text-slate-600 italic">{m.replyTo.text}</p>
                    </div>
                  )}

                  {/* Text Message Content */}
                  <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap pr-12">
                    {m.text}
                  </p>

                  {/* Timestamp & Double Checkmarks inside bubble bottom-right */}
                  <div className="flex items-center gap-1 text-[10px] text-[#667781] font-normal absolute bottom-1 right-2.5">
                    <span>{m.time}</span>
                    {isMe && !m.isInternal && (
                      <CheckCheck className="w-4 h-4 text-[#53bdeb]" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />

          {/* Floating Scroll to Bottom Arrow Button */}
          <button
            onClick={scrollToBottom}
            className="fixed bottom-20 right-8 w-9 h-9 bg-white text-[#54656f] rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer z-10"
            title="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* 3. BOTTOM INPUT BAR */}
        <div className="bg-[#f0f2f5] px-4 py-2.5 border-t border-[#e9edef] shrink-0 z-10">
          
          {/* Quote Reply Banner */}
          <AnimatePresence>
            {replyingTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 p-2 bg-white border-l-4 border-[#008069] rounded-lg flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#008069] block">
                    Replying to {replyingTo.sender}
                  </span>
                  <p className="text-slate-700 text-xs truncate max-w-md font-normal">
                    "{replyingTo.text}"
                  </p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            
            {/* Attachment & Emoji Buttons */}
            <button
              type="button"
              onClick={() => alert("Upload Attachment: Blueprint DWG/PDF file supported")}
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

            {/* Input Box */}
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder={
                isInternalMode 
                  ? "Type internal team note..." 
                  : "Type a message here .."
              }
              className="flex-1 bg-white border-0 rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder-[#54656f] focus:outline-none shadow-2xs font-normal"
            />

            {/* Send Button */}
            <button
              type="submit"
              className="text-[#54656f] hover:text-[#008069] transition-colors p-1 cursor-pointer shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5 text-[#54656f] hover:text-[#008069]" />
            </button>
          </form>
        </div>

      </div>

      {/* 4. RIGHT SIDEBAR CHANNEL DRAWER */}
      <AnimatePresence>
        {showInfoDrawer && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 320 }}
            exit={{ opacity: 0, width: 0 }}
            className="bg-white border-l border-[#e9edef] p-5 flex flex-col gap-5 shadow-xs overflow-y-auto shrink-0 z-20"
          >
            <div className="flex items-center justify-between border-b border-[#f0f2f5] pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Contact Info</h3>
              <button
                onClick={() => setShowInfoDrawer(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Picture */}
            <div className="text-center space-y-2">
              <img
                src={activeChat.avatar}
                alt={activeChat.client}
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-slate-100"
              />
              <div>
                <strong className="text-slate-900 font-bold text-base block">{activeChat.client}</strong>
                <span className="text-xs text-slate-500 block">{activeChat.company}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-[#f0f2f5] pt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone Number</span>
              <div className="flex items-center gap-2 text-slate-700 font-mono">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{activeChat.phone}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-[#f0f2f5] pt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Linked Project</span>
              <div className="p-3 bg-[#f0f2f5] rounded-xl space-y-1">
                <strong className="text-slate-900 font-bold block">{activeChat.project}</strong>
                <span className="text-[11px] text-emerald-600 font-semibold block">Active Client Portal Link</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </div>
  );
}
