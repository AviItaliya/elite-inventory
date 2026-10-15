/* global importScripts, firebase */

// =====================================================
// 1. IMPORT FIREBASE SDK
// =====================================================

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

// =====================================================
// 2. INITIALIZE FIREBASE
// =====================================================

// Replace these placeholders with the same Firebase
// configuration used in frontend/src/config/firebase.ts

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// =====================================================
// 3. INITIALIZE FIREBASE CLOUD MESSAGING
// =====================================================

const messaging = firebase.messaging();

console.log("[FCM SW] Firebase Messaging initialized");

// =====================================================
// 4. HANDLE BACKGROUND NOTIFICATIONS
// =====================================================

messaging.onBackgroundMessage((payload) => {
  console.log("[FCM SW] Background message received:", {
    messageId: payload.messageId,
    data: payload.data,
    notification: payload.notification,
  });

  // Firebase automatically displays notification payloads.
  // Avoid displaying another notification.
  if (payload.notification) {
    return;
  }

  const title = payload.data?.title || "Elite Inventory";

  const body = payload.data?.body || "You have a new inventory notification.";

  const url = payload.data?.url || "/dashboard";

  // Display browser notification
  return self.registration.showNotification(title, {
    body,

    icon: "/logo2.png",

    badge: "/logo2.png",

    data: {
      url,
      messageId: payload.messageId,
    },

    requireInteraction: false,
  });
});

// =====================================================
// 5. HANDLE NOTIFICATION CLICK
// =====================================================

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationUrl = event.notification.data?.url || "/dashboard";

  const targetUrl = new URL(notificationUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windowClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Check whether Elite Inventory is already open
      for (const client of windowClients) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();

          if ("navigate" in client) {
            return client.navigate(targetUrl);
          }

          return client;
        }
      }

      // Open a new window if the application is not open
      return clients.openWindow(targetUrl);
    })(),
  );
});

// =====================================================
// 6. SERVICE WORKER LIFECYCLE
// =====================================================

self.addEventListener("install", () => {
  console.log("[FCM SW] Service worker installed");
});

self.addEventListener("activate", () => {
  console.log("[FCM SW] Service worker activated");
});
