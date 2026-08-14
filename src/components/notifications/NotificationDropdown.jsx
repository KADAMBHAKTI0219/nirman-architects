import React from 'react';
import { CheckCheck, Bell } from 'lucide-react';
import NotificationItem from './NotificationItem';

/**
 * Reusable NotificationDropdown Component
 * Displays up to 15 notifications and opens full modal on "View All Notifications"
 */
export default function NotificationDropdown({
  notifications = [],
  unreadCount = 0,
  onMarkAllRead = null,
  onMarkRead = null,
  onClose = null,
  onOpenModal = null
}) {
  const displayList = notifications.slice(0, 15);

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
      
      {/* Header */}
      <div className="h-14 bg-[#f0f2f5] px-4 flex items-center justify-between border-b border-[#e9edef] shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-dark" />
          <h3 className="text-xs font-black text-slate-900 leading-none">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-brand-primary text-slate-900 font-extrabold text-[10px]">
              {unreadCount} unread
            </span>
          )}
        </div>

        {unreadCount > 0 && onMarkAllRead && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[10px] text-brand-dark hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* Notifications List Body (up to 15) */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 scrollbar-thin">
        {displayList.length > 0 ? (
          displayList.map((n, idx) => (
            <NotificationItem
              key={n._id || n.id || idx}
              notification={n}
              onRead={onMarkRead}
              onCloseDropdown={onClose}
            />
          ))
        ) : (
          <div className="p-8 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto opacity-50 animate-pulse" />
            <p className="text-xs font-bold text-slate-700">No notifications yet</p>
            <span className="text-[10px] text-slate-400 block font-medium">You are all caught up!</span>
          </div>
        )}
      </div>

      {/* Footer Action to Open Modal */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            if (onOpenModal) onOpenModal();
          }}
          className="text-xs font-extrabold text-slate-900 hover:text-brand-dark transition-colors inline-block cursor-pointer hover:underline"
        >
          View All Notifications ({notifications.length}) →
        </button>
      </div>
    </div>
  );
}
