import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import { Role } from "../generated/prisma/enums.js";
import emailController from "../controllers/emailController.js";

const emailRoutes = Router();
// emailRoutes.post("/test", authMiddleware, authorize(Role.ADMIN), emailController.sendTestEmail);
emailRoutes.post("/low-stock", authMiddleware, authorize(Role.ADMIN), emailController.sendLowStockAlert);
emailRoutes.post("/daily-summary", authMiddleware, authorize(Role.ADMIN), emailController.sendDailyInventorySummary);
emailRoutes.post("/weekly-report", authMiddleware, authorize(Role.ADMIN), emailController.sendWeeklyInventoryReport);

export default emailRoutes;
