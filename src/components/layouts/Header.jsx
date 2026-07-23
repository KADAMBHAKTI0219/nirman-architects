import React, { useState } from 'react';
import { Bell, Search, RefreshCw, User, HardHat, Hammer, FileCheck, Menu } from 'lucide-react';

export default function Header({ currentRole, onChangeRole, title = "Dashboard", onToggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifications = [
    { id: 1, text: "Drawing 'Ground Floor Plan V1.1' was approved by Project Manager.", time: "10 mins ago", type: "drawing" },
    { id: 2, text: "Overdue task alert: 'Site Survey Report' is past deadline.", time: "1 hour ago", type: "task" },
    { id: 3, text: "New leave request from Alice (Architect) awaiting approval.", time: "2 hours ago", type: "hr" }
  ];

  return (
    <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-35 shadow-2xs">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all mr-1"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="p-2 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-xl text-slate-900 font-black shadow-sm">
          <HardHat className="w-5 h-5 text-slate-800" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight m-0 p-0 leading-none">Nirman Architects</h1>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
            {title} Panel
          </span>
        </div>
      </div>



      {/* Right Side: Profile & Notifications */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">Notifications</span>
                <span className="text-[10px] text-brand-dark bg-brand-tint font-bold px-2 py-0.5 rounded-full">New alerts</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50/50 transition-colors text-xs">
                    <p className="text-slate-600 leading-normal">{n.text}</p>
                    <span className="text-[10px] text-slate-400 block mt-1.5">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center bg-slate-50/30">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-black text-brand-dark hover:underline"
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
            {currentRole.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-bold text-slate-805 block">Nirman Staff</span>
            <span className="text-[10px] font-semibold text-slate-450 uppercase">{currentRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
