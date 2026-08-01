import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import logoImg from '../../assets/images/logo.png';


const SIDEBAR_ITEMS = {
  Admin: [
    { label: "Dashboard", path: "/admin", icon: "LayoutDashboard" },
    { category: "ERP Modules" },
    { 
      label: "Projects", 
      icon: "Building2",
      subItems: [
        { label: "Projects Directory", path: "/admin/projects" },
        { label: "Project Timelines", path: "/admin/projects/timeline" }
      ]
    },
    { 
      label: "Tasks", 
      icon: "CheckSquare",
      subItems: [
        { label: "Task Directory", path: "/admin/tasks" },
        { label: "Overdue Tasks", path: "/admin/tasks/overdue" }
      ]
    },
    { 
      label: "Drawings", 
      icon: "FileCode",
      subItems: [
        { label: "Drawings Directory", path: "/admin/drawings" },
        { label: "Drawings Approvals", path: "/admin/drawings/approvals" },
        { label: "GFC Releases", path: "/admin/drawings/gfc" }
      ]
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
    { label: "Performance Reviews", path: "/hr/reviews", icon: "Award" },
    { label: "HR Documents", path: "/hr/docs", icon: "FolderOpen" }
  ],
  ProjectManager: [
    { label: "Dashboard", path: "/project-manager", icon: "LayoutDashboard" },
    { category: "Project Delivery" },
    { label: "Projects", path: "/project-manager/projects", icon: "Building2" },
    { label: "Tasks", path: "/project-manager/tasks", icon: "CheckSquare" },
    { label: "Drawings", path: "/project-manager/drawings", icon: "FileCode" },
    { category: "Collaboration" },
    { label: "Team Roster", path: "/project-manager/team", icon: "Users" },
    { label: "Client Communication", path: "/project-manager/chats", icon: "MessageSquare" },
    { label: "Leaves Portal", path: "/project-manager/leaves", icon: "Calendar" },
    { label: "Reports", path: "/project-manager/reports/projects", icon: "BarChart3" }
  ],
  Architect: [
    { label: "Dashboard", path: "/architect", icon: "LayoutDashboard" },
    { category: "My Workspace" },
    { label: "My Tasks", path: "/architect/tasks", icon: "CheckSquare" },
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

  const [expandedMenus, setExpandedMenus] = React.useState(() => {
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
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <aside className="w-64 bg-white text-slate-650 h-screen flex flex-col flex-shrink-0 shadow-xs sticky top-0">
      {/* Brand Profile */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-center relative bg-white">
        <Link to="/" className="flex items-center justify-center transition-opacity hover:opacity-90">
          <img 
            src={logoImg} 
            alt="Nirman Architects Logo" 
            className="h-11 sm:h-12 w-auto object-contain mx-auto"
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
            title="Close Menu"
          >
            <Icons.X className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Navigation List - Clean, Flat List with Category Headings */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {items.map((item, idx) => {
          if (item.category) {
            return (
              <div key={`cat-${idx}`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-5 mb-2.5 px-4 block">
                {item.category}
              </div>
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    hasActiveSub
                      ? 'bg-brand-tint text-slate-900 font-extrabold border-l-4 border-brand-primary'
                      : 'hover:bg-slate-50 hover:text-slate-900 text-slate-550'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {renderIcon(item.icon)}
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <Icons.ChevronDown className="w-3.5 h-3.5 transition-transform text-slate-400" />
                  ) : (
                    <Icons.ChevronRight className="w-3.5 h-3.5 transition-transform text-slate-400" />
                  )}
                </button>
                {isExpanded && (
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
              onClick={() => {
                if (onClose) onClose();
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-tint text-slate-900 font-extrabold border-l-4 border-brand-primary shadow-xs'
                  : 'hover:bg-slate-50 hover:text-slate-900 text-slate-550'
              }`}
            >
              {renderIcon(item.icon)}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer: Profile Card matching mockup */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-brand-tint rounded-xl flex items-center justify-center text-brand-dark font-black text-[11px] shadow-xs border border-white flex-shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-black text-slate-800 block truncate leading-tight">
              {name}
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5 leading-none">
              {roleLabel}
            </span>
          </div>
        </div>

        <button 
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="p-1.5 hover:bg-slate-100 text-slate-450 hover:text-rose-600 rounded-lg transition-colors flex-shrink-0"
          title="Sign Out"
        >
          <Icons.LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
