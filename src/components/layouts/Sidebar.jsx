import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import logoImg from '../../assets/images/logo.png';

const SIDEBAR_ITEMS = {
  Admin: [
    { label: "Dashboard", path: "/admin", icon: "LayoutDashboard" },
    { category: "ERP Modules" },
    { label: "Projects", path: "/admin/projects", icon: "Building2" },
    { label: "Tasks", path: "/admin/tasks", icon: "CheckSquare" },
    { label: "Drawings", path: "/admin/drawings", icon: "FileCode" },
    { label: "Documents", path: "/admin/docs/projects", icon: "FolderOpen" },
    { category: "Workforce Group" },
    { label: "Attendance", path: "/admin/attendance/office", icon: "CalendarRange" },
    { label: "Employees", path: "/admin/employees", icon: "Users" },
    { label: "HR & Payroll", path: "/admin/hr/leaves", icon: "Briefcase" },
    { category: "CRM Modules" },
    { label: "Clients & CRM", path: "/admin/crm/clients", icon: "BadgeAlert" },
    { category: "Analytics & System" },
    { label: "Analytics & Reports", path: "/admin/reports/projects", icon: "BarChart3" },
    { label: "Notifications", path: "/admin/notifications", icon: "BellRing" },
    { label: "Settings", path: "/admin/settings", icon: "Settings2" },
    { label: "AI Insights (BI)", path: "/admin/bi", icon: "BrainCircuit" }
  ],
  HR: [
    { label: "Dashboard", path: "/hr", icon: "LayoutDashboard" },
    { category: "Staff Management" },
    { label: "Employees", path: "/hr/employees", icon: "Users" },
    { label: "Attendance", path: "/hr/attendance/office", icon: "CalendarRange" },
    { label: "Leaves & Holidays", path: "/hr/leaves", icon: "Calendar" },
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
    { label: "Reports", path: "/project-manager/reports/projects", icon: "BarChart3" }
  ],
  Architect: [
    { label: "Dashboard", path: "/architect", icon: "LayoutDashboard" },
    { category: "My Workspace" },
    { label: "My Tasks", path: "/architect/tasks", icon: "CheckSquare" },
    { label: "My Drawings", path: "/architect/drawings", icon: "DraftingCompass" },
    { label: "Time Tracking", path: "/architect/time", icon: "Clock3" },
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
    { label: "Photos & Issues", path: "/site-engineer/photos", icon: "Camera" },
    { label: "Client Updates", path: "/site-engineer/updates", icon: "Share2" },
    { label: "Notifications", path: "/site-engineer/notifications", icon: "Bell" }
  ],
  Employee: [
    { label: "Dashboard", path: "/employee", icon: "LayoutDashboard" },
    { category: "Office Terminal" },
    { label: "Shift Attendance", path: "/employee/attendance", icon: "Fingerprint" },
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
  const { initials, name, roleLabel } = getProfileDetails(role);

  const renderIcon = (name) => {
    const IconComponent = Icons[name] || Icons.HelpCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <aside className="w-64 bg-white text-slate-650 h-screen flex flex-col flex-shrink-0 shadow-sm border-r border-slate-100 sticky top-0">
      {/* Brand Profile */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
        <img 
          src={logoImg} 
          alt="Nex Alliance Logo" 
          className="h-9 w-auto object-contain"
        />
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 hover:bg-slate-150 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
