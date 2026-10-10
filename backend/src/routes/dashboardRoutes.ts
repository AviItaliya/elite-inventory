import { Router } from "express";
import { Role } from "../generated/prisma/client.js";
import dashboardController from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";

const dashboardRouter = Router();

dashboardRouter.get("/", authMiddleware, authorize(Role.ADMIN, Role.MANAGER, Role.STAFF), dashboardController.getDashboard);

export default dashboardRouter;