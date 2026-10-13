import activityNotificationService from "./activityNotificationService.js";
import type { NotificationType, Role } from "../generated/prisma/client.js";

type UserEvent =
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_ROLE_CHANGED"
  | "USER_DELETED"
  | "PASSWORD_CHANGED";

interface UserEventInput {
  type: UserEvent;
  userId?: string;
  userName: string;
  role?: Role;
}

class UserActivityNotificationService {
  async notify(data: UserEventInput): Promise<void> {
    const titles: Record<UserEvent, string> = {
      USER_CREATED: "New User Added",
      USER_UPDATED: "Profile Updated",
      USER_ROLE_CHANGED: "Role Updated",
      USER_DELETED: "User Removed",
      PASSWORD_CHANGED: "Password Changed",
    };
    const messages: Record<UserEvent, string> = {
      USER_CREATED: `New user "${data.userName}" was added.`,
      USER_UPDATED: "Your profile information was updated.",
      USER_ROLE_CHANGED: `Your account role was changed to ${data.role ?? "a new role"}.`,
      USER_DELETED: `User "${data.userName}" was removed.`,
      PASSWORD_CHANGED: "Your account password was changed successfully.",
    };

    // Affected user sees private account events; admins see user creation/deletion.
    const adminEvent =
      data.type === "USER_CREATED" || data.type === "USER_DELETED";
    const recipients = adminEvent
      ? { recipientRoles: ["ADMIN" as Role] }
      : { recipientUserIds: data.userId ? [data.userId] : [] };

    // Notifications are secondary: an outage must not turn a successful user update
    // or password reset into a failed API response.
    try {
      const notifications =
        await activityNotificationService.createActivityNotifications({
          type: data.type as NotificationType,
          title: titles[data.type],
          message: messages[data.type],
          ...recipients,
        });
      activityNotificationService.emitNotifications(notifications);
    } catch (error) {
      console.error("User activity notification failed:", error);
    }
  }
}

export default new UserActivityNotificationService();
