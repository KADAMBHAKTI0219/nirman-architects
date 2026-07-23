import React, { useState } from 'react';
import { 
  CheckCircle, Clock, AlertTriangle, HelpCircle, 
  ChevronRight, ChevronDown, Calendar, FileText 
} from 'lucide-react';
import Card from '../../common/Card';

const TIMELINE_PHASES = [
  { id: 1, name: "Concept Phase", status: "Done", date: "2026-05-10", notes: "Lobby layouts design and schematic material palettes finalized.", files: ["Lobby_Material_V1.pdf", "Floor_Concept_Schema.dwg"] },
  { id: 2, name: "Planning & Permits", status: "Done", date: "2026-06-15", notes: "Noida municipal authority site layout plan approvals signed off.", files: ["Permit_Approval_Municipal.pdf"] },
  { id: 3, name: "Development & Casting", status: "In Progress", date: "2026-07-20", notes: "Excavation completed. Basement columns rebar reinforcement casting active.", files: ["Concrete_Cylinder_Test_Report.xlsx"] },
  { id: 4, name: "GFC Drawings Review", status: "Pending", date: "Est: 2026-08-10", notes: "Mechanical duct routing designs GFC locks scheduled for client signoff.", files: [] },
  { id: 5, name: "Approval & Sign-offs", status: "Pending", date: "Est: 2026-08-30", notes: "Client final verification step.", files: [] },
  { id: 6, name: "Completion & Handover", status: "Pending", date: "Est: 2026-09-15", notes: "Site cleaning and lock installation handover.", files: [] }
];

export default function Timeline() {
  const [phases, setPhases] = useState(TIMELINE_PHASES);
  const [expandedPhaseId, setExpandedPhaseId] = useState(3);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-[#2484C6] animate-spin-slow" />;
      case 'Delayed':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'In Progress':
        return 'bg-blue-50 text-[#2484C6] border-blue-100';
      case 'Delayed':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. GREETING HEADER */}
      <div>
        <h2 className="text-xl font-black text-slate-905 tracking-tight">Interactive Project Timeline</h2>
        <p className="text-xs text-slate-400">Click any construction phase to expand target files and milestones status details</p>
      </div>

      {/* 2. TIMELINE CHART */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Vertical Timeline Card (2/3 width) */}
        <Card title="Construction Roadmap" subtitle="Chronological milestones tracking" className="xl:col-span-2">
          
          <div className="space-y-6 pt-3 relative before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-105">
            {phases.map(phase => {
              const isExpanded = expandedPhaseId === phase.id;
              return (
                <div key={phase.id} className="relative pl-8">
                  
                  {/* Timeline icon node */}
                  <div className="absolute left-[7px] top-1 bg-white rounded-full -translate-x-1/2 p-0.5 z-10">
                    {getStatusIcon(phase.status)}
                  </div>

                  <div 
                    onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
                    className="p-4 bg-white border border-slate-150 rounded-2xl cursor-pointer hover:border-[#2484C6]/40 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold block">{phase.date}</span>
                        <strong className="text-slate-805 block text-xs mt-0.5">{phase.name}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusColor(phase.status)}`}>
                          {phase.status}
                        </span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-100/50 space-y-3 text-xs font-semibold text-slate-550 animate-in slide-in-from-top duration-150">
                        <p className="leading-relaxed text-slate-700 italic">"{phase.notes}"</p>
                        
                        {phase.files.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[8px] text-slate-400 block uppercase font-black">Shared deliverables</span>
                            <div className="flex gap-2 flex-wrap">
                              {phase.files.map(f => (
                                <div 
                                  key={f} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Downloading file: ${f}`);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-205 rounded-xl hover:bg-slate-100 text-[10px] text-slate-700 font-bold"
                                >
                                  <FileText className="w-3.5 h-3.5 text-[#2484C6]" />
                                  <span>{f}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </Card>

        {/* Info panel (1/3 width) */}
        <div className="xl:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4 text-xs font-bold text-slate-655">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Project Health</span>
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
            <div>
              <strong className="text-emerald-700 block text-xs">On Schedule</strong>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Physical progress has met target metrics</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
