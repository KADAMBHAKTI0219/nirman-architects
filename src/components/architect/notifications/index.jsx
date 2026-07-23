import React, { useState } from 'react';
import { 
  Bell, CheckSquare, FileText, MessageSquare, Clock, FolderOpen, 
  Check, Trash2, Info, AlertTriangle, ArrowRight 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_ALERTS = [
  { id: 1, text: "New Task Assignment: 'Detail the staircase treads & balustrades blueprints'", time: "1 hour ago", category: "task", read: false, group: "Today" },
  { id: 2, text: "Drawing update: 'First Floor Plan Column Layouts V1.1' was Approved", time: "3 hours ago", category: "drawing", read: false, group: "Today" },
  { id: 3, text: "Sarah Connor mentioned you in Central Office Tower project chat", time: "4 hours ago", category: "chat", read: true, group: "Today" },
  { id: 4, text: "Time reminder: Submit weekly timesheets by Friday afternoon", time: "Yesterday", category: "time", read: true, group: "Earlier" },
  { id: 5, text: "Document request: Admin requested design brief coordinates sheet", time: "2 days ago", category: "document", read: true, group: "Earlier" }
];

export default function Notifications() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const handleMarkRead = (id) => {
    setAlerts(prev => prev.map(al => al.id === id ? { ...al, read: true } : al));
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(al => ({ ...al, read: true })));
    alert("All notifications marked as read!");
  };

  const handleClearAll = () => {
    setAlerts([]);
    alert("All notifications cleared!");
  };

  const renderIcon = (category) => {
    switch (category) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-rose-500" />;
      case 'drawing':
        return <FileText className="w-4 h-4 text-[#2484C6]" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-emerald-505" />;
      case 'time':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      case 'document':
        return <FolderOpen className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const todayAlerts = alerts.filter(al => al.group === 'Today');
  const earlierAlerts = alerts.filter(al => al.group === 'Earlier');
  const unreadCount = alerts.filter(al => !al.read).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. HEADER CONTROL */}
      <div className="bg-white p-5 rounded-3xl border border-slate-105 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#2484C6] rounded-2xl">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">Design Desk Notifications</strong>
            <span className="text-[10px] text-slate-405 block font-bold">Track drawings signoffs, team chats mentions, and timesheet reminders</span>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase transition-all shadow-3xs"
            >
              Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase transition-all shadow-3xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 2. TIMELINE CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Main Feed (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          
          {todayAlerts.length > 0 && (
            <Card title="Today" subtitle="New design assignments & updates received today" className="space-y-3">
              {todayAlerts.map(al => (
                <div 
                  key={al.id} 
                  className={`p-4 border rounded-2xl flex items-start justify-between gap-4 transition-all ${
                    al.read ? 'bg-slate-50/20 border-slate-100 opacity-75' : 'bg-blue-50/20 border-blue-100 shadow-3xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-white border border-slate-150 rounded-xl mt-0.5 shrink-0 shadow-3xs">
                      {renderIcon(al.category)}
                    </span>
                    <div>
                      <span className={`text-xs font-bold block leading-relaxed ${al.read ? 'text-slate-550' : 'text-slate-850'}`}>
                        {al.text}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold">{al.time}</span>
                    </div>
                  </div>

                  {!al.read && (
                    <button
                      onClick={() => handleMarkRead(al.id)}
                      className="p-1.5 hover:bg-white rounded-lg text-[#2484C6] border border-transparent hover:border-blue-150 transition-all flex-shrink-0"
                      title="Dismiss"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </Card>
          )}

          {earlierAlerts.length > 0 && (
            <Card title="Earlier" subtitle="Prior alerts from this week" className="space-y-3">
              {earlierAlerts.map(al => (
                <div 
                  key={al.id} 
                  className="p-4 bg-slate-50/20 border border-slate-100 rounded-2xl flex items-start justify-between gap-4 opacity-75"
                >
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-white border border-slate-150 rounded-xl mt-0.5 shrink-0">
                      {renderIcon(al.category)}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-550 block leading-relaxed">
                        {al.text}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold">{al.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {alerts.length === 0 && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 font-bold uppercase tracking-wider">
              No new studio alerts.
            </div>
          )}

        </div>

        {/* Info widgets (1/3 width) */}
        <div className="xl:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4 text-xs font-bold text-slate-655">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Notifications Count</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center font-black text-slate-850 text-xs">
              {unreadCount}
            </span>
            <span>Unread alerts requiring attention</span>
          </div>
        </div>

      </div>

    </div>
  );
}
