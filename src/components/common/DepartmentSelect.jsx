import React, { useState, useEffect } from 'react';
import { getActiveDepartments, getCleanDepartmentName } from '../../service/departments';
import { Building, RefreshCw } from 'lucide-react';

export default function DepartmentSelect({ value, onChange, required = false, className = '', disabled = false }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getActiveDepartments();
      if (res && res.success && Array.isArray(res.departments)) {
        setDepartments(res.departments);
      } else if (Array.isArray(res)) {
        setDepartments(res);
      } else if (res && Array.isArray(res.data)) {
        setDepartments(res.data);
      } else {
        setDepartments([]);
      }
    } catch (err) {
      console.warn("DepartmentSelect fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 font-semibold">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
        <span>Loading Departments...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full text-left">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-secondary bg-white font-semibold text-xs text-slate-800 ${className}`}
      >
        <option value="">Select Department *</option>
        {departments.map((dept, idx) => {
          const deptName = getCleanDepartmentName(dept);
          if (!deptName) return null;
          return (
            <option key={dept._id || dept.id || idx} value={deptName}>
              {deptName}
            </option>
          );
        })}
      </select>

      {error && (
        <div className="flex items-center justify-between text-[10px] text-amber-600 font-bold mt-1">
          <span>Failed to load live departments</span>
          <button type="button" onClick={fetchDepts} className="underline hover:text-amber-800 cursor-pointer">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
