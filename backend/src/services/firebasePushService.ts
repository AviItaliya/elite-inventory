import { firebaseMessaging } from "../config/firebaseAdmin.js";
import fcmTokenService from "./fcmTokenService.js";
import prisma from "../config/prisma.js";

interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
}

class FirebasePushService {
  async sendToUser(userId: string, payload: PushNotificationPayload) {
    const userTokens = await fcmTokenService.getUserTokens(userId);

    if (userTokens.length === 0) {
      return {
        success: false,
        message: "User has no registered FCM tokens.",
      };
    }

    const tokens = userTokens.map((item) => item.token);

    const response = await firebaseMessaging.sendEachForMulticast({
      tokens,

      data: {
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/dashboard",
      },
    });

    const invalidTokens: string[] = [];

    response.responses.forEach((result, index) => {
      if (result.success) return;

      const errorCode = result.error?.code;

      if (
        errorCode === "messaging/registration-token-not-registered" ||
        errorCode === "messaging/invalid-registration-token"
      ) {
        const token = tokens[index];
        if (token !== undefined) {
          invalidTokens.push(token);
        }
      }
    });

    if (invalidTokens.length > 0) {
      await prisma.fcmToken.deleteMany({
        where: {
          token: {
            in: invalidTokens,
          },
        },
      });
    }

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  }
}

export default new FirebasePushService();
