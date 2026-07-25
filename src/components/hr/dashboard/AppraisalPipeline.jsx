import React from 'react';
import Card from '../../common/Card';
import { Sparkles, Check } from 'lucide-react';

const payrollReadyStatus = [
  { department: "Architecture", processed: 20, total: 20, status: "Ready", progress: 100 },
  { department: "Engineering", processed: 28, total: 31, status: "Updating Attendance Logs", progress: 85 },
  { department: "Project Management", processed: 16, total: 16, status: "Ready", progress: 100 },
  { department: "Admin & Operations", processed: 7, total: 7, status: "Ready", progress: 100 },
];

export default function AppraisalPipeline() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Payroll Data Readiness" subtitle="Track progress of payroll reports for the current cycle">
        <div className="space-y-4">
          {payrollReadyStatus.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{item.department}</span>
                <span className={`font-semibold ${item.status === 'Ready' ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {item.status} ({item.processed}/{item.total})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.progress === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Performance Review Pipeline" subtitle="Overview of upcoming review audits">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg font-bold"><Sparkles className="w-4 h-4" /></span>
            <div className="flex-1">
              <strong className="text-slate-855 block">Upcoming Reviews (14 Staff)</strong>
              <span className="text-[10px] text-slate-500">Designers & Site Engineers evaluations scheduled for next week.</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg font-bold"><Check className="w-4 h-4" /></span>
            <div className="flex-1">
              <strong className="text-slate-855 block">Completed Reviews (24 Staff)</strong>
              <span className="text-[10px] text-slate-500">Architecture managers reviews completed. Ready for salary increment adjustments.</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
