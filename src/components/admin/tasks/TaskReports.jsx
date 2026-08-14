import React from 'react';
import { ArrowLeft, Clock, AlertTriangle, CheckSquare, Settings, Activity, Sparkles } from 'lucide-react';

export default function TaskReports({ tasks = [], onBack }) {
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const delayed = tasks.filter(t => t.delayFlag || t.isDelayed).length;

  const totalWorkingMinutes = tasks.reduce((sum, t) => sum + (t.totalWorkingTimeMinutes || 0), 0);
  const totalIdleMinutes = tasks.reduce((sum, t) => sum + (t.idleTimeMinutes || 0), 0);

  const formatMins = (minutes) => {
    if (!minutes || minutes <= 0) return '0h';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const scoredTasks = tasks.filter(t => t.productivityScore !== undefined && t.productivityScore !== null);
  const avgProductivity = scoredTasks.length > 0
    ? Math.round(scoredTasks.reduce((sum, t) => sum + t.productivityScore, 0) / scoredTasks.length)
    : 85;

  const renderMetricCard = (title, value, subtitle, stripeColor, Icon) => (
    <div className="relative bg-white border border-slate-200/90 rounded-2xl p-5 overflow-hidden shadow-3xs flex flex-col justify-between min-h-[120px] transition-all hover:shadow-2xs text-left">
      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: stripeColor }}></div>
      <div className="pl-2.5 flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{title}</span>
          <strong className="text-2xl font-black text-slate-900 block">{value}</strong>
        </div>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="pl-2.5 pt-2">
        <span className="text-[10px] text-slate-500 font-semibold">{subtitle}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 border border-slate-250 hover:bg-slate-50 rounded-xl text-slate-600 transition-all shadow-3xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-wide">Task Analytics Dashboard</h1>
            <p className="text-[10px] text-slate-500 font-semibold">Live productivity, working times & SLA delay tracking</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {renderMetricCard("Total Tasks", total, "Registered deliverables", "#6366F1", Settings)}
        {renderMetricCard("Pending / Created", pending, "Requires review", "#94A3B8", Clock)}
        {renderMetricCard("In Progress", inProgress, "Actively working", "#3B82F6", Activity)}
        {renderMetricCard("Completed", completed, "Finished actions", "#10B981", CheckSquare)}
        {renderMetricCard("Delayed Tasks", delayed, "Exceeding deadline SLA", "#EF4444", AlertTriangle)}
        {renderMetricCard("Avg Productivity", `${avgProductivity}%`, "Overall employee score", "#EC4899", Sparkles)}
        {renderMetricCard("Total Working Time", formatMins(totalWorkingMinutes), "Timesheet logged", "#8B5CF6", Clock)}
        {renderMetricCard("Total Idle Time", formatMins(totalIdleMinutes), "Inactive/pause logs", "#F59E0B", Clock)}
      </div>
    </div>
  );
}
