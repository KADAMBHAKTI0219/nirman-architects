import React, { useState } from 'react';
import Card from '../../common/Card';
import { Send } from 'lucide-react';

export default function ClientChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "Sarah Connor (Lead PM)", text: "Hello Bruce, we uploaded the central lobby 3D renders. Let us know if the marble tiling materials fit your expectations.", time: "2 hours ago" },
    { id: 2, sender: "Me (Bruce)", text: "Checking them now. Facade work seems to be progressing on schedule.", time: "1 hour ago" }
  ]);
  const [newMsg, setNewMsg] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: "Me (Bruce)",
      text: newMsg,
      time: "Just now"
    }]);
    setNewMsg('');
  };

  return (
    <Card title="Direct Support & Queries" subtitle="Instant messaging with Lead Architect & PMs">
      <div className="flex flex-col h-64 justify-between">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-3">
          {messages.map((m) => (
            <div key={m.id} className={`p-3 rounded-2xl max-w-lg border ${
              m.sender.includes('Me') 
                ? 'bg-brand-tint border-brand-secondary/35 ml-auto text-right' 
                : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center justify-between gap-4 mb-0.5 text-[10px]">
                <span className="font-bold text-slate-700">{m.sender}</span>
                <span className="text-slate-400">{m.time}</span>
              </div>
              <p className="text-xs text-slate-650 leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type query to manager..."
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
          <button 
            type="submit"
            className="p-2 bg-brand-dark hover:bg-slate-805 text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </Card>
  );
}
