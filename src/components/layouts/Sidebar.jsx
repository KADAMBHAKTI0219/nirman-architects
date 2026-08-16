import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import logoImg from '../../assets/images/logo.png';

const SIDEBAR_ITEMS = {
  Admin: [
    { label: "Dashboard", path: "/admin", icon: "LayoutDashboard" },
    { category: "PROJECT OPERATIONS" },
    { label: "Projects", path: "/admin/projects", icon: "Building2" },
    { label: "Tasks", path: "/admin/tasks", icon: "CheckSquare" },
    { label: "Drawings & GFC", path: "/admin/drawings", icon: "PenTool" },
    {
      label: "Documents",
      icon: "FolderOpen",
      subItems: [
        { label: "Project Documents", path: "/admin/docs/projects" },
        { label: "Storage Analytics", path: "/admin/docs/global" }
      ]
    },
    { category: "WORKFORCE" },
    { label: "Attendance", path: "/admin/attendance/office", icon: "CalendarDays" },
    { label: "Employees Directory", path: "/admin/employees", icon: "Users" },
    { label: "Departments", path: "/admin/departments", icon: "Building" },
    { label: "Work Locations", path: "/admin/work-locations", icon: "MapPin" },
    { label: "Role Master", path: "/admin/roles", icon: "Shield" },
    { category: "HR & PAYROLL" },
    {
      label: "HR & Payroll",
      icon: "Briefcase",
      subItems: [
        { label: "Payroll Center", path: "/admin/hr/payroll" },
        { label: "Leave Management", path: "/admin/hr/leaves" },
        { label: "Leave Master", path: "/admin/hr/leave-master" },
        { label: "Performance Score", path: "/admin/hr/performance" }
      ]
    },
    { category: "CLIENT RELATIONS" },
    {
      label: "Clients & CRM",
      icon: "BadgeAlert",
      subItems: [
        { label: "Lead Management", path: "/admin/crm/leads" },
        { label: "Client Directory", path: "/admin/crm/clients" }
      ]
    },
    { category: "COMMUNICATION" },
    { label: "Internal Chat", path: "/internal-chat", icon: "MessageSquare" },
    { label: "Client Chat", path: "/client-chat", icon: "Building2" },
    { category: "ANALYTICS & SYSTEM" },
    {
      label: "Analytics & Reports",
      icon: "BarChart3",
      subItems: [
        { label: "Project Progress", path: "/admin/reports/projects" },
        { label: "Productivity Logs", path: "/admin/reports/productivity" },
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
    { category: "WORKFORCE" },
    { label: "Attendance", path: "/hr/attendance/overview", icon: "CalendarDays" },
    { label: "Employees Directory", path: "/hr/employees", icon: "Users" },
    { label: "Departments", path: "/hr/departments", icon: "Building" },
    { label: "Work Locations", path: "/hr/work-locations", icon: "MapPin" },
    { category: "LEAVES & HOLIDAYS" },
    {
      label: "Leaves",
      icon: "Calendar",
      subItems: [
        { label: "Company Approvals", path: "/hr/leaves/company" },
        { label: "My Personal Leaves", path: "/hr/leaves/personal" }
      ]
    },
    { label: "Payroll", path: "/hr/payroll", icon: "Briefcase" },
    { label: "Performance", path: "/hr/reviews", icon: "Award" },
    { category: "COMMUNICATION" },
    { label: "Internal Chat", path: "/internal-chat", icon: "MessageSquare" },
    { label: "Client Chat", path: "/client-chat", icon: "Building2" },
    { label: "Notifications", path: "/hr/notifications", icon: "Bell" }
  ],
  ProjectManager: [
    { label: "Dashboard", path: "/project-manager", icon: "LayoutDashboard" },
    { category: "PROJECT OPERATIONS" },
    { label: "Projects Directory", path: "/project-manager/projects", icon: "Building2" },
    { label: "Task Board", path: "/project-manager/tasks", icon: "CheckSquare" },
    { label: "Drawings & GFC", path: "/project-manager/drawings", icon: "PenTool" },
    { category: "TEAM & WORKFORCE" },
    { label: "Teams Management", path: "/project-manager/team", icon: "Users" },
    { label: "Shift Attendance", path: "/project-manager/attendance", icon: "Fingerprint" },
    { label: "Work Locations", path: "/project-manager/work-locations", icon: "MapPin" },
    { label: "Leaves Approvals", path: "/project-manager/leaves", icon: "Calendar" },
    { category: "COMMUNICATION" },
    { label: "Internal Chat", path: "/internal-chat", icon: "MessageSquare" },
    { label: "Client Chat", path: "/client-chat", icon: "Building2" },
    { label: "Reports & Audits", path: "/project-manager/reports", icon: "BarChart3" }
  ],
  Architect: [
    { label: "Dashboard", path: "/architect", icon: "LayoutDashboard" },
    { category: "DESIGN STUDIO" },
    { label: "My Projects", path: "/architect/projects", icon: "Building2" },
    { label: "Drawings & GFC", path: "/architect/drawings", icon: "PenTool" },
    { label: "Time Tracking", path: "/architect/time", icon: "Clock3" },
    { category: "WORKFORCE" },
    { label: "Shift Attendance", path: "/architect/attendance", icon: "Fingerprint" },
    { label: "Leaves Portal", path: "/architect/leaves", icon: "Calendar" },
    { label: "Documents", path: "/architect/docs", icon: "FolderOpen" },
    { category: "COMMUNICATION" },
    { label: "Internal Chat", path: "/internal-chat", icon: "MessageSquare" },
    { label: "Client Chat", path: "/client-chat", icon: "Building2" },
    { label: "Notifications", path: "/architect/notifications", icon: "Bell" }
  ],
  SiteEngineer: [
    { label: "Dashboard", path: "/site-engineer", icon: "LayoutDashboard" },
    { category: "CONSTRUCTION SITE" },
    { label: "Active Sites", path: "/site-engineer/sites", icon: "HardHat" },
    { label: "Site Attendance", path: "/site-engineer/attendance", icon: "CalendarRange" },
    { label: "Photos & Issues", path: "/site-engineer/photos", icon: "Camera" },
    { label: "Leaves Portal", path: "/site-engineer/leaves", icon: "Calendar" },
    { category: "COMMUNICATION" },
    { label: "Internal Chat", path: "/internal-chat", icon: "MessageSquare" },
    { label: "Client Chat", path: "/client-chat", icon: "Building2" },
    { label: "Notifications", path: "/site-engineer/notifications", icon: "Bell" }
  ],
  Employee: [
    { label: "Dashboard", path: "/employee", icon: "LayoutDashboard" },
    { category: "MY WORKSPACE" },
    { label: "My Tasks", path: "/employee/tasks", icon: "CheckSquare" },
    { label: "Drawings & GFC", path: "/employee/drawings", icon: "PenTool" },
    { label: "Documents", path: "/employee/docs", icon: "FolderOpen" },
    { category: "WORKFORCE" },
    { label: "Shift Attendance", path: "/employee/attendance", icon: "Fingerprint" },
    { label: "Leaves Portal", path: "/employee/leaves", icon: "Calendar" },
    { category: "COMMUNICATION" },
    { label: "Internal Chat", path: "/internal-chat", icon: "MessageSquare" },
    { label: "Client Chat", path: "/client-chat", icon: "Building2" },
    { label: "Notifications", path: "/employee/notifications", icon: "Bell" }
  ],
  Customer: [
    { label: "Dashboard", path: "/customer", icon: "LayoutDashboard" },
    { category: "CLIENT PORTAL" },
    { label: "Project Timeline", path: "/customer/timeline", icon: "Milestone" },
    { label: "Photos & 3D Views", path: "/customer/views", icon: "Sparkles" },
    { label: "Project History", path: "/customer/history", icon: "History" },
    { category: "COMMUNICATION" },
    { label: "Client Chat", path: "/client-chat", icon: "Building2" },
    { label: "Notifications", path: "/customer/notifications", icon: "Bell" }
  ]
};

const getProfileDetails = (role) => {
  switch (role) {
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

  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    return <IconComponent className="w-4.5 h-4.5 flex-shrink-0" />;
  };

  return (
    <aside
      className={`bg-white text-slate-650 h-[100dvh] h-full flex flex-col flex-shrink-0 sticky top-0 transition-all duration-300 ease-in-out border-r border-slate-200/80 ${isCollapsed ? 'w-20' : 'w-64 sm:w-72'
        }`}
    >
      {/* 1. Brand Logo Header & Toggle Button */}
      <div className={`py-4 border-b border-slate-100 flex items-center justify-between relative bg-white ${isCollapsed ? 'px-3 justify-center' : 'px-5'
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
            <div className="w-9 h-9 rounded-xl bg-brand-primary text-brand-dark border border-brand-secondary font-black text-xs flex items-center justify-center shadow-3xs">
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

          {onClose && !isLargeScreen && (
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

      {/* 2. Navigation List with Clean Professional SaaS Layout */}
      <nav className={`flex-1 overflow-y-auto space-y-1 scrollbar-thin ${isCollapsed ? 'px-2 pt-4 pb-16' : 'px-3.5 pt-4 pb-20'
        }`}>
        {items.map((item, idx) => {
          if (item.category) {
            return !isCollapsed ? (
              <div key={`cat-${idx}`} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-1.5 px-3 block">
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
              <div key={idx} className="space-y-0.5">
                <button
                  onClick={() => toggleMenu(idx)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-bold transition-all cursor-pointer ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'
                    } ${hasActiveSub
                      ? 'bg-gradient-to-r from-brand-primary/50 to-brand-secondary/40 text-brand-dark font-extrabold border-l-4 border-brand-secondary shadow-2xs'
                      : 'hover:bg-brand-soft/60 hover:text-slate-900 text-slate-650 font-semibold'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`${hasActiveSub ? 'text-slate-900' : 'text-slate-500'}`}>
                      {renderIcon(item.icon)}
                    </div>
                    {!isCollapsed && (
                      <span className="text-slate-800 font-bold">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    isExpanded ? (
                      <Icons.ChevronDown className="w-3.5 h-3.5 transition-transform text-slate-500" />
                    ) : (
                      <Icons.ChevronRight className="w-3.5 h-3.5 transition-transform text-slate-400" />
                    )
                  )}
                </button>

                {isExpanded && !isCollapsed && (
                  <div className="pl-3.5 pr-1 py-1 space-y-1 border-l-2 border-brand-secondary ml-4 my-0.5">
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
                          className={`block px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${isSubActive
                            ? 'bg-brand-primary/40 text-brand-dark font-extrabold border-l-2 border-brand-secondary'
                            : 'hover:bg-brand-soft/80 hover:text-slate-900 text-slate-650'
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
              className={`flex items-center rounded-xl text-xs font-bold transition-all ${isCollapsed ? 'justify-center p-3' : 'gap-2.5 px-3 py-2.5'
                } ${isActive
                  ? 'bg-gradient-to-r from-brand-primary/50 to-brand-secondary/40 text-brand-dark font-extrabold border-l-4 border-brand-secondary shadow-2xs'
                  : 'hover:bg-brand-soft/60 hover:text-slate-900 text-slate-650 font-semibold'
                }`}
            >
              <div className={`${isActive ? 'text-brand-dark' : 'text-slate-500'}`}>
                {renderIcon(item.icon)}
              </div>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 3. Sidebar Footer */}
      <div className={`border-t border-slate-200/80 bg-white flex shrink-0 transition-all ${isCollapsed ? 'p-2 flex-col items-center gap-2' : 'p-4 items-center justify-between gap-3'
        }`}>
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div
            className="w-9 h-9 bg-brand-primary text-brand-dark rounded-xl flex items-center justify-center font-black text-[11px] shadow-xs border border-brand-secondary flex-shrink-0"
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
          className={`hover:bg-slate-100 text-slate-450 hover:text-rose-600 rounded-lg transition-colors flex-shrink-0 cursor-pointer ${isCollapsed ? 'p-2' : 'p-1.5'
            }`}
          title="Sign Out"
        >
          <Icons.LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
