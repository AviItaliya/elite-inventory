import type { Notification } from "../store/slices/notificationSlice";
import api from "./api";

// ------------------------------------
// Types
// ------------------------------------

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationListData {
  notifications: Notification[];
  pagination: NotificationPagination;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
}

// ------------------------------------
// Notification API Service
// ------------------------------------

class NotificationService {
  // GET /api/notifications
  async getNotifications(
    params: NotificationQuery = {},
  ): Promise<NotificationListData> {
    const response = await api.get<ApiResponse<NotificationListData>>(
      "/api/notifications",
      {
        params,
      },
    );

    return response.data.data;
  }

  // GET /api/notifications/unread-count
  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>(
      "/api/notifications/unread-count",
    );

    return response.data.data.unreadCount;
  }

  // PATCH /api/notifications/:id/read
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.patch<ApiResponse<Notification>>(
      `/api/notifications/${encodeURIComponent(notificationId)}/read`,
    );

    return response.data.data;
  }

  // PATCH /api/notifications/read-all
  async markAllAsRead(): Promise<{
    message: string;
    updatedCount: number;
  }> {
    const response = await api.patch<
      ApiResponse<{
        message: string;
        updatedCount: number;
      }>
    >("/api/notifications/read-all");

    return response.data.data;
  }

  // DELETE /api/notifications/:id
  async deleteNotification(
    notificationId: string,
  ): Promise<{ message: string }> {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/api/notifications/${encodeURIComponent(notificationId)}`,
    );

    return response.data.data;
  }
}

export default new NotificationService();
