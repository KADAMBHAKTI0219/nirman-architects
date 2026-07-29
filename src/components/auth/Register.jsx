import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Shield, Laptop, 
  ArrowLeft, CheckCircle2, AlertCircle, Clock,
  Briefcase, DollarSign
} from 'lucide-react';
import { registerUser, getRoles } from '../../service/auth';

export default function Register() {
  const navigate = useNavigate();

  // Form Fields State aligned with Backend Schema
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: '',
    role: '',
    department: '',
    designation: '',
    baseSalary: '',
    deviceId: import.meta.env.VITE_LOCAL_DEVICE_ID || 'GUID-MACHINE-123'
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load available roles from backend API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const res = await getRoles();
        if (res.success && Array.isArray(res.roles)) {
          setRoles(res.roles);
          // Set EMPLOYEE as default role if it exists in retrieved roles
          const defaultRole = res.roles.find(r => r.roleCode === 'EMPLOYEE') || res.roles[0];
          if (defaultRole) {
            setFormData(prev => ({
              ...prev,
              roleId: defaultRole._id || defaultRole.id,
              role: defaultRole.roleCode,
              designation: defaultRole.roleName,
              department: defaultRole.roleCode === 'SUPER_ADMIN' ? 'Super Admin' : 'Office Staff'
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to load roles, fallback to default list", err);
        const fallbackRoles = [
          { "_id": "6a6377dd1c9726ccf73aa7fd", "roleCode": "SUPER_ADMIN", "roleName": "Super Admin" },
          { "_id": "6a6377dd1c9726ccf73aa7fe", "roleCode": "HR", "roleName": "HR" },
          { "_id": "6a6377dd1c9726ccf73aa7ff", "roleCode": "PROJECT_MANAGER", "roleName": "Project Manager" },
          { "_id": "6a6377dd1c9726ccf73aa800", "roleCode": "ARCHITECT", "roleName": "Architect" },
          { "_id": "6a6377dd1c9726ccf73aa801", "roleCode": "SITE_ENGINEER", "roleName": "Site Engineer" },
          { "_id": "6a6377de1c9726ccf73aa802", "roleCode": "EMPLOYEE", "roleName": "Employee" },
          { "_id": "6a6377de1c9726ccf73aa803", "roleCode": "CUSTOMER", "roleName": "Customer" }
        ];
        setRoles(fallbackRoles);
        const defaultRole = fallbackRoles.find(r => r.roleCode === 'EMPLOYEE') || fallbackRoles[0];
        setFormData(prev => ({
          ...prev,
          roleId: defaultRole._id,
          role: defaultRole.roleCode,
          designation: defaultRole.roleName,
          department: 'Office Staff'
        }));
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict phone to exactly 10 numeric digits
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 10) return;
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    const selectedRoleId = e.target.value;
    const selectedRole = roles.find(r => (r._id || r.id) === selectedRoleId);
    if (selectedRole) {
      setFormData(prev => ({
        ...prev,
        roleId: selectedRoleId,
        role: selectedRole.roleCode,
        designation: selectedRole.roleName,
        department: selectedRole.roleCode === 'SUPER_ADMIN' ? 'Super Admin' : (selectedRole.roleName + ' Department')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, email, password, phone, roleId, role, department, designation, baseSalary } = formData;

    if (!name || !email || !password || !phone || !roleId || !role || !department || !designation || !baseSalary) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      // Structure the payload explicitly to match backend schema keys
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
        deviceId: formData.deviceId
      };

      const response = await registerUser(payload);
      if (response.success || response._id) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Registration failed. Please check your network.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
        
        {/* Back Button & Title */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Login
          </button>
          <span className="text-[10px] font-black text-brand-dark bg-brand-tint px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Nirman Architects
          </span>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-slate-905 tracking-tight">Create Workforce Account</h2>
          <p className="text-[11px] text-slate-450 font-semibold uppercase tracking-wider">
            Registration & Hardware Device Binding Portal
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 py-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
            <strong className="text-sm font-black block">Account Registered Successfully!</strong>
            <p className="text-xs font-semibold text-slate-500 max-w-xs">
              Workforce member registered and device token bound to system. Redirecting to login...
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-405 font-bold uppercase tracking-wider pt-2">
              <Clock className="w-3 h-3 animate-spin" />
              <span>Redirecting in 3s</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Kadam Bhakti" 
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                />
              </div>
            </div>

            {/* Email & Phone number row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="kadambhakti@gmail.com" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••" 
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                />
              </div>
            </div>

            {/* Role dropdown loaded from API */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">
                Assign System Role {rolesLoading && '(Loading roles...)'}
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  name="roleId" 
                  value={formData.roleId}
                  onChange={handleRoleChange}
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
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Department</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="department" 
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Super Admin / Architecture" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Designation</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="designation" 
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Super Admin / Senior Architect" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>
            </div>

            {/* Base Salary & Hardware Device ID (GUI) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Base Salary (INR)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    name="baseSalary" 
                    value={formData.baseSalary}
                    onChange={handleChange}
                    placeholder="25000" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Hardware Device ID (GUID)</label>
                <div className="relative">
                  <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="deviceId" 
                    value={formData.deviceId}
                    onChange={handleChange}
                    placeholder="GUID-MACHINE-123" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-slate-905 font-black uppercase text-xs rounded-xl shadow-xs transition-all tracking-wider mt-4 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Workforce Account'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <span className="text-[10px] text-slate-400 font-semibold block">
            Already have an account? <Link to="/" className="text-brand-dark hover:underline font-bold">Login here</Link>
          </span>
        </div>

      </div>
    </div>
  );
}
