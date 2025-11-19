/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAWa3UVqiKJxfWZfiEq7GciMmyWW0TnA5E",
  authDomain: "foody-b0e5a.firebaseapp.com",
  projectId: "foody-b0e5a",
  storageBucket: "foody-b0e5a.firebasestorage.app",
  messagingSenderId: "1006719858259",
  appId: "1:1006719858259:web:6be9e64a402d12670078a6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📩 Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon-64x64.png',
    badge: '/favicon-64x64.png',
    tag: payload.data?.orderId || 'notification',
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View'
      }
    ],
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data?.url || '/');
        }
      })
    );
  }
});

self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notification dismissed:', event);
});
