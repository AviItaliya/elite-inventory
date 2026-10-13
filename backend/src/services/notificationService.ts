import prisma from "../config/prisma.js";
import notificationRepository from "../repositories/notificationRepository.js";
import AppError from "../utils/AppError.js";
import { Prisma } from "../generated/prisma/client.js";

interface LowStockNotificationData {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
}

class NotificationService {
  async createLowStockNotifications(data: LowStockNotificationData, tx?: Prisma.TransactionClient) {
    const db = tx ?? prisma;
    const recipients = await db.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "MANAGER"],
        },
      },
      select: {
        id: true,
      },
    });
    if (recipients.length === 0) {
      return [];
    }
    const notificationData: Prisma.NotificationCreateManyInput[] =
      recipients.map((user) => ({
        userId: user.id,
        type: "LOW_STOCK",
        title: "Low Stock Alert",
        message: `${data.productName} is running low on stock.`,
        productId: data.productId,
        currentStock: data.currentStock,
        minStock: data.minStock,
        isRead: false,
      }));
    return notificationRepository.createNotifications(notificationData, tx);
  }

  async getMyNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 10;
    return notificationRepository.findNotificationByUser(
      userId,
      safePage,
      safeLimit,
    );
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await notificationRepository.findUnreadCount(userId);
    return {
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await notificationRepository.markAsRead(
      notificationId,
      userId,
    );
    if (!notification) {
      throw new AppError("Notification not found.", 404);
    }
    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await notificationRepository.markAllAsRead(userId);
    return {
      message: "All notifications marked as read.",
      updatedCount: result.count,
    };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const deleted = await notificationRepository.deleteNotification(
      notificationId,
      userId,
    );
    if (!deleted) {
      throw new AppError("Notification not found.", 404);
    }
    return {
      message: "Notification deleted successfully.",
    };
  }
}
export default new NotificationService();
