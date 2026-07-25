import React, { useState } from 'react';
import { 
  Building, Smartphone, Mail, MapPin, Layers, FileText, CheckCircle2, 
  AlertCircle, MessageSquare, Send, Award, Download, Clock
} from 'lucide-react';
import Card from '../../common/Card';

export default function CRMClientProfile({
  client,
  onUpdateClientNotes
}) {
  const [activeSubTab, setActiveSubTab] = useState('projects'); // projects, drawings, queries, chat
  const [internalNote, setInternalNote] = useState('');

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    onUpdateClientNotes(client.id, internalNote);
    setInternalNote('');
    alert("Internal CRM communication notes saved!");
  };

  const subTabs = [
    { id: 'projects', label: 'Linked Projects' },
    { id: 'drawings', label: 'Shared Files' },
    { id: 'queries', label: 'Query Logs' },
    { id: 'chat', label: 'Client Chat' }
  ];

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Profile Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-12 h-12 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center font-black text-slate-805">
          {client.name.split(' ').map(n=>n[0]).join('')}
        </div>
        <div>
          <h4 className="font-black text-slate-905 text-sm leading-none">{client.name}</h4>
          <span className="text-[10px] text-slate-450 font-bold block mt-1 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" /> {client.company}
          </span>
        </div>
      </div>

      {/* 2. Contact details */}
      <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-550 border-b border-slate-50 pb-3">
        <div>
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Phone Contact</span>
          <span className="font-bold text-slate-700">{client.phone}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Email Address</span>
          <span className="font-bold text-slate-700">{client.email}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Registered Address</span>
          <span className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {client.address}
          </span>
        </div>
      </div>

      {/* 3. Sub-tabs Selector */}
      <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none gap-2 pb-1.5">
        {subTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSubTab(t.id)}
            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-shrink-0 border ${
              activeSubTab === t.id
                ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 4. Sub-tab Content panels */}
      <div className="min-h-[220px] max-h-[300px] overflow-y-auto pr-1 space-y-4">
        
        {/* Linked Projects */}
        {activeSubTab === 'projects' && (
          <div className="space-y-4">
            {client.projects.map((proj, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <strong className="text-slate-805">{proj.projectName}</strong>
                  <span className="text-[9px] text-[#2484C6] bg-[#E5F0FA] px-1.5 py-0.5 rounded font-black uppercase">
                    {proj.progress}% Done
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-brand-primary h-full rounded-full" style={{ width: `${proj.progress}%` }}></div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase pt-0.5">
                  <span>Start: {proj.startDate}</span>
                  <span>Timeline: {proj.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared Files (drawings/docs) */}
        {activeSubTab === 'drawings' && (
          <div className="space-y-2.5">
            {client.sharedFiles.map((file, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <span className="font-bold text-slate-700 block truncate" title={file.name}>{file.name}</span>
                    <span className="text-[9px] text-slate-450 block font-semibold uppercase">{file.type} &bull; Shared {file.date}</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Downloading shared file: ${file.name}`)}
                  className="p-1.5 bg-white border border-slate-205 hover:bg-slate-55 rounded-xl shadow-3xs text-slate-500 transition-all flex-shrink-0"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Support Queries */}
        {activeSubTab === 'queries' && (
          <div className="space-y-3">
            {client.queries.map((q, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-black uppercase">
                  <span className="text-slate-400">Query Log</span>
                  <span className={`px-1.5 py-0.5 rounded border ${
                    q.status === 'Open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>{q.status}</span>
                </div>
                <strong className="text-slate-805 block">{q.title}</strong>
                <p className="text-slate-500 leading-normal font-semibold">"{q.description}"</p>
                <span className="text-[8px] text-slate-400 block font-bold">Assigned Staff: {q.assignedStaff}</span>
              </div>
            ))}
          </div>
        )}

        {/* Client Chat thread */}
        {activeSubTab === 'chat' && (
          <div className="space-y-3">
            {client.chats.map((c, idx) => (
              <div key={idx} className="p-2.5 bg-slate-55/40 border border-slate-100 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase">
                  <span>{c.sender}</span>
                  <span>{c.time}</span>
                </div>
                <p className="font-semibold text-slate-700 leading-normal">{c.message}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 5. Internal HR/CRM notes update */}
      <form onSubmit={handleNoteSubmit} className="pt-4 border-t border-slate-100 space-y-3">
        <span className="text-[9px] font-bold text-slate-400 uppercase block">Internal CRM Notes</span>
        {client.internalNotes && (
          <p className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-xl italic leading-relaxed">
            "{client.internalNotes}"
          </p>
        )}
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Add internal CRM comment..." 
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
          />
          <button 
            type="submit"
            className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black shadow-3xs"
          >
            Post
          </button>
        </div>
      </form>

    </div>
  );
}
