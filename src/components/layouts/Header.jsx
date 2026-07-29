import React, { useState, useEffect } from 'react';
import { Bell, Search, RefreshCw, User, HardHat, Hammer, FileCheck, Menu, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyNotifications, markNotificationAsRead } from '../../service/notification';

export default function Header({ currentRole, onChangeRole, title = "Dashboard", onToggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [realNotifications, setRealNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'Admin': return '/admin';
      case 'HR': return '/hr';
      case 'ProjectManager': return '/project-manager';
      case 'Architect': return '/architect';
      case 'SiteEngineer': return '/site-engineer';
      case 'Employee': return '/employee';
      default: return '/';
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getMyNotifications();
      if (res && res.success && res.data) {
        setRealNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } else if (res && res.notifications) {
        setRealNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications in Header:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  return (
    <header className="bg-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-35 shadow-2xs">
      {/* Title block */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-slate-105 text-slate-650 rounded-xl transition-all mr-0.5 flex-shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex p-2 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl text-slate-900 font-black shadow-sm flex-shrink-0">
          <HardHat className="w-5 h-5 text-slate-805" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight m-0 p-0 leading-tight truncate">Nirman Architects</h1>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest mt-0.5 block truncate">
            {title} Panel
          </span>
        </div>
      </div>

      {/* Right Side: Profile & Notifications */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
        {/* Dashboard Shortcut Button */}
        <button
          onClick={() => navigate(getDashboardPath(currentRole))}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all shadow-3xs"
          title="Go to Dashboard Home"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-xl transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border border-white text-[8px] font-black text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-105 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[9px] text-rose-600 bg-rose-50 border border-rose-100 font-black px-2 py-0.5 rounded-full">
                    {unreadCount} New alerts
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {realNotifications.map(n => (
                  <div
                    key={n._id || n.id}
                    onClick={() => {
                      handleMarkAsRead(n._id || n.id);
                    }}
                    className={`p-3.5 hover:bg-slate-50/50 transition-colors text-xs cursor-pointer flex justify-between items-start gap-2 ${!n.isRead ? 'bg-slate-50/30 font-bold' : ''}`}
                  >
                    <div className="space-y-1">
                      <p className={`${!n.isRead ? 'text-slate-900' : 'text-slate-500'} leading-normal`}>{n.message}</p>
                      <span className="text-[9px] text-slate-400 block font-bold">
                        {new Date(n.createdAt).toLocaleDateString()} &bull; {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></span>
                    )}
                  </div>
                ))}
                {realNotifications.length === 0 && (
                  <div className="p-4 text-center text-slate-400 font-semibold text-[10px]">No notifications to show.</div>
                )}
              </div>
              <div className="p-2 border-t border-slate-105 text-center bg-slate-50/30">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-black text-slate-600 hover:underline uppercase"
                >
                  Close panel
                </button>
              </div>
            </div>
          )}
        </div>


        {/* User Profile Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
          <div className="w-9 h-9 bg-brand-tint rounded-xl flex items-center justify-center text-brand-dark font-bold text-xs shadow-2xs">
            {(() => {
              const savedUserStr = localStorage.getItem('user');
              if (savedUserStr) {
                try {
                  const user = JSON.parse(savedUserStr);
                  if (user.name) {
                    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                  }
                } catch { }
              }
              return currentRole.substring(0, 2).toUpperCase();
            })()}
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold text-slate-805 block font-extrabold">
              {(() => {
                const savedUserStr = localStorage.getItem('user');
                if (savedUserStr) {
                  try {
                    const user = JSON.parse(savedUserStr);
                    if (user.name) return user.name;
                  } catch { }
                }
                return 'Nirman Staff';
              })()}
            </span>
            <span className="text-[10px] font-semibold text-slate-450 uppercase">{currentRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
