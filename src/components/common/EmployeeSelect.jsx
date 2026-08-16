import React, { useState, useEffect } from 'react';
import { getUsersList } from '../../service/auth';
import { Users, RefreshCw } from 'lucide-react';

export default function EmployeeSelect({ 
  value, 
  onChange, 
  roleCodes = [], 
  department = '', 
  isActiveOnly = true,
  required = false, 
  className = '', 
  disabled = false,
  placeholder = "Select Employee *"
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

  return (
    <div className="relative w-full">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6] bg-white font-semibold text-xs text-slate-900 ${className}`}
      >
        <option value="">{placeholder}</option>
        {filteredUsers.map((emp) => {
          const empId = emp._id || emp.id;
          const roleName = emp.roleId?.roleName || emp.role || emp.roleCode || '';
          const deptName = emp.department || '';
          const designation = emp.designation || '';
          const metaInfo = [deptName, designation || roleName].filter(Boolean).join(' · ');

          return (
            <option key={empId} value={empId}>
              {emp.name || emp.email} {metaInfo ? `(${metaInfo})` : ''}
            </option>
          );
        })}
      </select>

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
