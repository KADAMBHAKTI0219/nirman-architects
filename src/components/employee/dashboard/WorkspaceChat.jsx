import React, { useState } from 'react';
import Card from '../../common/Card';
import { Send } from 'lucide-react';

export default function WorkspaceChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "Sarah Connor (PM)", text: "Team, please verify the wall thickness revisions in the blueprints before submitting to client review.", time: "10:30 AM" },
    { id: 2, sender: "Biometric Portal", text: "Appraisal records readiness is currently open. Submit self-reviews today.", time: "09:00 AM" }
  ]);
  const [newMsg, setNewMsg] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      sender: "Me (Employee)",
      text: newMsg,
      time: "Just now"
    }]);
    setNewMsg('');
  };

  return (
    <Card title="Project Chat Rooms" subtitle="Discuss design parameters with PMs & teammates">
      <div className="flex flex-col h-60 justify-between">
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

        <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-105 flex items-center gap-2">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Message active chatroom..."
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
