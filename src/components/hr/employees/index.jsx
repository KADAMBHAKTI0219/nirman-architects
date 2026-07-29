import React, { useState, useEffect } from 'react';
import { 
  Search, User, Briefcase, CreditCard, ChevronRight, Plus, Check, Mail, 
  Phone, Calendar, AlertTriangle, FileText, Download, Award, Clock, Filter, 
  MapPin, X, Trash2, ArrowUpDown, ChevronLeft, Laptop, Send, RefreshCw, Key
} from 'lucide-react';
import Card from '../../common/Card';
import { getUsersList, deleteUser, changeUserPassword } from '../../../service/auth';
import { useToast } from '../../../context/ToastContext';

const INITIAL_EMPLOYEES = [
  { id: "EMP-101", name: "Sarah Connor", email: "sarah@nirman.com", phone: "+91 98765 43210", gender: "Female", role: "Lead Architect", dept: "Architecture", status: "Active", desk: "Office Desk 1", shift: "Shift A (9:00 AM - 5:30 PM)", salary: 75000, joiningDate: "2024-03-10", attendanceScore: 96, leaveBalance: 10, performanceBadge: "Outstanding (92%)", workType: "Office", manager: "Bruce Wayne", emergencyContact: "John Connor (+91 98765 00000)", documents: ["Contract.pdf", "TaxID.pdf"], reviewNotes: "Excellent blueprints check-offs." },
  { id: "EMP-102", name: "Alice Smith", email: "alice@nirman.com", phone: "+91 98765 43211", gender: "Female", role: "Jr Architect", dept: "Architecture", status: "Active", desk: "Office Desk 4", shift: "Shift A (9:00 AM - 5:30 PM)", salary: 45000, joiningDate: "2024-05-15", attendanceScore: 94, leaveBalance: 12, performanceBadge: "Excellent (88%)", workType: "Office", manager: "Sarah Connor", emergencyContact: "Mary Smith (+91 98765 11111)", documents: ["Contract.pdf"], reviewNotes: "Staircase detail layouts are precise." },
  { id: "EMP-103", name: "Bob Johnson", email: "bob@nirman.com", phone: "+91 98765 43212", gender: "Male", role: "Site Engineer", dept: "Engineering", status: "Probation", desk: "Site HQ 1", shift: "Shift B (8:00 AM - 4:30 PM)", salary: 50000, joiningDate: "2026-02-20", attendanceScore: 92, leaveBalance: 15, performanceBadge: "Good (78%)", workType: "Site", manager: "John Wick", emergencyContact: "Anna Johnson (+91 98765 22222)", documents: ["Contract.pdf", "Degree_Cert.pdf"], reviewNotes: "Compaction foundational calculations verified." },
  { id: "EMP-104", name: "Charlie Brown", email: "charlie@nirman.com", phone: "+91 98765 43213", gender: "Male", role: "Drafter", dept: "Architecture", status: "On Leave", desk: "Office Desk 9", shift: "Shift A (9:00 AM - 5:30 PM)", salary: 35000, joiningDate: "2025-01-10", attendanceScore: 88, leaveBalance: 8, performanceBadge: "Good (75%)", workType: "Hybrid", manager: "Sarah Connor", emergencyContact: "Sally Brown (+91 98765 33333)", documents: [], reviewNotes: "Good CAD coordination support." },
  { id: "EMP-105", name: "Frank Castle", email: "frank@nirman.com", phone: "+91 98765 43214", gender: "Male", role: "Site Inspector", dept: "Engineering", status: "Active", desk: "Site HQ 2", shift: "Shift B (8:00 AM - 4:30 PM)", salary: 40000, joiningDate: "2024-08-01", attendanceScore: 91, leaveBalance: 11, performanceBadge: "Excellent (82%)", workType: "Site", manager: "John Wick", emergencyContact: "Maria Castle (+91 98765 44444)", documents: ["Contract.pdf"], reviewNotes: "Concrete structural deadweight logs checked." }
];

export default function Employees() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [loading, setLoading] = useState(false);
  
  // Selection & Details Drawer states
  const [selectedEmployee, setSelectedEmployee] = useState(INITIAL_EMPLOYEES[0]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState('overview'); // overview, attendance, leave, payroll, performance, documents

  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [targetPasswordUser, setTargetPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

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
      const userId = targetPasswordUser.id || targetPasswordUser._id;
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

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await getUsersList();
      const usersList = res.users || [];
      
      const mapped = usersList.map(u => {
        const roleCodeStr = u.roleId?.roleCode || u.roleCode || (typeof u.role === 'string' ? u.role : '');
        const isSite = roleCodeStr.toLowerCase().includes('site');
        
        return {
          id: u.id || u._id,
          name: u.name || 'User',
          email: u.email || 'N/A',
          phone: u.phone || '+91 98765 00000',
          gender: u.gender || 'Male',
          role: u.roleId?.roleName || u.designation || 'Staff Member',
          dept: u.department || 'Architecture',
          status: u.deviceStatus === 'APPROVED' ? 'Active' : 'Probation',
          desk: u.desk || 'Office Desk A',
          shift: isSite ? 'Shift B (8:00 AM - 4:30 PM)' : 'Shift A (9:00 AM - 5:30 PM)',
          salary: u.baseSalary || 25000,
          joiningDate: u.joiningDate ? u.joiningDate.split('T')[0] : (u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
          attendanceScore: 95,
          leaveBalance: 12,
          performanceBadge: 'Good (80%)',
          workType: isSite ? 'Site' : 'Office',
          manager: u.manager || 'Bruce Wayne',
          emergencyContact: u.emergencyContact || 'N/A',
          documents: u.documents || [],
          reviewNotes: 'Active staff member.'
        };
      });
      
      if (mapped.length > 0) {
        setEmployees(mapped);
      }
    } catch (err) {
      console.error("Failed to load employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDeleteEmployee = async (emp) => {
    setIsDeleting(true);
    try {
      const response = await deleteUser(emp.id);
      if (response.success) {
        setEmployees(prev => prev.filter(e => e.id !== emp.id));
        showToast(response.message || `${emp.name} has been deleted successfully.`, 'success');
        setEmployeeToDelete(null);
        setDrawerOpen(false);
        fetchEmployees();
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

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedWorkType, setSelectedWorkType] = useState('All');

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Checkboxes for Bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Filter & Sort Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.dept === selectedDept;
    const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
    const matchesWork = selectedWorkType === 'All' || emp.workType === selectedWorkType;
    return matchesSearch && matchesDept && matchesStatus && matchesWork;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const pageCount = Math.ceil(sortedEmployees.length / itemsPerPage);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedEmployees.map(emp => emp.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      alert("No employees selected!");
      return;
    }
    alert(`Bulk Action [${action}] applied successfully to: ${selectedIds.join(', ')}`);
    setSelectedIds([]);
  };

  const handleAddEmployee = () => {
    const name = prompt("Enter Employee Name:");
    const role = prompt("Enter Role/Designation:");
    const dept = prompt("Enter Department (Architecture, Engineering):");
    const workType = prompt("Enter Work Type (Office, Site, Hybrid):");

    if (name && role && dept && workType) {
      const newId = `EMP-${100 + employees.length + 1}`;
      const newEmp = {
        id: newId,
        name,
        email: `${name.toLowerCase().replace(' ', '')}@nirman.com`,
        phone: "+91 98765 55555",
        gender: "Male",
        role,
        dept,
        status: "Active",
        desk: "Desk 14",
        shift: "Shift A (9:00 AM - 5:30 PM)",
        salary: 42000,
        joiningDate: new Date().toISOString().split('T')[0],
        attendanceScore: 100,
        leaveBalance: 15,
        performanceBadge: "Good (80%)",
        workType,
        manager: "Sarah Connor",
        emergencyContact: "Emergency Guardian (+91 98765 99999)",
        documents: [],
        reviewNotes: "Newly registered staff record."
      };
      setEmployees(prev => [...prev, newEmp]);
      alert(`Employee ${newId} registered successfully!`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & FILTERS BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Staff Master Registry</h2>
            <p className="text-xs text-slate-400">Manage employee rosters, credentials files, and department allocations</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('Export')}
              className="px-3.5 py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase transition-all shadow-3xs"
            >
              Export Report
            </button>
            <button
              onClick={handleAddEmployee}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-905 rounded-xl text-xs font-black uppercase transition-all shadow-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </div>

        {/* Filters panel */}
        <div className="flex flex-wrap gap-3 items-center pt-2 border-t border-slate-50">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or designation..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-xs font-semibold bg-white text-slate-805"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Departments</option>
            <option value="Architecture">Architecture</option>
            <option value="Engineering">Engineering</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Probation">Probation</option>
            <option value="On Leave">On Leave</option>
          </select>

          <select
            value={selectedWorkType}
            onChange={(e) => setSelectedWorkType(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white font-semibold text-slate-700"
          >
            <option value="All">All Work Types</option>
            <option value="Office">Office</option>
            <option value="Site">Site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* 2. SUMMARY STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Employees</span>
          <strong className="text-base font-black text-slate-800 block mt-0.5">28 Staff</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Active Employees</span>
          <strong className="text-base font-black text-emerald-600 block mt-0.5">24 Active</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">On Leave</span>
          <strong className="text-base font-black text-rose-600 block mt-0.5">2 Staff</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">New Joiners</span>
          <strong className="text-base font-black text-indigo-505 block mt-0.5">3 Staff</strong>
        </div>
        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-3xs text-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Pending Docs</span>
          <strong className="text-base font-black text-amber-500 block mt-0.5">1 File</strong>
        </div>
      </div>

      {/* 3. MAIN DIRECTORY TABLE & DETAIL DRAWER */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Main Employee Table (3/4 width if drawer open, else 4/4) */}
        <div className={`${drawerOpen ? 'xl:col-span-3' : 'xl:col-span-4'} space-y-4`}>
          
          {/* Bulk actions bar */}
          {selectedIds.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-150 rounded-2xl flex justify-between items-center text-xs animate-in slide-in-from-top duration-200">
              <span className="font-bold text-slate-700">{selectedIds.length} employees selected</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBulkAction('Assign Shift')}
                  className="px-2.5 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg text-[9px] font-black uppercase shadow-3xs"
                >
                  Assign Shift
                </button>
                <button 
                  onClick={() => handleBulkAction('Send Reminder')}
                  className="px-2.5 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg text-[9px] font-black uppercase shadow-3xs"
                >
                  Send Reminder
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left table-auto">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest w-12">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedIds.length === paginatedEmployees.length && paginatedEmployees.length > 0}
                        className="rounded text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                      />
                    </th>
                    <th 
                      onClick={() => handleSort('name')}
                      className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none align-middle"
                    >
                      <div className="flex items-center gap-1">
                        Employee Details
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('dept')}
                      className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none align-middle"
                    >
                      <div className="flex items-center gap-1">
                        Department
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Designation</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Work Type</th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th 
                      onClick={() => handleSort('joiningDate')}
                      className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer select-none align-middle"
                    >
                      <div className="flex items-center gap-1">
                        Join Date
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedEmployees.map(emp => (
                    <tr 
                      key={emp.id} 
                      className={`hover:bg-slate-50/40 cursor-pointer ${selectedEmployee?.id === emp.id ? 'bg-slate-50' : ''}`}
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setDrawerOpen(true);
                      }}
                    >
                      <td className="px-4 py-3.5 align-middle" onClick={(e)=>e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(emp.id)}
                          onChange={() => handleSelectOne(emp.id)}
                          className="rounded text-brand-primary focus:ring-brand-primary w-3.5 h-3.5"
                        />
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-700">
                            {emp.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <strong className="text-slate-805 block">{emp.name}</strong>
                            <span className="text-[9px] text-slate-400 block font-semibold">{emp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-bold align-middle">{emp.dept}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-semibold align-middle">{emp.role}</td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="text-slate-655 font-bold flex items-center gap-1">
                          <Laptop className="w-3.5 h-3.5 text-slate-400" />
                          {emp.workType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                          emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          emp.status === 'Probation' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{emp.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-450 font-semibold align-middle">{emp.joiningDate}</td>
                      <td className="px-4 py-3.5 text-right align-middle" onClick={(e)=>e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setDrawerOpen(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-3xs flex items-center justify-center"
                            title="Open Slide-over Drawer"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-slate-550" />
                          </button>
                          <button
                            onClick={() => {
                              setTargetPasswordUser(emp);
                              setNewPassword('');
                              setConfirmPassword('');
                              setPasswordError('');
                              setShowPasswordModal(true);
                            }}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl transition-all shadow-3xs flex items-center justify-center font-bold"
                            title="Change Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEmployeeToDelete(emp)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-650 rounded-xl transition-all shadow-3xs flex items-center justify-center font-bold"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-black text-slate-405 uppercase tracking-wider">
                Page {currentPage} of {pageCount}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-205 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-all bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                  className="p-1.5 border border-slate-205 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-all bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Slide-over Detail Drawer (1/4 width) */}
        {drawerOpen && selectedEmployee && (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs space-y-5 animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-start border-b border-slate-50 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center font-black text-slate-805 text-xs">
                  {selectedEmployee.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-black text-slate-905 text-xs block leading-none">{selectedEmployee.name}</h4>
                  <span className="text-[9px] text-slate-400 font-bold block mt-1">{selectedEmployee.role} &bull; {selectedEmployee.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slider Tabs */}
            <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none gap-2 pb-1.5">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'leave', label: 'Leaves' },
                { id: 'payroll', label: 'Payroll' },
                { id: 'performance', label: 'KPIs' },
                { id: 'documents', label: 'Vault' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDrawerTab(tab.id)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                    drawerTab === tab.id
                      ? 'bg-brand-primary border-brand-primary text-slate-905 shadow-3xs font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Drawer Content Area */}
            <div className="min-h-[220px] text-xs space-y-4">
              
              {drawerTab === 'overview' && (
                <div className="space-y-3.5 text-slate-550">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Reporting Manager</span>
                    <strong className="text-slate-805 block mt-0.5">{selectedEmployee.manager}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Workstation Desk</span>
                    <span className="font-bold text-slate-700 block mt-0.5">{selectedEmployee.desk}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Email & Phone</span>
                    <span className="font-bold text-slate-700 block mt-0.5">{selectedEmployee.email}</span>
                    <span className="font-bold text-slate-700 block mt-0.5">{selectedEmployee.phone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Emergency contact</span>
                    <span className="font-semibold text-slate-700 block mt-0.5">{selectedEmployee.emergencyContact}</span>
                  </div>
                </div>
              )}

              {drawerTab === 'attendance' && (
                <div className="space-y-3 text-slate-550 font-bold">
                  <div className="flex justify-between items-center">
                    <span>Attendance Rate</span>
                    <span className="text-[#2484C6] font-black">{selectedEmployee.attendanceScore}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[8px] text-slate-405 block uppercase">Recent Log</span>
                    <p className="text-[10px] font-semibold text-slate-700 leading-normal">
                      Checked in on laptop boot registry at 09:02 AM today.
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'leave' && (
                <div className="space-y-3 text-slate-550 font-bold">
                  <div className="flex justify-between items-center">
                    <span>Leave Balance Remaining</span>
                    <span className="text-slate-700 font-extrabold">{selectedEmployee.leaveBalance} Days</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[8px] text-slate-405 block uppercase font-bold">Approved Leaves History</span>
                    <p className="text-[10px] font-semibold text-slate-700">
                      Annual: 5 days used (July 2026).
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'payroll' && (
                <div className="space-y-3 text-slate-550 font-bold">
                  <div className="flex justify-between items-center">
                    <span>Salary Tier</span>
                    <span className="text-slate-750 font-black">${selectedEmployee.salary.toLocaleString()} / mo</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[8px] text-slate-405 block uppercase">Bank Ledger</span>
                    <p className="text-[10px] font-semibold text-slate-700">
                      Nirman Payroll Bank Roster #95817
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'performance' && (
                <div className="space-y-3 text-slate-550 font-bold">
                  <div className="flex justify-between items-center">
                    <span>Performance Score</span>
                    <span className="text-indigo-650 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-black">
                      {selectedEmployee.performanceBadge}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <span className="text-[8px] text-slate-405 block uppercase">Review Notes</span>
                    <p className="text-[10px] font-semibold text-slate-700 italic">
                      "{selectedEmployee.reviewNotes}"
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === 'documents' && (
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Uploaded HR Documents</span>
                  {selectedEmployee.documents.map(doc => (
                    <div key={doc} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-700">{doc}</span>
                      <button 
                        onClick={() => alert(`Downloading document: ${doc}`)}
                        className="text-[9px] text-[#2484C6] hover:underline font-bold uppercase"
                      >
                        Get file
                      </button>
                    </div>
                  ))}
                  {selectedEmployee.documents.length === 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center text-rose-650 text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing documents!
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-105 flex flex-col animate-in fade-in zoom-in duration-200 text-left">
            
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
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-555 rounded-xl text-xs font-bold transition-all"
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

      </div>

    </div>
  );
}
