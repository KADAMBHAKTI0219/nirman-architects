import React, { useState, useEffect } from 'react';
import { 
  Bell, ShieldAlert, Award, FileText, CheckCircle2, MessageSquare, 
  Trash2, Mail, Smartphone, RefreshCw, Pin, Eye, Settings, Clock, X
} from 'lucide-react';
import Card from '../../common/Card';
import { getMyNotifications, markNotificationAsRead } from '../../../service/notification';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  
  // Channels Configs state
  const [channels, setChannels] = useState({
    push: true,
    email: true,
    sms: false,
    whatsapp: true
  });

  const categories = ['All', 'Approval Alerts', 'Work Alerts', 'HR Alerts', 'System Messages'];

  const getCategoryLabel = (type) => {
    if (!type) return 'System Messages';
    const t = type.toUpperCase();
    if (t.includes('APPROVAL') || t.includes('DRAWING')) return 'Approval Alerts';
    if (t.includes('TASK') || t.includes('WORK')) return 'Work Alerts';
    if (t.includes('LEAVE') || t.includes('HR') || t.includes('OFFER')) return 'HR Alerts';
    return 'System Messages';
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      const list = res && res.success && res.data ? (res.data.notifications || []) : (res ? (res.notifications || []) : []);
      const mapped = list.map(n => ({
        id: n._id || n.id,
        category: getCategoryLabel(n.type),
        text: n.message,
        time: new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pinned: false,
        read: n.isRead,
        detail: n.message,
        projectName: n.type || "System"
      }));
      setNotifications(mapped);
      if (mapped.length > 0) {
        setSelectedNotification(mapped[0]);
      } else {
        setSelectedNotification(null);
      }
    } catch (err) {
      console.error("Failed to load admin notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filtered notifications
  const filteredNotifications = notifications.filter(n => {
    return activeCategory === 'All' || n.category === activeCategory;
  });

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
      if (selectedNotification?.id === id) {
        setSelectedNotification(prev => ({ ...prev, read: true }));
      }
    } catch (err) {
      console.error("Failed to mark read:", err);
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
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      
      {/* TOP PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications & Alert Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage communication channels, broadcast alerts, and process system notifications
          </p>
        </div>
      </div>

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
