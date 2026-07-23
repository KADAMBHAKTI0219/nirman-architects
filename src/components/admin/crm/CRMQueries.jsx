import React, { useState } from 'react';
import { Search, Eye, AlertCircle, Check, Send, User } from 'lucide-react';
import Card from '../../common/Card';

export default function CRMQueries({
  queriesList,
  onResolveQuery,
  onReplyQuery
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [selectedQuery, setSelectedQuery] = useState(null);

  const filteredQueries = queriesList.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyInput.trim() || !selectedQuery) return;
    onReplyQuery(selectedQuery.id, replyInput);
    setReplyInput('');
    alert("Reply dispatched successfully to client portal!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Upper split: Queries table (2/3) + Reply card (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Queries Table */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search support queries..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white"
            />
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Query details</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Project link</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredQueries.map(q => (
                    <tr 
                      key={q.id} 
                      className={`hover:bg-slate-50/40 cursor-pointer ${selectedQuery?.id === q.id ? 'bg-slate-50' : ''}`}
                      onClick={() => setSelectedQuery(q)}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <strong className="text-slate-850 block">{q.title}</strong>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-bold line-clamp-1">{q.description}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-bold align-middle">{q.clientName}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{q.projectName}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          q.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
                        }`}>{q.priority}</span>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          q.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>{q.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right align-middle">
                        <div className="flex justify-end gap-1.5" onClick={(e)=>e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedQuery(q)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs"
                            title="Inspect Conversation"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-655" />
                          </button>
                          {q.status === 'Open' && (
                            <button
                              onClick={() => onResolveQuery(q.id)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-150 rounded-xl transition-all shadow-3xs"
                              title="Mark Resolved"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Selected Query details & Reply log */}
        <div className="space-y-4">
          
          {selectedQuery ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5">
              
              <div className="border-b border-slate-50 pb-2 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{selectedQuery.projectName}</span>
                  <h4 className="font-black text-slate-905">{selectedQuery.title}</h4>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Client Inquiry Description</span>
                <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed text-slate-700 font-semibold italic">
                  "{selectedQuery.description}"
                </p>
              </div>

              {/* Chat Thread reply log */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Dispatched Replies</span>
                {selectedQuery.replies.map((rep, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-55/50 border border-slate-100 rounded-xl text-xs space-y-0.5">
                    <div className="flex justify-between text-[8px] text-[#2484C6] font-bold uppercase">
                      <span>{rep.author}</span>
                      <span>{rep.date}</span>
                    </div>
                    <p className="font-semibold text-slate-750 leading-normal">{rep.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply form */}
              {selectedQuery.status === 'Open' ? (
                <form onSubmit={handleReplySubmit} className="pt-3 border-t border-slate-100 space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Post Reply</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required 
                      placeholder="Type response to client..." 
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
                    />
                    <button 
                      type="submit" 
                      className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs shrink-0 flex items-center gap-0.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-[10px] text-emerald-705 font-bold uppercase tracking-wider">
                  Query resolved and closed
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-center text-slate-400 h-64 flex items-center justify-center">
              Select a customer query record to view details or dispatch answers.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
