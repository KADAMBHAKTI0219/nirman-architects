/* Nirman Architects Web Push Service Worker */
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Nirman Architects Notification';
    const options = {
      body: data.message || data.body || 'You have a new update.',
      icon: data.icon || '/favicon.png',
      badge: '/favicon.png',
      data: {
        deepLink: data.deepLink || data.url || '/',
        notificationId: data.notificationId || data.id,
        projectId: data.projectId
      },
      vibrate: [100, 50, 100],
      actions: [
        { action: 'open', title: 'View Update' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('Error handling push event in ServiceWorker:', err);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const deepLink = event.notification.data?.deepLink || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.focus();
          client.postMessage({ type: 'NAVIGATE_DEEP_LINK', deepLink });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(deepLink);
      }
    })
  );
});
