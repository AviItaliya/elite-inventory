import { Router } from "express";
import { Role } from "../generated/prisma/client.js";

import auditLogController from "../controllers/auditLogController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";

const auditLogRoutes = Router();

auditLogRoutes.get("/", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), auditLogController.findAll);
auditLogRoutes.get("/:id", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), auditLogController.findById);

export default auditLogRoutes;
