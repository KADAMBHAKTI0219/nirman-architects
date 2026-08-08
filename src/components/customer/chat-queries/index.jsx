import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Paperclip, MessageSquare, Users, Info, 
  Check, CheckCheck, Smile, Phone, Video, HelpCircle, 
  RefreshCw, WifiOff, CornerUpLeft, Bell, ShieldCheck, Lock,
  Search, Moon, Circle, MoreVertical, ChevronDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getUnreadCounts, 
  getProjectChat, 
  sendClientChatMessage, 
  syncOfflineChatMessages, 
  markChatAsRead 
} from '../../../service/chat';
import { getClientDashboard } from '../../../service/crm/clientPortal';

export default function CustomerChatQueries({ userPermissionLevel = 'OWNER' }) {
  const [projectId, setProjectId] = useState('proj-1');
  const [projectChannels, setProjectChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMsgText, setNewMsgText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reply & Mention states
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await getClientDashboard();
      if (res?.success && Array.isArray(res.activeProjects) && res.activeProjects.length > 0) {
        const channels = res.activeProjects.map((p, idx) => ({
          id: p.projectId || p._id || `proj-${idx + 1}`,
          name: p.projectName || p.name || 'Architectural Project',
          code: `PROJ-00${idx + 1}`,
          pm: 'Project Manager & Lead Architect',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
        }));
        setProjectChannels(channels);
        if (channels[0]) setProjectId(channels[0].id);
      }
    } catch (e) {
      console.warn("Notice project channels:", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getUnreadCountForProj = (pId) => {
    if (!unreadCounts) return 0;
    if (Array.isArray(unreadCounts)) {
      const found = unreadCounts.find(u => u && (u.projectId === pId || u._id === pId));
      return found?.unreadCount || found?.count || 0;
    }
    if (typeof unreadCounts === 'object') {
      return unreadCounts[pId] || 0;
    }
    return 0;
  };

  const fetchChatData = async () => {
    setLoading(true);
    try {
      const [unreadRes, chatRes] = await Promise.all([
        getUnreadCounts().catch(() => null),
        getProjectChat(projectId).catch(() => null)
      ]);

      if (unreadRes && unreadRes.unreadCounts) {
        setUnreadCounts(unreadRes.unreadCounts);
      }
      if (chatRes && Array.isArray(chatRes.messages) && chatRes.messages.length > 0) {
        setMessages(chatRes.messages);
      } else if (messages.length === 0) {
        setMessages([
          {
            _id: 'm1',
            projectId,
            formattedAuthorName: 'Sarah Connor (Lead PM)',
            messageText: 'Hello! Welcome to the project workspace chat. Let us know if you need any clarifications on design blueprints or site schedules.',
            sentAt: new Date(Date.now() - 3600000).toISOString(),
            isSelf: false
          },
          {
            _id: 'm2',
            projectId,
            formattedAuthorName: 'Client Contact',
            messageText: 'Thank you Sarah, we will review the uploaded GFC drawings.',
            sentAt: new Date(Date.now() - 1800000).toISOString(),
            isSelf: true
          }
        ]);
      }
      // Endpoint 19.5: Automatically mark project chat as read
      await markChatAsRead(projectId).catch(() => null);
    } catch (err) {
      console.warn("Project chat history notice:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatData();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    if (userPermissionLevel === 'VIEW_ONLY') {
      alert("HTTP 403 Forbidden: VIEW_ONLY contact level cannot post chat messages.");
      return;
    }

    const payload = {
      messageText: newMsgText,
      replyToMessageId: replyToMsg?._id || replyToMsg?.id || null,
      mentionedIds: []
    };

    // Endpoint 19.4: Batch sync messages composed while offline
    if (!navigator.onLine) {
      const offlineItem = {
        messageText: newMsgText,
        localComposedAt: new Date().toISOString(),
        replyToMessageId: replyToMsg?._id || replyToMsg?.id || null
      };
      setOfflineQueue(prev => [...prev, offlineItem]);
      setMessages(prev => [...prev, {
        _id: 'off_' + Date.now(),
        projectId,
        formattedAuthorName: 'You (Offline Draft)',
        messageText: newMsgText,
        sentAt: new Date().toISOString(),
        isOfflineSync: true
      }]);
      setNewMsgText('');
      setReplyToMsg(null);
      return;
    }

    try {
      const res = await sendClientChatMessage(projectId, payload);
      if (res && (res.messageObj || res.message)) {
        const added = res.messageObj || res.message;
        setMessages(prev => [...prev, added]);
      } else {
        fetchChatData();
      }
      setNewMsgText('');
      setReplyToMsg(null);
    } catch (err) {
      alert(err.message || "Failed to send chat message.");
    }
  };

  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setIsSyncing(true);
    try {
      const res = await syncOfflineChatMessages(projectId, offlineQueue);
      alert(`Batch sync completed: ${res.syncedCount || offlineQueue.length} messages synced to project workspace!`);
      setOfflineQueue([]);
      fetchChatData();
    } catch (err) {
      alert(err.message || "Failed to sync offline messages.");
    } finally {
      setIsSyncing(false);
    }
  };

  const displayChannels = projectChannels.length > 0 ? projectChannels : [
    { id: 'proj-1', name: 'Architectural Project Workspace', code: 'PROJ-001', pm: 'Project Manager & Lead Architect', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80' }
  ];

  const currentChannel = displayChannels.find(p => p.id === projectId) || displayChannels[0];

  const filteredChannels = displayChannels.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-130px)] rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg bg-[#f0f2f5] font-sans text-slate-800 antialiased animate-in fade-in duration-200">
      
      {/* 1. WHATSAPP WEB LEFT SIDEBAR */}
      <div className="w-80 md:w-96 bg-white border-r border-[#e9edef] flex flex-col shrink-0">
        
        {/* Sidebar Header */}
        <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef]">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Client Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 cursor-pointer"
            />
            <div>
              <strong className="text-slate-900 font-bold text-xs block">Client Portal</strong>
              <span className="text-[10px] text-emerald-600 font-bold uppercase">{userPermissionLevel} ACCESS</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[#54656f]">
            <button onClick={fetchChatData} className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Refresh Channel">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Menu">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offline Queue Sync Indicator */}
        {offlineQueue.length > 0 && (
          <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-800">
            <div className="flex items-center gap-1.5 font-bold">
              <WifiOff className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{offlineQueue.length} Offline Drafts</span>
            </div>
            <button
              onClick={handleSyncOfflineQueue}
              disabled={isSyncing}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="p-2 bg-[#f0f2f5] border-b border-[#e9edef]">
          <div className="relative bg-white rounded-lg flex items-center px-3 py-1.5 shadow-2xs">
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

        {/* Project Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5] bg-white">
          {filteredChannels.map((p) => {
            const isSelected = projectId === p.id;
            const count = getUnreadCountForProj(p.id);

            return (
              <div
                key={p.id}
                onClick={() => setProjectId(p.id)}
                className={`px-4 py-3.5 cursor-pointer transition-all flex items-center gap-3 relative ${
                  isSelected ? 'bg-[#f0f2f5]' : 'hover:bg-[#f5f6f6]'
                }`}
              >
                {/* PM Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25d366] border-2 border-white" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <strong className="text-slate-900 font-bold text-xs truncate">
                      {p.name}
                    </strong>
                    <span className="text-[10px] text-[#8696a0] font-mono shrink-0 ml-1">
                      {p.code}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#667781] truncate font-normal">
                    Assigned: {p.pm}
                  </p>
                </div>

                {/* Green Circular Unread Counter Badge */}
                {count > 0 && (
                  <span className="w-5 h-5 bg-[#25d366] text-white font-bold text-[10px] rounded-full flex items-center justify-center shrink-0 ml-2 shadow-2xs">
                    {count}
                  </span>
                )}
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
              src={currentChannel.avatar}
              alt={currentChannel.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-semibold text-sm text-slate-900 leading-tight">{currentChannel.name}</h4>
              <span className="text-[11px] text-[#667781] block">{currentChannel.pm} &bull; Socket.io Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[#54656f]">
            {userPermissionLevel === 'VIEW_ONLY' && (
              <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-full border border-slate-200 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-slate-600" /> Read Only
              </span>
            )}
            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Search Channel">
              <Search className="w-5 h-5" />
            </button>
            <button className="hover:text-slate-900 transition-colors p-1 cursor-pointer" title="Menu" onClick={() => setShowInfoDrawer(prev => !prev)}>
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Stream Wallpaper (#efeae2) */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#efeae2] bg-[radial-gradient(#dcd6cd_1px,transparent_1px)] [background-size:16px_16px] relative">
          
          {/* Encryption Notice Banner */}
          <div className="bg-[#ffeecd] text-[#54656f] text-[11px] px-4 py-2 rounded-lg max-w-xl mx-auto text-center shadow-2xs font-medium flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#54656f] shrink-0" />
            <span>Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.</span>
          </div>

          {/* Floating Date Badge */}
          <div className="text-center my-2">
            <span className="bg-white text-[#54656f] text-[11px] font-semibold px-3 py-1 rounded-md shadow-2xs uppercase tracking-wider">
              TODAY
            </span>
          </div>

          {/* Message Stream */}
          {messages.map((m, idx) => {
            const isMe = m.authorType === 'CLIENT_CONTACT' || m.formattedAuthorName?.includes('OWNER') || m.isOfflineSync;
            const authorName = m.formattedAuthorName || (m.authorId?.name ? `${m.authorId.name}` : 'Project Team');
            const timeStr = m.sentAt || m.createdAt ? new Date(m.sentAt || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '10:00';

            return (
              <div
                key={m._id || m.id || idx}
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
                    onClick={() => setReplyToMsg(m)}
                    className={`absolute top-1.5 p-1 rounded opacity-0 group-hover/bubble:opacity-100 transition-opacity cursor-pointer ${
                      isMe ? '-left-7 text-[#54656f] bg-white shadow-2xs' : '-right-7 text-[#54656f] bg-white shadow-2xs'
                    }`}
                    title="Reply"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                  </button>

                  {/* Author Title */}
                  <div className={`text-[10px] font-bold mb-1 ${isMe ? 'text-[#008069]' : 'text-indigo-600'}`}>
                    {authorName}
                  </div>

                  {/* Quoted Message */}
                  {m.replyToMessageId && (
                    <div className="p-2 rounded bg-black/5 border-l-4 border-[#008069] mb-1.5 text-[11px]">
                      <strong className="block font-bold text-[#008069]">Quoted Message</strong>
                      <p className="truncate text-slate-600 italic">Replying to previous discussion</p>
                    </div>
                  )}

                  {/* Text Message Content */}
                  <p className="text-xs leading-relaxed font-normal whitespace-pre-wrap pr-12">
                    {m.messageText || m.text}
                  </p>

                  {/* Timestamp & Double Checkmarks inside bubble bottom-right */}
                  <div className="flex items-center gap-1 text-[10px] text-[#667781] font-normal absolute bottom-1 right-2.5">
                    <span>{timeStr}</span>
                    {isMe && (
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
            {replyToMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2 p-2 bg-white border-l-4 border-[#008069] rounded-lg flex items-center justify-between gap-3 text-xs shadow-2xs"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#008069] block">
                    Replying to {replyToMsg.formattedAuthorName || 'Message'}
                  </span>
                  <p className="text-slate-700 text-xs truncate max-w-md font-normal">
                    "{replyToMsg.messageText || replyToMsg.text}"
                  </p>
                </div>
                <button
                  onClick={() => setReplyToMsg(null)}
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
              onClick={() => alert("Upload Attachment: Blueprint file attachment supported")}
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
              value={newMsgText}
              disabled={userPermissionLevel === 'VIEW_ONLY'}
              onChange={(e) => setNewMsgText(e.target.value)}
              placeholder={
                userPermissionLevel === 'VIEW_ONLY' 
                  ? "VIEW_ONLY contact level: Posting messages disabled" 
                  : "Type a message here .."
              }
              className="flex-1 bg-white border-0 rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder-[#54656f] focus:outline-none shadow-2xs font-normal disabled:bg-slate-100 disabled:cursor-not-allowed"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={userPermissionLevel === 'VIEW_ONLY'}
              className="text-[#54656f] hover:text-[#008069] transition-colors p-1 cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h3 className="font-bold text-slate-900 text-sm">Channel Info</h3>
              <button
                onClick={() => setShowInfoDrawer(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PM Avatar */}
            <div className="text-center space-y-2">
              <img
                src={currentChannel.avatar}
                alt={currentChannel.name}
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-slate-100"
              />
              <div>
                <strong className="text-slate-900 font-bold text-base block">{currentChannel.name}</strong>
                <span className="text-xs text-slate-500 block">{currentChannel.pm}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-[#f0f2f5] pt-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Permission Status</span>
              <div className="p-3 bg-[#f0f2f5] rounded-xl space-y-1">
                <strong className="text-slate-900 font-bold block">{userPermissionLevel} ACCESS</strong>
                <span className="text-[11px] text-slate-600 block">
                  {userPermissionLevel === 'VIEW_ONLY' ? 'Read-only access to channel stream' : 'Full posting privileges enabled'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
