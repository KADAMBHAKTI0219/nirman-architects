import React, { useState, useEffect } from 'react';
import buildingSketchLogin from '../../assets/images/building-sketch-login.png';
import logoImg from '../../assets/images/logo.png';
import {
  ShieldAlert, Clock, History, Lock, Key, AlertCircle, CheckCircle, RefreshCw, X, Eye, EyeOff,
  ShieldCheck, User, Building2, Users, Shield
} from 'lucide-react';
import { loginUser } from '../../service/auth';
import { clientLogin, clientChangePassword, clientForgotPassword, clientResetPassword } from '../../service/crm/client';
import BrandLoader from '../common/BrandLoader';
import { useToast } from '../../context/ToastContext';
import { FieldError } from '../../utils/validation';

export default function Login({ onLogin }) {
  const { showToast } = useToast();
  const [loginTab, setLoginTab] = useState('staff'); // 'staff' | 'client'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

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

  const triggerAccountLock = (seconds = 900, customLogs = null) => {
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

  const recordFailedAttempt = (msg = 'Invalid email or password', retrySeconds = 900) => {
    const nextCount = failedCount + 1;
    setFailedCount(nextCount);
    localStorage.setItem('login_failed_count', String(nextCount));

    const newLog = {
      attempt: nextCount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: nextCount >= 5 ? `${msg} (5/5 - Security Locked)` : `${msg} (Attempt ${nextCount}/5)`
    };
    const updatedLogs = [...failedLogs, newLog].slice(-5);
    setFailedLogs(updatedLogs);
    localStorage.setItem('login_failed_logs', JSON.stringify(updatedLogs));

    if (nextCount >= 5) {
      triggerAccountLock(retrySeconds, updatedLogs);
    }
    return updatedLogs;
  };

  const formatTimeMinutesSeconds = (sec) => {
    const validSec = Math.max(0, parseInt(sec || 0, 10));
    const m = Math.floor(validSec / 60);
    const s = validSec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Toast-Only Email Validation
  const validateEmail = (val) => {
    const cleanEmail = String(val || '').trim();
    if (!cleanEmail) {
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      return 'Invalid email address';
    }
    return '';
  };

  // Toast-Only Password Validation with Complexity Rules (Min 8, Max 15, Upper, Lower, Number, Special)
  const validatePassword = (val) => {
    const cleanPassword = String(val || ''); // DO NOT TRIM PASSWORD
    if (!cleanPassword) {
      return 'Password is required';
    }
    if (cleanPassword.length < 8) {
      return `Password must be at least 8 characters (${cleanPassword.length}/8)`;
    }
    if (cleanPassword.length > 15) {
      return 'Password must not exceed 15 characters';
    }
    if (!/[A-Z]/.test(cleanPassword)) {
      return 'Password must contain at least one uppercase letter (A-Z)';
    }
    if (!/[a-z]/.test(cleanPassword)) {
      return 'Password must contain at least one lowercase letter (a-z)';
    }
    if (!/[0-9]/.test(cleanPassword)) {
      return 'Password must contain at least one number (0-9)';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(cleanPassword)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    return '';
  };

  // Force Password Change Modal State
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(false);
  const [pendingClientContact, setPendingClientContact] = useState(null);
  const [newPasswordForm, setNewPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordChanging, setPasswordChanging] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMessage, setForgotMessage] = useState('');
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

    const sessionExpiresAt = Date.now() + (15 * 60 * 1000); // 15 Minutes Token & Session Validity

    const finalUser = {
      ...userData,
      role: matchedRole,
      roleCode: matchedRole,
      isClientPortal: matchedRole === 'Customer',
      sessionExpiresAt: sessionExpiresAt
    };

    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(finalUser));
      localStorage.setItem('session_expires_at', String(sessionExpiresAt));
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(finalUser));
      sessionStorage.setItem('session_expires_at', String(sessionExpiresAt));
    }

    if (onLogin) {
      onLogin(matchedRole);
    }
  };

  /**
   * Helper to normalize raw backend error messages into clean, user-friendly strings
   */
  const normalizeBackendError = (res, err) => {
    const backendMsg = res?.message || res?.error || err?.response?.data?.message || err?.response?.data?.error;
    if (res?.status === 429 || res?.isRateLimited || err?.response?.status === 429) {
      return backendMsg || 'Too many login attempts. Access has been restricted.';
    }

    const rawMsg = String(backendMsg || err?.message || '').toLowerCase();
    if (rawMsg.includes('email') || rawMsg.includes('user not found') || rawMsg.includes('account not found') || rawMsg.includes('user address')) {
      return 'Invalid email address';
    }
    if (rawMsg.includes('password') || rawMsg.includes('passcode') || rawMsg.includes('mismatch')) {
      return 'Invalid password';
    }
    return backendMsg || 'Invalid email or password';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: '', password: '' });

    // 1. Email Frontend Validation
    const cleanEmail = String(email || '').trim();
    const emailValMsg = validateEmail(email);
    if (emailValMsg) {
      setErrors(prev => ({ ...prev, email: emailValMsg }));
      showToast(emailValMsg, 'error');
      return;
    }

    // 2. Password Frontend Validation
    const cleanPassword = String(password || '');
    const passwordValMsg = validatePassword(password);
    if (passwordValMsg) {
      setErrors(prev => ({ ...prev, password: passwordValMsg }));
      showToast(passwordValMsg, 'error');
      return;
    }

    setLoading(true);

    try {
      let res;
      let isClientAuth = false;

      // Try Staff/Admin login first (/auth/login)
      res = await loginUser(cleanEmail, cleanPassword, 'staff');

      // If staff login fails with 401 / error / not staff, try Client Portal login (/client-auth/login)
      if (!res || !res.success || res.status === 401) {
        const clientRes = await clientLogin({ email: cleanEmail, password: cleanPassword });
        if (clientRes && (clientRes.token || clientRes.success)) {
          res = clientRes;
          isClientAuth = true;
        }
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
          role: isClientAuth ? 'Customer' : 'Admin'
        };

        const isMustChangePassword = Boolean(
          rawUser.mustChangePassword ||
          res.contact?.mustChangePassword ||
          res.mustChangePassword
        );

        // Check if Client must change password on first login (Temporary Password)
        if (isMustChangePassword) {
          const clientContactUser = {
            ...rawUser,
            ...(res.contact || {}),
            email: cleanEmail,
            role: 'Customer',
            roleCode: 'Customer',
            isClientPortal: true,
            mustChangePassword: true
          };
          if (token) {
            localStorage.setItem('clientToken', token);
            localStorage.setItem('token', token);
          }
          setPendingClientContact(clientContactUser);
          setNewPasswordForm({ oldPassword: cleanPassword, newPassword: '', confirmPassword: '' });
          setShowForcePasswordModal(true);
          setLoading(false);
          return;
        }

        const finalUserData = isClientAuth
          ? { ...rawUser, role: 'Customer', roleCode: 'Customer', isClientPortal: true }
          : rawUser;

        handleSuccessfulAuth(finalUserData, token);
      } else {
        const normalizedMsg = normalizeBackendError(res, null);
        showToast(normalizedMsg, 'error');
        const retryAfter = parseInt(
          res?.retryAfter || res?.headers?.['retry-after'] || res?.data?.retryAfter || 900,
          10
        );

        const updatedLogs = recordFailedAttempt(normalizedMsg, retryAfter);
        if (res?.isRateLimited || res?.status === 429 || failedCount + 1 >= 5) {
          triggerAccountLock(retryAfter, updatedLogs);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const normalizedMsg = normalizeBackendError(null, err);
      showToast(normalizedMsg, 'error');

      const retryHeader = err.response?.headers?.['retry-after'];
      const retryAfter = parseInt(
        retryHeader || err.response?.data?.retryAfter || err.response?.data?.retrySecs || 900,
        10
      );

      const updatedLogs = recordFailedAttempt(normalizedMsg, retryAfter);
      if (err.response?.status === 429 || failedCount + 1 >= 5) {
        triggerAccountLock(retryAfter, updatedLogs);
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Change for First-Time Client Login
  const handleForcePasswordChangeSubmit = async (e) => {
    e.preventDefault();

    const pwdValMsg = validatePassword(newPasswordForm.newPassword);
    if (pwdValMsg) {
      showToast(pwdValMsg, 'error');
      return;
    }
    if (newPasswordForm.newPassword !== newPasswordForm.confirmPassword) {
      showToast('New password and confirm password do not match', 'error');
      return;
    }

    setPasswordChanging(true);
    try {
      const res = await clientChangePassword({
        contactId: pendingClientContact._id || pendingClientContact.id,
        email: pendingClientContact.email || email,
        oldPassword: newPasswordForm.oldPassword || password,
        currentPassword: newPasswordForm.oldPassword || password,
        newPassword: newPasswordForm.newPassword
      });

      if (res?.success) {
        showToast('Password updated successfully! Logging you in...', 'success');
        setShowForcePasswordModal(false);
        const updatedUser = { ...pendingClientContact, mustChangePassword: false };
        const token = res.token || res.clientToken || localStorage.getItem('token') || 'client-token';
        handleSuccessfulAuth(updatedUser, token);
      } else {
        showToast(res?.message || 'Failed to update password.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error updating password.', 'error');
    } finally {
      setPasswordChanging(false);
    }
  };

  // Forgot Password Submit Handler
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMessage('');

    if (forgotStep === 1) {
      const cleanForgotEmail = String(forgotEmail || '').trim();
      if (!cleanForgotEmail) {
        showToast('Please enter your registered email address.', 'error');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(cleanForgotEmail)) {
        showToast('Invalid email address', 'error');
        return;
      }
      setForgotSubmitting(true);
      try {
        const res = await clientForgotPassword(cleanForgotEmail);
        if (res?.success) {
          setForgotMessage('Password reset instructions & token sent to your email.');
          showToast('Password reset instructions sent to your email.', 'success');
          setForgotStep(2);
        } else {
          showToast(res?.message || 'Failed to request password reset.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Error requesting password reset.', 'error');
      } finally {
        setForgotSubmitting(false);
      }
    } else {
      if (!resetToken.trim()) {
        showToast('Please enter the reset token.', 'error');
        return;
      }
      const pwdValMsg = validatePassword(newResetPassword);
      if (pwdValMsg) {
        showToast(pwdValMsg, 'error');
        return;
      }
      setForgotSubmitting(true);
      try {
        const res = await clientResetPassword({
          email: forgotEmail.trim(),
          token: resetToken.trim(),
          newPassword: newResetPassword
        });

        if (res?.success) {
          showToast('Password has been reset successfully! You can now log in.', 'success');
          setShowForgotModal(false);
          setForgotStep(1);
        } else {
          showToast(res?.message || 'Failed to reset password.', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Error resetting password.', 'error');
      } finally {
        setForgotSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen overflow-y-auto md:h-screen md:overflow-hidden flex flex-col md:flex-row bg-slate-50 text-left font-sans">

      {loading && <BrandLoader fullScreen text="Authenticating & Loading Dashboard..." />}

      {/* Left Column: Architectural City Blueprint using building-sketch-login.png */}
      <div
        className="w-full md:w-5/12 lg:w-1/2 p-6 md:p-10 flex flex-col justify-between items-center text-black min-h-[360px] md:min-h-screen relative overflow-hidden shadow-2xl shrink-0"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(189, 224, 254, 0.8) 0%, rgba(143, 201, 255, 0.8) 50%, rgba(59, 130, 246, 0.5) 100%), url(${buildingSketchLogin})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Decorative Dotted Matrix Background Grid (Bottom-Left) */}
        <div className="absolute left-6 bottom-16 opacity-25 pointer-events-none grid grid-cols-6 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white"></div>
          ))}
        </div>

        {/* Centered Brand Package */}
        <div className="my-auto flex flex-col items-center space-y-4 md:space-y-5 z-10 text-center max-w-lg w-full py-4">
          <div className="p-4 transition-transform duration-300 hover:scale-105">
            <img
              src={logoImg}
              alt="Nirman Architects Logo"
              className="h-16 md:h-20 w-auto object-contain mx-auto drop-shadow-md"
            />
          </div>


          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-black tracking-tight drop-shadow-xs">
              Nirman Architects
            </h1>
            <p className="text-[11px] md:text-xs font-bold text-gray-800 tracking-widest uppercase">
              ENTERPRISE PORTAL WORKSPACE
            </p>
          </div>

          {/* 3 Feature Highlights Cards - Responsive Stack on Mobile, Grid on Tablet+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 sm:pt-5 w-full max-w-md px-2">
            <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-black border border-white/30 shadow-xs">
                <Shield className="w-4.5 h-4.5 text-black" />
              </div>
              <h3 className="text-xs font-bold text-black tracking-wide">Secure Access</h3>
              <p className="text-[10px] text-gray-800 leading-tight font-medium">Your data is protected with enterprise grade security</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-black border border-white/30 shadow-xs">
                <Building2 className="w-4.5 h-4.5 text-black" />
              </div>
              <h3 className="text-xs font-bold text-black tracking-wide">Unified Workspace</h3>
              <p className="text-[10px] text-gray-800 leading-tight font-medium">All your projects and tools in one place</p>
            </div>

            <div className="flex flex-col items-center text-center space-y-1.5 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-black border border-white/30 shadow-xs">
                <Users className="w-4.5 h-4.5 text-black" />
              </div>
              <h3 className="text-xs font-bold text-black tracking-wide">Built for Teams</h3>
              <p className="text-[10px] text-gray-800 leading-tight font-medium">Collaborate seamlessly with your team</p>
            </div>
          </div>
        </div>

        {/* Bottom Powered By Badge */}
        <div className="z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/30 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wider uppercase text-black shadow-sm my-2">
          <Shield className="w-3.5 h-3.5 text-black" />
          <span>POWERED BY NEXALLIANCE IT SOLUTIONS</span>
        </div>
      </div>

      {/* Right Column: Clean White Form Panel using index.css brand color palette */}
      <div className="w-full md:w-7/12 lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center bg-white min-h-[480px] md:min-h-screen text-left relative">

        <div className="max-w-md w-full mx-auto space-y-6 my-auto py-4">

          {isBlocked ? (
            /* ACCOUNT TEMPORARILY BLOCKED PANEL */
            <div className="space-y-4 animate-in fade-in duration-300">

              {/* Shield Alert Header Pill */}
              <div className="text-center space-y-2.5">
                <div className="relative inline-block mx-auto">
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl animate-pulse"></div>
                  <div className="relative w-12 h-12 bg-rose-50 border border-rose-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <ShieldAlert className="w-6 h-6 text-rose-600" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 uppercase tracking-widest inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                    Rate Limited
                  </span>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Account Temporarily Blocked
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium leading-normal max-w-xs mx-auto">
                    5 consecutive failed login attempts detected. Access has been restricted for 15 minutes.
                  </p>
                </div>

                {/* Live Countdown Badge */}
                <div className="pt-0.5 flex justify-center">
                  <div className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-full shadow-2xs flex items-center gap-2 text-rose-600 font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-rose-600 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Try again in {formatTimeMinutesSeconds(remainingSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* Security Failure Timeline Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-rose-600" />
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Security Failure Timeline</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                    5 / 5 Logged
                  </span>
                </div>

                {/* Timeline items */}
                <div className="relative pl-4 space-y-2 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-200">
                  {(() => {
                    let logs = [...failedLogs];
                    if (logs.length === 0) {
                      logs = [
                        { attempt: 1, time: '17:11:02', message: 'Invalid email or password (Attempt 1/5)' },
                        { attempt: 2, time: '17:11:15', message: 'Invalid email or password (Attempt 2/5)' },
                        { attempt: 3, time: '17:11:32', message: 'Invalid email or password (Attempt 3/5)' },
                        { attempt: 4, time: '17:11:58', message: 'Invalid email or password (Attempt 4/5)' },
                        { attempt: 5, time: '17:12:10', message: 'Invalid email or password (5/5 - Security Locked)' }
                      ];
                    } else {
                      while (logs.length < 5) {
                        const nextNum = logs.length + 1;
                        const lastMsg = logs[logs.length - 1]?.message || 'Invalid email or password';
                        const cleanBaseMsg = lastMsg.replace(/\s*\(Attempt \d+\/5\)/, '').replace(/\s*\(5th failure - Security Lock Fired\)/, '').replace(/\s*\(5\/5 - Security Locked\)/, '');
                        logs.push({
                          attempt: nextNum,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                          message: nextNum === 5 ? `${cleanBaseMsg} (5/5 - Security Locked)` : `${cleanBaseMsg} (Attempt ${nextNum}/5)`
                        });
                      }
                    }
                    return logs.slice(-5);
                  })().map((log, idx) => (
                    <div key={idx} className="relative flex items-center justify-between text-xs bg-white p-2 px-3 rounded-xl border border-slate-200 shadow-2xs gap-2">
                      <div className={`absolute -left-4 top-2.5 w-2.5 h-2.5 rounded-full border-2 border-white ${idx === 4 ? 'bg-rose-600 ring-2 ring-rose-300 animate-pulse' : 'bg-rose-400'}`}></div>
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium min-w-0 truncate">
                        <span className="font-bold shrink-0">Attempt #{log.attempt || idx + 1}:</span>
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
              {/* Welcome Back Header with Hand Emoji */}
              <div className="space-y-1.5 text-left">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Welcome Back</span>
                  <span className="inline-block animate-bounce" style={{ animationDuration: '2s' }}>👋</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Please enter your credentials to sign in to your workspace.
                </p>
              </div>

              {/* Unified Form Matching Reference Image */}
              <form noValidate onSubmit={handleSubmit} className="space-y-4 pt-1">

                {/* Email Input Field with Left User Icon Box */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 p-2 bg-brand-soft rounded-xl text-brand-accent flex items-center justify-center shrink-0 border border-brand-primary/40">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="login-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      onBlur={() => {
                        const err = validateEmail(email);
                        if (err) setErrors(prev => ({ ...prev, email: err }));
                      }}
                      placeholder="Enter Your Email"
                      className={`w-full pl-12 pr-4 py-3 text-xs font-semibold rounded-2xl border bg-white text-slate-900 focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs ${
                        errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-brand-secondary'
                      }`}
                    />
                  </div>
                  <FieldError error={errors.email} id="login-email" />
                </div>

                {/* Password Input Field with Left Lock Icon Box & Right Toggle Eye */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wider">
                    PASSWORD
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-2.5 p-2 bg-brand-soft rounded-xl text-brand-accent flex items-center justify-center shrink-0 border border-brand-primary/40">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      value={password}
                      minLength={8}
                      maxLength={15}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      onBlur={() => {
                        const err = validatePassword(password);
                        if (err) setErrors(prev => ({ ...prev, password: err }));
                      }}
                      placeholder="••••••••••••"
                      className={`w-full pl-12 pr-12 py-3 text-xs font-semibold rounded-2xl border bg-white text-slate-900 focus:outline-none transition-all placeholder:text-slate-400 shadow-2xs ${
                        errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-brand-secondary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center justify-center"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <FieldError error={errors.password} id="login-password" />
                </div>

                {/* Remember Me Checkbox & Forgot Password Link */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 font-bold text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-brand-accent border-slate-300 rounded cursor-pointer"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() => { setForgotEmail(email); setForgotMessage(''); setForgotStep(1); setShowForgotModal(true); }}
                    className="font-bold text-brand-accent hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Live Failed Login Attempts Counter Banner */}
                {failedCount > 0 && failedCount < 5 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Failed login attempts: <strong className="font-extrabold text-amber-950">{failedCount} / 5</strong></span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                      {5 - failedCount} {5 - failedCount === 1 ? 'attempt' : 'attempts'} left
                    </span>
                  </div>
                )}

                {/* Unblocked Notice Banner */}
                {unblockedNotice && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>{unblockedNotice}</span>
                  </div>
                )}

                {/* Main Submit Button using index.css brand-primary & brand-secondary colors */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-black rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-brand-secondary/60"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin text-brand-dark" /> : <ShieldCheck className="w-4 h-4 text-brand-dark" />}
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

            <form noValidate onSubmit={handleForcePasswordChangeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Temporary / Current Password <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPasswordForm.oldPassword}
                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, oldPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent bg-white"
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
                <label className="block text-slate-700 font-bold mb-1">
                  New Secure Password <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    maxLength={15}
                    placeholder="8 to 15 characters"
                    value={newPasswordForm.newPassword}
                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent bg-white"
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
                <label className="block text-slate-700 font-bold mb-1">
                  Confirm New Password <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    maxLength={15}
                    placeholder="Re-enter new password"
                    value={newPasswordForm.confirmPassword}
                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent bg-white"
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

            {forgotMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200">
                {forgotMessage}
              </div>
            )}

            <form noValidate onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
              {forgotStep === 1 ? (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Registered Client Email Address <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="bruce@waynecorp.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    We will issue a reset token for this email address.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Reset Token <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter reset token from email"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      New Password <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="password"
                      minLength={8}
                      maxLength={15}
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Enter new secure password (8-15 chars)"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-accent bg-white"
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
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-brand-dark font-extrabold rounded-xl shadow-xs flex items-center gap-1.5"
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
