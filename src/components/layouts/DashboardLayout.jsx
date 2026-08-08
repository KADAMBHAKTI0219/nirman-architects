import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ role, onChangeRole, title, children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 w-full text-slate-900 text-left relative">
      
      {/* Mobile & Tablet Sidebar Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200" 
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}

      {/* Dynamic Slide-in Sidebar (Drawer on mobile/tablet, inline on large desktop) */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out transform ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:flex flex-shrink-0 max-w-[85vw] h-[100dvh] h-full overflow-hidden`}>
        <Sidebar role={role} onClose={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* Main Content viewport container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dynamic Header */}
        <Header 
          currentRole={role} 
          onChangeRole={onChangeRole} 
          title={title} 
          onToggleSidebar={handleToggleSidebar} 
        />
        
        {/* Scrollable Main Content panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {children}
        </main>
      </div>

    </div>
  );
}
