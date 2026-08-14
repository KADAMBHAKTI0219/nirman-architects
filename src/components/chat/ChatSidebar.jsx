import React, { useState } from 'react';
import { Search, RefreshCw, MessageSquare } from 'lucide-react';

/**
 * Reusable WhatsApp-style ChatSidebar Component
 */
export default function ChatSidebar({
  title = "Conversations",
  badge = "ACTIVE",
  conversations = [],
  activeId = null,
  onSelectConversation = null,
  onRefresh = null,
  loading = false
}) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    const name = c.name || c.projectName || c.title || '';
    const subtitle = c.subtitle || c.clientName || c.code || '';
    return name.toLowerCase().includes(search.toLowerCase()) || subtitle.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-80 border-r border-[#e9edef] flex flex-col shrink-0 bg-white h-full font-sans">
      {/* Sidebar Header */}
      <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-brand-primary text-slate-900 flex items-center justify-center font-bold text-xs shadow-2xs">
            <MessageSquare className="w-4 h-4 text-slate-900" />
          </div>
          <div>
            <strong className="text-slate-900 font-bold text-xs block leading-tight">{title}</strong>
            <span className="text-[9px] text-brand-dark font-black uppercase tracking-wider">{badge}</span>
          </div>
        </div>

        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh Conversations"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100 bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary text-slate-800"
          />
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-thin">
        {filtered.map(item => {
          const itemId = item._id || item.id;
          const isActive = String(itemId) === String(activeId);
          const name = item.name || item.projectName || 'Conversation';
          const subtitle = item.subtitle || item.clientName || item.code || '';
          const lastMsg = item.lastMessage || 'No messages yet';
          const time = item.time || '';
          const unread = item.unread || 0;

          return (
            <div
              key={itemId}
              onClick={() => onSelectConversation && onSelectConversation(item)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                isActive ? 'bg-[#E5F0FA] border-l-4 border-brand-dark' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand-secondary/40 text-slate-900 font-bold text-xs flex items-center justify-center shrink-0">
                {name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">{name}</h4>
                  {time && <span className="text-[9px] text-slate-400 shrink-0 ml-2">{time}</span>}
                </div>
                
                {subtitle && <p className="text-[10px] text-slate-500 font-medium truncate mb-0.5">{subtitle}</p>}
                
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span className="truncate italic font-normal">{lastMsg}</span>
                  {unread > 0 && (
                    <span className="ml-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold text-[9px] shrink-0">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No conversations found.
          </div>
        )}
      </div>
    </div>
  );
}
