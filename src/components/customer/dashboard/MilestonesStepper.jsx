import React from 'react';
import Card from '../../common/Card';
import { CheckCircle2 } from 'lucide-react';

const milestones = [
  { id: 1, name: "Site Excavation & Surveying", date: "May 10, 2026", status: "Completed" },
  { id: 2, name: "Foundation Bi-axial Concreting", date: "June 02, 2026", status: "Completed" },
  { id: 3, name: "Super-Structure Pillars Cast", date: "July 12, 2026", status: "Completed" },
  { id: 4, name: "Glass Facade Cladding Panel Installation", date: "August 20, 2026", status: "In Progress" },
  { id: 5, name: "Interior HVAC & Lighting Fit-outs", date: "September 30, 2026", status: "Upcoming" }
];

export default function MilestonesStepper() {
  return (
    <Card title="Project Milestones Tracker" subtitle="Interactive stages of building completion">
      <div className="space-y-6 relative pl-6 border-l-2 border-slate-100">
        {milestones.map((step) => (
          <div key={step.id} className="relative">
            <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-white ${
              step.status === 'Completed' ? 'border-emerald-500' :
              step.status === 'In Progress' ? 'border-brand-primary' : 'border-slate-200'
            }`}>
              {step.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-white" />}
            </span>
            
            <div className="text-xs">
              <div className="flex justify-between items-center">
                <strong className="text-slate-800 text-sm">{step.name}</strong>
                <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  step.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                  step.status === 'In Progress' ? 'bg-brand-tint text-brand-dark' : 'bg-slate-50 text-slate-400'
                }`}>
                  {step.status}
                </span>
              </div>
              <span className="text-[10px] text-slate-450 block mt-1">Completion target: {step.date}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
