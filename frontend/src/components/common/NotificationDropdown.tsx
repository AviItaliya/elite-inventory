import { useEffect, useState } from "react";

import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  X,
  PackagePlus,
  PackageCheck,
  PackageX,
  PackageMinus,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type NotificationType,
} from "../../store/slices/notificationSlice";
import EnableNotificationsButton from "../notification/EnableNotificationsButton";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "PRODUCT_CREATED":
      return <PackagePlus size={18} />;

    case "PRODUCT_UPDATED":
      return <PackageCheck size={18} />;

    case "PRODUCT_DELETED":
      return <PackageX size={18} />;

    case "LOW_STOCK":
    case "OUT_OF_STOCK":
      return <AlertTriangle size={18} />;

    case "STOCK_IN":
      return <PackagePlus size={18} />;

    case "STOCK_OUT":
      return <PackageMinus size={18} />;

    default:
      return <Bell size={18} />;
  }
};

const NotificationDropdown = () => {
  const dispatch = useAppDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const { notifications, unreadCount, loading, actionLoading, error } =
    useAppSelector((state) => state.notification);

  // Load persistent notifications after component mounts.
  useEffect(() => {
    void dispatch(
      fetchNotifications({
        page: 1,
        limit: 20,
      }),
    );

    void dispatch(fetchUnreadNotificationCount());
  }, [dispatch]);

  // Refresh notifications whenever the dropdown opens.
  useEffect(() => {
    if (!isOpen) return;

    void dispatch(
      fetchNotifications({
        page: 1,
        limit: 20,
      }),
    );

    void dispatch(fetchUnreadNotificationCount());
  }, [dispatch, isOpen]);

  // Mark one notification as read.
  const handleMarkRead = async (id: string) => {
    const notification = notifications.find((item) => item.id === id);

    if (!notification || notification.isRead) return;

    try {
      await dispatch(markNotificationAsRead(id)).unwrap();

      await dispatch(fetchUnreadNotificationCount()).unwrap();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read.
  const handleMarkAllRead = async () => {
    try {
      await dispatch(markAllNotificationsAsRead()).unwrap();

      await dispatch(fetchUnreadNotificationCount()).unwrap();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Delete a single notification from PostgreSQL.
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteNotification(id)).unwrap();

      await dispatch(fetchUnreadNotificationCount()).unwrap();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="notification">
      {/* Notification Bell */}

      <button
        type="button"
        className="topbar__notification"
        aria-label="Notifications"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="notification__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}

      {isOpen && (
        <div className="notification__dropdown">
          <div className="notification__header">
            <div>
              <h3>Notifications</h3>

              <p>
                {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              type="button"
              className="notification__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              <X size={18} />
            </button>
          </div>

          {/* Notification Actions */}

          {notifications.length > 0 && (
            <div className="notification__actions">
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                disabled={unreadCount === 0 || actionLoading}
              >
                <CheckCheck size={15} />
                Mark all read
              </button>
              <EnableNotificationsButton />
            </div>
          )}

          {/* Notification List */}

          <div className="notification__list">
            {loading && notifications.length === 0 ? (
              <div className="notification__empty">
                <p>Loading notifications...</p>
              </div>
            ) : error && notifications.length === 0 ? (
              <div className="notification__empty">
                <p role="alert">{error}</p>

                <button
                  type="button"
                  onClick={() => {
                    void dispatch(
                      fetchNotifications({
                        page: 1,
                        limit: 20,
                      }),
                    );
                  }}
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification__empty">
                <Bell size={28} />

                <p>No notifications yet</p>

                <span>Low-stock alerts will appear here.</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification__item ${
                    notification.isRead ? "" : "notification__item--unread"
                  }`}
                >
                  {/* Notification Content */}

                  <button
                    type="button"
                    className="notification__content"
                    onClick={() => void handleMarkRead(notification.id)}
                    disabled={notification.isRead || actionLoading}
                  >
                    <div className="notification__icon">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="notification__details">
                      <strong>{notification.title}</strong>

                      <p>{notification.message}</p>

                      {notification.currentStock !== null && (
                        <span>Current stock: {notification.currentStock}</span>
                      )}

                      <small>
                        {new Date(notification.createdAt).toLocaleString()}
                      </small>
                    </div>

                    {!notification.isRead && (
                      <span className="notification__unread-dot" />
                    )}
                  </button>

                  {/* Delete Notification */}

                  <button
                    type="button"
                    className="notification__delete"
                    aria-label="Delete notification"
                    title="Delete notification"
                    disabled={actionLoading}
                    onClick={() => void handleDelete(notification.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
