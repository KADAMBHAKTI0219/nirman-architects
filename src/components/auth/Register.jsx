import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Shield, Laptop, 
  ArrowLeft, CheckCircle2, AlertCircle, Clock 
} from 'lucide-react';
import { register, getRoles } from '../../services/auth.api';

export default function Register() {
  const navigate = useNavigate();

  // Form Fields State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    email: '',
    password: '',
    role: 'Super Admin',
    deviceId: import.meta.env.VITE_LOCAL_DEVICE_ID || 'E3D9C5BE-3D2C-4C2E-ACF8-A108FF8A3EC5'
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load available roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const res = await getRoles();
        if (res.success && Array.isArray(res.roles)) {
          setRoles(res.roles);
          // Set first role as default if available
          if (res.roles.length > 0) {
            setFormData(prev => ({ ...prev, role: res.roles[0].name }));
          }
        }
      } catch (err) {
        console.warn("Failed to load roles, fallback to default roles list", err);
        const fallbackRoles = [
          { "_id": "6a607dae7f99c70902371c1d", "name": "Super Admin" },
          { "_id": "6a607dae7f99c70902371c1f", "name": "HR" },
          { "_id": "6a607dae7f99c70902371c22", "name": "Project Manager" },
          { "_id": "6a607dae7f99c70902371c24", "name": "Architect" },
          { "_id": "6a607dae7f99c70902371c26", "name": "Site Engineer" },
          { "_id": "6a607dae7f99c70902371c28", "name": "Employee" },
          { "_id": "6a607dae7f99c70902371c2a", "name": "customer" },
          { "_id": "6a6094667f99c70902373c05", "name": "Site Manager" }
        ];
        setRoles(fallbackRoles);
        setFormData(prev => ({ ...prev, role: fallbackRoles[0].name }));
      } finally {
        setRolesLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Restrict mobile number to exactly 10 numeric digits
    if (name === 'mobileNumber') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.firstName || !formData.lastName || !formData.mobileNumber || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (formData.mobileNumber.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(response.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
        
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
              Hardware device token bound to system. Redirecting you to login portal...
            </p>
            <div className="flex items-center gap-1 text-[10px] text-slate-405 font-bold uppercase tracking-wider pt-2">
              <Clock className="w-3 h-3 animate-spin" />
              <span>Redirecting in 3s</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* First & Last Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>
            </div>

            {/* Email & Mobile Number row */}
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
                    placeholder="john.doe@example.com" 
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="tel" 
                    name="mobileNumber" 
                    value={formData.mobileNumber}
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
                  name="role" 
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                >
                  {roles.map(r => (
                    <option key={r._id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hardware Device ID (GUI) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-405 uppercase tracking-wider block">Hardware Device Binding ID (GUID)</label>
              <div className="relative">
                <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  name="deviceId" 
                  value={formData.deviceId}
                  onChange={handleChange}
                  placeholder="Device GUID" 
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-205 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary font-semibold text-slate-755"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-slate-905 font-black uppercase text-xs rounded-xl shadow-xs transition-all tracking-wider mt-4 disabled:opacity-50"
            >
              {loading ? 'Registering Device...' : 'Register Workforce Account'}
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
