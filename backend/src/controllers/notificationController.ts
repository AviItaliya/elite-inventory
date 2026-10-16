import type { Request, Response } from "express";
// import { sendResponse } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import notificationService from "../services/notificationService.js";

class NotificationController {
  getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);
    const result = await notificationService.getMyNotifications(
      userId,
      page,
      limit,
    );
    res.status(200).json({
      succesS: true,
      message: "Notifications fetched successfully",
      data: result,
    });
  });

  getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const result = await notificationService.getUnreadCount(userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const notificationId = req.params.id;
    if (typeof notificationId !== "string") {
      throw new AppError("Invalid notification ID", 400);
    }
    const notification = await notificationService.markAsRead(
      notificationId,
      userId,
    );
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  });

  markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const result = await notificationService.markAllAsRead(userId);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const notificationId = req.params.id;
    if (typeof notificationId !== "string") {
      throw new AppError("Invalid notification ID", 400);
    }
    const result = await notificationService.deleteNotification(
      notificationId,
      userId,
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  });
}
export default new NotificationController();
