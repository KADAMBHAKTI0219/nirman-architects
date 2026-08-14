import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

/**
 * Global Toast Provider
 * Manages real-time toast popups across all dashboards and triggers Browser Web Push.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', title = '', triggerWebPush = true) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // Auto-generate title if omitted
    const formattedTitle = title || (
      type === 'success' ? 'Success' :
      type === 'error' ? 'Action Failed' :
      type === 'warning' ? 'Attention Required' : 'Notice'
    );

    const newToast = { id, message, type, title: formattedTitle };

    setToasts(prev => [...prev.slice(-4), newToast]); // Keep top 5 latest toasts

    // Auto dismiss after 4.5s
    setTimeout(() => {
      removeToast(id);
    }, 4500);

    // Trigger Desktop Web Push Notification via ServiceWorker if permission granted
    if (triggerWebPush && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(`Nirman Architects: ${formattedTitle}`, {
              body: message,
              icon: '/favicon.png',
              badge: '/favicon.png',
              vibrate: [100, 50, 100],
              data: { deepLink: '/' }
            }).catch(() => null);
          }).catch(() => null);
        }
      } catch (err) {
        console.warn('Web Push trigger skipped:', err);
      }
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}

      {/* Floating Toast Portal Container (Top Right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none font-sans">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 transition-all duration-300 transform animate-in slide-in-from-top-4 fade-in ${
              toast.type === 'success'
                ? 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10'
                : toast.type === 'warning'
                ? 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10'
                : 'bg-white border-brand-secondary/60 text-slate-800 shadow-blue-500/10'
            }`}
          >
            {/* Icon Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              toast.type === 'error' ? 'bg-rose-100 text-rose-600' :
              toast.type === 'warning' ? 'bg-amber-100 text-amber-600' :
              'bg-brand-soft text-brand-dark'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {toast.type === 'info' && <Info className="w-5 h-5" />}
            </div>

            {/* Content Body */}
            <div className="min-w-0 flex-1">
              <h4 className={`text-xs font-black leading-tight ${
                toast.type === 'success' ? 'text-emerald-800' :
                toast.type === 'error' ? 'text-rose-800' :
                toast.type === 'warning' ? 'text-amber-800' :
                'text-slate-900'
              }`}>
                {toast.title}
              </h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5 leading-normal break-words">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Custom Hook to trigger Toast Popups and Web Push anywhere in the app
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback safe dummy function if used outside provider
    return {
      showToast: (msg, type = 'info') => console.log(`[Toast ${type}]: ${msg}`),
      removeToast: () => {}
    };
  }
  return context;
}
