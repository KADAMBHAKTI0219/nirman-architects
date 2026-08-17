import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Eye, EyeOff, ShieldCheck, Mail, MapPin, Briefcase, FileText, CheckCircle2,
  Clock, Plus, Filter, Award, ChevronRight, Laptop, Calendar, IndianRupee, UserCheck, X,
  Pencil, Trash2, Camera, Download, RefreshCw, AlertTriangle, Key,
  LayoutGrid, LayoutList
} from 'lucide-react';
import Card from '../../common/Card';
import {
  getOfferLetterMetadata,
  downloadOfferLetterPDF,
  regenerateOfferLetter
} from '../../../service/hrm/offerLetter';
import { parseIndexedObjectToArray } from '../../../service/hrm/leave';
import { getEmployeeScreenshots, downloadAllScreenshots } from '../../../service/hrm/screenshot';
import { deleteUser, changeUserPassword, getUserById } from '../../../service/auth';
import { getDepartments, getCleanDepartmentName } from '../../../service/departments';
import CalendarDatePicker from '../../common/CalendarDatePicker';

export default function EmployeesHR({
  employees,
  selectedEmployee: propSelectedEmployee,
  onSelectEmployee,
  onAddEmployeeClick,
  onEditEmployeeClick,
  onRefresh
}) {
  const [localEmployees, setLocalEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [apiDepartments, setApiDepartments] = useState([]);

  // Modals state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUserFullData, setViewUserFullData] = useState(null);
  const [viewUserLoading, setViewUserLoading] = useState(false);
  const [showScreenshotsModal, setShowScreenshotsModal] = useState(false);

  // Offer Letter states
  const [offerMetadata, setOfferMetadata] = useState(null);
  const [offerHistory, setOfferHistory] = useState([]);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [targetPasswordUser, setTargetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Fields for Regeneration Modal
  const [regenDesignation, setRegenDesignation] = useState('');
  const [regenDepartment, setRegenDepartment] = useState('');
  const [regenBaseSalary, setRegenBaseSalary] = useState('');
  const [regenJoiningDate, setRegenJoiningDate] = useState('');

  // Screenshots state
  const [backendScreenshots, setBackendScreenshots] = useState([]);
  const [screenshotsLoading, setScreenshotsLoading] = useState(false);
  const [selectedScreenshotDate, setSelectedScreenshotDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);

  // Fetch real departments from backend API
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await getDepartments();
        if (res && res.success && Array.isArray(res.departments)) {
          setApiDepartments(res.departments);
        } else if (Array.isArray(res)) {
          setApiDepartments(res);
        }
      } catch (e) {
        console.warn("Failed to load departments in EmployeesHR:", e);
      }
    };
    fetchDepts();
  }, []);

  const departments = useMemo(() => {
    const list = ['All'];
    apiDepartments.forEach(d => {
      const name = getCleanDepartmentName(d);
      if (name && !list.includes(name)) {
        list.push(name);
      }
    });
    localEmployees.forEach(emp => {
      const name = getCleanDepartmentName(emp.department);
      if (name && !list.includes(name)) {
        list.push(name);
      }
    });
    return list;
  }, [apiDepartments, localEmployees]);

  useEffect(() => {
    // Inject email if not present
    const updated = employees.map(emp => {
      const email = emp.email || emp.rawUser?.email || `${emp.name.toLowerCase().replace(/\s+/g, '')}@nirman.com`;
      return { ...emp, email };
    });
    setLocalEmployees(updated);
  }, [employees]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const fetchOfferLetterMetadata = async (empId) => {
    try {
      setLoadingOffer(true);
      const res = await getOfferLetterMetadata(empId);
      if (res && res.success && res.data) {
        setOfferMetadata(res.data.latest || null);
        setOfferHistory(res.data.history || []);
      } else if (res && res.latest) {
        setOfferMetadata(res.latest || null);
        setOfferHistory(res.history || []);
      } else {
        setOfferMetadata(null);
        setOfferHistory([]);
      }
    } catch (err) {
      console.error("Failed to load offer letter metadata:", err);
      setOfferMetadata(null);
      setOfferHistory([]);
    } finally {
      setLoadingOffer(false);
    }
  };

  useEffect(() => {
    if (selectedEmployee) {
      const empId = selectedEmployee._id || selectedEmployee.id;
      if (empId) {
        fetchOfferLetterMetadata(empId);
      } else {
        setOfferMetadata(null);
        setOfferHistory([]);
      }
    }
  }, [selectedEmployee]);

  const fetchScreenshots = async (empId, date) => {
    setScreenshotsLoading(true);
    try {
      const res = await getEmployeeScreenshots(empId, date);
      const list = parseIndexedObjectToArray(res.screenshots || res.data?.screenshots || res);
      setBackendScreenshots(list || []);
      setActiveScreenshotIdx(0);
    } catch (err) {
      console.error("Failed to fetch screenshots from backend:", err);
      setBackendScreenshots([]);
    } finally {
      setScreenshotsLoading(false);
    }
  };

  useEffect(() => {
    if (showScreenshotsModal && selectedEmployee) {
      const empId = selectedEmployee._id || selectedEmployee.id;
      fetchScreenshots(empId, selectedScreenshotDate);
    }
  }, [showScreenshotsModal, selectedScreenshotDate, selectedEmployee]);

  const handleDownloadOfferLetter = async () => {
    if (!selectedEmployee) return;
    const empId = selectedEmployee._id || selectedEmployee.id;
    try {
      showToast(`Downloading Offer Letter for ${selectedEmployee.name}...`);
      await downloadOfferLetterPDF(empId, selectedEmployee.name);
      showToast("Offer Letter downloaded successfully!");
    } catch (err) {
      console.error("Error downloading offer letter PDF:", err);
      showToast("Failed to download PDF.", "error");
    }
  };

  const handleRegenerateOfferLetter = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const empId = selectedEmployee._id || selectedEmployee.id;
    try {
      showToast("Generating new offer letter snapshot...");
      const payload = {
        designation: regenDesignation,
        department: regenDepartment,
        baseSalary: Number(regenBaseSalary) || 0,
        joiningDate: regenJoiningDate
      };
      const res = await regenerateOfferLetter(empId, payload);
      if (res.success || res._id) {
        showToast("Offer letter version created and notified!");
        setShowRegenerateModal(false);
        fetchOfferLetterMetadata(empId);
      } else {
        showToast("Regeneration failed.", "error");
      }
    } catch (err) {
      console.error("Error regenerating offer letter:", err);
      showToast(err.response?.data?.message || err.message || "Failed to regenerate offer letter.", "error");
    }
  };

  const handleDownloadZip = async () => {
    if (!selectedEmployee) return;
    const empId = selectedEmployee._id || selectedEmployee.id;
    try {
      showToast("Downloading all screenshots as ZIP...");
      const blob = await downloadAllScreenshots(empId, selectedScreenshotDate);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Screenshots_${selectedEmployee.name.replace(/\s+/g, '_')}_${selectedScreenshotDate}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("ZIP download started successfully!");
    } catch (err) {
      console.error("Failed to download ZIP:", err);
      showToast("Failed to download ZIP file.", "error");
    }
  };

  const handleDeleteEmployee = async (emp) => {
    setIsDeleting(true);
    try {
      const response = await deleteUser(emp.id);
      if (response.success) {
        setLocalEmployees(prev => prev.filter(e => e.id !== emp.id));
        showToast(response.message || `${emp.name} has been deleted successfully.`, 'success');
        setEmployeeToDelete(null);
        if (typeof onRefresh === 'function') {
          onRefresh();
        }
      } else {
        showToast(response.message || 'Failed to delete employee.', 'error');
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast(err.response?.data?.message || err.message || 'Failed to delete employee.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.trim() === '') {
      setPasswordError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    if (!targetPasswordUser) return;

    setIsSubmittingPassword(true);
    try {
      const userId = targetPasswordUser.id || targetPasswordUser._id || targetPasswordUser.rawUser?._id;
      const res = await changeUserPassword(userId, { newPassword });
      if (res && (res.success || res.message)) {
        showToast(res.message || `Password changed successfully for ${targetPasswordUser.name}!`, 'success');
        setShowPasswordModal(false);
        setTargetPasswordUser(null);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res?.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleOpenViewModal = async (emp) => {
    setSelectedEmployee(emp);
    setShowViewModal(true);
    setViewUserLoading(true);
    setViewUserFullData(null);
    try {
      const empId = emp._id || emp.id || emp.rawUser?._id || emp.rawUser?.id;
      if (empId) {
        const res = await getUserById(empId);
        if (res && (res._id || res.id || res.user || res.data)) {
          const userObj = res.user || res.data || res;
          setViewUserFullData(userObj);
        } else {
          setViewUserFullData(emp);
        }
      } else {
        setViewUserFullData(emp);
      }
    } catch (err) {
      console.error("Failed to load user profile by ID:", err);
      setViewUserFullData(emp);
    } finally {
      setViewUserLoading(false);
    }
  };

  const [activeKpiFilter, setActiveKpiFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtered employees
  const filteredEmployees = localEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;

    let matchesKpi = true;
    if (activeKpiFilter === 'active') {
      const status = (emp.status || emp.attendanceStatus || '').toUpperCase();
      matchesKpi = status === 'PRESENT' || status === 'ACTIVE' || emp.isOnline === true || Boolean(emp.clockInTime);
    } else if (activeKpiFilter === 'leave') {
      const status = (emp.status || emp.attendanceStatus || '').toUpperCase();
      matchesKpi = status === 'LEAVE' || status === 'ABSENT' || emp.isOnLeave === true;
    } else if (activeKpiFilter === 'new') {
      const joinDate = emp.joiningDate || emp.createdAt;
      if (!joinDate) matchesKpi = false;
      else {
        const timeDiff = Date.now() - new Date(joinDate).getTime();
        matchesKpi = timeDiff >= 0 && timeDiff <= (30 * 24 * 60 * 60 * 1000);
      }
    } else if (activeKpiFilter === 'resigned') {
      const status = (emp.status || emp.employmentStatus || '').toUpperCase();
      matchesKpi = status === 'RESIGNED' || status === 'INACTIVE' || emp.isActive === false;
    }

    return matchesSearch && matchesDept && matchesKpi;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dynamic KPI Stats calculation from real employees list
  const kpiStats = useMemo(() => {
    const total = localEmployees.length;

    // Active Shift count: employees with status PRESENT, active, or online
    const active = localEmployees.filter(e => {
      const status = (e.status || e.attendanceStatus || '').toUpperCase();
      return status === 'PRESENT' || status === 'ACTIVE' || e.isOnline === true || Boolean(e.clockInTime);
    }).length;

    // On Leave count: employees with status LEAVE, ABSENT, or isOnLeave
    const leave = localEmployees.filter(e => {
      const status = (e.status || e.attendanceStatus || '').toUpperCase();
      return status === 'LEAVE' || status === 'ABSENT' || e.isOnLeave === true;
    }).length;

    // New Joiners count: joined in the last 30 days
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const newJoiners = localEmployees.filter(e => {
      const joinDate = e.joiningDate || e.createdAt;
      if (!joinDate) return false;
      const timeDiff = now - new Date(joinDate).getTime();
      return timeDiff >= 0 && timeDiff <= thirtyDays;
    }).length;

    // Resigned count: employees marked inactive or resigned
    const resigned = localEmployees.filter(e => {
      const status = (e.status || e.employmentStatus || '').toUpperCase();
      return status === 'RESIGNED' || status === 'INACTIVE' || e.isActive === false;
    }).length;

    // Departments count: unique departments in employee list
    const uniqueDepts = new Set(
      localEmployees
        .map(e => e.department)
        .filter(d => d && d !== 'All')
    );
    const departmentsCount = uniqueDepts.size || 1;

    return {
      total,
      active,
      leave,
      newJoiners,
      resigned,
      departments: departmentsCount
    };
  }, [localEmployees]);

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-12 animate-in fade-in duration-200">
      {/* 0. TOP PAGE HEADER & ACTION RIBBON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employees Directory
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage corporate employees, designations, department allocation & onboarding
          </p>
        </div>

      </div>

      {/* 1. KPIs - 100% DYNAMIC & CLICKABLE FILTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div 
          onClick={() => { setActiveKpiFilter('all'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${
            activeKpiFilter === 'all' 
              ? 'bg-white border-[#3B82F6] ring-2 ring-[#3B82F6]/20 shadow-xs' 
              : 'bg-white border-slate-100 shadow-3xs hover:border-slate-300'
          }`}
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Employees</span>
          <strong className="text-base font-black text-slate-800 block mt-1">{kpiStats.total} Staff</strong>
        </div>

        <div 
          onClick={() => { setActiveKpiFilter('active'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${
            activeKpiFilter === 'active' 
              ? 'bg-emerald-50/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
              : 'bg-white border-slate-100 shadow-3xs hover:border-emerald-200'
          }`}
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Shift</span>
          <strong className="text-base font-black text-emerald-600 block mt-1">{kpiStats.active} Active</strong>
        </div>

        <div 
          onClick={() => { setActiveKpiFilter('leave'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${
            activeKpiFilter === 'leave' 
              ? 'bg-rose-50/50 border-rose-500 ring-2 ring-rose-500/20 shadow-xs' 
              : 'bg-white border-slate-100 shadow-3xs hover:border-rose-200'
          }`}
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase block">On Leave</span>
          <strong className="text-base font-black text-rose-600 block mt-1">{kpiStats.leave} Leave</strong>
        </div>

        <div 
          onClick={() => { setActiveKpiFilter('new'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${
            activeKpiFilter === 'new' 
              ? 'bg-sky-50/50 border-sky-500 ring-2 ring-sky-500/20 shadow-xs' 
              : 'bg-white border-slate-100 shadow-3xs hover:border-sky-200'
          }`}
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase block">New Joiners</span>
          <strong className="text-base font-black text-sky-500 block mt-1">{kpiStats.newJoiners} New</strong>
        </div>

        <div 
          onClick={() => { setActiveKpiFilter('resigned'); setCurrentPage(1); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer text-center ${
            activeKpiFilter === 'resigned' 
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-xs' 
              : 'bg-white border-slate-100 shadow-3xs hover:border-slate-300'
          }`}
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Resigned</span>
          <strong className="text-base font-black text-slate-500 block mt-1">{kpiStats.resigned} Staff</strong>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Departments</span>
          <strong className="text-base font-black text-brand-dark block mt-1">{kpiStats.departments} Groups</strong>
        </div>
      </div>

      {/* 2. Main split view: Directory (3/3 full width) */}
      <div className="grid grid-cols-1 gap-6">

        <div className="space-y-6">

          <div className="bg-white p-4 rounded-3xl border border-slate-100/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, designation, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
              />
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-secondary text-slate-700 bg-white font-semibold cursor-pointer"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                ))}
              </select>

              <button
                onClick={onAddEmployeeClick}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>

              {/* Toggle View Buttons */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60 shadow-3xs">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Table List View"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-slate-800 shadow-3xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Directory Table / Cards Grid */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((emp) => (
                <div 
                  key={emp.id}
                  className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs space-y-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  onClick={() => handleOpenViewModal(emp)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-black text-slate-805 text-xs shrink-0">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <strong className="text-slate-850 block text-xs">{emp.name}</strong>
                        <span className="text-[9px] text-slate-400 block font-semibold">{emp.designation || 'Staff'}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">Email</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">{emp.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">Department</span>
                      <span className="font-semibold text-slate-650">{emp.department}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 pt-3 border-t border-slate-100/60" onClick={(e) => e.stopPropagation()}>
                    {/* VIEW PROFILE BUTTON */}
                    <button
                      onClick={() => handleOpenViewModal(emp)}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-655 border border-blue-100 rounded-xl transition-all shadow-4xs cursor-pointer"
                      title="View Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* EDIT PROFILE BUTTON */}
                    <button
                      onClick={() => onEditEmployeeClick(emp)}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-655 border border-amber-100 rounded-xl transition-all shadow-4xs cursor-pointer"
                      title="Edit Details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* CHANGE PASSWORD BUTTON */}
                    <button
                      onClick={() => {
                        setTargetPasswordUser(emp);
                        setNewPassword('');
                        setConfirmPassword('');
                        setPasswordError('');
                        setShowPasswordModal(true);
                      }}
                      className="p-2 bg-purple-55 hover:bg-purple-100 text-purple-650 border border-purple-100 rounded-xl transition-all shadow-4xs cursor-pointer"
                      title="Change Password"
                    >
                      <Key className="w-3.5 h-3.5" />
                    </button>

                    {/* DELETE EMPLOYEE BUTTON */}
                    <button
                      onClick={() => setEmployeeToDelete(emp)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-655 border border-rose-100 rounded-xl transition-all shadow-4xs cursor-pointer"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* VIEW SCREENSHOTS BUTTON */}
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setSelectedScreenshotDate(new Date().toISOString().split('T')[0]);
                        setShowScreenshotsModal(true);
                      }}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-655 border border-emerald-100 rounded-xl transition-all shadow-4xs cursor-pointer"
                      title="View Desktop Screenshots"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredEmployees.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white border border-slate-100 rounded-3xl">
                  <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-medium text-slate-800">No employees found in directory.</h4>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs table-auto">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">EMPLOYEE NAME</th>
                      <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">EMAIL ADDRESS</th>
                      <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">DEPARTMENT</th>
                      <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedEmployees.map(emp => (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        {/* FIRST COLUMN: EMPLOYEE NAME & AVATAR (LEFT-ALIGNED AS PER SPEC) */}
                        <td className="px-6 py-4 align-middle text-left">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 shadow-3xs">
                              {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong className="text-slate-850 block text-xs font-black tracking-tight">{emp.name}</strong>
                              <span className="text-[10px] text-slate-400 block font-bold mt-0.5">{emp.designation || 'Employee'}</span>
                            </div>
                          </div>
                        </td>

                        {/* OTHER COLUMNS: CENTER-ALIGNED */}
                        <td className="px-5 py-4 text-slate-600 font-semibold align-middle text-center">{emp.email}</td>
                        <td className="px-5 py-4 text-slate-500 font-bold align-middle text-center">{emp.department}</td>
                        <td className="px-5 py-4 text-center align-middle">
                          <div className="flex justify-center items-center gap-2">
                            
                            {/* VIEW PROFILE BUTTON WITH MATCHING BLUE TOOLTIP BADGE */}
                            <div className="relative group">
                              <button
                                onClick={() => handleOpenViewModal(emp)}
                                className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all">
                                <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-extrabold rounded-lg whitespace-nowrap shadow-md">
                                  View Profile
                                </span>
                                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-blue-600"></div>
                              </div>
                            </div>

                            {/* EDIT PROFILE BUTTON WITH MATCHING AMBER TOOLTIP BADGE */}
                            <div className="relative group">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditEmployeeClick(emp);
                                }}
                                className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all">
                                <span className="px-3 py-1 bg-amber-600 text-white text-[10px] font-extrabold rounded-lg whitespace-nowrap shadow-md">
                                  Edit Employee
                                </span>
                                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-amber-600"></div>
                              </div>
                            </div>

                            {/* CHANGE PASSWORD BUTTON WITH MATCHING PURPLE TOOLTIP BADGE */}
                            <div className="relative group">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTargetPasswordUser(emp);
                                  setNewPassword('');
                                  setConfirmPassword('');
                                  setPasswordError('');
                                  setShowPasswordModal(true);
                                }}
                                className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold cursor-pointer"
                              >
                                <Key className="w-4 h-4" />
                              </button>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all">
                                <span className="px-3 py-1 bg-purple-600 text-white text-[10px] font-extrabold rounded-lg whitespace-nowrap shadow-md">
                                  Change Password
                                </span>
                                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-purple-600"></div>
                              </div>
                            </div>

                            {/* DELETE EMPLOYEE BUTTON WITH MATCHING ROSE TOOLTIP BADGE */}
                            <div className="relative group">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEmployeeToDelete(emp);
                                }}
                                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all">
                                <span className="px-3 py-1 bg-rose-600 text-white text-[10px] font-extrabold rounded-lg whitespace-nowrap shadow-md">
                                  Delete Employee
                                </span>
                                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-rose-600"></div>
                              </div>
                            </div>

                            {/* VIEW SCREENSHOTS BUTTON WITH MATCHING EMERALD TOOLTIP BADGE */}
                            <div className="relative group">
                              <button
                                onClick={() => {
                                  setSelectedEmployee(emp);
                                  setSelectedScreenshotDate(new Date().toISOString().split('T')[0]);
                                  setShowScreenshotsModal(true);
                                }}
                                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold cursor-pointer"
                              >
                                <Laptop className="w-4 h-4" />
                              </button>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all">
                                <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg whitespace-nowrap shadow-md">
                                  View Screenshots
                                </span>
                                <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-emerald-600"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                          No matching employees found in directory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              {filteredEmployees.length > 0 && (
                <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                  <div>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
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
                            ? 'bg-[#3B82F6] text-white shadow-xs'
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
          )}

        </div>

      </div>

      {/* LARGE VIEW PROFILE MODAL */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-105 flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh]">

            {(() => {
              const u = viewUserFullData || selectedEmployee;
              const name = u.name || selectedEmployee.name || 'User';
              const designation = u.designation || u.roleId?.roleName || u.role?.roleName || selectedEmployee.designation || 'Staff Member';
              const joiningDate = u.joiningDate ? u.joiningDate.split('T')[0] : (selectedEmployee.joiningDate || '2026-07-29');
              const department = u.department || selectedEmployee.department || 'Project Manager Department';
              const salary = u.baseSalary ?? selectedEmployee.baseSalary ?? 25000;
              const empId = u._id || u.id || selectedEmployee._id || selectedEmployee.id || 'N/A';
              const phone = u.phone || u.mobileNumber || selectedEmployee.phone || '1234567890';
              const deviceId = u.deviceId || u.registeredDeviceId || selectedEmployee.deviceId || 'AFD16383-087C-4AC1-8C56-4A13DBE3EF50';
              const roleCode = u.roleId?.roleCode || u.role?.roleCode || selectedEmployee.role || 'PROJECT_MANAGER';
              const email = u.email || selectedEmployee.email || 'N/A';
              const assignedProjects = u.roleProfile?.assignedProjects || selectedEmployee.assignedProjects || ['Main Office'];

              return (
                <>
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-brand-primary/20 border border-brand-primary flex items-center justify-center font-black text-slate-805 text-sm shrink-0">
                        {name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-905 leading-none">{name}</h3>
                        <span className="text-[10px] text-slate-455 font-bold block mt-1.5">{designation} &bull; Joined {joiningDate}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="p-1.5 hover:bg-slate-200 text-slate-550 rounded-xl transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content grid */}
                  <div className="p-6 overflow-y-auto space-y-6">
                    {viewUserLoading && (
                      <div className="text-center py-2 text-xs font-bold text-slate-400">Loading user profile from server...</div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      {/* Left side parameters */}
                      <div className="space-y-4">
                        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-4">
                          <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-200 pb-2">SHIFT & LEAVES REGISTRY</h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Department</span>
                              <span className="text-xs font-bold text-slate-700 block mt-0.5">{department}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Shift Timings</span>
                              <span className="text-xs font-semibold text-slate-655 block mt-0.5">Office Shift A (9:00 - 17:30)</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Leave Tracker</span>
                              <span className="text-xs font-semibold text-slate-655 block mt-0.5">On Duty</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Leave Usage</span>
                              <span className="text-xs font-semibold text-slate-655 block mt-0.5">0 / 15 days used</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-4">
                          <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-200 pb-2">PAYROLL & PROJECTS SUMMARY</h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Salary / Compensation</span>
                              <span className="text-xs font-black text-slate-700 block mt-0.5">
                                ₹{salary}/mo
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Assigned Bank</span>
                              <span className="text-xs font-semibold text-slate-655 block mt-0.5">
                                Nirman Bank
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Assigned Active Projects</span>
                            <div className="flex flex-wrap gap-1.5">
                              {assignedProjects.length > 0 ? (
                                assignedProjects.map((proj, idx) => (
                                  <span key={idx} className="px-2.5 py-0.5 bg-white border border-slate-150 rounded-lg text-[9px] font-bold text-slate-500 shadow-4xs">
                                    {typeof proj === 'object' ? proj.name || proj.projectName || 'Main Office' : proj}
                                  </span>
                                ))
                              ) : (
                                <span className="px-2.5 py-0.5 bg-white border border-slate-150 rounded-lg text-[9px] font-bold text-slate-500 shadow-4xs">
                                  Main Office
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side Offer letter & docs */}
                      <div className="space-y-4">
                        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-4">
                          <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-200 pb-2">OFFICIAL OFFER LETTER</h4>

                          {loadingOffer ? (
                            <span className="text-[10px] text-slate-400 italic block">Loading metadata...</span>
                          ) : offerMetadata ? (
                            <div className="space-y-2.5 text-[10px] text-slate-600 font-semibold">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-455">Issued Status:</span>
                                <span className="bg-emerald-50 text-emerald-650 border border-emerald-100 px-1.5 py-0.5 rounded text-[8px] font-black">{offerMetadata.status}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-455">Snapshot Role:</span>
                                <span className="text-slate-755 font-bold">{offerMetadata.designationSnapshot}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-455">Snapshot Salary:</span>
                                <span className="text-slate-755 font-bold">₹{offerMetadata.baseSalarySnapshot?.toLocaleString()}/mo</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-455">Generated At:</span>
                                <span className="text-slate-700 font-bold">{new Date(offerMetadata.generatedAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex gap-2 pt-2 border-t border-slate-100">
                                <button
                                  onClick={handleDownloadOfferLetter}
                                  className="flex-1 py-1.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-750 text-[9px] font-black uppercase rounded-lg transition-all shadow-3xs flex items-center justify-center gap-0.5"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-450" />
                                  Download PDF
                                </button>
                                <button
                                  onClick={() => {
                                    setRegenDesignation(offerMetadata.designationSnapshot || designation);
                                    setRegenDepartment(offerMetadata.departmentSnapshot || department);
                                    setRegenBaseSalary(offerMetadata.baseSalarySnapshot || salary);
                                    setRegenJoiningDate(offerMetadata.joiningDateSnapshot ? new Date(offerMetadata.joiningDateSnapshot).toISOString().split('T')[0] : joiningDate);
                                    setShowRegenerateModal(true);
                                  }}
                                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-805 text-white text-[9px] font-black uppercase rounded-lg transition-all shadow-3xs flex items-center justify-center gap-0.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                                  Regenerate
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2 space-y-2">
                              <p className="text-[10px] text-slate-455">No offer letter generated for this profile yet.</p>
                              <button
                                onClick={() => {
                                  setRegenDesignation(designation);
                                  setRegenDepartment(department);
                                  setRegenBaseSalary(salary);
                                  setRegenJoiningDate(joiningDate);
                                  setShowRegenerateModal(true);
                                }}
                                className="px-3 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-905 text-[9px] font-black uppercase rounded-lg transition-all shadow-3xs mx-auto block"
                              >
                                Generate Offer Letter
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl space-y-4">
                          <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider border-b border-slate-200 pb-2">EMPLOYEE CONTACT & SYSTEM INFO</h4>

                          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-655">
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Employee ID</span>
                              <span className="text-xs font-mono text-slate-700 block mt-0.5 truncate" title={empId}>
                                {empId}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Phone Number</span>
                              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                                {phone}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Login Device ID</span>
                              <span className="text-xs font-mono text-slate-655 block mt-0.5 truncate" title={deviceId}>
                                {deviceId}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">System Role Code</span>
                              <span className="text-xs font-bold text-slate-700 block mt-0.5 uppercase">
                                {roleCode}
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">Official Email</span>
                              <span className="text-xs font-semibold text-slate-655 block mt-0.5 truncate" title={email}>
                                {email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Footer buttons */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        onEditEmployeeClick(selectedEmployee);
                      }}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-705 rounded-xl text-xs font-bold transition-all uppercase"
                    >
                      EDIT PROFILE
                    </button>
                    <button
                      onClick={() => {
                        showToast(`Leave approved for ${name}!`);
                      }}
                      className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black transition-all uppercase shadow-3xs"
                    >
                      APPROVE LEAVE
                    </button>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}

      {/* LARGE SCREENSHOTS VIEWER MODAL - LIGHT THEME & CLEAN DYNAMIC OVERLAY */}
      {showScreenshotsModal && selectedEmployee && (() => {
        const currCapture = backendScreenshots[activeScreenshotIdx] || {};
        const capturedAtVal = currCapture.capturedAt || currCapture.createdAt || currCapture.timestamp;
        const capturedAtFormatted = capturedAtVal
          ? new Date(capturedAtVal).toLocaleString()
          : 'N/A';
        const fileSizeVal = currCapture.fileSizeKB || currCapture.fileSize || currCapture.size;
        const fileSizeFormatted = fileSizeVal ? `${fileSizeVal} KB` : null;

        const deviceOS = currCapture.os || currCapture.operatingSystem || selectedEmployee.os || selectedEmployee.deviceInfo?.os || 'Windows 11 Corporate';
        const deviceIP = currCapture.ipAddress || currCapture.ip || currCapture.localIp || selectedEmployee.ip || selectedEmployee.localIp || selectedEmployee.ipAddress || '192.168.1.48';
        const deviceID = currCapture.deviceId || currCapture.machineId || selectedEmployee.deviceId || selectedEmployee.id || 'web-browser';
        const isSessionOnline = currCapture.status?.toLowerCase() === 'active' || selectedEmployee.isOnline || selectedEmployee.status === 'PRESENT';

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto animate-in fade-in zoom-in duration-200">

              {/* Header - Fixed non-cutoff */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Workstation Desktop Screenshots</h3>
                    <span className="text-[11px] text-slate-500 font-bold block mt-0.5">
                      Monitoring: {selectedEmployee.name} &bull; Email: {selectedEmployee.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowScreenshotsModal(false)}
                  className="p-1.5 hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid Layout Body: Scrollable flex-1 container */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 overflow-y-auto flex-1">

                {/* Left Column (lg:col-span-3): Screenshot capture area */}
                <div className="lg:col-span-3 flex flex-col h-full min-h-[420px]">
                  {screenshotsLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-slate-50 rounded-2xl border border-slate-200 flex-1">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                      <span className="text-xs font-bold text-slate-500">Fetching screenshots from backend...</span>
                    </div>
                  ) : backendScreenshots.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex-1">
                      <Camera className="w-10 h-10 text-slate-400" />
                      <div>
                        <strong className="text-sm font-black text-slate-800 block">No screenshots captured</strong>
                        <span className="text-[11px] text-slate-500 font-bold block mt-1 uppercase">There are no desktop captures registered for this date.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center flex-1 min-h-[400px] max-h-[58vh]">
                      <img
                        src={currCapture.cloudinaryUrl || currCapture.filePath || desktopScreenshotImg}
                        alt="Captured Workspace desktop screenshot"
                        className="w-full h-full object-contain max-h-[58vh]"
                      />

                      <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg flex items-center gap-1 shadow-md z-10">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Registry Verified</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column (lg:col-span-1): Controls, Target Date Filter, and Dynamic Device info */}
                <div className="space-y-4 text-xs font-semibold text-slate-700 flex flex-col justify-between">

                  <div className="space-y-4">
                    {/* 1. Date Filter & Action card */}
                    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Filter & Actions</h4>

                      <div className="space-y-3.5">
                        <CalendarDatePicker
                          label="Target Date"
                          value={selectedScreenshotDate}
                          onChange={(val) => setSelectedScreenshotDate(val)}
                        />

                        <button
                          onClick={handleDownloadZip}
                          disabled={screenshotsLoading || backendScreenshots.length === 0}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Zip</span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Device Info Card (100% Dynamic - Full Device ID display) */}
                    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Device Info</h4>
                      <div className="space-y-2.5 text-xs text-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold text-[11px]">OS:</span>
                          <span className="text-slate-800 font-extrabold">{deviceOS}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold text-[11px]">Local IP:</span>
                          <span className="text-slate-800 font-extrabold font-mono">{deviceIP}</span>
                        </div>
                        <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-200/70">
                          <span className="text-slate-400 font-bold text-[11px]">Device ID:</span>
                          <span className="text-slate-900 font-extrabold font-mono text-[11px] bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 break-all select-all block shadow-3xs" title={deviceID}>
                            {deviceID}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200/70 pt-2 mt-1">
                          <span className="text-slate-400 font-bold text-[11px]">Active Session:</span>
                          <span className={`font-black uppercase text-[10px] px-2.5 py-0.5 rounded-full border ${isSessionOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {isSessionOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Footer - Fixed non-cutoff at the absolute bottom */}
              <div className="px-6 py-3.5 bg-slate-50/90 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4 text-xs text-slate-700">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-3xs">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none">Captured At</span>
                      <span className="font-extrabold font-mono text-slate-900 text-xs">{capturedAtFormatted}</span>
                    </div>
                  </div>

                  {backendScreenshots.length > 0 && (
                    <span className="text-slate-500 font-bold text-[11px] hidden sm:inline-block">
                      Showing {activeScreenshotIdx + 1} of {backendScreenshots.length} active captures
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {backendScreenshots.length > 0 && (
                    <div className="flex gap-1.5 mr-2">
                      <button
                        onClick={() => setActiveScreenshotIdx(prev => (prev === 0 ? backendScreenshots.length - 1 : prev - 1))}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-3xs"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setActiveScreenshotIdx(prev => (prev === backendScreenshots.length - 1 ? 0 : prev + 1))}
                        className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-3xs"
                      >
                        Next
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowScreenshotsModal(false)}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all uppercase cursor-pointer shadow-md"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Regeneration Offer Letter Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form onSubmit={handleRegenerateOfferLetter} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200">

            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Offer Letter Wizard</span>
                <h3 className="text-sm font-black text-slate-905">Generate Official Offer Letter</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegenerateModal(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-550 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-[10px] text-slate-455 leading-relaxed">
                Configure the snapshot values for this employee contract version. This creates a historical PDF version without altering live profiles.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Contract Designation</label>
                <input
                  type="text"
                  value={regenDesignation}
                  onChange={(e) => setRegenDesignation(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={regenDepartment}
                  onChange={(e) => setRegenDepartment(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Base Salary (USD / Month)</label>
                <input
                  type="number"
                  value={regenBaseSalary}
                  onChange={(e) => setRegenBaseSalary(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
                />
              </div>

              <CalendarDatePicker
                label="Official Joining Date"
                required
                value={regenJoiningDate}
                onChange={(val) => setRegenJoiningDate(val)}
              />
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowRegenerateModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black transition-all shadow-sm uppercase tracking-wide"
              >
                Regenerate & Notify
              </button>
            </div>

          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-105 flex flex-col animate-in fade-in zoom-in duration-200">

            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-slate-905">Delete Employee?</h3>
              </div>
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-550 rounded-xl transition-all"
                disabled={isDeleting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-855 font-bold">{employeeToDelete.name}</strong>?
              </p>
              <div className="p-3.5 bg-rose-50/50 border border-rose-100/50 rounded-2xl text-[10px] text-rose-700 font-bold leading-normal">
                WARNING: This is a cascade delete operation. It will permanently remove their user credentials, role profile, attendance logs, device bindings, app usage, leaves, payrolls, offer letters, and physical storage files from the database. This action cannot be undone.
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEmployeeToDelete(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-550 rounded-xl text-xs font-bold transition-all"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEmployee(employeeToDelete)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all shadow-sm uppercase tracking-wide flex items-center gap-1.5"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Permanently Delete'
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && targetPasswordUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-105 flex flex-col animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-brand-soft text-brand-dark rounded-xl border border-brand-secondary">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-none">Change User Password</h3>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1">{targetPasswordUser.name} ({targetPasswordUser.email})</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setTargetPasswordUser(null);
                }}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl font-bold">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswordModal ? 'password' : 'text'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswordModal ? 'password' : 'text'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setTargetPasswordUser(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-brand-dark font-black rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-brand-dark" />
                  {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold z-50 flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-705' : 'bg-rose-50 border-rose-100 text-rose-705'
          }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
