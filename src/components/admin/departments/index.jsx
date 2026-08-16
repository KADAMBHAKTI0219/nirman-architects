import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building, Search, Plus, Edit2, Trash2, CheckCircle, XCircle, 
  X, Filter, RefreshCw, AlertCircle, Calendar
} from 'lucide-react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../../service/departments';
import { useToast } from '../../../context/ToastContext';

const INITIAL_DEPARTMENTS_FALLBACK = [
  { _id: 'DEP-01', name: 'Architecture & Design', isActive: true, createdAt: '2024-01-15' },
  { _id: 'DEP-02', name: 'Structural Engineering', isActive: true, createdAt: '2024-01-18' },
  { _id: 'DEP-03', name: 'Project Management', isActive: true, createdAt: '2024-02-01' },
  { _id: 'DEP-04', name: 'Site Operations & Supervision', isActive: true, createdAt: '2024-02-10' },
  { _id: 'DEP-05', name: 'Human Resources', isActive: true, createdAt: '2024-01-10' },
  { _id: 'DEP-06', name: 'Accounts & Finance', isActive: true, createdAt: '2024-01-12' },
  { _id: 'DEP-07', name: 'IT & Systems', isActive: true, createdAt: '2024-03-01' },
  { _id: 'DEP-08', name: 'Client Relations & Marketing', isActive: false, createdAt: '2024-03-15' }
];

export default function DepartmentsPage() {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Deactivated'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deptNameInput, setDeptNameInput] = useState('');
  const [statusInput, setStatusInput] = useState('Active'); // 'Active' or 'Deactivated'
  const [nameError, setNameError] = useState('');

  // Fetch departments directly from backend API
  const fetchDepartmentsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      let rawList = [];

      if (res && res.departments && Array.isArray(res.departments)) {
        rawList = res.departments;
      } else if (res && res.data && Array.isArray(res.data)) {
        rawList = res.data;
      } else if (Array.isArray(res)) {
        rawList = res;
      }

      const normalized = rawList.map(d => ({
        _id: d._id || d.id,
        name: typeof d === 'string' ? d : (d.name || d.departmentName || d.title || 'Unnamed Department'),
        isActive: d.isActive !== undefined ? d.isActive : (d.status === 'Active' || d.status !== 'Inactive'),
        createdAt: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Aug 2026',
        rawCreatedAt: d.createdAt || new Date().toISOString()
      }));
      setDepartments(normalized);
    } catch (err) {
      console.warn("Failed to fetch departments from server:", err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentsData();
  }, [fetchDepartmentsData]);

  // Dynamic search & status filtering
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(dept._id).toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'Active') matchesStatus = dept.isActive === true;
    if (statusFilter === 'Deactivated') matchesStatus = dept.isActive === false;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage) || 1;
  const paginatedDepts = filteredDepartments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Modal Open Handlers
  const handleOpenAddModal = () => {
    setDeptNameInput('');
    setStatusInput('Active');
    setNameError('');
    setIsEditing(false);
    setSelectedDept(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (dept) => {
    setSelectedDept(dept);
    setDeptNameInput(dept.name);
    setStatusInput(dept.isActive ? 'Active' : 'Deactivated');
    setNameError('');
    setIsEditing(true);
    setShowAddModal(true);
  };

  // Form Submit Handler (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const trimmed = deptNameInput.trim();
    if (!trimmed) {
      setNameError('Department name is required.');
      return;
    }

    setSubmitting(true);
    setNameError('');
    try {
      if (isEditing && selectedDept) {
        await updateDepartment(selectedDept._id, { name: trimmed });
        showToast(`Department "${trimmed}" updated successfully`, 'success');
      } else {
        await createDepartment({ name: trimmed });
        showToast(`Department "${trimmed}" created successfully`, 'success');
      }

      setShowAddModal(false);
      // Reload live department list from backend API
      await fetchDepartmentsData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Action failed';
      setNameError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Toggle Handler
  const handleToggleStatus = async (id, currentStatus, name) => {
    const newStatus = !currentStatus;
    try {
      if (!newStatus) {
        await deleteDepartment(id);
      } else {
        await updateDepartment(id, { isActive: true });
      }
    } catch (err) {
      console.warn("Status toggle API notice:", err);
    }
    setDepartments(prev => prev.map(d => d._id === id ? { ...d, isActive: newStatus } : d));
    showToast(`Department "${name}" status updated to ${newStatus ? 'Active' : 'Deactivated'}`, 'info');
  };

  const activeCount = departments.filter(d => d.isActive).length;
  const deactivatedCount = departments.filter(d => !d.isActive).length;

  return (
    <div className="space-y-6 text-left font-sans animate-in fade-in duration-200">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-brand-soft text-[#3B82F6] rounded-xl border border-brand-primary/40">
              <Building className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Departments Directory</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage company departments and active organizational units dynamically via backend APIs.
          </p>
        </div>

        {/* ADD DEPARTMENT BUTTON WITH BRAND-PRIMARY & BRAND-SECONDARY GRADIENT */}
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-primary via-[#A6D5FF] to-brand-secondary hover:brightness-105 text-slate-900 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0 border border-brand-secondary/60"
        >
          <Plus className="w-4 h-4 text-slate-900" />
          <span>Add Department</span>
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
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Departments</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{departments.length}</span>
          </div>
          <div className="p-3 bg-brand-soft text-[#3B82F6] rounded-2xl border border-brand-primary/30">
            <Building className="w-6 h-6" />
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
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Departments</span>
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
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Deactivated Departments</span>
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
            placeholder="Search department name..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50 focus:border-brand-secondary bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* REFRESH BUTTON */}
          <button
            onClick={fetchDepartmentsData}
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

      {/* 4. Data Table with Left-Aligned Name Column & Centered Headers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6 text-left">DEPARTMENT NAME</th>
                <th className="py-4 px-4 text-center">STATUS</th>
                <th className="py-4 px-4 text-center">CREATED AT</th>
                <th className="py-4 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#3B82F6] mb-2" />
                    <p className="text-xs font-bold text-slate-600">Loading departments from server...</p>
                  </td>
                </tr>
              ) : paginatedDepts.length > 0 ? (
                paginatedDepts.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* FIRST COLUMN: DEPARTMENT NAME (LEFT-ALIGNED DATA & HEADER) */}
                    <td className="py-4 px-6 text-left align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary/40 to-brand-secondary/50 border border-brand-secondary/60 flex items-center justify-center font-black text-slate-900 text-xs shrink-0 shadow-3xs">
                          {dept.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong className="font-black text-slate-900 block text-xs tracking-tight">{dept.name}</strong>
                        </div>
                      </div>
                    </td>

                    {/* STATUS BADGE (DEACTIVATED INSTEAD OF INACTIVE) */}
                    <td className="py-4 px-4 text-center align-middle">
                      <button
                        onClick={() => handleToggleStatus(dept._id, dept.isActive, dept.name)}
                        title="Click to toggle status"
                        className="cursor-pointer transition-all hover:scale-105"
                      >
                        {dept.isActive ? (
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

                    {/* CREATED AT DATE */}
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px] text-center align-middle">
                      <div className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dept.createdAt}</span>
                      </div>
                    </td>

                    {/* ACTIONS: ONLY EDIT DEPARTMENT BUTTON */}
                    <td className="py-4 px-4 text-center align-middle">
                      <div className="flex items-center justify-center">
                        
                        {/* EDIT DEPARTMENT BUTTON WITH BRAND STYLING & TOOLTIP */}
                        <div className="relative group">
                          <button
                            onClick={() => handleOpenEditModal(dept)}
                            className="p-2.5 bg-gradient-to-r from-brand-primary/40 to-brand-secondary/40 hover:from-brand-primary hover:to-brand-secondary text-slate-900 border border-brand-secondary/50 rounded-xl transition-all shadow-4xs flex items-center justify-center font-black cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4 text-slate-900" />
                          </button>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all">
                            <span className="px-3 py-1 bg-brand-secondary text-slate-900 text-[10px] font-black rounded-lg whitespace-nowrap shadow-md">
                              Edit Department
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
                    <Building className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No departments found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting search or add a new department.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {!loading && filteredDepartments.length > 0 && (
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
            <div>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDepartments.length)} of {filteredDepartments.length} departments
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

      {/* 5. ADD / EDIT DEPARTMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-brand-soft text-[#3B82F6] rounded-xl border border-brand-primary/40">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {isEditing ? 'Edit Department Name' : 'Create New Department'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Department Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={deptNameInput}
                  onChange={(e) => setDeptNameInput(e.target.value)}
                  placeholder="e.g. Architecture & Design"
                  className={`w-full px-3.5 py-2.5 border rounded-xl focus:ring-2 bg-slate-50/50 font-semibold ${
                    nameError ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-brand-secondary/40 focus:border-brand-secondary'
                  }`}
                />
                {nameError && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{nameError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">Department Status</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-secondary/40 focus:border-brand-secondary bg-white font-bold cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {isEditing && selectedDept && selectedDept.isActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleStatus(selectedDept._id, true, selectedDept.name);
                      setShowAddModal(false);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Deactivate</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
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
                    <span>{isEditing ? 'Save Changes' : 'Create Department'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
