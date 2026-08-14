import React from 'react';
import { Bell, Mail, ShieldCheck } from 'lucide-react';
import useClientNotifications from '../../hooks/useClientNotifications';
import useWebPush from '../../hooks/useWebPush';

/**
 * Reusable Client Notification Preferences Component
 */
export default function NotificationPreferences() {
  const { preferences, updatePreferences } = useClientNotifications();
  const { permission, requestPermission } = useWebPush();

  const handlePushToggle = async () => {
    const nextVal = !preferences.pushEnabled;
    if (nextVal && permission !== 'granted') {
      await requestPermission();
    }
    updatePreferences({ pushEnabled: nextVal });
  };

  const handleEmailToggle = () => {
    updatePreferences({ emailEnabled: !preferences.emailEnabled });
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 font-sans">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-dark" /> Notification Preferences
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure how you receive project updates and workspace messages.
        </p>
      </div>

      <div className="space-y-4">
        {/* Browser Push Notifications */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 block">Browser Push Notifications</strong>
              <span className="text-[10px] text-slate-500 font-medium block">
                Receive real-time browser desktop popups for drawing approvals & messages.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePushToggle}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer relative ${
              preferences.pushEnabled ? 'bg-brand-secondary' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
              preferences.pushEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-slate-900 block">Email Digest & Instant Alerts</strong>
              <span className="text-[10px] text-slate-500 font-medium block">
                Receive email notifications for important milestone completions.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEmailToggle}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer relative ${
              preferences.emailEnabled ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
              preferences.emailEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
}
