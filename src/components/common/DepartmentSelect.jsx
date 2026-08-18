import React, { useState, useEffect } from 'react';
import { getActiveDepartments, parseDepartments, DEFAULT_ARCHITECTURAL_DEPARTMENTS } from '../../service/departments';
import { RefreshCw } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function DepartmentSelect({
  value,
  onChange,
  required = false,
  className = '',
  disabled = false,
  placeholder = "Select Department...",
  label = "",
  variant = "default"
}) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getActiveDepartments();
      const cleanNames = parseDepartments(res);
      setDepartments(cleanNames);
    } catch (err) {
      console.warn("DepartmentSelect fetch error:", err);
      setError(true);
      setDepartments(DEFAULT_ARCHITECTURAL_DEPARTMENTS.map(d => d.name));
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

  const selectOptions = departments.map(deptName => ({
    value: deptName,
    label: deptName
  }));

  return (
    <div className="relative w-full text-left">
      <CustomSelect
        value={value || ''}
        onChange={(val) => onChange && onChange(val)}
        options={selectOptions}
        placeholder={placeholder}
        label={label}
        required={required}
        disabled={disabled}
        variant={variant}
        className={className}
      />

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
