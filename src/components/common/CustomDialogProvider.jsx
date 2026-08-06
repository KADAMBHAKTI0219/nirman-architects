import React, { useState, useEffect } from 'react';
import { HelpCircle, AlertCircle, CheckCircle, X, ShieldAlert } from 'lucide-react';

export default function CustomDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'alert', // 'alert' | 'confirm' | 'prompt'
    title: '',
    message: '',
    defaultValue: '',
    inputValue: '',
    resolve: null
  });

  useEffect(() => {
    // Intercept native window dialogs with custom UI modals
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    const originalPrompt = window.prompt;

    window.customAlert = (message, title = 'Notification') => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          type: 'alert',
          title,
          message: String(message || ''),
          defaultValue: '',
          inputValue: '',
          resolve
        });
      });
    };

    window.customConfirm = (message, title = 'Confirmation Required') => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          type: 'confirm',
          title,
          message: String(message || ''),
          defaultValue: '',
          inputValue: '',
          resolve
        });
      });
    };

    window.customPrompt = (message, defaultValue = '', title = 'Action Required') => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          type: 'prompt',
          title,
          message: String(message || ''),
          defaultValue: String(defaultValue || ''),
          inputValue: String(defaultValue || ''),
          resolve
        });
      });
    };

    // Override browser native popups
    window.alert = (msg) => window.customAlert(msg);
    window.confirm = (msg) => window.customConfirm(msg);
    window.prompt = (msg, def) => window.customPrompt(msg, def);

    return () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
      window.prompt = originalPrompt;
    };
  }, []);

  const handleConfirm = () => {
    if (dialogState.resolve) {
      if (dialogState.type === 'prompt') {
        dialogState.resolve(dialogState.inputValue);
      } else if (dialogState.type === 'confirm') {
        dialogState.resolve(true);
      } else {
        dialogState.resolve(true);
      }
    }
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (dialogState.resolve) {
      if (dialogState.type === 'prompt') {
        dialogState.resolve(null);
      } else if (dialogState.type === 'confirm') {
        dialogState.resolve(false);
      } else {
        dialogState.resolve(false);
      }
    }
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      {children}

      {/* GLOBAL CUSTOM STYLED UI MODAL FOR ALERTS, PROMPTS & CONFIRMS */}
      {dialogState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-left font-sans animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start gap-3.5 border-b border-slate-100 pb-3">
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                dialogState.type === 'prompt' ? 'bg-indigo-50 text-indigo-600' :
                dialogState.type === 'confirm' ? 'bg-amber-50 text-amber-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {dialogState.type === 'prompt' ? <HelpCircle className="w-5 h-5" /> :
                 dialogState.type === 'confirm' ? <ShieldAlert className="w-5 h-5" /> :
                 <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  {dialogState.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1 whitespace-pre-line leading-relaxed">
                  {dialogState.message}
                </p>
              </div>
              <button 
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Prompt Input Box */}
            {dialogState.type === 'prompt' && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Mandatory Details / Reason Notes:
                </label>
                <textarea
                  rows="3"
                  autoFocus
                  value={dialogState.inputValue}
                  onChange={(e) => setDialogState(prev => ({ ...prev, inputValue: e.target.value }))}
                  placeholder="Type notes or details..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent text-xs font-semibold text-slate-800 bg-slate-50/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleConfirm();
                    }
                  }}
                ></textarea>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-2">
              {dialogState.type !== 'alert' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                className="px-5 py-2 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold rounded-xl text-xs transition-all shadow-3xs cursor-pointer"
              >
                {dialogState.type === 'prompt' ? 'Submit' : dialogState.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
