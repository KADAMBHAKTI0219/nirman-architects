import React, { useState, useEffect, useRef } from 'react';
import ChatSidebar from '../../../components/chat/ChatSidebar';
import ChatHeader from '../../../components/chat/ChatHeader';
import MessageBubble from '../../../components/chat/MessageBubble';
import MessageComposer from '../../../components/chat/MessageComposer';
import { getClientProjectChat, sendClientChatMessage } from '../../../service/chat';
import { getProjects } from '../../../service/project';
import { getClients } from '../../../service/crm/client';
import { isMockSession } from '../../../service/auth';

/**
 * 2. CLIENT CHAT MODULE
 * Communication STRICTLY for Employees <-> Authorized Client Contacts.
 * Associated with specific project scopes (projectId).
 */
export default function ClientChat() {
  const [conversations, setConversations] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [messages, setMessages] = useState([]);
  const [clientParticipants, setClientParticipants] = useState([]);
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
  const isClientUser = currentUser.role === 'Customer' || !!localStorage.getItem('clientToken');

  // 2. Load Project Client Conversations dynamically from backend
  const loadData = async () => {
    try {
      setLoading(true);
      const projRes = await getProjects().catch(() => null);
      const projList = projRes?.projects || (Array.isArray(projRes) ? projRes : []);

      const clientChannels = projList.map((p, idx) => ({
        id: p._id || p.id || `proj-client-${idx + 1}`,
        name: p.projectName || p.name || `Client Project #${idx + 1}`,
        clientName: p.client || p.clientName || 'Client Representative',
        subtitle: `Client Scope: ${p.client || p.clientName || 'Authorized Account'}`,
        lastMessage: p.status ? `Project Status: ${p.status}` : 'Client communication workspace',
        time: 'Active'
      }));

      if (clientChannels.length === 0) {
        clientChannels.push({
          id: 'client-general',
          name: 'Nirman Client Portal Workspace',
          clientName: 'Authorized Client Contacts',
          subtitle: 'General Client Channel',
          lastMessage: 'Client workspace channel',
          time: 'Active'
        });
      }

      setConversations(clientChannels);
      if (clientChannels.length > 0) setActiveProjectId(clientChannels[0].id);

      // Dynamic Client Participants list from CRM API
      const clientRes = await getClients().catch(() => null);
      if (clientRes && (clientRes.clients || Array.isArray(clientRes.data) || Array.isArray(clientRes))) {
        const cList = clientRes.clients || clientRes.data || (Array.isArray(clientRes) ? clientRes : []);
        const pList = cList.map(c => ({
          id: c._id || c.id,
          name: c.name || c.contactPerson || c.clientName || c.email,
          role: c.companyName || 'Client Representative',
          email: c.email
        }));
        setClientParticipants(pList);
      }
    } catch (e) {
      console.warn("Error loading dynamic client chat channels:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

  // 3. Load Project Client Chat History
  const fetchChatHistory = async () => {
    if (!activeProjectId) {
      setMessages([]);
      return;
    }
    setLoading(true);

    if (isValidObjectId(activeProjectId)) {
      try {
        const res = await getClientProjectChat(activeProjectId);
        if (res && Array.isArray(res.messages)) {
          setMessages(res.messages);
          setLoading(false);
          return;
        }
      } catch (err) {}
    }

    try {
      const saved = localStorage.getItem(`nirman_client_chat_${activeProjectId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    setMessages([]);
    setLoading(false);
  };

  useEffect(() => {
    fetchChatHistory();
    setReplyToMsg(null);
  }, [activeProjectId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Send Client Chat Message
  const handleSendMessage = async ({ messageText }) => {
    if (!messageText.trim() || !activeProjectId) return;

    const senderName = currentUser.name || (isClientUser ? 'Client Representative' : (currentUser.role || 'Project Lead'));

    const newMsg = {
      _id: 'msg-cli-' + Date.now(),
      projectId: activeProjectId,
      messageText: messageText.trim(),
      senderName,
      senderId: currentUserId,
      authorType: isClientUser ? 'CLIENT_CONTACT' : 'EMPLOYEE',
      replyTo: replyToMsg ? { sender: replyToMsg.senderName || replyToMsg.sender, text: replyToMsg.messageText || replyToMsg.text } : null,
      createdAt: new Date().toISOString()
    };

    if (isValidObjectId(activeProjectId)) {
      try {
        await sendClientChatMessage(activeProjectId, {
          messageText: messageText.trim(),
          sender: senderName,
          senderId: currentUserId,
          authorType: newMsg.authorType
        });
      } catch (err) {}
    }

    setMessages(prev => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem(`nirman_client_chat_${activeProjectId}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setReplyToMsg(null);
  };

  const activeConv = conversations.find(c => String(c.id) === String(activeProjectId)) || conversations[0];

  return (
    <div className="flex h-[calc(100vh-130px)] border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-md font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* 1. LEFT SIDEBAR: CLIENT PROJECT CONVERSATIONS */}
      <ChatSidebar
        title="Client Chat"
        badge="PROJECT SCOPED"
        conversations={conversations}
        activeId={activeProjectId}
        onSelectConversation={(c) => setActiveProjectId(c.id)}
        onRefresh={fetchChatHistory}
        loading={loading}
      />

      {/* 2. MAIN CLIENT CHAT AREA */}
      <div className="flex-1 flex flex-col bg-[#efeae2]/30 bg-repeat relative">
        {activeConv ? (
          <>
            <ChatHeader
              title={activeConv.name}
              subtitle={activeConv.clientName}
              contextBadge="CLIENT WORKSPACE"
              type="client"
            />

            {/* Message Feed Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
              {messages.map((m, idx) => {
                const msgSenderId = m.senderId || m.userId || m.authorId || m.createdBy;
                const isOwn = (msgSenderId && String(msgSenderId) === String(currentUserId)) ||
                              (isClientUser ? m.authorType === 'CLIENT_CONTACT' : m.authorType === 'EMPLOYEE');

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
              mentionUsers={clientParticipants}
              placeholder="Message client workspace..."
              isInternalToggleSupported={false}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a client project workspace to view messages.
          </div>
        )}
      </div>

    </div>
  );
}
