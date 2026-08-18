import React, { useState, useEffect, useRef } from 'react';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatHeader from '../../../components/chat/ChatHeader';
import MessageBubble from '../../../components/chat/MessageBubble';
import MessageComposer from '../../../components/chat/MessageComposer';
import { getInternalProjectChat, sendInternalChatMessage } from '../../../service/chat';
import { getProjects } from '../../../service/project';
import { getUsersList } from '../../../service/auth';
import { isMockSession } from '../../../service/auth';

/**
 * 1. INTERNAL CHAT MODULE
 * Communication STRICTLY for Internal Company Employees & Team Members.
 * Client contacts are NEVER displayed here.
 */
export default function InternalChat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyToMsg, setReplyToMsg] = useState(null);
  const messagesEndRef = useRef(null);

  // 1. Get current logged-in user
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const currentUserId = currentUser.id || currentUser._id || 'usr_current';

  // 2. Load Internal Conversations & Employees dynamically
  const loadData = async () => {
    try {
      setLoading(true);
      // Dynamic Internal Team Channels & Staff Members
      const userRes = await getUsersList().catch(() => null);
      let staffChannels = [];
      if (userRes && (userRes.users || Array.isArray(userRes.data))) {
        const uList = userRes.users || userRes.data || [];
        const empList = uList.filter(u => {
          const r = String(u.role || u.designation || '').toLowerCase();
          return !r.includes('client') && !r.includes('customer');
        });

        staffChannels = empList.map(u => ({
          id: u._id || u.id || `emp-${u.email}`,
          name: u.name || u.fullName || u.email,
          subtitle: `${u.designation || u.role || 'Team Staff'} • ${u.department || 'Internal Studio'}`,
          lastMessage: 'Direct internal team discussion',
          time: 'Active'
        }));

        setEmployees(empList.map(u => ({
          id: u._id || u.id,
          name: u.name || u.fullName || u.email,
          role: u.role || u.designation || 'Staff',
          email: u.email
        })));
      }

      // Fetch dynamic projects list from backend
      const projRes = await getProjects().catch(() => null);
      const projList = projRes?.projects || (Array.isArray(projRes) ? projRes : []);

      const projChannels = projList.map((p, idx) => ({
        id: p._id || p.id || `proj-int-${idx + 1}`,
        name: `${p.projectName || p.name || `Project #${idx+1}`} (Team Discussion)`,
        subtitle: `Internal Project • ${p.code || 'PRJ'}`,
        lastMessage: p.status ? `Status: ${p.status}` : 'Internal project discussion channel',
        time: 'Active'
      }));

      // Department Channels
      const deptChannels = [
        { id: 'dept-arch', name: 'Architecture & Design Team', subtitle: 'Design Studio Channel', lastMessage: 'Blueprint revision discussion', time: 'Active' },
        { id: 'dept-eng', name: 'Structural & Site Engineering', subtitle: 'Engineers Channel', lastMessage: 'Foundation concrete testing notes', time: 'Active' },
        { id: 'dept-pmo', name: 'Project Management Office', subtitle: 'PMO Workspace', lastMessage: 'Milestone timeline reviews', time: 'Active' }
      ];

      const allTeamChannels = [...deptChannels, ...staffChannels, ...projChannels];

      setConversations(allTeamChannels);
      if (allTeamChannels.length > 0) setActiveId(allTeamChannels[0].id);
    } catch (e) {
      console.warn("Error loading dynamic internal team chat channels:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

  // 3. Load Chat History
  const fetchChatHistory = async () => {
    if (!activeId || !isValidObjectId(activeId)) {
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getInternalProjectChat(activeId);
      if (res && Array.isArray(res.messages)) {
        setMessages(res.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      if (err?.response?.status !== 404) {
        console.warn("Failed to load internal chat history:", err);
      }
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
    setReplyToMsg(null);
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send Internal Message
  const handleSendMessage = async ({ messageText, isInternal }) => {
    if (!messageText.trim() || !activeId) return;

    const payload = {
      messageText,
      isInternal: true,
      sender: currentUser.name || 'Team Member',
      senderId: currentUserId,
      replyToMessageId: replyToMsg?._id || replyToMsg?.id || null
    };

    try {
      const res = await sendInternalChatMessage(activeId, payload);
      const newMsg = res?.messageData || res?.messageObj || res?.data || {
        _id: 'msg-int-' + Date.now(),
        projectId: activeId,
        messageText,
        senderName: currentUser.name || 'Team Member',
        senderId: currentUserId,
        authorType: 'EMPLOYEE',
        isInternal: true,
        replyTo: replyToMsg ? { sender: replyToMsg.senderName || replyToMsg.sender, text: replyToMsg.messageText || replyToMsg.text } : null,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, newMsg]);
      setReplyToMsg(null);
    } catch (err) {
      alert("Failed to send internal chat message.");
    }
  };

  const activeConv = conversations.find(c => String(c.id) === String(activeId)) || conversations[0];

  return (
    <div className="flex h-[calc(100vh-130px)] border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-md font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* 1. LEFT SIDEBAR: INTERNAL TEAM CONVERSATIONS */}
      <ChatSidebar
        title="Team Chat"
        badge="INTERNAL TEAM"
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={(c) => setActiveId(c.id)}
        onRefresh={fetchChatHistory}
        loading={loading}
      />

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#efeae2]/30 bg-repeat relative">
        {activeConv ? (
          <>
            <ChatHeader
              title={activeConv.name}
              subtitle={activeConv.subtitle}
              contextBadge="INTERNAL TEAM"
              type="internal"
            />

            {/* Message Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
              {messages.map((m, idx) => {
                const msgSenderId = m.senderId || m.userId || m.authorId || m.createdBy;
                const isOwn = (msgSenderId && String(msgSenderId) === String(currentUserId)) || 
                              m.authorType === 'EMPLOYEE' || 
                              (m.senderName && currentUser.name && m.senderName === currentUser.name);

                return (
                  <MessageBubble
                    key={m._id || m.id || idx}
                    message={m}
                    isOwn={isOwn}
                    onReply={(msg) => setReplyToMsg(msg)}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer Input Bar */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              replyToMsg={replyToMsg}
              onClearReply={() => setReplyToMsg(null)}
              mentionUsers={employees}
              placeholder="Message internal team members..."
              isInternalToggleSupported={true}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select an internal conversation to start messaging.
          </div>
        )}
      </div>

    </div>
  );
}
