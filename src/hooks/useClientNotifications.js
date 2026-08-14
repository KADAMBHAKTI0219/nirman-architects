import { useState, useEffect, useCallback } from 'react';
import {
  getClientNotificationsMy,
  getClientNotificationsUnreadCount,
  markClientNotificationRead,
  markAllClientNotificationsRead,
  getClientNotificationPreferences,
  updateClientNotificationPreferences
} from '../service/notification';

/**
 * Custom Hook for Client Portal Notifications & Preferences
 */
export default function useClientNotifications({ enabled = true } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState({ pushEnabled: true, emailEnabled: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    const clientToken = localStorage.getItem('clientToken');
    const userStr = localStorage.getItem('user');
    const isCustomer = clientToken || (userStr && userStr.includes('Customer'));

    if (!isCustomer) return;

    setLoading(true);
    setError(null);
    try {
      const [listRes, countRes, prefRes] = await Promise.all([
        getClientNotificationsMy().catch(() => null),
        getClientNotificationsUnreadCount().catch(() => null),
        getClientNotificationPreferences().catch(() => null)
      ]);

      if (listRes && listRes.success !== false) {
        const rawList = listRes.notifications || listRes.data || [];
        setNotifications(Array.isArray(rawList) ? rawList : []);
      }

      if (countRes && typeof countRes.unreadCount === 'number') {
        setUnreadCount(countRes.unreadCount);
      }

      if (prefRes && (prefRes.preferences || prefRes.data)) {
        setPreferences(prefRes.preferences || prefRes.data);
      }
    } catch (err) {
      if (err?.response?.status !== 401) {
        setError(err.message || 'Failed to load client notifications');
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
      await markClientNotificationRead(id);
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark client notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllClientNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all client notifications read:', err);
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      setPreferences(prev => ({ ...prev, ...newPrefs }));
      await updateClientNotificationPreferences(newPrefs);
    } catch (err) {
      console.warn('Failed to update client notification preferences:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    error,
    refreshNotifications: fetchNotifications,
    markRead,
    markAllRead,
    updatePreferences
  };
}
