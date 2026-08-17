import React, { useState } from 'react';
import { X, Bell, CheckCheck, Filter, Inbox } from 'lucide-react';
import NotificationItem from './NotificationItem';

/**
 * Reusable NotificationModal Component
 * Shows up to 15 notifications with filter tabs ("All", "Unread", "Read") and "Mark all read" action.
 */
export default function NotificationModal({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkRead,
  onMarkAllRead
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ'

  if (!isOpen) return null;

  // Limit to 15 notifications as requested
  const displayList = notifications.slice(0, 15);

  const filteredNotifications = displayList.filter(n => {
    const isRead = Boolean(n.isRead || n.read);
    if (filter === 'UNREAD') return !isRead;
    if (filter === 'READ') return isRead;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-soft to-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-slate-900 flex items-center justify-center font-black shadow-2xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">Notifications Center</h3>
              <p className="text-xs text-slate-500 font-medium">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Quick Actions */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                filter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({displayList.length})
            </button>

            <button
              type="button"
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                filter === 'UNREAD' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unread ({displayList.filter(n => !(n.isRead || n.read)).length})
            </button>

            <button
              type="button"
              onClick={() => setFilter('READ')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                filter === 'READ' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Read ({displayList.filter(n => (n.isRead || n.read)).length})
            </button>
          </div>

          {unreadCount > 0 && onMarkAllRead && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-secondary text-slate-900 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer border border-[#8FC9FF]/60"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All as Read
            </button>
          )}
        </div>

        {/* Scrollable Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 scrollbar-thin">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n, idx) => (
              <NotificationItem
                key={n._id || n.id || idx}
                notification={n}
                onRead={onMarkRead}
                onCloseDropdown={onClose}
              />
            ))
          ) : (
            <div className="p-12 text-center space-y-3">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
              <h4 className="text-sm font-black text-slate-800">No Notifications Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                There are no notifications matching your current filter tab.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-5 shrink-0">
          <span>Showing top {displayList.length} notifications</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
