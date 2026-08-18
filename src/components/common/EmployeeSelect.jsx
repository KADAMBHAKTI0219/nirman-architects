import React, { useState, useEffect } from 'react';
import { getUsersList } from '../../service/auth';
import { RefreshCw } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function EmployeeSelect({ 
  value, 
  onChange, 
  roleCodes = [], 
  department = '', 
  isActiveOnly = true,
  required = false, 
  className = '', 
  disabled = false,
  placeholder = "Select Employee *",
  label = "",
  variant = "default"
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchUsersData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getUsersList();
      if (res && res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      } else {
        setError(true);
      }
    } catch (err) {
      console.warn("EmployeeSelect fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const filteredUsers = users.filter(user => {
    if (isActiveOnly && user.isActive === false) return false;
    
    if (department && user.department && user.department.toLowerCase() !== department.toLowerCase()) {
      return false;
    }

    if (roleCodes && roleCodes.length > 0) {
      const uRoleCode = (user.roleId?.roleCode || user.roleCode || user.role || '').toUpperCase();
      const uRoleName = (user.roleId?.roleName || user.role || '').toUpperCase();
      
      const matches = roleCodes.some(rc => {
        const cleanRC = rc.toUpperCase().replace(/[\s_\-]/g, '');
        const cleanURoleCode = uRoleCode.replace(/[\s_\-]/g, '');
        const cleanURoleName = uRoleName.replace(/[\s_\-]/g, '');
        return cleanURoleCode.includes(cleanRC) || cleanURoleName.includes(cleanRC);
      });
      if (!matches) return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 font-semibold">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
        <span>Loading Employees...</span>
      </div>
    );
  }

  const selectOptions = filteredUsers.map((emp) => {
    const empId = emp._id || emp.id;
    const empName = emp.name || emp.fullName || emp.email;
    const roleName = emp.roleId?.roleName || emp.role || emp.roleCode || '';
    const deptName = emp.department || '';
    const designation = emp.designation || '';
    const metaInfo = [deptName, designation || roleName, emp.email].filter(Boolean).join(' • ');

    return {
      value: empId,
      label: empName,
      subtext: metaInfo,
      raw: emp
    };
  });

  return (
    <div className="relative w-full">
      <CustomSelect
        value={value || ''}
        onChange={(val, rawEmp) => onChange && onChange(val, rawEmp)}
        options={selectOptions}
        placeholder={placeholder}
        label={label}
        required={required}
        disabled={disabled}
        searchable={true}
        variant={variant}
        className={className}
      />

      {error && (
        <div className="flex items-center justify-between text-[10px] text-amber-600 font-bold mt-1">
          <span>Failed to load live users</span>
          <button type="button" onClick={fetchUsersData} className="underline hover:text-amber-800 cursor-pointer">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
