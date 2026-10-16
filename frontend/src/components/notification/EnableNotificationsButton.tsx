import { useState } from "react";

import { requestFirbaseNotificationPermission } from "../../services/firebaseNotificationService";
import { registerFcmToken } from "../../services/fcmApiService";

export default function EnableNotificationsButton() {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(() => {
    return (
      "Notification" in window &&
      Notification.permission === "granted" &&
      localStorage.getItem("fcm_enabled") === "true"
    );
  });
  const [error, setError] = useState("");

  const handleEnableNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const token = await requestFirbaseNotificationPermission();

      if (!token) {
        throw new Error("Firebase did not return an FCM token.");
      }

      await registerFcmToken(token);

      localStorage.setItem("fcm_enabled", "true");
      setEnabled(true);

      console.log("[FCM] Notifications enabled successfully.");
    } catch (error) {
      console.error("[FCM] Notification registration failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to register notifications.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleEnableNotifications}
        disabled={loading || enabled}
      >
        {loading
          ? "Enabling..."
          : enabled
            ? "Notifications Enabled"
            : "Enable Notifications"}
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}
