import React, { useState, useEffect } from 'react';
import { 
  Users, Heart, HardHat, Briefcase, Star, Building, Search, Mail, Phone, 
  MapPin, ShieldCheck, Clock, Award, Eye, X, LayoutGrid, LayoutList, 
  CheckCircle2, ChevronRight, UserCheck, ExternalLink, Filter
} from 'lucide-react';
import { getUsersList } from '../../../service/auth';
import { getUsers, getHRDashboardWidgets, getSiteLocations } from '../../../service/mockApi';
import { getProjects } from '../../../service/project';

export default function Stats() {
  const [stats, setStats] = useState({
    totalUsers: 6,
    activeClients: 2,
    activeSites: 1,
    pendingProjects: 2,
    onlineCount: 2,
    usersList: []
  });

  const [activeModalType, setActiveModalType] = useState(null); // 'employees' | 'clients' | 'sites' | 'projects'
  const [projectsList, setProjectsList] = useState([]);
  const [sitesList, setSitesList] = useState([]);
  const [modalSubFilter, setModalSubFilter] = useState('All');
  
  // Enhanced Employee Modal States
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const [selectedEmpDept, setSelectedEmpDept] = useState('All');
  const [empViewMode, setEmpViewMode] = useState('table'); // 'table' | 'grid'
  const [inspectedEmp, setInspectedEmp] = useState(null);

  const openModal = (type) => {
    setModalSubFilter('All');
    setEmpSearchQuery('');
    setSelectedEmpDept('All');
    setInspectedEmp(null);
    setActiveModalType(type);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Fetch real registered users from backend API service
        let backendUsers = [];
        try {
          const userRes = await getUsersList();
          if (userRes) {
            if (Array.isArray(userRes.users)) {
              backendUsers = userRes.users;
            } else if (Array.isArray(userRes.data)) {
              backendUsers = userRes.data;
            } else if (Array.isArray(userRes)) {
              backendUsers = userRes;
            } else if (typeof userRes === 'object') {
              const uArray = [];
              Object.keys(userRes).forEach(k => {
                if (userRes[k] && typeof userRes[k] === 'object' && (userRes[k].email || userRes[k].name || userRes[k].id || userRes[k]._id)) {
                  uArray.push(userRes[k]);
                }
              });
              if (uArray.length > 0) backendUsers = uArray;
            }
          }
        } catch (apiErr) {
          console.warn("Backend getUsersList API call failed, using local/mock fallback:", apiErr);
        }

        // 2. Fetch mock API users + LocalStorage users as fallbacks
        const usersRes = await getUsers();
        const mockUsers = usersRes.users || [];
        
        let localEmp = [];
        let localUsers = [];
        try {
          localEmp = JSON.parse(localStorage.getItem('nirman_employees') || '[]');
          localUsers = JSON.parse(localStorage.getItem('nirman_users') || '[]');
        } catch (e) {
          console.warn("Error reading local users storage:", e);
        }

        // 3. Merge all user datasets cleanly using Map to avoid duplicate entries
        const userMap = new Map();

        const mergeList = (list) => {
          if (!Array.isArray(list)) return;
          list.forEach(u => {
            if (!u) return;
            const key = String(u.email || u.id || u._id || u.employeeId || u.name || '').toLowerCase();
            if (key && !userMap.has(key)) {
              userMap.set(key, u);
            }
          });
        };

        mergeList(backendUsers);
        mergeList(mockUsers);
        mergeList(localEmp);
        mergeList(localUsers);

        const users = Array.from(userMap.values());
        const siteRes = await getSiteLocations();
        const widgetRes = await getHRDashboardWidgets();

        const sites = siteRes.locations || [];
        setSitesList(sites);

        const clients = users.filter(u => {
          const r = String(u.role || u.designation || '').toLowerCase();
          return r.includes('client') || r.includes('customer');
        }).length || 2;
        
        const total = users.length || 6;
        const online = widgetRes.onlineCount || 2;
        
        // Fetch projects through project service so mock projects are initialized and correctly fetched
        let projects = [];
        try {
          const res = await getProjects();
          if (res && res.success && Array.isArray(res.projects)) {
            projects = res.projects;
          } else if (res && Array.isArray(res.data)) {
            projects = res.data;
          } else if (Array.isArray(res)) {
            projects = res;
          }
        } catch (projErr) {
          console.warn("Could not fetch projects through API in stats:", projErr);
        }

        if (projects.length === 0) {
          projects = JSON.parse(localStorage.getItem('nirman_projects') || '[]');
        }
        setProjectsList(projects);

        const pendingProjsCount = projects.filter(p => {
          const s = String(p.status || '').toLowerCase();
          return s !== 'completed' && s !== 'archived';
        }).length;

        setStats({
          totalUsers: total,
          activeClients: clients,
          activeSites: sites.length || 1,
          pendingProjects: pendingProjsCount || 2,
          onlineCount: online,
          usersList: users
        });
      } catch (err) {
        console.error("Error loading admin stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Compute initials for avatar pile
  const initialsList = stats.usersList.slice(0, 3).map(u => {
    const parts = (u.name || u.email || 'User').split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        
        {/* CARD 1: Total Employees */}
        <div 
          onClick={() => openModal('employees')}
          className="premium-stat-box p-5 flex flex-col justify-between h-36 cursor-pointer hover:border-indigo-405 hover:shadow-xs hover:-translate-y-0.5 active:scale-98 transition-all duration-200 group"
          title="Click to view all employees"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Employees</span>
              <h3 className="text-2xl font-black text-slate-808 group-hover:text-indigo-650 transition-colors tracking-tight">{stats.totalUsers}</h3>
            </div>
            <div className="p-2.5 bg-brand-tint rounded-xl text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {/* Dynamic employee initials avatar pile */}
            <div className="flex -space-x-2">
              {initialsList.map((init, idx) => (
                <div key={idx} className="w-5.5 h-5.5 rounded-full bg-[#8FC9FF] text-slate-900 border border-white flex items-center justify-center text-[8px] font-black font-sans">
                  {init}
                </div>
              ))}
              {stats.totalUsers > 3 && (
                <div className="w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-500 border border-white flex items-center justify-center text-[7px] font-bold">
                  +{stats.totalUsers - 3}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full tracking-wider uppercase">
                {stats.onlineCount} Online
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Total Happy Clients */}
        <div 
          onClick={() => openModal('clients')}
          className="premium-stat-box p-5 flex flex-col justify-between h-36 cursor-pointer hover:border-rose-405 hover:shadow-xs hover:-translate-y-0.5 active:scale-98 transition-all duration-200 group"
          title="Click to view all happy clients"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Happy Clients</span>
              <h3 className="text-2xl font-black text-slate-808 group-hover:text-rose-600 transition-colors tracking-tight">{stats.activeClients}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 group-hover:bg-rose-100 transition-colors">
              <Heart className="w-4.5 h-4.5 fill-rose-500/20" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {/* Mini 5-Star Rating block */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-[9px] font-black text-slate-700 ml-1">4.9/5</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full tracking-wider uppercase">100% Retention</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Active Sites */}
        <div 
          onClick={() => openModal('sites')}
          className="premium-stat-box p-5 flex flex-col justify-between h-36 cursor-pointer hover:border-amber-405 hover:shadow-xs hover:-translate-y-0.5 active:scale-98 transition-all duration-200 group"
          title="Click to view all active sites"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Sites</span>
              <h3 className="text-2xl font-black text-slate-808 group-hover:text-amber-600 transition-colors tracking-tight">{stats.activeSites}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-100 transition-colors">
              <HardHat className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="space-y-1 pt-1">
            {/* Milestone progress bar with pulsing radar dot */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full w-[74%]"></div>
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-450">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-slate-500">{stats.activeSites} Geofence Enabled</span>
              </div>
              <span className="text-[9px] font-black text-emerald-600 uppercase">On Schedule</span>
            </div>
          </div>
        </div>

        {/* CARD 4: Pending Projects */}
        <div 
          onClick={() => openModal('projects')}
          className="premium-stat-box p-5 flex flex-col justify-between h-36 cursor-pointer hover:border-indigo-405 hover:shadow-xs hover:-translate-y-0.5 active:scale-98 transition-all duration-200 group"
          title="Click to view all projects"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Projects</span>
              <h3 className="text-2xl font-black text-slate-808 group-hover:text-indigo-650 transition-colors tracking-tight">{stats.pendingProjects}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {/* Mini project count stats indicator */}
            <div className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-indigo-550" />
              <span className="text-[9px] font-black text-slate-600">Total {projectsList.length} Contracted</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-50 text-indigo-605 rounded-full tracking-wider uppercase">Active Tracker</span>
            </div>
          </div>
        </div>

      </div>

      {(() => {
        if (!activeModalType) return null;

        const rawEmployees = stats.usersList.filter(u => {
          const r = String(u.role || u.designation || '').toLowerCase();
          return !r.includes('client') && !r.includes('customer');
        });

        const clients = stats.usersList.filter(u => {
          const r = String(u.role || u.designation || '').toLowerCase();
          return r.includes('client') || r.includes('customer');
        });

        // Clean Employee Data mapping directly from backend users
        const realEmployees = stats.usersList
          .filter(u => {
            const r = String(u.role || u.designation || '').toLowerCase();
            return !r.includes('client') && !r.includes('customer');
          })
          .map((u, idx) => {
            const name = u.name || u.fullName || u.userName || u.email?.split('@')[0] || 'Employee Member';
            const rawRole = u.designation || u.roleName || u.jobTitle || (typeof u.role === 'object' ? (u.role?.roleName || u.role?.name || u.role?.roleCode) : u.role) || 'Staff Member';
            const roleStr = String(rawRole).toLowerCase();
            
            let dept = u.department || u.dept || u.deptName;
            if (!dept) {
              if (roleStr.includes('arch')) dept = 'Architecture';
              else if (roleStr.includes('site') || roleStr.includes('engine') || roleStr.includes('mep')) dept = 'Engineering';
              else if (roleStr.includes('pm') || roleStr.includes('project') || roleStr.includes('manager')) dept = 'Management';
              else if (roleStr.includes('hr')) dept = 'HR & Admin';
              else dept = 'Construction';
            }

            const isOnline = idx < stats.onlineCount;
            const status = u.status || (isOnline ? 'Online' : 'Offline');
            const empCode = u.employeeId || u.empCode || u.userCode || (u.id || u._id ? `EMP-${u.id || u._id}` : `EMP-${101 + idx}`);

            return {
              ...u,
              name,
              empCode,
              department: dept,
              designation: rawRole,
              status,
              rawIndex: idx
            };
          });

        // Filter Logic for Employees
        let filteredEmployees = realEmployees;
        
        if (activeModalType === 'employees') {
          if (modalSubFilter === 'Online') {
            filteredEmployees = filteredEmployees.filter(e => e.status === 'Online');
          }

          if (selectedEmpDept !== 'All') {
            filteredEmployees = filteredEmployees.filter(e => e.department === selectedEmpDept);
          }

          if (empSearchQuery.trim()) {
            const q = empSearchQuery.toLowerCase();
            filteredEmployees = filteredEmployees.filter(e => 
              e.name.toLowerCase().includes(q) ||
              e.email.toLowerCase().includes(q) ||
              e.designation.toLowerCase().includes(q) ||
              e.department.toLowerCase().includes(q) ||
              e.empCode.toLowerCase().includes(q)
            );
          }
        }

        // Color badge helper for departments
        const getDeptBadgeStyle = (dept) => {
          switch(dept) {
            case 'Architecture': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'Engineering': return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'Construction': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'HR & Admin': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Management': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
          }
        };

        const getAvatarBg = (idx) => {
          const colors = [
            'bg-indigo-600 text-white',
            'bg-blue-600 text-white',
            'bg-emerald-600 text-white',
            'bg-amber-600 text-white',
            'bg-rose-600 text-white',
            'bg-purple-600 text-white'
          ];
          return colors[idx % colors.length];
        };

        // Render CLEAN EMPLOYEE DIRECTORY MODAL
        if (activeModalType === 'employees') {
          const deptList = ['All', 'Architecture', 'Engineering', 'Construction', 'HR & Admin', 'Management'];

          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Registered Employees Roster
                        <span className="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                          {realEmployees.length} Total
                        </span>
                      </h2>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Active staff members, architects, site engineers and managers fetched from backend service.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveModalType(null)}
                    className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
                    title="Close Modal"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Search & Filters Controls */}
                <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                  
                  {/* Status Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                    <button
                      onClick={() => setModalSubFilter('All')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        modalSubFilter === 'All'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      All ({realEmployees.length})
                    </button>
                    <button
                      onClick={() => setModalSubFilter('Online')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        modalSubFilter === 'Online'
                          ? 'bg-white text-emerald-700 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Online ({realEmployees.filter(e => e.status === 'Online').length})
                    </button>
                  </div>

                  {/* Search Bar & Department Dropdown */}
                  <div className="flex items-center gap-2 flex-1 w-full sm:w-auto sm:max-w-md">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        value={empSearchQuery}
                        onChange={(e) => setEmpSearchQuery(e.target.value)}
                        placeholder="Search employee name, email, role..."
                        className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      {empSearchQuery && (
                        <button 
                          onClick={() => setEmpSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <select
                      value={selectedEmpDept}
                      onChange={(e) => setSelectedEmpDept(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      {deptList.map(d => (
                        <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>
                      ))}
                    </select>
                  </div>

                </div>

                {/* Table Content - ONLY Real Clean Columns */}
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                  {filteredEmployees.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-slate-500 text-xs font-semibold">No registered employees match the filter criteria.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[9.5px] font-black tracking-wider">
                            <th className="px-5 py-3.5">Employee Name & Code</th>
                            <th className="px-5 py-3.5">Department & Role</th>
                            <th className="px-5 py-3.5 text-right">Account Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredEmployees.map((emp) => (
                            <tr key={emp.id || emp.email || emp.empCode} className="hover:bg-slate-50/80 transition-colors">
                              
                              {/* 1. Name & Avatar */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-2xs ${getAvatarBg(emp.rawIndex)}`}>
                                    {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-slate-900 text-xs block">{emp.name}</span>
                                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] font-mono font-bold rounded">
                                        {emp.empCode}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-medium block">{emp.email}</span>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Department & Designation */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-block px-2.5 py-0.5 border text-[10px] font-bold rounded-lg ${getDeptBadgeStyle(emp.department)}`}>
                                    {emp.department}
                                  </span>
                                  <span className="text-xs font-bold text-slate-700">{emp.designation}</span>
                                </div>
                              </td>

                              {/* 3. Account Status */}
                              <td className="px-5 py-3.5 text-right">
                                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                  emp.status === 'Online' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                  {emp.status}
                                </span>
                              </td>

                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Displaying <strong>{filteredEmployees.length}</strong> registered employee accounts
                  </span>
                  <button
                    onClick={() => setActiveModalType(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Close Roster
                  </button>
                </div>

              </div>
            </div>
          );
        }

        let title = "";
        let subtitle = "";
        let data = [];
        let columns = [];
        let tabOptions = [];

        // Set Tab Options based on Card Type
        if (activeModalType === 'clients') {
          tabOptions = [
            { id: 'All', label: `All Clients (${clients.length})` },
            { id: 'Active', label: 'With Active Projects' }
          ];
        } else if (activeModalType === 'sites') {
          tabOptions = [
            { id: 'All', label: `All Sites (${sitesList.length || 1})` },
            { id: 'Active', label: 'Active GPS' },
            { id: 'Delayed', label: 'Delayed Sites (1)' }
          ];
        } else if (activeModalType === 'projects') {
          tabOptions = [
            { id: 'All', label: `All Projects (${projectsList.length})` },
            { id: 'Pending', label: `Pending (${stats.pendingProjects})` },
            { id: 'Completed', label: `Completed (${projectsList.length - stats.pendingProjects})` }
          ];
        }

        // Filter Data based on Selected Tab
        if (activeModalType === 'clients') {
          title = "Happy Client Profiles";
          subtitle = "Active client accounts linked to architectural contracts and billing files.";
          
          if (modalSubFilter === 'Active') {
            data = clients.filter(c => 
              projectsList.some(p => {
                const clientVal = String(p.clientInformation || p.client || '').toLowerCase();
                const clientName = String(c.name || '').toLowerCase();
                return clientVal.includes(clientName) || clientName.includes(clientVal);
              })
            );
          } else {
            data = clients;
          }

          columns = [
            { label: "Client & Company", render: (item) => (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-605 font-extrabold text-[11px]">
                  {(item.name || 'CL').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.companyName || 'Private Client'}</span>
                </div>
              </div>
            )},
            { label: "Email & Phone", render: (item) => (
              <div className="space-y-0.5">
                <span className="text-slate-600 font-semibold block">{item.email}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{item.phone || 'No phone'}</span>
              </div>
            )},
            { label: "Access Status", render: (item) => (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md">
                Enabled
              </span>
            )}
          ];
        } else if (activeModalType === 'sites') {
          title = "Construction Sites & Geofencing";
          subtitle = "Monitored sites coordinates and live delay alerts.";

          if (modalSubFilter === 'Delayed') {
            data = [
              {
                name: "Smart City Mall Site (Tower B)",
                address: "Plot 12, Commercial Sector 62, Noida",
                radiusMeters: 120,
                status: "Delayed",
                delayReason: "Awaiting structural clearance sign-off"
              }
            ];
          } else {
            data = sitesList.length > 0 ? sitesList : [
              {
                name: "Oceanic Luxury Villas Project",
                address: "Beach Road Sector 4, Visakhapatnam",
                radiusMeters: 150,
                status: "On Schedule"
              }
            ];
          }

          columns = [
            { label: "Site Location", render: (item) => (
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-extrabold text-[11px] ${
                  item.status === 'Delayed' 
                    ? 'bg-rose-50 text-rose-600 border-rose-200' 
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  ST
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">{item.name || item.projectName}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.address || 'GPS Geofenced'}</span>
                </div>
              </div>
            )},
            { label: "Geofence / Status Details", render: (item) => (
              <div className="space-y-0.5">
                <span className="text-slate-600 font-bold font-mono text-[11px] block">{item.radiusMeters || item.radius || '150'}m Radius</span>
                {item.delayReason && (
                  <span className="text-[9px] text-rose-500 font-semibold block">{item.delayReason}</span>
                )}
              </div>
            )},
            { label: "Tracking Status", render: (item) => (
              <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full ${
                item.status === 'Delayed' 
                  ? 'bg-rose-100 text-rose-700 animate-pulse' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-250'
              }`}>
                {item.status || 'Active GPS'}
              </span>
            )}
          ];
        } else if (activeModalType === 'projects') {
          title = "Nirman Project Registry";
          subtitle = "Database record of all registered, pending, and completed architectural projects.";

          if (modalSubFilter === 'Pending') {
            data = projectsList.filter(p => {
              const s = String(p.status || '').toLowerCase();
              return s !== 'completed' && s !== 'archived';
            });
          } else if (modalSubFilter === 'Completed') {
            data = projectsList.filter(p => {
              const s = String(p.status || '').toLowerCase();
              return s === 'completed' || s === 'archived';
            });
          } else {
            data = projectsList;
          }

          columns = [
            { label: "Project & Category", render: (item) => (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-[11px]">
                  PR
                </div>
                <div>
                  <span className="font-extrabold text-slate-800 text-xs block">{item.projectName || item.name}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.category || 'Architecture Design'}</span>
                </div>
              </div>
            )},
            { label: "Priority & Budget", render: (item) => (
              <div className="space-y-0.5">
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                  item.priority === 'High' || item.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {item.priority || 'Medium'}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold mt-1">₹{item.budget?.toLocaleString() || '0'}</span>
              </div>
            )},
            { label: "Lifecycle Status", render: (item) => (
              <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-md uppercase ${
                String(item.status).toLowerCase() === 'completed' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-indigo-50 text-indigo-705 border-indigo-200'
              }`}>
                {item.status || 'Active'}
              </span>
            )}
          ];
        }

        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
                  <span className="text-[11px] text-slate-450 block mt-0.5 font-normal">{subtitle}</span>
                </div>
                <button 
                  onClick={() => setActiveModalType(null)}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sub-Filters Tabs Bar (Dynamic & Reusable) */}
              {tabOptions.length > 0 && (
                <div className="flex border-b border-slate-100 bg-slate-50/50 px-6 py-2.5 gap-1.5 overflow-x-auto">
                  {tabOptions.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setModalSubFilter(tab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        modalSubFilter === tab.id
                          ? 'bg-slate-800 text-white shadow-3xs'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* List Content */}
              <div className="p-6 overflow-y-auto flex-1">
                {data.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    No items found in this section.
                  </div>
                ) : (
                  <div className="border border-slate-105 rounded-2xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-105 bg-slate-50 text-slate-400 uppercase text-[9px] font-black tracking-wider">
                          {columns.map((c, i) => (
                            <th key={i} className="px-4 py-3">{c.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {data.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40">
                            {columns.map((c, i) => (
                              <td key={i} className="px-4 py-3.5 align-middle">{c.render(item, idx)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setActiveModalType(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-3xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
