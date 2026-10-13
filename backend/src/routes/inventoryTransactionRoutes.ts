import { Router } from "express";
import { Role } from "../generated/prisma/client.js";

import inventoryTransactionController from "../controllers/inventoryTransactionController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";

const transactionRoutes = Router();

transactionRoutes.post("/", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), inventoryTransactionController.create);
transactionRoutes.get("/", authMiddleware, authorize(Role.ADMIN, Role.MANAGER, Role.STAFF), inventoryTransactionController.findAll);
transactionRoutes.get("/:id", authMiddleware, authorize(Role.ADMIN, Role.MANAGER, Role.STAFF), inventoryTransactionController.findById);

export default transactionRoutes;