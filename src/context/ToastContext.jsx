import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    window.alert = (message) => {
      const msgStr = String(message);
      const isError = /error|fail|deny|denied|invalid|reject|cannot|could not/i.test(msgStr);
      const isWarning = /warning|snooze|overdue/i.test(msgStr);
      const type = isError ? 'error' : isWarning ? 'warning' : 'success';
      showToast(msgStr, type);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Cards Container - Stacked in Top-Right */}
      <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-100 text-rose-800'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-100 text-amber-800'
                : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  toast.type === 'error'
                    ? 'bg-rose-500'
                    : toast.type === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="text-xs font-bold leading-normal">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[10px] uppercase font-black opacity-60 hover:opacity-100 flex-shrink-0 ml-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
