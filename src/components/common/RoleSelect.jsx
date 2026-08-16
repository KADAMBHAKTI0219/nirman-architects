import React, { useState, useEffect } from 'react';
import { getRoles } from '../../service/auth';
import { Shield, RefreshCw } from 'lucide-react';

export default function RoleSelect({ value, onChange, required = false, className = '', disabled = false }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchRolesData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getRoles();
      if (res && res.success && Array.isArray(res.roles)) {
        setRoles(res.roles);
      } else {
        setError(true);
      }
    } catch (err) {
      console.warn("RoleSelect fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 font-semibold">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
        <span>Loading Roles...</span>
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
        <option value="">Select Role *</option>
        {roles.map((role) => (
          <option key={role._id || role.id || role.roleCode} value={role._id || role.id}>
            {role.roleName || role.roleCode || role.name}
          </option>
        ))}
      </select>

      {error && (
        <div className="flex items-center justify-between text-[10px] text-amber-600 font-bold mt-1">
          <span>Failed to load live roles</span>
          <button type="button" onClick={fetchRolesData} className="underline hover:text-amber-800 cursor-pointer">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
