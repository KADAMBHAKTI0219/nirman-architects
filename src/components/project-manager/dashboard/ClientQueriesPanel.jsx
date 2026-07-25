import React, { useState } from 'react';
import Card from '../../common/Card';
import { Send } from 'lucide-react';

export default function ClientQueriesPanel() {
  const [clientQueries, setClientQueries] = useState([
    { id: 1, client: "Mr. Bruce Wayne", project: "Oceanic Luxury Villas", query: "Can we review the layout of the underground parking? Send 3D render ASAP.", time: "10 mins ago" },
    { id: 2, client: "Lex Luthor (Metropolis Corp)", project: "Central Office Tower", query: "Are the GFC electrical schematics ready? Need them for site inspectors.", time: "2 hours ago" },
  ]);

  const handleSendReply = (clientName) => {
    alert(`Reply sent to ${clientName}`);
  };

  return (
    <Card title="Client Queries & Communications" subtitle="Direct chats from customer dashboards">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clientQueries.map((q, idx) => (
          <div key={idx} className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl flex flex-col justify-between h-40">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <strong className="text-slate-800">{q.client}</strong>
                <span className="text-[10px] text-slate-400 font-semibold">{q.time}</span>
              </div>
              <span className="text-[9px] uppercase font-bold text-brand-dark bg-brand-tint px-2 py-0.5 rounded-full inline-block">
                {q.project}
              </span>
              <p className="text-xs text-slate-600 line-clamp-2 italic">"{q.query}"</p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50 mt-2">
              <input 
                type="text" 
                placeholder="Type reply to client..." 
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
              <button 
                onClick={() => handleSendReply(q.client)}
                className="p-1.5 bg-brand-dark hover:bg-slate-805 text-white rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
