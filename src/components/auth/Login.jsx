import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import loginHero from '../../assets/images/login/loginpage.png';
import { Ruler, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../../service/auth';

const EMAIL_ROLE_MAP = {
  'admin@nirman.com': 'Admin',
  'kadambhakti@gmail.com': 'Admin',
  'hr@nirman.com': 'HR',
  'pm@nirman.com': 'ProjectManager',
  'architect@nirman.com': 'Architect',
  'engineer@nirman.com': 'SiteEngineer',
  'employee@gmail.com': 'Employee',
  'customer@nirman.com': 'Customer'
};

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@nirman.com');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const normalizeRole = (role) => {
    if (!role) return 'Employee';
    const rawVal = typeof role === 'object' ? (role.roleCode || role.role || 'Employee') : role;
    const r = String(rawVal).toLowerCase().trim();
    if (r.includes('admin') || r.includes('super')) return 'Admin';
    if (r.includes('hr')) return 'HR';
    if (r.includes('site') || r.includes('engineer')) return 'SiteEngineer';
    if (r.includes('manager') || r.includes('pm')) return 'ProjectManager';
    if (r.includes('architect')) return 'Architect';
    if (r.includes('customer')) return 'Customer';
    return 'Employee';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      setError('');
      const response = await loginUser(cleanEmail, password);
      
      const token = response.token || response.data?.token;
      // Extremely robust success flag resolution: checks explicit flag, presence of token, or success message.
      const success = response.success === true || !!token || response.data?.success === true || String(response.message).toLowerCase().includes('success');
      
      if (success) {
        // Extract user data from response or nested data object
        const userObj = response.user || response.data?.user || response.data || response;
        const user = {
          id: userObj.id || userObj._id || cleanEmail.split('@')[0],
          name: userObj.name || cleanEmail.split('@')[0].toUpperCase(),
          email: userObj.email || cleanEmail,
          role: userObj.role,
          roleCode: userObj.roleCode,
          roleId: userObj.roleId,
          deviceId: userObj.deviceId
        };
        
        if (token) {
          localStorage.setItem('token', token);
        }
        
        // Prioritize roleCode for normalisation
        const roleToNormalize = user.roleCode || user.role || 'SUPER_ADMIN';
        const normRole = normalizeRole(roleToNormalize);
        
        // Save details inside localStorage user metadata for route checks
        const updatedUser = { ...user, role: normRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        onLogin(normRole);
      } else {
        setError(response.message || 'Invalid login credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please check your credentials or network.'
      );
    }
  };


  const fillQuickCredentials = (demoEmail) => {
    setEmail(demoEmail);
    if (demoEmail === 'admin@nirman.com') {
      setPassword('Admin123!');
    } else if (demoEmail === 'kadambhakti@gmail.com') {
      setPassword('Password123!');
    } else {
      setPassword('Password123!');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white text-left">
      
      {/* Left Column: Graphic & Centered Branding - Clean Solid Gradient Background */}
      <div className="w-full md:w-1/2 bg-gradient-to-tr from-brand-light via-brand-soft to-brand-secondary p-8 flex flex-col justify-between items-center text-brand-dark min-h-[300px] md:min-h-screen">
        
        {/* Centered Graphic & Brand Package */}
        <div className="my-auto flex flex-col items-center space-y-4 md:space-y-8">
          
          {/* Logo & Typography Group (Centered) */}
          <div className="text-center space-y-2">
            <h1 className="text-xl md:text-2xl font-black tracking-widest text-slate-900 uppercase">
              NIRMAN <span className="font-light text-slate-600">ARCHITECTS</span>
            </h1>
            <div className="w-10 h-0.5 bg-brand-primary mx-auto rounded-full mt-2"></div>
          </div>

          {/* Graphic Frame */}
          <div className="w-32 h-32 md:w-80 md:h-80 overflow-hidden rounded-2xl">
            <img 
              src={loginHero} 
              alt="Architect Graphic illustration" 
              className="w-full h-full object-cover"
            />
          </div>

        </div>

        {/* Footer branding */}
        <div className="text-[10px] tracking-widest font-black text-slate-500 uppercase mt-4 md:mt-0">
          powered by Nex Alliance
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center bg-white min-h-[450px] md:min-h-screen">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back!</h2>
            <p className="text-xs text-slate-400">Enter your credentials to enter the workspace simulation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nirman.com"
                className="w-full px-4 py-3 text-xs font-semibold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-12 py-3 text-xs font-semibold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 font-bold text-slate-500 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-brand-primary border-slate-300 rounded cursor-pointer"
                />
                Remember me
              </label>
              <a href="#" className="font-bold text-brand-dark hover:underline" onClick={(e) => { e.preventDefault(); alert("Password reset is not active in this simulation."); }}>
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-bold border border-rose-100">
                {error}
              </div>
            )}

            {/* Login button - Using Brand Color Combination (bg-brand-primary) */}
            <button 
              type="submit"
              className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold rounded-full text-xs transition-all shadow-sm hover:shadow active:scale-98"
            >
              Login
            </button>
          </form>

          <div className="relative text-center">
            <div className="absolute inset-y-1/2 left-0 right-0 border-t border-slate-200"></div>
            <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              or continue with
            </span>
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => alert("Google sign-in is simulated.")}
              className="py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 transition-colors"
              title="Google Login"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 5.92 1 12 5.92 12 12s4.92 11 11.24 11c6.6 0 11-4.65 11-11.2 0-.756-.08-1.333-.18-1.815H12.24z"/>
              </svg>
            </button>
            <button 
              onClick={() => alert("GitHub sign-in is simulated.")}
              className="py-2.5 bg-white hover:bg-slate-50 border border-slate-202 rounded-full flex items-center justify-center text-slate-605 transition-colors"
              title="GitHub Login"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </button>
            <button 
              onClick={() => alert("Apple sign-in is simulated.")}
              className="py-2.5 bg-white hover:bg-slate-50 border border-slate-205 rounded-full flex items-center justify-center text-slate-605 transition-colors"
              title="Apple Login"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z"/>
              </svg>
            </button>
          </div>


          {/* Helper quick switch buttons for easy testing */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-wider">
              Quick Demo Accounts (Click to Fill)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(EMAIL_ROLE_MAP).map((demoEmail) => (
                <button
                  key={demoEmail}
                  type="button"
                  onClick={() => fillQuickCredentials(demoEmail)}
                  className="text-[9px] px-2.5 py-1 bg-slate-50 hover:bg-brand-tint border border-slate-200 text-slate-600 hover:text-slate-800 rounded-full font-bold transition-all"
                >
                  {demoEmail.split('@')[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
