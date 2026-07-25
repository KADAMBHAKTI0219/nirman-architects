import React, { useState, useEffect } from 'react';
import { 
  Bell, CheckSquare, FileText, Image as ImageIcon, MessageSquare, 
  MapPin, Clock, Trash2, Check, CheckCheck, Info 
} from 'lucide-react';
import Card from '../../common/Card';
import { getMyNotifications, markNotificationAsRead } from '../../../service/notification';

export default function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      if (res && res.success && res.data) {
        setAlerts(res.data.notifications || []);
      } else if (res && res.notifications) {
        setAlerts(res.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications page:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchAlerts();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unreadAlerts = alerts.filter(al => !al.isRead);
      if (unreadAlerts.length === 0) return;
      await Promise.all(unreadAlerts.map(al => markNotificationAsRead(al._id || al.id)));
      fetchAlerts();
      alert("All notifications marked as read!");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleClearAll = () => {
    setAlerts([]);
  };

  const getCategory = (type) => {
    if (!type) return 'info';
    const t = type.toUpperCase();
    if (t.includes('OFFER') || t.includes('LEAVE') || t.includes('HR')) return 'hr';
    if (t.includes('TASK')) return 'task';
    if (t.includes('ATTENDANCE')) return 'attendance';
    if (t.includes('DRAWING')) return 'drawing';
    if (t.includes('CHAT') || t.includes('MESSAGE')) return 'chat';
    return 'info';
  };

  const renderIcon = (category) => {
    switch (category) {
      case 'drawing':
      case 'approval':
        return <CheckSquare className="w-4 h-4 text-rose-500" />;
      case 'milestone':
        return <Clock className="w-4 h-4 text-[#2484C6]" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-emerald-505" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const unreadCount = alerts.filter(al => !al.isRead).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. HEADER CONTROLS */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50/50 border border-blue-100 text-[#2484C6] rounded-2xl">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <strong className="text-slate-855 text-sm block">Project Announcement Board</strong>
            <span className="text-[10px] text-slate-400 block font-bold">Stay updated on drawings approval queries, construction milestones, and chats notifications</span>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase transition-all shadow-3xs flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase transition-all shadow-3xs"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* 2. TIMELINE FEED */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Main Feed (2/3 width) */}
        <div className="xl:col-span-2 space-y-3">
          {loading && alerts.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-xs font-bold text-slate-405">
              Loading project announcements...
            </div>
          ) : (
            <>
              {alerts.map(al => (
                <div 
                  key={al._id || al.id} 
                  className={`p-4 border rounded-2xl flex items-start justify-between gap-4 transition-all ${
                    al.isRead ? 'bg-slate-50/20 border-slate-100 opacity-75' : 'bg-blue-50/20 border-blue-100 shadow-3xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="p-2.5 bg-white border border-slate-150 rounded-xl mt-0.5 shrink-0 shadow-3xs">
                      {renderIcon(getCategory(al.type))}
                    </span>
                    <div>
                      <span className={`text-xs font-bold block leading-relaxed ${al.isRead ? 'text-slate-550' : 'text-slate-855'}`}>
                        {al.message}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 font-semibold">
                        {new Date(al.createdAt).toLocaleDateString()} &bull; {new Date(al.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!al.isRead && (
                    <button
                      onClick={() => handleMarkRead(al._id || al.id)}
                      className="p-1.5 hover:bg-white rounded-lg text-[#2484C6] border border-transparent hover:border-blue-150 transition-all flex-shrink-0"
                      title="Dismiss"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                  No active announcements.
                </div>
              )}
            </>
          )}
        </div>

        {/* Info panel */}
        <div className="xl:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4 text-xs font-bold text-slate-655">
          <span className="text-[9px] font-bold text-slate-400 block uppercase">Unread Badge Status</span>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center font-black text-slate-850 text-xs">
              {unreadCount}
            </span>
            <span>Alerts requiring review</span>
          </div>
        </div>

      </div>

    </div>
  );
}
