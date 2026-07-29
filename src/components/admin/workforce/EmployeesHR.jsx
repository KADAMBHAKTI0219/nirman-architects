import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, ShieldCheck, Mail, MapPin, Briefcase, FileText, CheckCircle2, 
  Clock, Plus, Filter, Award, ChevronRight, Laptop, Calendar, DollarSign, UserCheck, X,
  Pencil, Trash2, Camera, Download, RefreshCw, AlertTriangle, Key
} from 'lucide-react';
import Card from '../../common/Card';
import {
  getOfferLetterMetadata,
  downloadOfferLetterPDF,
  regenerateOfferLetter
} from '../../../service/offerLetter';
import { parseIndexedObjectToArray } from '../../../service/leave';
import { getEmployeeScreenshots, downloadAllScreenshots } from '../../../service/screenshot';
import { deleteUser, changeUserPassword, getUserById } from '../../../service/auth';

export default function EmployeesHR({
  employees,
  selectedEmployee: propSelectedEmployee,
  onSelectEmployee,
  onAddEmployeeClick,
  onEditEmployeeClick
}) {
  const [localEmployees, setLocalEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

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

  const departments = ['All', 'Architecture', 'Engineering', 'Project Management', 'HR'];

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
        if (onRefresh) {
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

  // Filtered employees
  const filteredEmployees = localEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Employees</span>
          <strong className="text-base font-black text-slate-800 block mt-1">{localEmployees.length} Staff</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Shift</span>
          <strong className="text-base font-black text-emerald-600 block mt-1">24 Active</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-105 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">On Leave</span>
          <strong className="text-base font-black text-rose-600 block mt-1">2 Leave</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">New Joiners</span>
          <strong className="text-base font-black text-sky-500 block mt-1">3 New</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Resigned</span>
          <strong className="text-base font-black text-slate-500 block mt-1">1 Staff</strong>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Departments</span>
          <strong className="text-base font-black text-indigo-505 block mt-1">4 Groups</strong>
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
                className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-slate-700 bg-white font-semibold cursor-pointer"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : `${dept} Department`}</option>
                ))}
              </select>

              <button
                onClick={onAddEmployeeClick}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Name</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map(emp => (
                    <tr 
                      key={emp.id} 
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-black text-slate-805 text-xs shrink-0">
                            {emp.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <strong className="text-slate-850 block text-xs">{emp.name}</strong>
                            <span className="text-[9px] text-slate-400 block font-semibold">{emp.designation}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-semibold align-middle">{emp.email}</td>
                      <td className="px-5 py-4 text-slate-500 font-bold align-middle">{emp.department}</td>
                      <td className="px-5 py-4 text-right align-middle">
                        <div className="flex justify-end gap-2">
                          
                          {/* VIEW PROFILE BUTTON */}
                          <button
                            onClick={() => handleOpenViewModal(emp)}
                            className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-650 border border-blue-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDIT PROFILE BUTTON */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEmployeeClick(emp);
                            }}
                            className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-650 border border-amber-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold"
                            title="Edit Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* CHANGE PASSWORD BUTTON */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTargetPasswordUser(emp);
                              setNewPassword('');
                              setConfirmPassword('');
                              setPasswordError('');
                              setShowPasswordModal(true);
                            }}
                            className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-650 border border-purple-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold"
                            title="Change Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* DELETE EMPLOYEE BUTTON */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmployeeToDelete(emp);
                            }}
                            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* VIEW SCREENSHOTS BUTTON */}
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setSelectedScreenshotDate(new Date().toISOString().split('T')[0]);
                              setShowScreenshotsModal(true);
                            }}
                            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 border border-emerald-100 rounded-xl transition-all shadow-4xs flex items-center justify-center font-bold"
                            title="View Desktop Screenshots"
                          >
                            <Laptop className="w-4 h-4" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
                        {name.split(' ').map(n=>n[0]).join('')}
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

      {/* LARGE SCREENSHOTS VIEWER MODAL */}
      {showScreenshotsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center gap-2.5">
                <Laptop className="w-4 h-4 text-emerald-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-100">Workstation Desktop Screenshots</h3>
                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                    Monitoring: {selectedEmployee.name} &bull; Email: {selectedEmployee.email}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowScreenshotsModal(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid Layout: Left side (3/4) is Screenshot viewer, Right side (1/4) is Controls & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
              
              {/* Left Column (lg:col-span-3): Screenshot capture area */}
              <div className="lg:col-span-3 space-y-4">
                {screenshotsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-xs font-bold text-slate-400">Fetching screenshots from backend...</span>
                  </div>
                ) : backendScreenshots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center bg-slate-950 rounded-2xl border border-slate-800">
                    <Camera className="w-10 h-10 text-slate-700" />
                    <div>
                      <strong className="text-sm font-black text-slate-300 block">No screenshots captured</strong>
                      <span className="text-[10px] text-slate-500 font-bold block mt-1 uppercase">There are no desktop captures registered for this date.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Interactive Screenshot Display Box */}
                    <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center aspect-video">
                      <img 
                        src={backendScreenshots[activeScreenshotIdx].cloudinaryUrl || backendScreenshots[activeScreenshotIdx].filePath || desktopScreenshotImg} 
                        alt="Captured Workspace desktop screenshot" 
                        className="w-full h-full object-contain"
                      />
                      
                      {/* Watermark/Details Overlay */}
                      <div className="absolute bottom-3 left-3 bg-slate-950/85 border border-slate-805 px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-350 flex flex-col gap-0.5">
                        <span>Capture ID: {backendScreenshots[activeScreenshotIdx]._id || backendScreenshots[activeScreenshotIdx].id}</span>
                        <span>Captured At: {new Date(backendScreenshots[activeScreenshotIdx].capturedAt || backendScreenshots[activeScreenshotIdx].createdAt).toLocaleString()}</span>
                        {backendScreenshots[activeScreenshotIdx].fileSizeKB && (
                          <span>File Size: {backendScreenshots[activeScreenshotIdx].fileSizeKB} KB</span>
                        )}
                      </div>
                      
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Registry Verified</span>
                      </div>
                    </div>

                    {/* Carousel Controls */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1">
                      <span>Showing {activeScreenshotIdx + 1} of {backendScreenshots.length} active captures</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveScreenshotIdx(prev => (prev === 0 ? backendScreenshots.length - 1 : prev - 1))}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-205 border border-slate-700 rounded-xl transition-colors font-bold uppercase tracking-wider"
                        >
                          Previous
                        </button>
                        <button 
                          onClick={() => setActiveScreenshotIdx(prev => (prev === backendScreenshots.length - 1 ? 0 : prev + 1))}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-205 border border-slate-700 rounded-xl transition-colors font-bold uppercase tracking-wider"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (lg:col-span-1): Controls, Target Date Filter, and Device info */}
              <div className="space-y-4 text-xs font-semibold text-slate-300">
                
                {/* 1. Date Filter & Action card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Filter & Actions</h4>
                  
                  <div className="space-y-3.5">
                    <div>
                      <span className="text-[8px] font-black text-slate-500 uppercase block mb-1.5">Target Date</span>
                      <input 
                        type="date"
                        value={selectedScreenshotDate}
                        onChange={(e) => setSelectedScreenshotDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    
                    <button
                      onClick={handleDownloadZip}
                      disabled={screenshotsLoading || backendScreenshots.length === 0}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 rounded-xl text-xs font-black transition-all shadow-sm uppercase flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Zip</span>
                    </button>
                  </div>
                </div>

                {/* 2. Device info card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Device Info</h4>
                  <div className="space-y-2.5 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-550 font-semibold">OS:</span>
                      <span className="text-slate-202 font-bold">Windows 11 Corporate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 font-semibold">Local IP:</span>
                      <span className="text-slate-202 font-bold font-mono">192.168.1.48</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-550 font-semibold">Device ID:</span>
                      <span className="text-slate-202 font-bold font-mono truncate max-w-[100px]" title={selectedEmployee.deviceId || "web-browser"}>
                        {selectedEmployee.deviceId || "web-browser"}
                      </span>
                    </div>
                    {backendScreenshots.length > 0 && (
                      <div className="flex justify-between border-t border-slate-800 pt-2 mt-1">
                        <span className="text-slate-550 font-semibold">Active Session:</span>
                        <span className="text-emerald-400 font-bold uppercase text-[9px]">Online</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            <div className="px-6 py-4 bg-slate-900/40 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowScreenshotsModal(false)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-202 rounded-xl text-xs font-bold transition-all uppercase"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

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

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Official Joining Date</label>
                <input 
                  type="date" 
                  value={regenJoiningDate} 
                  onChange={(e) => setRegenJoiningDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
                />
              </div>
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
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
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
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
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
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-bold z-50 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-705' : 'bg-rose-50 border-rose-100 text-rose-705'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
