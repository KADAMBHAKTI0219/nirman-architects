import React from 'react';
import Card from '../../common/Card';
import { Check } from 'lucide-react';

export default function SiteCrewAttendance({ crew, onToggleAttendance }) {
  return (
    <Card title="Today's Crew Attendance" subtitle="Daily biometric gate checklist (simulation)">
      <div className="space-y-3">
        {crew.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl">
            <div className="text-xs">
              <strong className="text-slate-805 block">{member.name}</strong>
              <span className="text-[10px] text-slate-400 font-semibold">{member.trade}</span>
            </div>
            <button
              onClick={() => onToggleAttendance(member.id)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all ${
                member.present 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                  : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {member.present && <Check className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
