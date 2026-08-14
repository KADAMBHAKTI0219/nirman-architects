import React, { useState } from 'react';
import { Send, Paperclip, Smile, X, AtSign } from 'lucide-react';
import MentionPicker from './MentionPicker';

/**
 * Reusable MessageComposer Component
 */
export default function MessageComposer({
  onSendMessage,
  replyToMsg = null,
  onClearReply = null,
  mentionUsers = [],
  placeholder = "Type a message...",
  disabled = false,
  isInternalToggleSupported = true
}) {
  const [text, setText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    const lastChar = val.slice(-1);
    const lastWord = val.split(/\s+/).pop() || '';

    if (lastWord.startsWith('@')) {
      setShowMentions(true);
      setMentionFilter(lastWord.slice(1));
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectUser = (user) => {
    const name = user.name || user.employeeName || 'User';
    const words = text.split(/\s+/);
    words.pop();
    const updated = [...words, `@${name} `].join(' ');
    setText(updated);
    setShowMentions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage({
      messageText: text,
      isInternal: isInternalNote
    });
    setText('');
    setShowMentions(false);
  };

  return (
    <div className="relative bg-[#f0f2f5] px-4 py-2.5 border-t border-[#e9edef] shrink-0 z-10 space-y-2">
      
      {/* Mention Dropdown */}
      {showMentions && (
        <MentionPicker
          users={mentionUsers}
          filterText={mentionFilter}
          onSelectUser={handleSelectUser}
          onClose={() => setShowMentions(false)}
        />
      )}

      {/* Quoted Reply Preview Banner */}
      {replyToMsg && (
        <div className="bg-white p-2 rounded-xl border-l-4 border-brand-dark shadow-3xs flex items-center justify-between text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-brand-dark block">
              Replying to {replyToMsg.senderName || replyToMsg.sender || 'Participant'}
            </span>
            <p className="text-slate-600 truncate italic">"{replyToMsg.messageText || replyToMsg.text}"</p>
          </div>
          {onClearReply && (
            <button 
              type="button" 
              onClick={onClearReply}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Helper Bar (@ Mention Trigger) */}
      <div className="flex items-center justify-end gap-2 text-[11px]">
        <button
          type="button"
          onClick={() => {
            setText(prev => prev + '@');
            setShowMentions(true);
            setMentionFilter('');
          }}
          className="text-slate-500 hover:text-brand-dark flex items-center gap-1 text-[10px] font-semibold cursor-pointer bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-3xs"
        >
          <AtSign className="w-3 h-3 text-brand-dark" /> Mention Teammate
        </button>
      </div>

      {/* Main Composer Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => alert("Attachment upload dialog")}
          className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
          title="Attach File"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={text}
          disabled={disabled}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="flex-1 text-xs border border-white rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 text-slate-800 font-medium shadow-3xs"
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="p-2.5 bg-brand-secondary hover:bg-brand-primary text-slate-900 font-bold rounded-full shadow-md disabled:opacity-50 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
