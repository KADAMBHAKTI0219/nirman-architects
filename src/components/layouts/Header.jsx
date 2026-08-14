import React from 'react';
import { Menu } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';
import logoImg from '../../assets/images/logo.png';

/**
 * Reusable Header Component
 * Displays Nirman Architects Logo on Left Side, title, and real-time NotificationBell
 */
export default function Header({ currentRole, onChangeRole, title = "Dashboard", onToggleSidebar }) {
  return (
    <header className="bg-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-35 shadow-2xs font-sans">
      {/* Title Block with Nirman Architects Logo */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-slate-100 text-slate-700 rounded-xl transition-all mr-0.5 flex-shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Official Nirman Architects Logo on Left Side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img 
            src={logoImg} 
            alt="Nirman Architects Logo" 
            className="h-9 sm:h-10 w-auto object-contain flex-shrink-0 drop-shadow-2xs hover:scale-105 transition-transform"
          />
          <div className="h-7 w-[1px] bg-slate-200 hidden sm:block" />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight m-0 p-0 leading-tight truncate">
              Nirman Architects
            </h1>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest mt-0.5 block truncate">
              {title} Panel
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: Reusable Real-Time Notification Bell */}
      <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
        <NotificationBell isClientPortal={currentRole === 'Customer'} />
      </div>
    </header>
  );
}
