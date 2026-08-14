import { useState, useEffect, useCallback } from 'react';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../service/notification';

/**
 * Custom Hook for Internal Employee Notifications
 */
export default function useInternalNotifications({ enabled = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const res = await getMyNotifications();
      if (res && res.success !== false) {
        const rawList = res.notifications || res.data?.notifications || res.data || [];
        const list = Array.isArray(rawList) ? rawList : [];
        setNotifications(list);

        const count = res.unreadCount ?? list.filter(n => !(n.isRead || n.read)).length;
        setUnreadCount(count);
      }
    } catch (err) {
      if (err?.response?.status !== 401) {
        setError(err.message || 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      fetchNotifications();
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, 15000);
      return () => clearInterval(intervalId);
    }
  }, [fetchNotifications, enabled]);

  const markRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications: fetchNotifications,
    markRead,
    markAllRead
  };
}
