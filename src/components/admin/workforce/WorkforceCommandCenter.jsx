import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Laptop, ShieldAlert, Check, X, AlertCircle,
  User, Mail, Phone, Lock, Shield, Briefcase, IndianRupee, Plus, Eye, EyeOff
} from 'lucide-react';
import AttendanceOps from './AttendanceOps';
import EmployeesHR from './EmployeesHR';
import DeviceBindingApprovals from './DeviceBindingApprovals';
import AppUsageTracking from '../app-usage/AppUsageTracking';
import { getAllAttendanceList } from '../../../service/hrm/attendance';
import { getRoles, registerUser, getUsersList, getUserById, updateUser, getPendingDeviceRequests, approveDevice } from '../../../service/auth';
import { getDepartments, parseDepartments } from '../../../service/departments';

import { parseIndexedObjectToArray } from '../../../service/hrm/leave';

export default function WorkforceCommandCenter({ defaultTab = 'attendance' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [employees, setEmployees] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [deviceRequests, setDeviceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Fetch real company attendance logs via getAllAttendanceList()
      let logsRes = [];
      try {
        logsRes = await getAllAttendanceList();
      } catch (err) {
        console.warn("getAllAttendanceList failed:", err);
      }
      const rawLogs = parseIndexedObjectToArray(logsRes);

      if (rawLogs) {
        const filteredRaw = rawLogs.filter(log => {
          const emp = log.userId || {};
          const designation = (emp.designation || emp.roleId?.roleName || '').toLowerCase();
          const roleCode = (emp.roleId?.roleCode || emp.roleCode || '').toLowerCase();
          const isSiteOrManagerOrEng = designation.includes('site') || designation.includes('manager') || designation.includes('engineer') || roleCode.includes('site');
          return !isSiteOrManagerOrEng;
        });

        const mappedLogs = filteredRaw.map((log, idx) => {
          const emp = log.userId || {};
          const isSite = (log.deviceId || '').toLowerCase().includes('gps') || (log.deviceId || '').toLowerCase().includes('mobile');
          const hoursStr = typeof log.workingHours === 'number' ? `${log.workingHours} hrs` : (log.workingHours || '0 hrs');
          
          return {
            id: log._id || log.id || idx,
            employeeId: emp._id || emp.id,
            name: emp.name || log.employeeName || 'Unknown User',
            role: emp.designation || emp.roleName || emp.role || 'Employee',
            timeIn: log.clockInTime ? new Date(log.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            timeOut: log.clockOutTime ? new Date(log.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress',
            hours: hoursStr,
            mode: isSite ? 'Site' : 'Office',
            status: log.status || 'Present',
            date: log.clockInTime ? new Date(log.clockInTime).toLocaleDateString() : 'N/A',
            rawLog: log
          };
        });
        
        setAttendanceLogs(mappedLogs);
        if (mappedLogs.length > 0) {
          setSelectedLog(mappedLogs[0]);
        }
      }

      // 2. Fetch all registered corporate users via getUsersList()
      let usersRes = [];
      try {
        usersRes = await getUsersList();
      } catch (err) {
        console.warn("getUsersList failed:", err);
        usersRes = [];
      }
      const usersList = usersRes.users || usersRes.data || (Array.isArray(usersRes) ? usersRes : []);
      if (usersList) {
        const mappedEmployees = usersList.map(u => {
          const userEmail = u.email?.toLowerCase();
          const activeLog = rawLogs.find(l => l.userEmail?.toLowerCase() === userEmail);
          
          const roleCodeStr = u.roleId?.roleCode || u.roleCode || (typeof u.role === 'string' ? u.role : '');
          const isSiteEng = roleCodeStr.toLowerCase().includes('site');
          
          return {
            id: u.id || u._id,
            name: u.name || 'User',
            email: u.email || 'N/A',
            designation: u.roleId?.roleName || u.designation || 'Staff Member',
            department: u.department || 'Office Staff',
            shift: isSiteEng ? 'Site Shift B (8:00 - 16:30)' : 'Office Shift A (9:00 - 17:30)',
            attendanceStatus: activeLog ? (activeLog.type === 'CLOCK_IN' ? 'Active' : 'Checked-Out') : 'Absent',
            leaveStatus: 'On Duty',
            performanceBadge: 'Good (80%)',
            lastActive: activeLog ? new Date(activeLog.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            joiningDate: u.joiningDate ? u.joiningDate.split('T')[0] : (u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            leaveHistory: '0 / 15 days used',
            payrollData: { salary: `$${u.baseSalary || 25000}/mo`, bank: 'Nirman Bank' },
            assignedProjects: isSiteEng ? ['Noida Site'] : ['Main Office'],
            documents: ['Contract_Signed.pdf'],
            rawUser: u
          };
        });
        setEmployees(mappedEmployees);
        if (mappedEmployees.length > 0) {
          setSelectedEmployee(prev => {
            if (prev) {
              const matched = mappedEmployees.find(emp => emp.id === prev.id);
              if (matched) return matched;
            }
            return mappedEmployees[0];
          });
        }
      }

      // 3. Fetch pending device binding requests
      let requestsList = [];
      try {
        const deviceRes = await getPendingDeviceRequests();
        requestsList = deviceRes.requests || deviceRes.data?.requests || (Array.isArray(deviceRes) ? deviceRes : []);
      } catch (err) {
        console.warn("getPendingDeviceRequests failed, using empty fallback:", err);
      }
      setDeviceRequests(requestsList);
    } catch (err) {
      console.error("Failed to load command center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeviceAction = async (requestId, action) => {
    try {
      const response = await approveDevice(requestId, action);
      alert(response.message || `Device request ${action.toLowerCase()}d successfully.`);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to process device action.");
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: '',
    role: '',
    department: '',
    designation: '',
    baseSalary: '',
    deviceId: ''
  });
  const [editEmployeeData, setEditEmployeeData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    roleId: '',
    role: '',
    department: '',
    designation: '',
    baseSalary: '',
    deviceId: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editFieldErrors, setEditFieldErrors] = useState({});

  // Fetch roles & departments dynamically from real backend API when modal opens
  useEffect(() => {
    if (showAddModal || showEditModal) {
      const fetchRoles = async () => {
        try {
          setRolesLoading(true);
          const res = await getRoles();
          let rolesList = (res.success && Array.isArray(res.roles) && res.roles.length > 0) ? res.roles : [];
          if (rolesList.length === 0) {
            rolesList = [
              { _id: 'role-1', roleCode: 'ADMIN', roleName: 'Admin' },
              { _id: 'role-2', roleCode: 'HR', roleName: 'HR Officer' },
              { _id: 'role-3', roleCode: 'PROJECT_MANAGER', roleName: 'Project Manager' },
              { _id: 'role-4', roleCode: 'ARCHITECT', roleName: 'Architect' },
              { _id: 'role-5', roleCode: 'SITE_ENGINEER', roleName: 'Site Engineer' },
              { _id: 'role-6', roleCode: 'EMPLOYEE', roleName: 'Employee' },
            ];
          }
          setRoles(rolesList);
          // Set default role selection without auto-populating text inputs
          if (showAddModal) {
            const defaultRole = rolesList.find(r => r.roleCode === 'EMPLOYEE') || rolesList[0];
            if (defaultRole && !newEmployee.roleId) {
              setNewEmployee(prev => ({
                ...prev,
                roleId: defaultRole._id || defaultRole.id,
                role: defaultRole.roleCode,
                designation: defaultRole.roleName
              }));
            }
          }
        } catch (err) {
          console.error("Failed to load roles for employee modal", err);
          setRoles([
            { _id: 'role-1', roleCode: 'ADMIN', roleName: 'Admin' },
            { _id: 'role-2', roleCode: 'HR', roleName: 'HR Officer' },
            { _id: 'role-3', roleCode: 'PROJECT_MANAGER', roleName: 'Project Manager' },
            { _id: 'role-4', roleCode: 'ARCHITECT', roleName: 'Architect' },
            { _id: 'role-5', roleCode: 'SITE_ENGINEER', roleName: 'Site Engineer' },
            { _id: 'role-6', roleCode: 'EMPLOYEE', roleName: 'Employee' },
          ]);
        } finally {
          setRolesLoading(false);
        }
      };

      const fetchDepts = async () => {
        try {
          setDepartmentsLoading(true);
          const res = await getDepartments();
          const deptList = parseDepartments(res);
          setDepartments(deptList);
        } catch (err) {
          console.error("Failed to load departments from backend API:", err);
        } finally {
          setDepartmentsLoading(false);
        }
      };


      fetchRoles();
      fetchDepts();
    }
  }, [showAddModal, showEditModal]);

  const autoMatchDepartment = (roleObj, availableDepts = []) => {
    if (!roleObj) return '';
    const code = (roleObj.roleCode || roleObj.code || '').toUpperCase();
    const name = (roleObj.roleName || roleObj.name || '').toLowerCase();

    const deptNames = availableDepts.map(d => typeof d === 'string' ? d : (d.name || d.departmentName || d.title || '')).filter(Boolean);

    // 1. Try fuzzy match in availableDepts
    let matched = deptNames.find(d => {
      const dLower = d.toLowerCase();
      if (code.includes('HR') || name.includes('hr') || name.includes('human')) {
        return dLower.includes('hr') || dLower.includes('human') || dLower.includes('admin');
      }
      if (code.includes('ARCHITECT') || name.includes('architect')) {
        return dLower.includes('architect') || dLower.includes('design');
      }
      if (code.includes('PROJECT') || code.includes('PM') || name.includes('project')) {
        return dLower.includes('project') || dLower.includes('management');
      }
      if (code.includes('ACCOUNT') || code.includes('FINANCE') || name.includes('finance')) {
        return dLower.includes('account') || dLower.includes('finance');
      }
      if (code.includes('SITE') || code.includes('ENGINEER') || name.includes('engineer')) {
        return dLower.includes('engineering') || dLower.includes('site') || dLower.includes('structural');
      }
      return dLower.includes(name) || name.includes(dLower);
    });

    if (matched) return matched;

    // 2. Specific role code fallbacks
    if (code.includes('HR') || name.includes('hr')) return 'HR & Administration';
    if (code.includes('SUPER_ADMIN') || code.includes('ADMIN')) return 'Super Admin';
    if (code.includes('ARCHITECT')) return 'Architecture & Design';
    if (code.includes('PM') || code.includes('PROJECT')) return 'Project Management';

    return roleObj.roleName ? `${roleObj.roleName} Department` : (deptNames[0] || 'Office Staff');
  };

  const handleAddEmployee = () => {
    setNewEmployee({
      name: '',
      email: '',
      password: '',
      phone: '',
      roleId: '',
      role: '',
      department: '',
      designation: '',
      baseSalary: '',
      deviceId: 'GUID-MACHINE-123'
    });
    setCreateError('');
    setShowAddModal(true);
  };

  const handleCreateEmployeeSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateFieldErrors({});

    const errors = {};
    const { name, email, password, phone, roleId, role, department, designation, baseSalary, deviceId } = newEmployee;

    if (!name || !name.trim()) errors.name = 'Full Name is required.';
    if (!email || !email.trim()) {
      errors.email = 'Email address is required.';
    } else if (/[A-Z]/.test(email)) {
      errors.email = 'Email address must contain only lowercase letters (e.g. john@nirman.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else {
      const isPassValid = 
        password.length >= 8 &&
        password.length <= 15 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

      if (!isPassValid) {
        errors.password = 'Password must be 8-15 chars with uppercase, lowercase, number & special char.';
      }
    }

    if (!phone || !phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (phone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    }

    if (!roleId) errors.roleId = 'Please select a system role.';
    if (!department || !department.trim()) errors.department = 'Department selection is required.';
    if (!designation || !designation.trim()) errors.designation = 'Designation is required.';
    if (!baseSalary) errors.baseSalary = 'Base Salary (INR) is required.';
    if (!deviceId || !deviceId.trim()) errors.deviceId = 'Hardware Device ID is required.';

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        roleId,
        role,
        department,
        designation,
        baseSalary: Number(baseSalary),
        deviceId
      };

      const response = await registerUser(payload);
      if (response.success || response._id) {
        const localUsers = JSON.parse(localStorage.getItem('nirman_users') || '[]');
        const localNewUser = {
          id: response._id || 'u_' + Math.random().toString(36).substr(2, 9),
          _id: response._id || 'u_' + Math.random().toString(36).substr(2, 9),
          name: payload.name,
          email: payload.email,
          role: payload.designation,
          department: payload.department,
          registeredDeviceId: payload.deviceId || 'GUID-MACHINE-123',
          deviceId: payload.deviceId || 'GUID-MACHINE-123',
          deviceStatus: 'PENDING',
          createdAt: new Date().toISOString()
        };
        localUsers.push(localNewUser);
        localStorage.setItem('nirman_users', JSON.stringify(localUsers));

        // Create Pending Device Change Request
        const localRequests = JSON.parse(localStorage.getItem('nirman_device_requests') || '[]');
        const newReq = {
          id: 'dreq-' + Date.now(),
          requestId: 'dreq-' + Date.now(),
          _id: 'dreq-' + Date.now(),
          userId: localNewUser,
          user: localNewUser,
          oldDeviceId: 'None (New Employee)',
          newDeviceId: payload.deviceId || 'GUID-MACHINE-123',
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };
        localRequests.unshift(newReq);
        localStorage.setItem('nirman_device_requests', JSON.stringify(localRequests));

        alert('Workforce employee added successfully!');
        setShowAddModal(false);
        setNewEmployee({
          name: '',
          email: '',
          password: '',
          phone: '',
          roleId: '',
          role: '',
          department: '',
          designation: '',
          baseSalary: '',
          deviceId: 'GUID-MACHINE-123'
        });
        loadData(); // Reload table data
      } else {
        setCreateError(response.message || 'Failed to create employee.');
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create employee.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditEmployee = async (employee) => {
    setEditError('');
    setEditLoading(true);
    setShowEditModal(true);
    try {
      const res = await getUserById(employee.id);
      if (res.success || res._id) {
        const u = res;
        const roleIdVal = typeof u.roleId === 'object' ? (u.roleId?._id || u.roleId?.id) : u.roleId;
        const roleCodeVal = typeof u.roleId === 'object' ? u.roleId?.roleCode : (u.role || 'EMPLOYEE');
        
        setEditEmployeeData({
          id: u._id || u.id,
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || u.mobileNumber || '',
          roleId: roleIdVal || '',
          role: roleCodeVal || '',
          department: u.department || '',
          designation: u.designation || '',
          baseSalary: u.baseSalary !== undefined ? String(u.baseSalary) : '',
          deviceId: u.deviceId || u.registeredDeviceId || ''
        });
      } else {
        setEditError('Failed to fetch employee details.');
      }
    } catch (err) {
      setEditError(err.message || 'Failed to fetch employee details.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditEmployeeSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditFieldErrors({});

    const errors = {};
    const { id, name, email, phone, roleId, role, department, designation, baseSalary, deviceId } = editEmployeeData;

    if (!name || !name.trim()) errors.name = 'Full Name is required.';
    if (!email || !email.trim()) errors.email = 'Email address is required.';
    if (!phone || !phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (phone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    }
    if (!roleId) errors.roleId = 'Please select a system role.';
    if (!department || !department.trim()) errors.department = 'Department selection is required.';
    if (!designation || !designation.trim()) errors.designation = 'Designation is required.';
    if (!baseSalary) errors.baseSalary = 'Base Salary (INR) is required.';
    if (!deviceId || !deviceId.trim()) errors.deviceId = 'Hardware Device ID is required.';

    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors);
      return;
    }

    setEditLoading(true);

    try {
      const payload = {
        name,
        email,
        phone,
        roleId,
        role,
        department,
        designation,
        baseSalary: Number(baseSalary),
        deviceId
      };

      const response = await updateUser(id, payload);
      if (response.success || response._id) {
        // Update local storage mock users list as well to keep simulation synchronized
        const localUsers = JSON.parse(localStorage.getItem('nirman_users') || '[]');
        const updatedLocalUsers = localUsers.map(u => {
          if (u.id === id || u.email?.toLowerCase() === email.toLowerCase()) {
            return {
              ...u,
              name: payload.name,
              email: payload.email,
              role: payload.designation,
              department: payload.department,
              registeredDeviceId: payload.deviceId
            };
          }
          return u;
        });
        localStorage.setItem('nirman_users', JSON.stringify(updatedLocalUsers));

        alert('Workforce employee updated successfully!');
        setShowEditModal(false);
        loadData();
      } else {
        setEditError(response.message || 'Failed to update employee.');
      }
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update employee.');
    } finally {
      setEditLoading(false);
    }
  };

  // Live Alerts calculated from actual logs
  const liveAlerts = attendanceLogs.slice(0, 5).map((log, idx) => ({
    id: idx,
    type: log.mode,
    time: log.timeIn !== 'N/A' ? log.timeIn : log.timeOut,
    message: `${log.name} logged ${log.timeIn !== 'N/A' ? 'check-in' : 'check-out'} via ${log.mode === 'Office' ? 'laptop registry' : 'mobile GPS'}.`
  }));

  return (
    <div className="space-y-6">
      


      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-605 rounded-2xl flex items-center gap-3 text-xs font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Render Active View */}
      <div>
        {activeTab === 'attendance' && (
          <AttendanceOps 
            attendanceLogs={attendanceLogs}
            liveAlerts={liveAlerts}
            onSelectEmployee={setSelectedLog}
            selectedEmployee={selectedLog}
          />
        )}

        {activeTab === 'app-usage' && (
          <AppUsageTracking userRole="Admin" />
        )}

        {activeTab === 'employees' && (
          <EmployeesHR 
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={setSelectedEmployee}
            onAddEmployeeClick={handleAddEmployee}
            onEditEmployeeClick={handleEditEmployee}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceBindingApprovals employees={employees} onRefresh={loadData} />
        )}
      {/* Add Employee Modal overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[95vh] overflow-y-auto text-left">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add New Workforce Employee</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Register user on backend database and bind machine</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {createError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-605 rounded-2xl flex items-center gap-3 text-xs font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateEmployeeSubmit} autoComplete="off" className="space-y-4">
              
              {/* Full Name field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required
                    autoComplete="off"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. John Doe" 
                    className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                      newEmployee.name && newEmployee.name.trim().length < 2 ? 'border-rose-400' : 'border-slate-200 focus:border-brand-secondary'
                    }`}
                  />
                </div>
                {newEmployee.name && newEmployee.name.trim().length < 2 && (
                  <p className="text-rose-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Full Name must be at least 2 characters</span>
                  </p>
                )}
              </div>

              {/* Email & Phone number row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Email Address with Inline Lowercase & Format Validation Error */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Email Address <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      required
                      autoComplete="off"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. john@nirman.com" 
                      className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                        newEmployee.email && (/[A-Z]/.test(newEmployee.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email))
                          ? 'border-rose-400' 
                          : 'border-slate-200 focus:border-brand-secondary'
                      }`}
                    />
                  </div>
                  {newEmployee.email && /[A-Z]/.test(newEmployee.email) ? (
                    <p className="text-rose-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Email address must contain only lowercase letters (no capital letters allowed, e.g. john@nirman.com)</span>
                    </p>
                  ) : newEmployee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmployee.email) ? (
                    <p className="text-rose-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Please enter a valid email address (e.g. user@nirman.com)</span>
                    </p>
                  ) : null}
                </div>

                {/* Phone Number Field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Phone Number (10 Digits) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="tel" 
                      required
                      autoComplete="off"
                      maxLength={10}
                      value={newEmployee.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNewEmployee(prev => ({ ...prev, phone: val }));
                      }}
                      placeholder="e.g. 9876543210" 
                      className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 font-mono ${
                        newEmployee.phone && newEmployee.phone.length < 10 ? 'border-rose-400' : 'border-slate-200 focus:border-brand-secondary'
                      }`}
                    />
                  </div>
                  {newEmployee.phone && newEmployee.phone.length < 10 && (
                    <p className="text-rose-500 text-[10px] font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Phone number must be exactly 10 digits ({newEmployee.phone.length}/10)</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Password Field with Live Password Policy Indicators */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Password (8-15 Chars, Uppercase, Lowercase, Number & Special Char) <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type={showCreatePass ? 'text' : 'password'} 
                    required
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={15}
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="e.g. Nirman@2026" 
                    className={`w-full pl-9 pr-10 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                      newEmployee.password
                        ? (
                            newEmployee.password.length >= 8 &&
                            newEmployee.password.length <= 15 &&
                            /[A-Z]/.test(newEmployee.password) &&
                            /[a-z]/.test(newEmployee.password) &&
                            /[0-9]/.test(newEmployee.password) &&
                            /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newEmployee.password)
                              ? 'border-emerald-500'
                              : 'border-rose-400'
                          )
                        : 'border-slate-200 focus:border-brand-secondary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePass(!showCreatePass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title={showCreatePass ? "Hide password" : "Show password"}
                  >
                    {showCreatePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Requirements Live Badges */}
                {newEmployee.password && (
                  <div className="pt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] font-extrabold">
                    <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                      newEmployee.password.length >= 8 && newEmployee.password.length <= 15
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {newEmployee.password.length >= 8 && newEmployee.password.length <= 15 ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      8-15 Chars ({newEmployee.password.length})
                    </span>

                    <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                      /[A-Z]/.test(newEmployee.password)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {/[A-Z]/.test(newEmployee.password) ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      Uppercase (A-Z)
                    </span>

                    <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                      /[a-z]/.test(newEmployee.password)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {/[a-z]/.test(newEmployee.password) ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      Lowercase (a-z)
                    </span>

                    <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                      /[0-9]/.test(newEmployee.password)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {/[0-9]/.test(newEmployee.password) ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      Number (0-9)
                    </span>

                    <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newEmployee.password)
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newEmployee.password) ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-500" />}
                      Special Char (@,#,$,etc.)
                    </span>
                  </div>
                )}
              </div>

              {/* Role dropdown loaded from API */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Assign System Role <span className="text-rose-500 font-bold">*</span> {rolesLoading && '(Loading roles...)'}
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={newEmployee.roleId}
                    onChange={(e) => {
                      const selectedRoleId = e.target.value;
                      const selectedRole = roles.find(r => (r._id || r.id) === selectedRoleId);
                      if (selectedRole) {
                        const matchedDept = autoMatchDepartment(selectedRole, departments);
                        setNewEmployee(prev => ({
                          ...prev,
                          roleId: selectedRoleId,
                          role: selectedRole.roleCode,
                          designation: selectedRole.roleName,
                          department: matchedDept
                        }));
                        if (matchedDept) {
                          setCreateFieldErrors(prev => ({ ...prev, department: '' }));
                        }
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-800"
                  >
                    {roles.map(r => {
                      const val = typeof r === 'object' ? (r._id || r.id || r.roleCode) : r;
                      const name = typeof r === 'object' 
                        ? (typeof r.roleName === 'string' ? r.roleName : (typeof r.name === 'string' ? r.name : (typeof r.roleCode === 'string' ? r.roleCode : 'Role')))
                        : String(r);
                      const code = typeof r === 'object' ? (typeof r.roleCode === 'string' ? r.roleCode : '') : '';
                      return (
                        <option key={val} value={val}>
                          {name} {code ? `(${code})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Department & Designation row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Department <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <select 
                      value={newEmployee.department}
                      onChange={(e) => {
                        setNewEmployee(prev => ({ ...prev, department: e.target.value }));
                        if (e.target.value) setCreateFieldErrors(prev => ({ ...prev, department: '' }));
                      }}
                      className={`w-full pl-9 pr-4 py-2.5 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 cursor-pointer ${
                        createFieldErrors.department ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:border-rose-500' : 'border-slate-200 focus:border-brand-secondary'
                      }`}
                    >
                      <option value="">Select Department *</option>
                      {departmentsLoading ? (
                        <option value="" disabled>Loading departments from API...</option>
                      ) : (
                        Array.from(new Set([
                          ...(newEmployee.department ? [newEmployee.department] : []),
                          ...departments.map(d => typeof d === 'string' ? d : (d.name || d.departmentName || d.title || 'Department'))
                        ])).filter(Boolean).map((deptName, idx) => (
                          <option key={idx} value={deptName}>
                            {deptName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {createFieldErrors.department && (
                    <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      {createFieldErrors.department}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Designation <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={newEmployee.designation}
                      onChange={(e) => {
                        setNewEmployee(prev => ({ ...prev, designation: e.target.value }));
                        if (e.target.value) setCreateFieldErrors(prev => ({ ...prev, designation: '' }));
                      }}
                      placeholder="e.g. Employee / Senior Architect" 
                      className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                        createFieldErrors.designation ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                      }`}
                    />
                  </div>
                  {createFieldErrors.designation && (
                    <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      {createFieldErrors.designation}
                    </span>
                  )}
                </div>
              </div>

              {/* Base Salary & Hardware Device ID (GUI) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Base Salary (INR) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={newEmployee.baseSalary}
                      onChange={(e) => {
                        setNewEmployee(prev => ({ ...prev, baseSalary: e.target.value }));
                        if (e.target.value) setCreateFieldErrors(prev => ({ ...prev, baseSalary: '' }));
                      }}
                      placeholder="25000" 
                      className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                        createFieldErrors.baseSalary ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                      }`}
                    />
                  </div>
                  {createFieldErrors.baseSalary && (
                    <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      {createFieldErrors.baseSalary}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                    Hardware Device ID (GUID) <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={newEmployee.deviceId}
                      onChange={(e) => {
                        setNewEmployee(prev => ({ ...prev, deviceId: e.target.value }));
                        if (e.target.value) setCreateFieldErrors(prev => ({ ...prev, deviceId: '' }));
                      }}
                      placeholder="GUID-MACHINE-123" 
                      className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                        createFieldErrors.deviceId ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                      }`}
                    />
                  </div>
                  {createFieldErrors.deviceId && (
                    <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                      <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                      {createFieldErrors.deviceId}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase rounded-xl transition-all shadow-3xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-slate-905 text-xs font-black uppercase rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  {createLoading ? 'Registering...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Employee Modal overlay */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[95vh] overflow-y-auto text-left">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-905">Edit Workforce Employee</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Modify user details and roles in backend database</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {editError && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-605 rounded-2xl flex items-center gap-3 text-xs font-bold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {editLoading && !editEmployeeData.id ? (
              <div className="p-8 text-center text-xs font-semibold text-slate-400">Loading employee details...</div>
            ) : (
              /* Form */
              <form onSubmit={handleEditEmployeeSubmit} className="space-y-4">
                
                {/* Full Name field */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      value={editEmployeeData.name}
                      onChange={(e) => setEditEmployeeData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Sarah Connor" 
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                    />
                  </div>
                </div>

                {/* Email & Phone number row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Email Address (Read-Only)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        readOnly
                        value={editEmployeeData.email}
                        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold text-slate-400 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        required
                        value={editEmployeeData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) {
                            setEditEmployeeData(prev => ({ ...prev, phone: val }));
                          }
                        }}
                        placeholder="9898989898" 
                        className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                      />
                    </div>
                  </div>
                </div>

                {/* Role dropdown loaded from API */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">
                    Assign System Role
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={editEmployeeData.roleId}
                      onChange={(e) => {
                        const selectedRoleId = e.target.value;
                        const selectedRole = roles.find(r => (r._id || r.id) === selectedRoleId);
                        if (selectedRole) {
                          const matchedDept = autoMatchDepartment(selectedRole, departments);
                          setEditEmployeeData(prev => ({
                            ...prev,
                            roleId: selectedRoleId,
                            role: selectedRole.roleCode,
                            designation: selectedRole.roleName,
                            department: matchedDept
                          }));
                          if (matchedDept) {
                            setEditFieldErrors(prev => ({ ...prev, department: '' }));
                          }
                        }
                      }}
                      className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                    >
                      {roles.map(r => {
                        const val = typeof r === 'object' ? (r._id || r.id || r.roleCode) : r;
                        const name = typeof r === 'object' 
                          ? (typeof r.roleName === 'string' ? r.roleName : (typeof r.name === 'string' ? r.name : (typeof r.roleCode === 'string' ? r.roleCode : 'Role')))
                          : String(r);
                        const code = typeof r === 'object' ? (typeof r.roleCode === 'string' ? r.roleCode : '') : '';
                        return (
                          <option key={val} value={val}>
                            {name} {code ? `(${code})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Department & Designation row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Department</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <select 
                        value={editEmployeeData.department}
                        onChange={(e) => {
                          setEditEmployeeData(prev => ({ ...prev, department: e.target.value }));
                          if (e.target.value) setEditFieldErrors(prev => ({ ...prev, department: '' }));
                        }}
                        className={`w-full pl-9 pr-4 py-2.5 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 cursor-pointer ${
                          editFieldErrors.department ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:border-rose-500' : 'border-slate-200 focus:border-brand-secondary'
                        }`}
                      >
                        <option value="">Select Department *</option>
                        {departmentsLoading ? (
                          <option value="" disabled>Loading departments from API...</option>
                        ) : (
                          Array.from(new Set([
                            ...(editEmployeeData.department ? [editEmployeeData.department] : []),
                            ...departments.map(d => typeof d === 'string' ? d : (d.name || d.departmentName || d.title || 'Department'))
                          ])).filter(Boolean).map((deptName, idx) => (
                            <option key={idx} value={deptName}>
                              {deptName}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    {editFieldErrors.department && (
                      <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        {editFieldErrors.department}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Designation <span className="text-rose-500 font-bold">*</span></label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={editEmployeeData.designation}
                        onChange={(e) => {
                          setEditEmployeeData(prev => ({ ...prev, designation: e.target.value }));
                          if (e.target.value) setEditFieldErrors(prev => ({ ...prev, designation: '' }));
                        }}
                        placeholder="e.g. Employee / Senior Architect" 
                        className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                          editFieldErrors.designation ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                        }`}
                      />
                    </div>
                    {editFieldErrors.designation && (
                      <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        {editFieldErrors.designation}
                      </span>
                    )}
                  </div>
                </div>

                {/* Base Salary & Hardware Device ID (GUI) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Base Salary (INR) <span className="text-rose-500 font-bold">*</span></label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        value={editEmployeeData.baseSalary}
                        onChange={(e) => {
                          setEditEmployeeData(prev => ({ ...prev, baseSalary: e.target.value }));
                          if (e.target.value) setEditFieldErrors(prev => ({ ...prev, baseSalary: '' }));
                        }}
                        placeholder="25000" 
                        className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                          editFieldErrors.baseSalary ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                        }`}
                      />
                    </div>
                    {editFieldErrors.baseSalary && (
                      <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        {editFieldErrors.baseSalary}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Hardware Device ID (GUID) <span className="text-rose-500 font-bold">*</span></label>
                    <div className="relative">
                      <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={editEmployeeData.deviceId}
                        onChange={(e) => {
                          setEditEmployeeData(prev => ({ ...prev, deviceId: e.target.value }));
                          if (e.target.value) setEditFieldErrors(prev => ({ ...prev, deviceId: '' }));
                        }}
                        placeholder="GUID-MACHINE-123" 
                        className={`w-full pl-9 pr-4 py-2 text-xs border rounded-xl bg-white focus:outline-none font-semibold text-slate-800 ${
                          editFieldErrors.deviceId ? 'border-rose-500 bg-rose-50/20 text-rose-900 focus:border-rose-500' : 'border-slate-200 focus:border-brand-primary'
                        }`}
                      />
                    </div>
                    {editFieldErrors.deviceId && (
                      <span className="text-[10px] font-extrabold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        {editFieldErrors.deviceId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-slate-50 border border-slate-205 hover:bg-slate-100 text-slate-700 text-xs font-black uppercase rounded-xl transition-all shadow-3xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary disabled:opacity-50 text-slate-905 text-xs font-black uppercase rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
