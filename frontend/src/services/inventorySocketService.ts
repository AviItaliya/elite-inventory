import { fetchProducts } from "../store/slices/productSlice";

import { fetchDashboard } from "../store/slices/dashboardSlice";

import { onSocketAvailable } from "./socketService";

import type { AppDispatch, RootState } from "../store/store";

import type { Notification } from "../store/slices/notificationSlice";

import {
  addNotification,
  fetchUnreadNotificationCount,
} from "../store/slices/notificationSlice";

interface InventoryUpdatedEvent {
  transactionId: string;
  productId: string;
  productName: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: number;
  updatedStock: number;
  minStock: number;
  timestamp: string;
}

export const registerInventorySocketListeners = (
  dispatch: AppDispatch,
  getState: () => RootState,
): (() => void) => {
  return onSocketAvailable((socket) => {
    const handleInventoryUpdated = (data: InventoryUpdatedEvent) => {
      console.log("Inventory updated:", data);

      void dispatch(fetchProducts());

      const { activeFilters } = getState().dashboard;

      void dispatch(fetchDashboard(activeFilters));
    };

    const handleNewNotification = (notification: Notification) => {
      console.log("New persistent notification:", notification);

      // Add notification to Redux immediately.
      dispatch(addNotification(notification));

      // Synchronize unread count with PostgreSQL.
      void dispatch(fetchUnreadNotificationCount());
    };

    socket.on("inventory:updated", handleInventoryUpdated);

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("inventory:updated", handleInventoryUpdated);

      socket.off("notification:new", handleNewNotification);
    };
  });
};
