import prisma from "../config/prisma.js";
import notificationRepository from "../repositories/notificationRepository.js";
import { getIO } from "../config/socket.js";

import { Prisma, NotificationType, Role } from "../generated/prisma/client.js";

interface CreateActivityNotificationInput {
  type: NotificationType;

  title: string;
  message: string;

  actorUserId?: string;

  recipientUserIds?: string[];
  recipientRoles?: Role[];

  productId?: string;
  currentStock?: number;
  minStock?: number;
}

class ActivityNotificationService {
  async createActivityNotifications(
    data: CreateActivityNotificationInput,
    tx?: Prisma.TransactionClient,
  ) {
    const db = tx ?? prisma;

    const recipientConditions: Prisma.UserWhereInput[] = [];

    if (data.recipientUserIds?.length) {
      recipientConditions.push({
        id: {
          in: data.recipientUserIds,
        },
      });
    }

    if (data.recipientRoles?.length) {
      recipientConditions.push({
        role: {
          in: data.recipientRoles,
        },
      });
    }

    if (recipientConditions.length === 0) {
      return [];
    }

    const recipients = await db.user.findMany({
      where: {
        OR: recipientConditions,

        ...(data.actorUserId
          ? {
              id: {
                not: data.actorUserId,
              },
            }
          : {}),
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

        type: data.type,

        title: data.title,
        message: data.message,

        productId: data.productId ?? null,

        currentStock: data.currentStock ?? null,
        minStock: data.minStock ?? null,

        isRead: false,
      }));

    return notificationRepository.createNotifications(notificationData, tx);
  }

  emitNotifications(
    notifications: Awaited<
      ReturnType<typeof notificationRepository.createNotifications>
    >,
  ) {
    if (notifications.length === 0) {
      return;
    }

    const io = getIO();

    for (const notification of notifications) {
      io.to(`user:${notification.userId}`).emit(
        "notification:new",
        notification,
      );
    }
  }
}

export default new ActivityNotificationService();
