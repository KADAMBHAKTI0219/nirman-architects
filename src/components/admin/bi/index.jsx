import React from 'react';
import { 
  BrainCircuit, TrendingUp, AlertTriangle, Lightbulb, ShieldAlert, Cpu 
} from 'lucide-react';
import Card from '../../common/Card';

export default function BI() {
  
  // 1. Mock AI forecast timeline data
  const timelineForecastData = [
    { week: "Wk 1", Actual: 10, Predicted: 10 },
    { week: "Wk 2", Actual: 25, Predicted: 24 },
    { week: "Wk 3", Actual: 35, Predicted: 38 },
    { week: "Wk 4", Actual: null, Predicted: 52 },
    { week: "Wk 5", Actual: null, Predicted: 68 },
    { week: "Wk 6", Actual: null, Predicted: 85 }
  ];

  // 2. Department KPI Data
  const radarData = [
    { subject: 'Milestones', PM: '90%', Engineering: '80%' },
    { subject: 'Attendance', PM: '85%', Engineering: '95%' },
    { subject: 'Doc Sync', PM: '95%', Engineering: '70%' },
    { subject: 'CAD Reviews', PM: '70%', Engineering: '90%' },
    { subject: 'Client Approval', PM: '88%', Engineering: '75%' }
  ];

  // 3. AI recommendation warnings
  const aiAlerts = [
    { 
      id: 1, 
      title: "Material Shortage Delay Risk (Smart City Mall)", 
      text: "Concrete grade 43 shipments are delayed by 4 days in local region. Predicted delay impact: 1 week.", 
      probability: "85% confidence score" 
    },
    { 
      id: 2, 
      title: "Labor Allocation Opportunity", 
      text: "Metro Station Phase 3 has reached 92% completion. Suggesting re-assigning 10 steel technicians to Smart City Mall foundations.", 
      probability: "92% confidence score" 
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. BI KPIs - Light shades of blue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-blue-50/40 p-5 rounded-3xl border border-blue-100 shadow-2xs space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Project Delay Risk</span>
          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black text-[#2484C6] block">12.5%</strong>
            <span className="text-[10px] text-slate-400 font-bold">Low Risk</span>
          </div>
          <p className="text-[9px] text-slate-450 leading-normal">Derived from soil foundations compaction logs velocity</p>
        </div>

        <div className="bg-blue-50/40 p-5 rounded-3xl border border-blue-100 shadow-2xs space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Resource Overload alerts</span>
          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black text-amber-500 block">2 Team</strong>
            <span className="text-[10px] text-slate-400 font-bold">Warning</span>
          </div>
          <p className="text-[9px] text-slate-450 leading-normal">Assigned hours exceed weekly shift buffers</p>
        </div>

        <div className="bg-blue-50/40 p-5 rounded-3xl border border-blue-100 shadow-2xs space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Productivity Anomalies</span>
          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black text-emerald-600 block">0 Alerts</strong>
            <span className="text-[10px] text-slate-400 font-bold">Optimal</span>
          </div>
          <p className="text-[9px] text-slate-450 leading-normal">Task outputs matches shift attendance schedules</p>
        </div>

        <div className="bg-blue-50/40 p-5 rounded-3xl border border-blue-100 shadow-2xs space-y-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Completion Forecast</span>
          <div className="flex items-baseline gap-1.5">
            <strong className="text-2xl font-black text-indigo-505 block">94%</strong>
            <span className="text-[10px] text-slate-400 font-bold">On schedule</span>
          </div>
          <p className="text-[9px] text-slate-450 leading-normal">Predicted milestones match client deadlines</p>
        </div>
      </div>

      {/* 2. Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Summary Tables */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card title="Completion Timeline Forecast" subtitle="Actual progress vs AI projected week-wise milestones timeline">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="px-4 py-2">Week</th>
                    <th className="px-4 py-2">Actual Progress</th>
                    <th className="px-4 py-2">AI Projected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timelineForecastData.map((row) => (
                    <tr key={row.week} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-800">{row.week}</td>
                      <td className="px-4 py-2.5 text-blue-600 font-semibold">{row.Actual !== null ? `${row.Actual}%` : '—'}</td>
                      <td className="px-4 py-2.5 text-emerald-600 font-semibold">{row.Predicted}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Business Unit Key Performance Indicators" subtitle="Multi-dimensional performance mapping by departments">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-400 font-bold">
                  <tr>
                    <th className="px-4 py-2">KPI Metric</th>
                    <th className="px-4 py-2">PM Dept</th>
                    <th className="px-4 py-2">Engineering Dept</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {radarData.map((row) => (
                    <tr key={row.subject} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-800">{row.subject}</td>
                      <td className="px-4 py-2.5 font-semibold">{row.PM}</td>
                      <td className="px-4 py-2.5 font-semibold">{row.Engineering}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

        {/* Right Side: AI alerts & predictions highlights panel - Light shades */}
        <div className="space-y-6">
          
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-[#2484C6]" />
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">AI Predictions Feed</span>
                <span className="text-[8px] text-slate-450 block font-semibold mt-0.5">Automated recommendations and bottlenecks</span>
              </div>
            </div>

            <div className="space-y-4">
              {aiAlerts.map(alert => (
                <div key={alert.id} className="p-3.5 bg-blue-50/30 border border-blue-100/60 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[8px] text-[#2484C6] font-bold uppercase tracking-wider">
                    <span>Predictive Warning</span>
                    <span>{alert.probability}</span>
                  </div>
                  <strong className="text-slate-805 block font-bold leading-normal">{alert.title}</strong>
                  <p className="text-slate-500 leading-relaxed italic text-[11px] font-semibold">
                    "{alert.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
            <div className="border-b border-slate-50 pb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block font-bold">Optimization actions</span>
                <span className="text-[8px] text-slate-400 block font-semibold mt-0.5">Recommended tasks reallocation</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-1">
                <strong className="text-slate-805 block">Auto task scheduling suggestions</strong>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  Compaction reports matching foundation parameters are complete. Suggest unlocking column concrete tasks 2 days ahead of schedule.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
