import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Clock, Trash2, User } from 'lucide-react';

export default function AnnotationPinModal({
  pin,
  onClose,
  onSaveReply,
  onUpdateStatus,
  onDeletePin
}) {
  const [replyText, setReplyText] = useState('');

  if (!pin) return null;

  const handleAddReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSaveReply(pin.id, replyText.trim());
    setReplyText('');
  };

  return (
    <div className="fixed top-20 right-5 sm:right-24 z-50 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl shadow-2xl p-4 w-[320px] sm:w-[360px] text-xs space-y-3 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-extrabold text-[11px] flex items-center justify-center shadow-3xs">
            #{pin.number || pin.id}
          </div>
          <span className="font-extrabold text-slate-900 text-xs">Annotation Comment</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDeletePin(pin.id)}
            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
            title="Delete Pin"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Pin Comment */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-extrabold text-slate-900 flex items-center gap-1">
            <User className="w-3 h-3 text-sky-600" />
            {pin.author || 'Super Admin'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{pin.date || 'Just now'}</span>
        </div>
        <p className="text-slate-700 font-medium text-xs leading-relaxed">
          {pin.message}
        </p>

        {/* Status Badge Toggle */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
          <select
            value={pin.status || 'Open'}
            onChange={(e) => onUpdateStatus(pin.id, e.target.value)}
            className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-white border border-slate-200 text-slate-800 cursor-pointer"
          >
            <option value="Open">🟢 Open</option>
            <option value="In Review">🟡 In Review</option>
            <option value="Resolved">🔵 Resolved</option>
          </select>
        </div>
      </div>

      {/* Thread Replies List */}
      {pin.replies && pin.replies.length > 0 && (
        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
          {pin.replies.map((reply, idx) => (
            <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                <span>{reply.author}</span>
                <span>{reply.date}</span>
              </div>
              <p className="text-slate-700 text-[11px]">{reply.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input Form */}
      <form onSubmit={handleAddReply} className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
        <input
          type="text"
          placeholder="Reply to thread or mention @user..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-medium"
        />
        <button
          type="submit"
          disabled={!replyText.trim()}
          className="p-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer shadow-3xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
