import React, { useState } from 'react';
import { 
  Bell, ShieldAlert, Award, FileText, CheckCircle2, MessageSquare, 
  Trash2, Mail, Smartphone, RefreshCw, Pin, Eye, Settings, Clock 
} from 'lucide-react';
import Card from '../../common/Card';

const INITIAL_NOTIFICATIONS = [
  { 
    id: 1, 
    category: "Approval Alerts", 
    text: "GFC sign-off required: Plumbing Riser Diagram V1.2 uploaded by Sarah Connor.", 
    time: "1 hour ago", 
    pinned: true, 
    read: false,
    detail: "Sarah Connor has uploaded version V1.2 of the Plumbing Riser Diagram for the Oceanic Luxury Villas project. Approval is required before GFC release lock can be applied.",
    projectName: "Oceanic Luxury Villas"
  },
  { 
    id: 2, 
    category: "Work Alerts", 
    text: "Timesheet discrepancy detected on Smart City Mall concrete pouring team.", 
    time: "3 hours ago", 
    pinned: false, 
    read: false,
    detail: "Three site team members logged 10 hours on Wednesday while their GPS location logs registered departures 2 hours early. Roster check required.",
    projectName: "Smart City Mall"
  },
  { 
    id: 3, 
    category: "HR Alerts", 
    text: "Annual appraisal review calendar has been published to all HR portals.", 
    time: "Yesterday", 
    pinned: false, 
    read: true,
    detail: "The 2026 performance appraisal cycles guidelines have been pushed to employee dashboards. Roster updates must be configured by Friday.",
    projectName: "System-wide"
  },
  { 
    id: 4, 
    category: "Client Messages", 
    text: "Mr. Bruce Wayne posted query: 'Cave concrete loading calculations checking status'.", 
    time: "2 days ago", 
    pinned: false, 
    read: true,
    detail: "Bruce Wayne is requesting concrete load bearing specs for the Oceanic Villas garage blueprints.",
    projectName: "Oceanic Luxury Villas"
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedNotification, setSelectedNotification] = useState(INITIAL_NOTIFICATIONS[0]);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Channels Configs state
  const [channels, setChannels] = useState({
    push: true,
    email: true,
    sms: false,
    whatsapp: true
  });

  const categories = ['All', 'Approval Alerts', 'Work Alerts', 'HR Alerts', 'Client Messages'];

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    return activeCategory === 'All' || n.category === activeCategory;
  });

  const handleMarkRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    if (selectedNotification?.id === id) {
      setSelectedNotification(prev => ({ ...prev, read: true }));
    }
  };

  const handleTogglePin = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ));
    if (selectedNotification?.id === id) {
      setSelectedNotification(prev => ({ ...prev, pinned: !prev.pinned }));
    }
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  };

  const handleSnooze = (id) => {
    alert("Alert snoozed for 2 hours.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top statistics banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-tint border border-brand-primary text-slate-805 rounded-2xl">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <strong className="text-slate-850 text-sm block">System Notification Center</strong>
            <span className="text-[10px] text-slate-400 block font-bold">Manage channels and process in-app alerts</span>
          </div>
        </div>

        {/* Channels Toggles */}
        <div className="flex gap-4 items-center flex-wrap bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
          <span className="text-[9px] font-black uppercase text-slate-400">Communication Channels:</span>
          
          <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={channels.email} 
              onChange={() => setChannels(c => ({ ...c, email: !c.email }))}
              className="rounded text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
            />
            Email
          </label>
          <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={channels.whatsapp} 
              onChange={() => setChannels(c => ({ ...c, whatsapp: !c.whatsapp }))}
              className="rounded text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
            />
            WhatsApp
          </label>
          <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={channels.sms} 
              onChange={() => setChannels(c => ({ ...c, sms: !c.sms }))}
              className="rounded text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
            />
            SMS
          </label>
        </div>
      </div>

      {/* Main Inbox split view: Categories + Alerts List + Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Categories selector (1/4 width) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-2 h-max">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-2">Filter Inbox</span>
          {categories.map(cat => {
            const count = cat === 'All' 
              ? notifications.filter(n=>!n.read).length 
              : notifications.filter(n=>n.category === cat && !n.read).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                  activeCategory === cat
                    ? 'bg-brand-tint border border-brand-primary/20 text-slate-805 font-extrabold shadow-3xs'
                    : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span className="px-2 py-0.5 bg-brand-primary text-slate-905 rounded-full text-[9px] font-black leading-none">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Center Side: Notification List (2/4 width) */}
        <div className="lg:col-span-2 space-y-3">
          {filteredNotifications.map(item => (
            <div 
              key={item.id}
              onClick={() => setSelectedNotification(item)}
              className={`p-4 bg-white border rounded-3xl shadow-3xs cursor-pointer transition-all flex gap-3 items-start ${
                selectedNotification?.id === item.id ? 'border-brand-primary ring-2 ring-brand-primary/10' : 'border-slate-100 hover:border-slate-205'
              } ${!item.read ? 'bg-slate-50/20' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 flex-shrink-0">
                {item.category[0]}
              </div>

              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{item.category}</span>
                  <span>{item.time}</span>
                </div>
                <strong className={`text-slate-805 block leading-normal text-xs ${!item.read ? 'font-black' : 'font-semibold'}`}>
                  {item.text}
                </strong>
                <span className="text-[9px] text-[#2484C6] block font-bold uppercase">{item.projectName}</span>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e)=>e.stopPropagation()}>
                {item.pinned && <Pin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />}
                {!item.read && <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0" />}
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-slate-400 font-bold uppercase bg-white border border-slate-100 rounded-3xl shadow-3xs">
              No notifications matching selector.
            </div>
          )}
        </div>

        {/* Right Side: Detail Drawer (1/4 width) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs h-max">
          {selectedNotification ? (
            <div className="space-y-6">
              
              <div className="border-b border-slate-50 pb-2 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedNotification.category}</span>
                  <h4 className="font-black text-slate-905 mt-1">{selectedNotification.projectName}</h4>
                </div>
                <button 
                  onClick={() => handleTogglePin(selectedNotification.id)}
                  className={`p-1.5 rounded-xl border transition-all ${
                    selectedNotification.pinned ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-405'
                  }`}
                  title="Pin Notification"
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Details Summary</span>
                <p className="p-3 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed text-slate-700 font-semibold italic">
                  "{selectedNotification.detail}"
                </p>
              </div>

              {/* Action drawer bar */}
              <div className="pt-4 border-t border-slate-100 flex gap-2 flex-wrap">
                {!selectedNotification.read && (
                  <button
                    onClick={() => handleMarkRead(selectedNotification.id)}
                    className="flex-1 px-3 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 text-xs font-black uppercase rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Read
                  </button>
                )}
                <button
                  onClick={() => handleSnooze(selectedNotification.id)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase rounded-xl transition-all shadow-3xs flex items-center justify-center gap-1"
                >
                  <Clock className="w-4 h-4" />
                  Snooze
                </button>
                <button
                  onClick={() => handleDelete(selectedNotification.id)}
                  className="p-2 border border-slate-205 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all shadow-3xs flex items-center justify-center"
                  title="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs py-8">
              Select an alert from the inbox list.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
