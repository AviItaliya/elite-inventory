import prisma from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

class NotificationRepository {
  async createNotifications(
    data: Prisma.NotificationCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ) {
    if (data.length === 0) {
      return [];
    }
    const db = tx ?? prisma;
    return db.notification.createManyAndReturn({
      data,
    });
  }

  async findNotificationByUser(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where,
      }),
    ]);
    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });
    if (result.count === 0) {
      return null;
    }

    return prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const result = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
    return result.count > 0;
  }
}

export default new NotificationRepository();
