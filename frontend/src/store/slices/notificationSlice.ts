import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import notificationService from "../../services/notificationService";
import type {
  NotificationListData,
  NotificationQuery,
} from "../../services/notificationService";

import { logout } from "./authSlice";

export type NotificationType =
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "STOCK_IN"
  | "STOCK_OUT"
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "PRODUCT_DELETED"
  | "CATEGORY_CREATED"
  | "CATEGORY_UPDATED"
  | "CATEGORY_DELETED"
  | "SUPPLIER_CREATED"
  | "SUPPLIER_UPDATED"
  | "SUPPLIER_DELETED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_ROLE_CHANGED"
  | "PASSWORD_CHANGED"
  | "REPORT_GENERATED"
  | "EMAIL_SENT";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  productId: string | null;
  currentStock: number | null;
  minStock: number | null;
  createdAt: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pagination: NotificationListData["pagination"] | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  pagination: null,
  loading: false,
  actionLoading: false,
  error: null,
};

// ------------------------------------
// Async Thunks
// ------------------------------------

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (params: NotificationQuery = {}) => {
    return notificationService.getNotifications(params);
  },
);

export const fetchUnreadNotificationCount = createAsyncThunk(
  "notification/fetchUnreadCount",
  async () => {
    return notificationService.getUnreadCount();
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId: string) => {
    return notificationService.markAsRead(notificationId);
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async () => {
    return notificationService.markAllAsRead();
  },
);

export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    return notificationId;
  },
);

// ------------------------------------
// Slice
// ------------------------------------

const notificationSlice = createSlice({
  name: "notification",
  initialState,

  reducers: {
    // Used by Socket.IO notification:new
    addNotification: (state, action: PayloadAction<Notification>) => {
      const exists = state.notifications.some(
        (notification) => notification.id === action.payload.id,
      );

      if (exists) return;

      state.notifications.unshift(action.payload);

      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }

      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    // Retained for compatibility with existing components.
    // Prefer markNotificationAsRead for database persistence.
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (item) => item.id === action.payload,
      );

      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Retained for compatibility.
    // Prefer markAllNotificationsAsRead for persistence.
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.isRead = true;
      });

      state.unreadCount = 0;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = null;
    },
  },

  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

        // Merge API results with notifications received
        // through Socket.IO while the request was pending.
        const merged = new Map<string, Notification>();

        for (const notification of action.payload.notifications) {
          merged.set(notification.id, notification);
        }

        for (const notification of state.notifications) {
          if (!merged.has(notification.id)) {
            merged.set(notification.id, notification);
          }
        }

        state.notifications = Array.from(merged.values())
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 50);

        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to load notifications.";
      });

    // Fetch unread count
    builder.addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Mark one notification as read
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.actionLoading = false;

        const notification = state.notifications.find(
          (item) => item.id === action.payload.id,
        );

        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state) => {
        state.actionLoading = false;
        state.error = "Failed to mark notification as read.";
      });

    // Mark all notifications as read
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.actionLoading = false;

        state.notifications.forEach((notification) => {
          notification.isRead = true;
        });

        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state) => {
        state.actionLoading = false;
        state.error = "Failed to mark all notifications as read.";
      });

    // Delete notification
    builder
      .addCase(deleteNotification.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.actionLoading = false;

        const notification = state.notifications.find(
          (item) => item.id === action.payload,
        );

        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.notifications = state.notifications.filter(
          (item) => item.id !== action.payload,
        );
      })
      .addCase(deleteNotification.rejected, (state) => {
        state.actionLoading = false;
        state.error = "Failed to delete notification.";
      });

    // Logout
    builder.addCase(logout.fulfilled, () => ({
      ...initialState,
    }));

    builder.addCase(logout.rejected, () => ({
      ...initialState,
    }));
  },
});

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
