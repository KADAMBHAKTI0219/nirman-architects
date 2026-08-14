import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import buildingSketch from '../../assets/images/building-sketch.png';
import logoImg from '../../assets/images/logo.png';
import { Ruler, ArrowRight, Eye, EyeOff, ShieldCheck, ShieldAlert, Clock, History, User, Building, Lock, Key, AlertCircle, CheckCircle, RefreshCw, X, ShieldX } from 'lucide-react';
import { loginUser } from '../../service/auth';
import { clientLogin, clientChangePassword, clientForgotPassword, clientResetPassword } from '../../service/crm/client';
import BrandLoader from '../common/BrandLoader';

export default function Login({ onLogin }) {
  const [loginTab, setLoginTab] = useState('staff'); // 'staff' | 'client'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Rate Limiting & Account Block State
  const [isBlocked, setIsBlocked] = useState(() => {
    const lockTime = localStorage.getItem('login_blocked_until');
    return lockTime ? parseInt(lockTime, 10) > Date.now() : false;
  });
  const [lockUntil, setLockUntil] = useState(() => {
    const lockTime = localStorage.getItem('login_blocked_until');
    return lockTime ? parseInt(lockTime, 10) : 0;
  });
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const lockTime = localStorage.getItem('login_blocked_until');
    if (!lockTime) return 0;
    const diff = Math.max(0, Math.ceil((parseInt(lockTime, 10) - Date.now()) / 1000));
    return diff;
  });
  const [failedCount, setFailedCount] = useState(() => {
    const saved = localStorage.getItem('login_failed_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [failedLogs, setFailedLogs] = useState(() => {
    try {
      const savedLogs = localStorage.getItem('login_failed_logs');
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch {
      return [];
    }
  });
  const [unblockedNotice, setUnblockedNotice] = useState('');

  // Live Countdown Timer Effect for Rate Limit Lock
  useEffect(() => {
    if (!isBlocked || !lockUntil || lockUntil <= Date.now()) {
      if (isBlocked) {
        setIsBlocked(false);
        setLockUntil(0);
        setFailedCount(0);
        setFailedLogs([]);
        localStorage.removeItem('login_blocked_until');
        localStorage.removeItem('login_failed_count');
        localStorage.removeItem('login_failed_logs');
      }
      return;
    }

    const calcRemaining = () => {
      const diff = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        setIsBlocked(false);
        setLockUntil(0);
        setFailedCount(0);
        setFailedLogs([]);
        localStorage.removeItem('login_blocked_until');
        localStorage.removeItem('login_failed_count');
        localStorage.removeItem('login_failed_logs');
        setUnblockedNotice('Rate limit restriction expired. Access has been restored.');
      }
    };

    calcRemaining();
    const interval = setInterval(calcRemaining, 1000);
    return () => clearInterval(interval);
  }, [isBlocked, lockUntil]);

  const triggerAccountLock = (seconds = 180, customLogs = null) => {
    const until = Date.now() + (seconds * 1000);
    setLockUntil(until);
    setRemainingSeconds(seconds);
    setIsBlocked(true);
    localStorage.setItem('login_blocked_until', String(until));
    if (customLogs) {
      setFailedLogs(customLogs);
      localStorage.setItem('login_failed_logs', JSON.stringify(customLogs));
    }
  };

  const recordFailedAttempt = (msg = 'Invalid password credential attempt') => {
    const nextCount = failedCount + 1;
    setFailedCount(nextCount);
    localStorage.setItem('login_failed_count', String(nextCount));

    const newLog = {
      attempt: nextCount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: `${msg} (Attempt ${nextCount}/5)`
    };
    const updatedLogs = [...failedLogs, newLog].slice(-5);
    setFailedLogs(updatedLogs);
    localStorage.setItem('login_failed_logs', JSON.stringify(updatedLogs));

    if (nextCount >= 5) {
      triggerAccountLock(180, updatedLogs);
    }
  };

  const formatTimeMinutesSeconds = (sec) => {
    const validSec = Math.max(0, parseInt(sec || 0, 10));
    const m = Math.floor(validSec / 60);
    const s = validSec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const simulateRateLimitBlock = () => {
    const mockLogs = [
      { attempt: 1, time: '17:11:02', message: 'Failed password attempt #1 mismatch' },
      { attempt: 2, time: '17:11:15', message: 'Failed password attempt #2 mismatch' },
      { attempt: 3, time: '17:11:32', message: 'Failed password attempt #3 mismatch' },
      { attempt: 4, time: '17:11:58', message: 'Failed password attempt #4 (Final Warning)' },
      { attempt: 5, time: '17:12:10', message: '5th consecutive failure - Security Lock Fired' }
    ];
    setFailedCount(5);
    setFailedLogs(mockLogs);
    localStorage.setItem('login_failed_count', '5');
    localStorage.setItem('login_failed_logs', JSON.stringify(mockLogs));
    triggerAccountLock(129, mockLogs); // 2m 09s matching screenshot!
  };

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
    if (!role) return null;
    const rawVal = typeof role === 'object' ? (role.roleCode || role.role || '') : role;
    if (!rawVal) return null;
    const r = String(rawVal).toLowerCase().replace(/[\s_\-]/g, '').trim();

    switch (r) {
      case 'superadmin':
      case 'admin':
        return 'Admin';
      case 'hr':
        return 'HR';
      case 'projectmanager':
      case 'pm':
        return 'ProjectManager';
      case 'architect':
        return 'Architect';
      case 'siteengineer':
      case 'sitemanager':
        return 'SiteEngineer';
      case 'employee':
        return 'Employee';
      case 'client':
      case 'customer':
        return 'Customer';
      default:
        return null;
    }
  };

  const handleSuccessfulAuth = (userData, token) => {
    const isClientMode = loginTab === 'client' || userData.isClientPortal || userData.role === 'Customer' || userData.roleCode === 'Customer';
    const matchedRole = normalizeRole(userData.role || userData.roleCode) || (isClientMode ? 'Customer' : 'Admin');

    const finalUser = {
      ...userData,
      role: matchedRole,
      roleCode: matchedRole,
      isClientPortal: matchedRole === 'Customer'
    };

    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(finalUser));
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(finalUser));
    }

    if (onLogin) {
      // Always pass string role to avoid component crash in AppRoutes
      onLogin(matchedRole);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = String(email || '').trim();
    const cleanPassword = String(password || '').trim();

    let hasError = false;

    if (!cleanEmail) {
      setEmailError('Email address is required');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!cleanPassword) {
      setPasswordError('Password is required');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    setLoading(true);
    setError('');

    try {
      let res;
      if (loginTab === 'client') {
        res = await clientLogin({ email: cleanEmail, password: cleanPassword });
      } else {
        res = await loginUser(cleanEmail, cleanPassword, loginTab);
      }

      if (res && (res.token || res.clientToken || res.data?.token || res.success)) {
        // Reset failed attempt tracking on successful login
        setFailedCount(0);
        setFailedLogs([]);
        localStorage.removeItem('login_failed_count');
        localStorage.removeItem('login_failed_logs');

        const token = res.token || res.clientToken || res.data?.token;
        const rawUser = res.user || res.client || res.contact || res.data?.user || res.data?.client || {
          email: cleanEmail,
          name: cleanEmail.split('@')[0].toUpperCase(),
          role: loginTab === 'client' ? 'Customer' : 'Admin'
        };

        // Check if Client must change password on first login
        if (rawUser.mustChangePassword) {
          setPendingClientContact(rawUser);
          setShowForcePasswordModal(true);
          setLoading(false);
          return;
        }

        handleSuccessfulAuth(rawUser, token);
      } else {
        const msg = res?.message || res?.error || 'Invalid credentials or login failed.';
        setError(msg);
        if (res?.isRateLimited || res?.status === 429) {
          triggerAccountLock(res?.retryAfter || 180);
        } else {
          recordFailedAttempt(msg);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Error logging in.';
      setError(msg);
      if (err.response?.status === 429) {
        triggerAccountLock(180);
      } else {
        recordFailedAttempt(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoRole, isClient = false) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoginTab(isClient ? 'client' : 'staff');
    setEmailError('');
    setPasswordError('');
    setError('');
  };

  // Submit Password Change for First-Time Client Login
  const handleForcePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (!newPasswordForm.newPassword || newPasswordForm.newPassword.length < 6) {
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
        contactId: pendingClientContact._id || pendingClientContact.id,
        email: pendingClientContact.email || email,
        oldPassword: newPasswordForm.oldPassword || password,
        newPassword: newPasswordForm.newPassword
      });

      if (res?.success) {
        alert("Password updated successfully! Logging you in...");
        setShowForcePasswordModal(false);
        const updatedUser = { ...pendingClientContact, mustChangePassword: false };
        const token = res.token || res.clientToken || localStorage.getItem('token') || 'client-token';
        handleSuccessfulAuth(updatedUser, token);
      } else {
        setPasswordChangeError(res?.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordChangeError(err.message || 'Error updating password.');
    } finally {
      setPasswordChanging(false);
    }
  };

  // Forgot Password Submit Handler
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
          setForgotMessage('Password reset instructions & token sent to your email.');
          setForgotStep(2);
        } else {
          setForgotError(res?.message || 'Failed to request password reset.');
        }
      } catch (err) {
        setForgotError(err.message || 'Error requesting password reset.');
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

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white text-left font-sans">

      {loading && <BrandLoader fullScreen text="Authenticating & Loading Dashboard..." />}

      {/* Left Column: Centered Branding with brand-primary & brand-secondary Gradient + building-sketch.png */}
      <div
        className="w-full md:w-1/2 p-8 flex flex-col justify-between items-center text-white min-h-[340px] md:min-h-screen relative overflow-hidden shadow-2xl"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(30, 58, 138, 0.2), rgba(37, 99, 235, 0.7 ), rgba(15, 23, 42, 0.5)), url(${buildingSketch})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >

        {/* Centered Brand Package with Crisp White Glass Container */}
        <div className="my-auto flex flex-col items-center space-y-6 z-10 text-center">
          <div className="p-5 bg-white/95 backdrop-blur-md border border-white/50 rounded-3xl shadow-xl transition-transform duration-300 hover:scale-105">
            <img
              src={logoImg}
              alt="Nirman Architects Logo"
              className="h-16 md:h-20 w-auto object-contain mx-auto drop-shadow-sm"
            />
          </div>
          <div className="w-16 h-1.5 bg-brand-secondary mx-auto rounded-full mt-2 shadow-xs"></div>
          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-xs">Nirman Architects</h1>
            <p className="text-xs font-black text-blue-200 tracking-widest uppercase">Enterprise Portal Workspace</p>
          </div>
        </div>

        <div className="text-[10px] tracking-widest font-black text-white uppercase mt-4 md:mt-0 z-10 bg-white/20 px-4 py-2 rounded-full border border-white/30 shadow-sm backdrop-blur-md">
          powered by Nex Alliance IT SOLUTIONS
        </div>
      </div>

      {/* Right Column: Form Panel (Pure White Background matching index.css design system) */}
      <div className="w-full md:w-1/2 p-6 md:p-14 flex flex-col justify-center bg-white min-h-[450px] md:min-h-screen text-left">
        <div className="max-w-md w-full mx-auto space-y-6">

          {isBlocked ? (
            /* ACCOUNT TEMPORARILY BLOCKED PANEL (Inside Right Column with Pure White BG & index.css tokens) */
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Shield Alert Header Pill */}
              <div className="text-center space-y-4">
                <div className="relative inline-block mx-auto">
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse"></div>
                  <div className="relative w-16 h-16 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <ShieldAlert className="w-8 h-8 text-rose-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 uppercase tracking-widest inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                    Rate Limited
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Account Temporarily Blocked
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    5 consecutive failed login attempts detected. Access has been temporarily restricted for security.
                  </p>
                </div>

                {/* Live Countdown Badge */}
                <div className="pt-1 flex justify-center">
                  <div className="px-5 py-2.5 bg-rose-50 border border-rose-200 rounded-full shadow-2xs flex items-center gap-2 text-rose-600 font-bold text-xs">
                    <Clock className="w-4 h-4 text-rose-600 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Try again in {formatTimeMinutesSeconds(remainingSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Security Failure Timeline Box */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-rose-600" />
                    <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wider">Security Failure Timeline</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                    {failedLogs.length || 5} / 5 Logged
                  </span>
                </div>

                {/* Timeline items */}
                <div className="relative pl-5 space-y-2.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-200">
                  {(failedLogs.length > 0 ? failedLogs : [
                    { attempt: 1, time: '17:11:02', message: 'Failed password attempt #1 mismatch' },
                    { attempt: 2, time: '17:11:15', message: 'Failed password attempt #2 mismatch' },
                    { attempt: 3, time: '17:11:32', message: 'Failed password attempt #3 mismatch' },
                    { attempt: 4, time: '17:11:58', message: 'Failed password attempt #4 (Final Warning)' },
                    { attempt: 5, time: '17:12:10', message: '5th consecutive failure - Security Lock Fired' }
                  ]).map((log, idx) => (
                    <div key={idx} className="relative flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className={`absolute -left-5 top-3 w-3 h-3 rounded-full border-2 border-white ${idx === 4 ? 'bg-rose-600 ring-2 ring-rose-300 animate-pulse' : 'bg-rose-400'}`}></div>
                      <div className="flex items-center gap-1.5 text-slate-700 truncate pr-2">
                        <span className="font-bold">Attempt #{log.attempt || idx + 1}:</span>
                        <span className="text-slate-600 font-medium truncate">{log.message}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{log.time || 'Logged'}</span>
                    </div>
                  ))}
                </div>

                {/* Auto Unlock / Demo Reset */}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] font-medium text-slate-500">
                  <span>Auto-unlocking when timer finishes.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBlocked(false);
                      setLockUntil(0);
                      setFailedCount(0);
                      setFailedLogs([]);
                      localStorage.removeItem('login_blocked_until');
                      localStorage.removeItem('login_failed_count');
                      localStorage.removeItem('login_failed_logs');
                      setUnblockedNotice('Lock cleared by administrator.');
                    }}
                    className="font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    [Bypass Lock (Demo)]
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <>

          {/* Mode Switcher Tabs: Staff Workspace vs Client Portal */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => { setLoginTab('staff'); setError(''); setEmailError(''); setPasswordError(''); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${loginTab === 'staff'
                ? 'bg-brand-primary text-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Staff Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => { setLoginTab('client'); setError(''); setEmailError(''); setPasswordError(''); }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${loginTab === 'client'
                ? 'bg-brand-primary text-black shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </button>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="e.g. user@nirman.com"
                className={`w-full px-4 py-3 text-xs font-semibold rounded-full focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${emailError
                    ? 'border-2 border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 text-rose-900'
                    : 'border border-slate-200 bg-white text-slate-900 focus:ring-brand-primary/30 focus:border-brand-primary'
                  }`}
              />
              {emailError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-12 py-3 text-xs font-semibold rounded-full focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${passwordError
                      ? 'border-2 border-rose-500 focus:ring-rose-500/20 bg-rose-50/20 text-rose-900'
                      : 'border border-slate-200 bg-white text-slate-900 focus:ring-brand-primary/30 focus:border-brand-primary'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer">
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
                className="font-bold text-brand-primary hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Live Failed Login Attempts Counter Banner (1/5, 2/5, 3/5, 4/5 warning) */}
            {failedCount > 0 && failedCount < 5 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Failed login attempts: <strong className="font-extrabold text-amber-950">{failedCount} / 5</strong></span>
                </div>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                  {5 - failedCount} {5 - failedCount === 1 ? 'attempt' : 'attempts'} left
                </span>
              </div>
            )}

            {unblockedNotice && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{unblockedNotice}</span>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-50 text-black rounded-2xl text-xs font-bold border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-primary hover:bg-brand-secondary text-black font-black rounded-full text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-brand-secondary/40"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <ShieldCheck className="w-4 h-4 text-black" />}
              <span>Login to Workspace</span>
            </button>
          </form>
          </>
          )}

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

            <form noValidate onSubmit={handleForcePasswordChangeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Temporary / Current Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPasswordForm.oldPassword}
                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, oldPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
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

            <form noValidate onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
              {forgotStep === 1 ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Registered Client Email Address *</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="bruce@waynecorp.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
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
