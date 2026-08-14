import { useState, useEffect } from 'react';
import { registerClientDeviceToken, unregisterClientDeviceToken } from '../service/notification';

/**
 * Custom Hook for Web Push Notifications
 * Handles browser permission, Service Worker registration, and device token binding.
 */
export default function useWebPush() {
  const [permission, setPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setIsSubscribed(true);
        });
      }).catch(err => console.warn('ServiceWorker registration skipped:', err));
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported';
    }

    try {
      setLoading(true);
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted' && 'serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: null // Uses standard browser push key or backend VAPID
        }).catch(() => null);

        const deviceToken = sub ? JSON.stringify(sub) : `web-device-${Date.now()}`;

        await registerClientDeviceToken({
          deviceToken,
          deviceType: 'WEB_BROWSER',
          userAgent: navigator.userAgent
        }).catch(() => null);

        setIsSubscribed(true);
      }
      return res;
    } catch (err) {
      console.warn('Error requesting push permission:', err);
      return permission;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setLoading(true);
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await unregisterClientDeviceToken(JSON.stringify(sub)).catch(() => null);
        }
      }
      setIsSubscribed(false);
    } catch (e) {
      console.warn('Error unsubscribing:', e);
    } finally {
      setLoading(false);
    }
  };

  return {
    permission,
    isSubscribed,
    loading,
    requestPermission,
    unsubscribe
  };
}
