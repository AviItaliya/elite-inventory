import { getToken, onMessage, type MessagePayload } from "firebase/messaging";

import { getFirebaseMessaging } from "../config/firebase";

export const requestFirbaseNotificationPermission = async (): Promise<
  string | null
> => {
  if (!("Notification" in window)) {
    throw new Error("Browser notifications are not supported.");
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported.");
  }

  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    throw new Error("Firebase Messaging is unavailable.");
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    throw new Error("Firebase VAPID key is missing.");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    {
      scope: "/",
    },
  );

  console.log("[FCM] Service worker registered:", {
    scope: registration.scope,
    active: registration.active?.state,
    installing: registration.installing?.state,
    waiting: registration.waiting?.state,
  });

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Firebase did not return an FCM token.");
  }

  console.log("[FCM] Token generated successfully.");

  return token;
};

export const listenForFirebaseNotifications = async (
  onNotification: (payload: MessagePayload) => void,
): Promise<(() => void) | null> => {
  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return null;
  }

  return onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message:", {
      messageId: payload.messageId,
      data: payload.data,
    });

    onNotification(payload);
  });
};
