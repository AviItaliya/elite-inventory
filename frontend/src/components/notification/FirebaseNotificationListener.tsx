import { useEffect } from "react";
import { listenForFirebaseNotifications } from "../../services/firebaseNotificationService";

export default function FirebaseNotificationListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let mounted = true;

    const initializeListener = async () => {
      try {
        const listener = await listenForFirebaseNotifications((payload) => {
          console.log("Firebase foreground message received:", {
            title: payload.data?.title ?? payload.notification?.title,
            body: payload.data?.body ?? payload.notification?.body,
          });
        });

        if (!mounted) {
          listener?.();
        } else {
          unsubscribe = listener;
        }
      } catch (error) {
        console.error("Firebase listener error:", error);
      }
    };

    void initializeListener();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  return null;
}
