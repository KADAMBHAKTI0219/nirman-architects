import React, { useState } from 'react';
import { Bell, ShieldCheck, X } from 'lucide-react';
import useWebPush from '../../hooks/useWebPush';

/**
 * Opt-in Desktop Push Notification Banner Component
 */
export default function PushNotificationPrompt() {
  const { permission, requestPermission } = useWebPush();
  const [dismissed, setDismissed] = useState(false);

  if (permission === 'granted' || permission === 'unsupported' || dismissed) {
    return null;
  }

  return (
    <div className="bg-brand-soft border border-brand-secondary/60 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 font-sans text-slate-800 my-3 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-primary text-slate-900 flex items-center justify-center shrink-0 shadow-2xs font-bold">
          <Bell className="w-5 h-5" />
        </div>

        <div>
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 leading-tight">
            Enable Desktop Push Notifications
            <span className="text-[9px] bg-brand-primary/40 text-slate-900 px-1.5 py-0.2 rounded font-bold uppercase">Web Push</span>
          </h4>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">
            Receive real-time browser alerts for new client messages, drawing approvals, and project updates.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={requestPermission}
          className="px-3.5 py-1.5 bg-brand-secondary hover:bg-brand-primary text-slate-900 font-bold rounded-xl text-xs transition-all shadow-2xs cursor-pointer"
        >
          Enable Notifications
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
