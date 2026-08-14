import React, { useState, useRef } from 'react';
import { CornerUpLeft, FileText, CheckCheck } from 'lucide-react';

/**
 * Reusable MessageBubble Component
 * Features:
 * - Brand color palette (#BDE0FE / #8FC9FF / #E5F0FA / #1E293B)
 * - Right (isOwn) vs Left message alignment
 * - Swipe-to-Reply gesture support (Touch & Mouse Drag)
 */
export default function MessageBubble({
  message,
  isOwn = false,
  onReply = null,
  onImageClick = null
}) {
  const [dragX, setDragX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);

  if (!message) return null;

  const senderName = message.senderName || message.formattedAuthorName || message.sender || 'Unknown';
  const senderRole = message.senderRole || message.role || (message.authorType === 'CLIENT_CONTACT' ? 'Client' : 'Team Member');
  const messageText = message.messageText || message.text || '';
  const time = message.time || (message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now');
  const replyTo = message.replyTo || null;
  const attachments = message.attachments || message.files || [];

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - startXRef.current;
    if (diff > 0 && diff < 120) {
      setDragX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragX > 45 && onReply) {
      onReply(message);
    }
    setDragX(0);
    setIsSwiping(false);
  };

  // Mouse Drag Handlers for Desktop Swipe
  const handleMouseDown = (e) => {
    startXRef.current = e.clientX;
    setIsSwiping(true);
  };

  const handleMouseMove = (e) => {
    if (!isSwiping) return;
    const diff = e.clientX - startXRef.current;
    if (diff > 0 && diff < 120) {
      setDragX(diff);
    }
  };

  const handleMouseUp = () => {
    if (dragX > 45 && onReply) {
      onReply(message);
    }
    setDragX(0);
    setIsSwiping(false);
  };

  // Highlight @Mentions in text
  const renderMessageContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(@[A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="bg-brand-primary text-slate-900 font-bold px-1.5 py-0.5 rounded text-[11px] inline-block my-0.5 shadow-3xs">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex flex-col my-1.5 group select-none relative ${isOwn ? 'items-end' : 'items-start'}`}>
      
      {/* Swipe Reply Icon Indicator */}
      {dragX > 15 && (
        <div 
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-primary text-slate-900 flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-100 z-10"
          style={{ opacity: Math.min(dragX / 45, 1) }}
        >
          <CornerUpLeft className="w-4 h-4" />
        </div>
      )}

      {/* Sender Name & Role Label (For Left-aligned messages) */}
      {!isOwn && (
        <div className="flex items-center gap-1.5 mb-1 px-1">
          <span className="text-[11px] font-bold text-slate-800">{senderName}</span>
          <span className="text-[9px] font-bold bg-brand-soft text-slate-700 border border-brand-secondary/40 px-1.5 py-0.2 rounded-md">
            {senderRole}
          </span>
        </div>
      )}

      {/* Message Card Container with Swipe Translation */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ transform: `translateX(${dragX}px)`, transition: isSwiping ? 'none' : 'transform 0.2s ease-out' }}
        className={`relative max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs font-normal leading-relaxed cursor-grab active:cursor-grabbing ${
          isOwn
            ? 'bg-[#E5F0FA] text-slate-900 border border-[#8FC9FF]/60 rounded-tr-none'
            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
        }`}
      >
        
        {/* Hover Reply Action Button */}
        {onReply && (
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onReply(message); }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded-md text-slate-400 hover:text-slate-800 transition-opacity cursor-pointer"
            title="Swipe right or click to reply"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Quoted Parent Reply Box */}
        {replyTo && (
          <div className="mb-2 p-2 rounded-xl bg-brand-soft/70 border-l-4 border-brand-secondary text-[11px] space-y-0.5">
            <span className="font-bold text-brand-dark block">{replyTo.sender || 'Quoted Message'}</span>
            <p className="italic text-slate-600 truncate">{replyTo.text}</p>
          </div>
        )}

        {/* Message Main Text */}
        <p className="whitespace-pre-wrap break-words">{renderMessageContent(messageText)}</p>

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mt-2 space-y-1 pt-1.5 border-t border-slate-200/60">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 p-1.5 bg-brand-soft/50 rounded-xl text-[11px]">
                <FileText className="w-4 h-4 text-brand-dark" />
                <span className="truncate flex-1 font-semibold">{file.name || `Attachment-${idx+1}`}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer: Time & Read Receipts */}
        <div className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${isOwn ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>{time}</span>
          {isOwn && <CheckCheck className="w-3 h-3 text-brand-dark" />}
        </div>
      </div>
    </div>
  );
}
