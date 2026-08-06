import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import logoImg from '../../assets/images/logo.png';

const SIDEBAR_ITEMS = {
  Admin: [
    { label: "Dashboard", path: "/admin", icon: "LayoutDashboard" },
    { category: "ERP Modules" },
    { 
      label: "Projects", 
      path: "/admin/projects",
      icon: "Building2"
    },
    { 
      label: "Tasks", 
      path: "/admin/tasks",
      icon: "CheckSquare"
    },
    { 
      label: "Drawings", 
      path: "/admin/drawings",
      icon: "FileCode"
    },
    { 
      label: "Documents", 
      icon: "FolderOpen",
      subItems: [
        { label: "Project Documents", path: "/admin/docs/projects" },
        { label: "Storage Analytics", path: "/admin/docs/global" }
      ]
    },
    { category: "Workforce Group" },
    { 
      label: "Attendance", 
      icon: "CalendarRange",
      subItems: [
        { label: "Attendance Operations", path: "/admin/attendance/office" },
        { label: "App Usage Tracking", path: "/admin/app-usage" },
        { label: "Employees Directory", path: "/admin/employees" },
        { label: "Device Approvals", path: "/admin/attendance/devices" }
      ]
    },
    { 
      label: "HR & Payroll", 
      icon: "Briefcase",
      subItems: [
        { label: "HR Overview", path: "/admin/hr/overview" },
        { label: "Leave Management", path: "/admin/hr/leaves" },
        { label: "Leave Master", path: "/admin/hr/leave-master" },
        { label: "Shift Planner", path: "/admin/hr/shifts" },
        { label: "Payroll Center", path: "/admin/hr/payroll" },
        { label: "Performance Score", path: "/admin/hr/performance" }
      ]
    },
    { category: "CRM Modules" },
    { 
      label: "Clients & CRM", 
      icon: "BadgeAlert",
      subItems: [
        { label: "CRM Overview", path: "/admin/crm/overview" },
        { label: "Lead Management", path: "/admin/crm/leads" },
        { label: "Client Directory", path: "/admin/crm/clients" },
        { label: "Support Queries", path: "/admin/crm/queries" },
        { label: "Client Approvals", path: "/admin/crm/approvals" }
      ]
    },
    { category: "Analytics & System" },
    { 
      label: "Analytics & Reports", 
      icon: "BarChart3",
      subItems: [
        { label: "Project Progress", path: "/admin/reports/projects" },
        { label: "Productivity Logs", path: "/admin/reports/productivity" },
        { label: "Drawing Status", path: "/admin/reports/drawings" },
        { label: "Attendance Registry", path: "/admin/reports/attendance" },
        { label: "Leave Summaries", path: "/admin/reports/leaves" }
      ]
    },
    { label: "Notifications", path: "/admin/notifications", icon: "BellRing" },
    { label: "Settings", path: "/admin/settings", icon: "Settings2" },
    { label: "AI Insights (BI)", path: "/admin/bi", icon: "BrainCircuit" }
  ],
  HR: [
    { label: "Dashboard", path: "/hr", icon: "LayoutDashboard" },
    { category: "Staff Management" },
    { label: "Employees", path: "/hr/employees", icon: "Users" },
    { 
      label: "Attendance", 
      icon: "CalendarRange",
      subItems: [
        { label: "Attendance Overview", path: "/hr/attendance/overview" },
        { label: "App Usage Tracking", path: "/hr/app-usage" },
        { label: "Daily Punch Logs", path: "/hr/attendance/daily" },
        { label: "Monthly Summaries", path: "/hr/attendance/monthly" },
        { label: "Late & Exceptions", path: "/hr/attendance/exceptions" }
      ]
    },
    { 
      label: "Leaves & Holidays", 
      icon: "Calendar",
      subItems: [
        { label: "Company Approvals", path: "/hr/leaves/company" },
        { label: "My Personal Leaves", path: "/hr/leaves/personal" }
      ]
    },
    { label: "Shift Rosters", path: "/hr/shifts", icon: "Clock3" },
    { category: "Operations & Reviews" },
    { label: "Payroll", path: "/hr/payroll", icon: "Briefcase" },
    { label: "Performance", path: "/hr/performance", icon: "Award" },
    { label: "Notifications", path: "/hr/notifications", icon: "Bell" }
  ],
  ProjectManager: [
    { label: "Dashboard", path: "/project-manager", icon: "LayoutDashboard" },
    { category: "Project Operations" },
    { label: "Projects Directory", path: "/project-manager/projects", icon: "Building2" },
    { label: "Task Board", path: "/project-manager/tasks", icon: "CheckSquare" },
    { label: "Drawing Approvals", path: "/project-manager/drawings", icon: "FileCode" },
    { label: "Leaves Approvals", path: "/project-manager/leaves", icon: "Calendar" },
    { category: "Team & Communication" },
    { label: "Client Communication", path: "/project-manager/client-communication", icon: "MessageSquare" },
    { label: "Teams Management", path: "/project-manager/team", icon: "Users" },
    { label: "Reports & Audits", path: "/project-manager/reports", icon: "BarChart3" }
  ],
  Architect: [
    { label: "Dashboard", path: "/architect", icon: "LayoutDashboard" },
    { category: "Design Studio" },
    { label: "My Projects", path: "/architect/projects", icon: "Building2" },
    { label: "My Drawings", path: "/architect/drawings", icon: "DraftingCompass" },
    { label: "Time Tracking", path: "/architect/time", icon: "Clock3" },
    { label: "Leaves Portal", path: "/architect/leaves", icon: "Calendar" },
    { category: "Communication" },
    { label: "Project Chats", path: "/architect/chats", icon: "MessageSquare" },
    { label: "Documents", path: "/architect/docs", icon: "FolderOpen" },
    { label: "Notifications", path: "/architect/notifications", icon: "Bell" }
  ],
  SiteEngineer: [
    { label: "Dashboard", path: "/site-engineer", icon: "LayoutDashboard" },
    { category: "Construction Site" },
    { label: "Active Sites", path: "/site-engineer/sites", icon: "HardHat" },
    { label: "Site Attendance", path: "/site-engineer/attendance", icon: "CalendarRange" },
    { label: "Leaves Portal", path: "/site-engineer/leaves", icon: "Calendar" },
    { label: "Photos & Issues", path: "/site-engineer/photos", icon: "Camera" },
    { label: "Client Updates", path: "/site-engineer/updates", icon: "Share2" },
    { label: "Notifications", path: "/site-engineer/notifications", icon: "Bell" }
  ],
  Employee: [
    { label: "Dashboard", path: "/employee", icon: "LayoutDashboard" },
    { category: "Office Terminal" },
    { label: "Shift Attendance", path: "/employee/attendance", icon: "Fingerprint" },
    { label: "Leaves Portal", path: "/employee/leaves", icon: "Calendar" },
    { label: "My Tasks", path: "/employee/tasks", icon: "CheckSquare" },
    { label: "Drawings Assigned", path: "/employee/drawings", icon: "FileCode" },
    { label: "Documents", path: "/employee/docs", icon: "FolderOpen" },
    { label: "Project Chat", path: "/employee/chat", icon: "MessageSquare" },
    { label: "Notifications", path: "/employee/notifications", icon: "Bell" }
  ],
  Customer: [
    { label: "Dashboard", path: "/customer", icon: "LayoutDashboard" },
    { category: "Client Portal" },
    { label: "Project Timeline", path: "/customer/timeline", icon: "Milestone" },
    { label: "Drawings & Approvals", path: "/customer/drawings", icon: "FileCode" },
    { label: "Photos & 3D Views", path: "/customer/views", icon: "Sparkles" },
    { label: "Chat & Queries", path: "/customer/chat", icon: "MessageSquare" },
    { label: "Notifications", path: "/customer/notifications", icon: "Bell" },
    { label: "Project History", path: "/customer/history", icon: "History" }
  ]
};

const getProfileDetails = (role) => {
  switch(role) {
    case 'Admin':
      return { initials: 'AD', name: 'Nirman Staff', roleLabel: 'ADMIN' };
    case 'HR':
      return { initials: 'HR', name: 'HR Personnel', roleLabel: 'HR MANAGER' };
    case 'ProjectManager':
      return { initials: 'PM', name: 'Sarah Connor', roleLabel: 'PROJECT MANAGER' };
    case 'Architect':
      return { initials: 'AR', name: 'Alice Smith', roleLabel: 'ARCHITECT' };
    case 'SiteEngineer':
      return { initials: 'SE', name: 'Bob Johnson', roleLabel: 'SITE ENGINEER' };
    case 'Employee':
      return { initials: 'EM', name: 'Charlie Brown', roleLabel: 'OFFICE EMPLOYEE' };
    case 'Customer':
      return { initials: 'CS', name: 'Bruce Wayne', roleLabel: 'CLIENT CUSTOMER' };
    default:
      return { initials: 'NA', name: 'Nirman Staff', roleLabel: 'STAFF' };
  }
};

export default function Sidebar({ role, onClose }) {
  const items = SIDEBAR_ITEMS[role] || [];
  const location = useLocation();

  // Persistent Mini-Sidebar / Icon-Only Collapsed State
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('nirman_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('nirman_sidebar_collapsed', String(next));
      return next;
    });
  };

  const [expandedMenus, setExpandedMenus] = useState(() => {
    const activeObj = {};
    items.forEach((item, idx) => {
      if (item.subItems) {
        const hasActiveSub = item.subItems.some(sub => location.pathname === sub.path || (sub.path !== '/' && location.pathname.startsWith(sub.path)));
        if (hasActiveSub) {
          activeObj[idx] = true;
        }
      }
    });
    return activeObj;
  });

  const toggleMenu = (idx) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      localStorage.setItem('nirman_sidebar_collapsed', 'false');
    }
    setExpandedMenus(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };
  
  let { initials, name, roleLabel } = getProfileDetails(role);
  const savedUserStr = localStorage.getItem('user');
  if (savedUserStr) {
    try {
      const user = JSON.parse(savedUserStr);
      name = user.name || user.email?.split('@')[0] || name;
      if (user.name) {
        initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      }
      roleLabel = user.role?.replace('_', ' ') || roleLabel;
    } catch (e) {
      console.error("Error parsing saved user in Sidebar", e);
    }
  }

  const renderIcon = (name) => {
    const IconComponent = Icons[name] || Icons.HelpCircle;
    return <IconComponent className="w-5 h-5 flex-shrink-0" />;
  };

  return (
    <aside 
      className={`bg-white text-slate-650 h-screen flex flex-col flex-shrink-0 shadow-xs sticky top-0 transition-all duration-300 ease-in-out border-r border-slate-100 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 1. Brand Logo Header & Toggle Button */}
      <div className={`py-4 border-b border-slate-100 flex items-center justify-between relative bg-white ${
        isCollapsed ? 'px-3 justify-center' : 'px-5'
      }`}>
        {!isCollapsed ? (
          <Link to="/" className="flex items-center transition-opacity hover:opacity-90 min-w-0">
            <img 
              src={logoImg} 
              alt="Nirman Architects Logo" 
              className="h-11 sm:h-12 w-auto object-contain mx-auto"
            />
          </Link>
        ) : (
          <Link to="/" className="flex items-center justify-center p-1" title="Nirman Architects">
            <div className="w-9 h-9 rounded-xl bg-brand-tint text-brand-dark border border-slate-200 font-black text-xs flex items-center justify-center shadow-3xs">
              N
            </div>
          </Link>
        )}

        <div className="flex items-center gap-1">
          {/* Toggle Expand / Collapse Icon Button */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-all border border-slate-200/60 cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse to Icons Only"}
          >
            {isCollapsed ? (
              <Icons.PanelLeftOpen className="w-4 h-4 text-slate-600" />
            ) : (
              <Icons.PanelLeftClose className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
              title="Close Menu"
            >
              <Icons.X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Navigation List using original global brand colors */}
      <nav className={`flex-1 overflow-y-auto space-y-2 scrollbar-thin ${
        isCollapsed ? 'px-2 py-4' : 'px-4 py-6'
      }`}>
        {items.map((item, idx) => {
          if (item.category) {
            return !isCollapsed ? (
              <div key={`cat-${idx}`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-5 mb-2.5 px-4 block">
                {item.category}
              </div>
            ) : (
              <div key={`cat-${idx}`} className="w-8 h-0.5 bg-slate-100 mx-auto my-3 rounded-full" />
            );
          }

          if (item.subItems) {
            const isExpanded = !!expandedMenus[idx];
            const hasExactSubMatch = item.subItems.some(sub => location.pathname === sub.path);
            const hasActiveSub = item.subItems.some(sub => 
              hasExactSubMatch 
                ? location.pathname === sub.path 
                : (sub.path !== '/' && location.pathname.startsWith(sub.path))
            );
            
            return (
              <div key={idx} className="space-y-1">
                <button
                  onClick={() => toggleMenu(idx)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-bold transition-all ${
                    isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-2.5'
                  } ${
                    hasActiveSub
                      ? 'bg-brand-tint text-slate-900 font-extrabold border-l-4 border-brand-primary'
                      : 'hover:bg-slate-50 hover:text-slate-900 text-slate-550'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(item.icon)}
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    isExpanded ? (
                      <Icons.ChevronDown className="w-3.5 h-3.5 transition-transform text-slate-400" />
                    ) : (
                      <Icons.ChevronRight className="w-3.5 h-3.5 transition-transform text-slate-400" />
                    )
                  )}
                </button>
                
                {isExpanded && !isCollapsed && (
                  <div className="pl-3.5 pr-1 py-1 space-y-1 border-l border-slate-100 ml-5">
                    {item.subItems.map((sub, sIdx) => {
                      const isSubActive = hasExactSubMatch 
                        ? location.pathname === sub.path 
                        : (sub.path !== '/' && location.pathname.startsWith(sub.path));
                      return (
                        <Link
                          key={`sub-${idx}-${sIdx}`}
                          to={sub.path}
                          onClick={() => {
                            if (onClose) onClose();
                          }}
                          className={`block px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                            isSubActive
                              ? 'bg-slate-50 text-slate-900 font-bold border-l-2 border-brand-primary/50'
                              : 'hover:bg-slate-50/50 hover:text-slate-900 text-slate-450'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = item.label === 'Dashboard'
            ? location.pathname === item.path
            : (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));

          return (
            <Link
              key={idx}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              onClick={() => {
                if (onClose) onClose();
              }}
              className={`flex items-center rounded-xl text-xs font-bold transition-all ${
                isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5'
              } ${
                isActive
                  ? 'bg-brand-tint text-slate-900 font-extrabold border-l-4 border-brand-primary shadow-xs'
                  : 'hover:bg-slate-50 hover:text-slate-900 text-slate-550'
              }`}
            >
              {renderIcon(item.icon)}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 3. Sidebar Footer using original brand colors */}
      <div className={`border-t border-slate-100 bg-slate-50/30 flex transition-all ${
        isCollapsed ? 'p-2 flex-col items-center gap-2' : 'p-4 items-center justify-between gap-3'
      }`}>
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div 
            className="w-9 h-9 bg-brand-tint text-brand-dark rounded-xl flex items-center justify-center font-black text-[11px] shadow-xs border border-white flex-shrink-0"
            title={isCollapsed ? `${name} (${roleLabel})` : undefined}
          >
            {initials}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="text-xs font-black text-slate-800 block truncate leading-tight">
                {name}
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5 leading-none">
                {roleLabel}
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className={`hover:bg-slate-100 text-slate-450 hover:text-rose-600 rounded-lg transition-colors flex-shrink-0 cursor-pointer ${
            isCollapsed ? 'p-2' : 'p-1.5'
          }`}
          title="Sign Out"
        >
          <Icons.LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
