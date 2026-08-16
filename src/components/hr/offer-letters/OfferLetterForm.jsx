import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Sparkles, User, Briefcase, Building, DollarSign, Calendar } from 'lucide-react';
import EmployeeSelect from '../../common/EmployeeSelect';
import { getUsersList } from '../../../service/auth';
import { getDepartments, getCleanDepartmentName, parseDepartments } from '../../../service/departments';


const DEFAULT_DEPARTMENTS = [
  'Architecture',
  'Engineering',
  'Human Resources',
  'Design',
  'Project Management',
  'Site Operations',
  'IT & Systems',
  'Finance & Accounts'
];

export default function OfferLetterForm({
  isOpen,
  onClose,
  initialUserId = '',
  initialEmployee = null,
  onSubmit,
  isSubmitting
}) {
  const [userId, setUserId] = useState(initialUserId);
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  const [users, setUsers] = useState([]);
  const [departmentList, setDepartmentList] = useState(DEFAULT_DEPARTMENTS);

  // Fetch users & department options from backend
  useEffect(() => {
    if (!isOpen) return;

    const loadFormData = async () => {
      try {
        const uRes = await getUsersList();
        if (uRes && uRes.users) {
          setUsers(uRes.users);
        } else if (Array.isArray(uRes)) {
          setUsers(uRes);
        }

        const dRes = await getDepartments();
        const cleanDepts = parseDepartments(dRes);
        setDepartmentList(cleanDepts);

      } catch (err) {
        console.warn("Error loading offer letter form options:", err);
      }
    };

    loadFormData();
  }, [isOpen]);

  // When selected user changes, auto-fill designation, department, and salary
  const handleEmployeeChange = (selectedId) => {
    setUserId(selectedId);
    if (!selectedId) return;

    const foundUser = users.find(u => (u._id || u.id) === selectedId);
    if (foundUser) {
      // Auto-set designation
      if (foundUser.designation) {
        setDesignation(foundUser.designation);
      } else if (foundUser.roleName || foundUser.role) {
        setDesignation(foundUser.roleName || foundUser.role);
      }

      // Auto-set department
      const rawDept = typeof foundUser.department === 'object'
        ? (foundUser.department?.name || '')
        : String(foundUser.department || '');
      const cleanDept = getCleanDepartmentName(rawDept) || rawDept;

      if (cleanDept) {
        const matched = departmentList.find(d => d.toLowerCase() === cleanDept.toLowerCase());
        setDepartment(matched || cleanDept);
      }

      // Auto-set base salary
      if (foundUser.baseSalary) {
        setBaseSalary(foundUser.baseSalary);
      }
    }
  };

  useEffect(() => {
    if (initialUserId) setUserId(initialUserId);
    if (initialEmployee) {
      if (initialEmployee.designation) setDesignation(initialEmployee.designation);
      if (initialEmployee.department) {
        const d = typeof initialEmployee.department === 'object' ? initialEmployee.department?.name : initialEmployee.department;
        setDepartment(getCleanDepartmentName(d) || d);
      }
      if (initialEmployee.baseSalary) setBaseSalary(initialEmployee.baseSalary);
    }
  }, [initialUserId, initialEmployee]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId) return;

    const payload = {};
    if (designation) payload.designation = designation;
    if (department) payload.department = department;
    if (baseSalary) payload.baseSalary = Number(baseSalary);
    if (joiningDate) payload.joiningDate = joiningDate;

    onSubmit(userId, payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#BDE0FE]/50 text-[#3B82F6] rounded-xl border border-[#8FC9FF]/40">
              <Sparkles className="w-4 h-4 stroke-[2]" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Generate Offer Letter
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold">
                Create official offer letter version for employee
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-semibold">
          
          {/* Employee Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Select Employee *</span>
            </label>
            <EmployeeSelect
              value={userId}
              onChange={handleEmployeeChange}
              required
              placeholder="Search & Select Employee *"
            />
          </div>

          {/* Department Select Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Department</span>
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all font-bold cursor-pointer text-xs"
              >
                <option value="">Select Department</option>
                {departmentList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Designation</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Architect / HR Lead"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all font-semibold text-xs"
            />
          </div>

          {/* Base Salary & Joining Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Base Salary (₹)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 60000"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all font-semibold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joining Date</span>
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all font-semibold cursor-pointer text-xs"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !userId}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#BDE0FE] to-[#8FC9FF] hover:from-[#8FC9FF] hover:to-[#3B82F6] text-slate-900 text-xs font-black shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 border border-[#8FC9FF]/60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Generating...</span>
                </>
              ) : (
                <span>Generate Offer Letter</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
