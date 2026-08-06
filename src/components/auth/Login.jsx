import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import loginHero from '../../assets/images/login/loginpage.png';
import logoImg from '../../assets/images/logo.png';
import { Ruler, ArrowRight, Eye, EyeOff, ShieldCheck, User, Building, Lock, Key, AlertCircle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { loginUser } from '../../service/auth';
import { clientLogin, clientChangePassword, clientForgotPassword, clientResetPassword } from '../../service/client';

const STAFF_DEMO_ACCOUNTS = {
  'admin@nirman.com': 'Admin',
  'kadambhakti@gmail.com': 'Admin',
  'hr@nirman.com': 'HR',
  'pm@nirman.com': 'ProjectManager',
  'architect@nirman.com': 'Architect',
  'engineer@nirman.com': 'SiteEngineer',
  'employee@gmail.com': 'Employee'
};

const CLIENT_DEMO_ACCOUNTS = {
  'anand@shah.com': 'Shah Enterprises (Anand Shah)',
  'info@shah.com': 'Shah Group Admin (info@shah.com)',
  'bruce@waynecorp.com': 'Wayne Enterprises (Bruce Wayne)',
  'lex@metropolis.com': 'Metropolis Corp (Lex Luthor)',
  'customer@nirman.com': 'Customer Portal Demo'
};

export default function Login({ onLogin }) {
  const [authType, setAuthType] = useState('staff'); // 'staff' or 'client'
  const [email, setEmail] = useState('admin@nirman.com');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Force Password Change Modal (CRM Module 2 Requirement: mustChangePassword)
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const [pendingClientContact, setPendingClientContact] = useState(null);
  const [newPasswordForm, setNewPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChanging, setPasswordChanging] = useState(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter token & new password
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);

  const normalizeRole = (role) => {
    if (!role) return 'Employee';
    const rawVal = typeof role === 'object' ? (role.roleCode || role.role || 'Employee') : role;
    const r = String(rawVal).toLowerCase().trim();
    if (r.includes('admin') || r.includes('super')) return 'Admin';
    if (r.includes('hr')) return 'HR';
    if (r.includes('site') || r.includes('engineer')) return 'SiteEngineer';
    if (r.includes('manager') || r.includes('pm')) return 'ProjectManager';
    if (r.includes('architect')) return 'Architect';
    if (r.includes('customer') || r.includes('client')) return 'Customer';
    return 'Employee';
  };

  const handleTabSwitch = (type) => {
    setAuthType(type);
    setError('');
    if (type === 'client') {
      setEmail('bruce@waynecorp.com');
      setPassword('Password123!');
    } else {
      setEmail('admin@nirman.com');
      setPassword('Admin123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    setError('');
    setLoading(true);

    try {
      if (authType === 'client') {
        // Explicit Client Portal Login Endpoint: POST /api/client-auth/login
        const res = await clientLogin({ email: cleanEmail, password });
        if (res?.success) {
          handleClientLoginSuccess(res, cleanEmail);
          return;
        } else {
          setError(res?.message || 'Invalid Client Portal credentials.');
        }
      } else {
        // Staff Login Endpoint: POST /api/auth/login
        try {
          const response = await loginUser(cleanEmail, password);
          const token = response.token || response.data?.token;
          const success = response.success === true || !!token || response.data?.success === true || String(response.message).toLowerCase().includes('success');
          
          if (success) {
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
            
            if (token) localStorage.setItem('token', token);
            const roleToNormalize = user.roleCode || user.role || 'SUPER_ADMIN';
            const normRole = normalizeRole(roleToNormalize);
            
            const updatedUser = { ...user, role: normRole };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            onLogin(normRole);
            return;
          }
        } catch (staffErr) {
          // Automatic Smart Fallback: Try Client Portal Login if staff login fails
          console.log("Staff login failed, attempting Client Portal login fallback...");
          const clientRes = await clientLogin({ email: cleanEmail, password });
          if (clientRes?.success) {
            handleClientLoginSuccess(clientRes, cleanEmail);
            return;
          }
          setError(staffErr.response?.data?.message || staffErr.message || 'Invalid login credentials.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check network/credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleClientLoginSuccess = (res, cleanEmail) => {
    const contact = res.contact || {};
    const client = res.client || {};
    const token = res.token || 'mock-client-jwt-token';

    const isTemp = contact.mustChangePassword || 
                   contact.isTemporaryPassword || 
                   res.mustChangePassword || 
                   res.isTemporaryPassword || 
                   (password && password.startsWith('TempPass'));

    if (isTemp) {
      setPendingClientContact({ ...contact, token, client });
      setNewPasswordForm({ oldPassword: password, newPassword: '', confirmPassword: '' });
      setShowForcePasswordModal(true);
      setLoading(false);
      return;
    }

    localStorage.setItem('token', token);
    const clientUser = {
      id: contact._id || contact.id || cleanEmail.split('@')[0],
      name: contact.name || 'Client Contact',
      email: contact.email || cleanEmail,
      role: 'Customer',
      isClientPortal: true,
      permissionLevel: contact.permissionLevel || 'OWNER',
      clientId: contact.clientId,
      clientName: client.name || client.companyName || 'Client'
    };

    localStorage.setItem('user', JSON.stringify(clientUser));
    onLogin('Customer');
  };

  // Submit Force Password Change on First Login
  const handleForcePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (newPasswordForm.newPassword.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters long.');
      return;
    }

    if (newPasswordForm.newPassword !== newPasswordForm.confirmPassword) {
      setPasswordChangeError('New password and confirm password do not match.');
      return;
    }

    setPasswordChanging(true);
    try {
      const res = await clientChangePassword({
        oldPassword: newPasswordForm.oldPassword,
        newPassword: newPasswordForm.newPassword
      });

      if (res?.success) {
        alert("Password updated successfully! Redirecting to Client Portal...");
        setShowForcePasswordModal(false);
        
        const contact = pendingClientContact;
        localStorage.setItem('token', contact.token);
        const clientUser = {
          id: contact._id || contact.id,
          name: contact.name,
          email: contact.email,
          role: 'Customer',
          isClientPortal: true,
          permissionLevel: contact.permissionLevel || 'OWNER',
          clientId: contact.clientId,
          clientName: contact.client?.name || contact.client?.companyName || 'Client'
        };

        localStorage.setItem('user', JSON.stringify(clientUser));
        onLogin('Customer');
      } else {
        setPasswordChangeError(res?.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordChangeError(err.message || 'Error updating password.');
    } finally {
      setPasswordChanging(false);
    }
  };

  // Submit Forgot Password Email Token Request
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (forgotStep === 1) {
      if (!forgotEmail.trim()) {
        setForgotError('Please enter your registered email address.');
        return;
      }
      setForgotSubmitting(true);
      try {
        const res = await clientForgotPassword(forgotEmail.trim());
        if (res?.success) {
          setForgotMessage(res.message);
          setForgotStep(2);
        } else {
          setForgotError(res?.message || 'Failed to request reset token.');
        }
      } catch (err) {
        setForgotError(err.message || 'Error sending reset request.');
      } finally {
        setForgotSubmitting(false);
      }
    } else {
      if (!resetToken.trim() || !newResetPassword.trim()) {
        setForgotError('Please provide both the reset token and your new password.');
        return;
      }
      setForgotSubmitting(true);
      try {
        const res = await clientResetPassword({
          email: forgotEmail.trim(),
          token: resetToken.trim(),
          newPassword: newResetPassword.trim()
        });

        if (res?.success) {
          alert("Password has been reset successfully! You can now log in.");
          setShowForgotModal(false);
          setForgotStep(1);
        } else {
          setForgotError(res?.message || 'Failed to reset password.');
        }
      } catch (err) {
        setForgotError(err.message || 'Error resetting password.');
      } finally {
        setForgotSubmitting(false);
      }
    }
  };

  const fillQuickCredentials = (demoEmail, type = 'staff') => {
    setAuthType(type);
    setEmail(demoEmail);
    if (demoEmail === 'admin@nirman.com') setPassword('Admin123!');
    else if (demoEmail === 'kadambhakti@gmail.com') setPassword('Password123!');
    else setPassword('Password123!');
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white text-left font-sans">
      
      {/* Left Column: Graphic & Centered Branding */}
      <div className="w-full md:w-1/2 bg-gradient-to-tr from-brand-light via-brand-soft to-brand-secondary p-8 flex flex-col justify-between items-center text-brand-dark min-h-[300px] md:min-h-screen">
        
        {/* Centered Graphic & Brand Package */}
        <div className="my-auto flex flex-col items-center space-y-4 md:space-y-8">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <img 
              src={logoImg} 
              alt="Nirman Architects Logo" 
              className="h-12 md:h-14 w-auto object-contain mx-auto"
            />
            <div className="w-12 h-0.5 bg-brand-primary mx-auto rounded-full mt-2"></div>
          </div>

          <div className="w-32 h-32 md:w-80 md:h-80 overflow-hidden rounded-2xl shadow-md border border-white/40">
            <img 
              src={loginHero} 
              alt="Architect Graphic illustration" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-[10px] tracking-widest font-black text-slate-500 uppercase mt-4 md:mt-0">
          powered by Nex Alliance
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="w-full md:w-1/2 p-6 md:p-14 flex flex-col justify-center bg-white min-h-[450px] md:min-h-screen">
        <div className="max-w-md w-full mx-auto space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back!</h2>
            <p className="text-xs text-slate-500">Log in with your email & password to access your portal workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 text-xs font-semibold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 block mb-1.5 uppercase tracking-wider">
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

              <button
                type="button"
                onClick={() => { setForgotEmail(email); setForgotError(''); setForgotMessage(''); setForgotStep(1); setShowForgotModal(true); }}
                className="font-bold text-brand-dark hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-slate-900" /> : <ShieldCheck className="w-4 h-4 text-slate-900" />}
              Login to Workspace
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-wider">
                Staff Quick Demo Accounts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(STAFF_DEMO_ACCOUNTS).map((demoEmail) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => fillQuickCredentials(demoEmail, 'staff')}
                    className="text-[9px] px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-600 hover:text-indigo-700 rounded-full font-bold transition-all"
                  >
                    {demoEmail.split('@')[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase block mb-1.5 tracking-wider">
                Client Portal Quick Demo Accounts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(CLIENT_DEMO_ACCOUNTS).map((demoEmail) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => fillQuickCredentials(demoEmail, 'client')}
                    className="text-[9px] px-2.5 py-1 bg-amber-50/80 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-full font-bold transition-all"
                  >
                    {CLIENT_DEMO_ACCOUNTS[demoEmail]}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL 1: FORCE PASSWORD CHANGE ON FIRST LOGIN (CRM Module 2) */}
      {showForcePasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">First-Time Password Change Required</h3>
                <p className="text-xs text-slate-500">Please set a secure password for your Client Portal account.</p>
              </div>
            </div>

            {passwordChangeError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handleForcePasswordChangeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Temporary / Current Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPasswordForm.oldPassword}
                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, oldPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Secure Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPasswordForm.newPassword}
                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Confirm New Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={newPasswordForm.confirmPassword}
                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={passwordChanging}
                  className="w-full py-2.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  {passwordChanging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Update Password & Enter Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CLIENT FORGOT / RESET PASSWORD */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Reset Client Portal Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
                {forgotError}
              </div>
            )}

            {forgotMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
              {forgotStep === 1 ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Registered Client Email Address *</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="bruce@waynecorp.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    We will issue a reset token for this email address.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Reset Token *</label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter reset token from email"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">New Password *</label>
                    <input
                      type="password"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Enter new secure password"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="px-5 py-2 bg-indigo-600 text-white font-extrabold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {forgotSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {forgotStep === 1 ? 'Request Reset Token' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
