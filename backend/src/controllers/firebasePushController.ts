import type { Request, Response } from "express";
import firebasePushService from "../services/firebasePushService.js";

class FirebasePushController {
  async sendTestNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }

      const result = await firebasePushService.sendToUser(userId, {
        title: "Elite Inventory",
        body: "Firebase push notification from Express is working!",
        url: "/dashboard",
      });

      return res.status(200).json({
        success: true,
        message: "Firebase push test completed.",
        data: result,
      });
    } catch (error) {
      console.error("Firebase push notification failed:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to send Firebase push notification.",
      });
    }
  }
}

export default new FirebasePushController();
