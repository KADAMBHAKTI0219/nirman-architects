import React, { useState, useEffect } from 'react';
import { 
  Shield, Search, Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, 
  X, Filter, RefreshCw, Key
} from 'lucide-react';
import { getRoles, createRole } from '../../../service/auth';
import { useToast } from '../../../context/ToastContext';

const DEFAULT_ROLES_FALLBACK = [
  { _id: 'r1', roleName: 'Super Admin', roleCode: 'SUPER_ADMIN', description: 'Full system control, database access, security master, and global administrative actions.', isActive: true },
  { _id: 'r2', roleName: 'HR Manager', roleCode: 'HR', description: 'Employee onboarding, attendance tracking, biometric binding, leaves, and payroll management.', isActive: true },
  { _id: 'r3', roleName: 'Project Manager', roleCode: 'PROJECT_MANAGER', description: 'Project scheduling, task assignment, site approvals, contractor coordination, and progress audits.', isActive: true },
  { _id: 'r4', roleName: 'Architect', roleCode: 'ARCHITECT', description: 'Building designs, CAD drafting, 3D Revit modeling, and GFC drawing approvals.', isActive: true },
  { _id: 'r5', roleName: 'Site Engineer', roleCode: 'SITE_ENGINEER', description: 'On-site execution, labor supervision, site attendance logging, and quality checks.', isActive: true },
  { _id: 'r6', roleName: 'Office Employee', roleCode: 'EMPLOYEE', description: 'Standard employee portal access for task tracking, personal attendance, and leave requests.', isActive: true },
  { _id: 'r7', roleName: 'Client Customer', roleCode: 'CLIENT', description: 'Client portal access for tracking project timelines, 3D views, and support chat.', isActive: true }
];

export default function RoleMasterPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Deactivated'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    roleName: '',
    roleCode: '',
    description: '',
    isActive: true
  });

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRoles();
      let list = [];
      if (res && res.success && Array.isArray(res.roles)) {
        list = res.roles;
      } else if (Array.isArray(res)) {
        list = res;
      }

      if (list.length > 0) {
        setRoles(list.map(r => ({
          ...r,
          isActive: r.isActive !== undefined ? r.isActive : true
        })));
      } else {
        setRoles(DEFAULT_ROLES_FALLBACK);
      }
    } catch (err) {
      console.warn("Error loading roles:", err);
      setRoles(DEFAULT_ROLES_FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({ roleName: '', roleCode: '', description: '', isActive: true });
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roleName.trim()) {
      showToast('Role Name is required', 'error');
      return;
    }

    const cleanCode = (formData.roleCode.trim() || formData.roleName.trim()).toUpperCase().replace(/\s+/g, '_');

    setSubmitting(true);
    try {
      const res = await createRole({
        roleName: formData.roleName.trim(),
        roleCode: cleanCode,
        description: formData.description.trim()
      });

      const newRole = {
        _id: res?._id || `r_${Date.now()}`,
        roleName: formData.roleName.trim(),
        roleCode: cleanCode,
        description: formData.description.trim() || 'System access role definition.',
        isActive: formData.isActive
      };

      setRoles(prev => [newRole, ...prev]);
      showToast(`Role "${formData.roleName}" created successfully!`, 'success');
      setShowAddModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Error creating role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (roleObj) => {
    const updatedStatus = !roleObj.isActive;
    setRoles(prev => prev.map(r => (r._id === roleObj._id || r.roleCode === roleObj.roleCode) ? { ...r, isActive: updatedStatus } : r));
    showToast(`Role "${roleObj.roleName || roleObj.name}" status set to ${updatedStatus ? 'Active' : 'Deactivated'}`, 'info');
  };

  const filteredRoles = roles.filter(r => {
    const rName = (r.roleName || r.name || '').toLowerCase();
    const rCode = (r.roleCode || r.code || '').toLowerCase();
    const rDesc = (r.description || '').toLowerCase();
    const q = searchTerm.toLowerCase();

    const matchesSearch = rName.includes(q) || rCode.includes(q) || rDesc.includes(q);
    
    let matchesStatus = true;
    if (statusFilter === 'Active') matchesStatus = r.isActive !== false;
    if (statusFilter === 'Deactivated') matchesStatus = r.isActive === false;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage) || 1;
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const activeCount = roles.filter(r => r.isActive !== false).length;
  const deactivatedCount = roles.filter(r => r.isActive === false).length;

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-brand-soft text-[#3B82F6] rounded-xl border border-brand-primary/40">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Role Master</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Define system roles, access levels, and RBAC permissions across the ERP application.
          </p>
        </div>

        {/* ADD ROLE BUTTON WITH BRAND-PRIMARY & BRAND-SECONDARY GRADIENT */}
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-primary via-[#A6D5FF] to-brand-secondary hover:brightness-105 text-slate-900 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 border border-brand-secondary/60"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>Add System Role</span>
        </button>
      </div>

      {/* 2. Interactive Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'All'
              ? 'bg-white border-brand-secondary ring-2 ring-brand-primary/40 shadow-xs'
              : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total System Roles</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{roles.length}</span>
          </div>
          <div className="p-3 bg-brand-soft text-[#3B82F6] rounded-2xl border border-brand-primary/30">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => { setStatusFilter('Active'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'Active'
              ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 shadow-2xs hover:border-emerald-200'
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Roles</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {activeCount}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div 
          onClick={() => { setStatusFilter('Deactivated'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            statusFilter === 'Deactivated'
              ? 'bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200/80 shadow-2xs hover:border-rose-200'
          }`}
        >
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Deactivated Roles</span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">{deactivatedCount}</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search role name or code..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* REFRESH BUTTON */}
          <button
            onClick={loadRoles}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-soft hover:bg-brand-primary/40 text-slate-900 border border-brand-primary/50 font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-4xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3B82F6] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Deactivated">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* 4. Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#3B82F6]" />
            <span>Loading System Roles from Backend...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">ROLE NAME & CODE</th>
                  <th className="py-4 px-5 text-left">DESCRIPTION / PERMISSIONS SCOPE</th>
                  <th className="py-4 px-4 text-center">STATUS</th>
                  <th className="py-4 px-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedRoles.length > 0 ? (
                  paginatedRoles.map((role, idx) => (
                    <tr key={role._id || role.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* FIRST COLUMN: ROLE NAME & CODE (LEFT-ALIGNED DATA & HEADER) */}
                      <td className="py-4 px-6 text-left align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/40 to-brand-secondary/50 border border-brand-secondary/60 flex items-center justify-center font-black text-slate-900 text-xs shrink-0 shadow-3xs">
                            <Shield className="w-4 h-4 text-[#3B82F6]" />
                          </div>
                          <div>
                            <strong className="font-black text-slate-900 block text-xs tracking-tight">{role.roleName || role.name}</strong>
                            <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-block mt-0.5">
                              {role.roleCode || role.code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DESCRIPTION / ACCESS SCOPE */}
                      <td className="py-4 px-5 text-slate-600 text-left align-middle font-medium max-w-sm leading-relaxed">
                        {role.description || 'System access role definition and RBAC scope.'}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="py-4 px-4 text-center align-middle">
                        <button
                          onClick={() => handleToggleStatus(role)}
                          title="Click to toggle status"
                          className="cursor-pointer transition-all hover:scale-105"
                        >
                          {role.isActive !== false ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200/80 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                              Deactivated
                            </span>
                          )}
                        </button>
                      </td>

                      {/* ACTIONS: VIEW ROLE DETAILS BUTTON WITH BRAND-PRIMARY AND BRAND-SECONDARY STYLING */}
                      <td className="py-4 px-4 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <div className="relative group">
                            <button
                              onClick={() => { setSelectedRole(role); setShowViewModal(true); }}
                              className="p-2.5 bg-gradient-to-r from-brand-primary/40 to-brand-secondary/40 hover:from-brand-primary hover:to-brand-secondary text-slate-900 border border-brand-secondary/50 rounded-xl transition-all shadow-4xs flex items-center justify-center font-black cursor-pointer"
                            >
                              <Eye className="w-4 h-4 text-slate-900" />
                            </button>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all">
                              <span className="px-3 py-1 bg-brand-secondary text-slate-900 text-[10px] font-black rounded-lg whitespace-nowrap shadow-md">
                                View Role Details
                              </span>
                              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-brand-secondary"></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <Shield className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-600">No system roles found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && filteredRoles.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRoles.length)} of {filteredRoles.length} system roles
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-slate-700 cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-slate-900 shadow-xs border border-brand-secondary/60'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold text-slate-700 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. ADD SYSTEM ROLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-brand-soft text-[#3B82F6] rounded-xl border border-brand-primary/40">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Add New System Role</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Role Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                  placeholder="e.g. Senior Architectural Lead"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary/40 focus:border-brand-secondary bg-slate-50/50 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Role Code (Uppercase)</label>
                <input
                  type="text"
                  value={formData.roleCode}
                  onChange={(e) => setFormData({ ...formData, roleCode: e.target.value })}
                  placeholder="e.g. SENIOR_ARCHITECT"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary/40 focus:border-brand-secondary bg-slate-50/50 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Description / Access Scope</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe access privileges and permissions..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary/40 focus:border-brand-secondary bg-slate-50/50 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-slate-900 font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 border border-brand-secondary/60 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Create Role</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. VIEW ROLE DETAILS MODAL */}
      {showViewModal && selectedRole && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-soft text-[#3B82F6] rounded-xl border border-brand-primary/40 font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedRole.roleName || selectedRole.name}</h3>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-block mt-0.5">
                    {selectedRole.roleCode || selectedRole.code}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">System Status</span>
                <p className="font-bold text-emerald-600">
                  {selectedRole.isActive !== false ? 'Active System Role' : 'Deactivated Role'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Description & Access Scope</span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {selectedRole.description || 'System access role definition and RBAC scope.'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
