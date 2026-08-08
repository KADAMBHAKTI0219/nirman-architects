import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Search, AlertTriangle, Eye, X, BookOpen, Clock, ChevronRight, Phone, Mail, Plus, RefreshCw
} from 'lucide-react';
import Card from '../../common/Card';
import { getUsersList } from '../../../service/auth';

export default function Team() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedMember, setSelectedMember] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersList();
      if (res && res.success && Array.isArray(res.users)) {
        const mapped = res.users.map((u, idx) => {
          const nameStr = typeof u.name === 'string' ? u.name : (typeof u.fullName === 'string' ? u.fullName : (typeof u.email === 'string' ? u.email : 'Team Member'));
          const roleStr = typeof u.role === 'string' ? u.role : (typeof u.roleName === 'string' ? u.roleName : (u.role && typeof u.role === 'object' ? (u.role.roleName || u.role.name || 'Architect') : 'Architect'));
          return {
            id: u._id || u.id || `EMP-${idx + 101}`,
            name: nameStr,
            role: roleStr,
            dept: (u.department && typeof u.department === 'object') ? u.department.name : (u.department || 'Architecture'),
            availability: u.isActive !== false ? 'Available' : 'On Leave',
            workload: 75,
            tasks: 1,
            phone: u.phone || '+91 98765 00000',
            email: typeof u.email === 'string' ? u.email : 'user@nirman.com',
            schedule: { Mon: "Office", Tue: "Office", Wed: "Office", Thu: "Office", Fri: "Office" }
          };
        });
        setTeam(mapped);
        if (mapped.length > 0) setSelectedMember(mapped[0]);
      }
    } catch (err) {
      console.warn("Failed to fetch team users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = team.filter(t => {
    const matchesSearch = (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || t.dept === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200 pb-16 w-full max-w-[1400px] mx-auto">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            PM Team Roster & Resource Planning
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-normal">
            Real-time employee workload allocation, availability status & site assignments
          </p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search member name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-brand-primary/30 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Architecture">Architecture</option>
            <option value="Engineering">Engineering</option>
          </select>
          <button
            onClick={fetchUsers}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
          <p className="text-xs font-normal">Loading team roster from backend database...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* TEAM LIST LEDGER */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map(member => (
              <div 
                key={member.id}
                onClick={() => { setSelectedMember(member); setDrawerOpen(true); }}
                className={`p-4 bg-white rounded-3xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  selectedMember?.id === member.id 
                    ? 'border-brand-primary ring-2 ring-brand-primary/20 shadow-md' 
                    : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-soft text-slate-900 font-semibold text-sm flex items-center justify-center border border-brand-secondary/40">
                    {member.name.split(' ').map(n=>n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{member.name}</h3>
                    <span className="text-xs text-slate-500 font-normal">{member.role} &bull; {member.dept}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                    member.availability === 'Available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {member.availability}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>

          {/* MEMBER DRAWER DETAILS */}
          {selectedMember && drawerOpen && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-5 h-fit sticky top-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">{selectedMember.id}</span>
                  <h2 className="text-lg font-semibold text-slate-900">{selectedMember.name}</h2>
                  <span className="text-xs text-slate-500 font-normal">{selectedMember.role}</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
              </div>

              <div className="space-y-3 text-xs font-normal">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Contact Info</span>
                  <p className="text-slate-800 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedMember.email}
                  </p>
                  <p className="text-slate-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedMember.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90 p-8 font-normal">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No team members match search query.</p>
        </div>
      )}

    </div>
  );
}
