import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import NotificationModal from './NotificationModal';
import useInternalNotifications from '../../hooks/useInternalNotifications';
import useClientNotifications from '../../hooks/useClientNotifications';

/**
 * Reusable NotificationBell Component
 * Displays live unread badge count (0 -> hidden, 3 -> 3, >99 -> 99+)
 * Works across all roles (Admin, Project Manager, HR, Architect, Site Engineer, Employee, Customer).
 */
export default function NotificationBell({ isClientPortal = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bellRef = useRef(null);

  const internalState = useInternalNotifications({ enabled: !isClientPortal });
  const clientState = useClientNotifications({ enabled: isClientPortal });

  const { notifications, unreadCount, markRead, markAllRead } = isClientPortal ? clientState : internalState;

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const badgeText = unreadCount > 99 ? '99+' : unreadCount;

  const handleBellClick = () => {
    setIsOpen(prev => !prev);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => null);
    }
  };

  return (
    <div className="relative font-sans" ref={bellRef}>
      {/* Bell Icon Trigger Button */}
      <button
        type="button"
        onClick={handleBellClick}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer shrink-0"
        title="View Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        
        {/* Unread Badge Indicator */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[9px] min-w-[18px] text-center border-2 border-white shadow-2xs animate-in zoom-in duration-150">
            {badgeText}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onClose={() => setIsOpen(false)}
          onOpenModal={() => setIsModalOpen(true)}
        />
      )}

      {/* Full Notification Center Modal */}
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </div>
  );
}
