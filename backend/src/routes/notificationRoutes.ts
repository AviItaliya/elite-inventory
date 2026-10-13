import { Router } from "express";
import notificationController from "../controllers/notificationController.js";
import authenticate from "../middlewares/authMiddleware.js";
import { validateNotificationPagination } from "../middlewares/notificationValidation.js";

const notificationRoutes = Router();
notificationRoutes.use(authenticate);
notificationRoutes.get("/", validateNotificationPagination, notificationController.getMyNotifications);
notificationRoutes.get("/unread-count", notificationController.getUnreadCount);
notificationRoutes.patch("/read-all", notificationController.markAllAsRead);
notificationRoutes.patch("/:id/read", validateNotificationPagination, notificationController.markAsRead);
notificationRoutes.delete("/:id", validateNotificationPagination, notificationController.deleteNotification);

export default notificationRoutes;