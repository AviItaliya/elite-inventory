import { Router } from "express";
import { Role } from "../generated/prisma/client.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import categoryController from "../controllers/categoryController.js";

const categoryRoutes = Router();

categoryRoutes.post("/create", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), categoryController.create);
categoryRoutes.get("/get-all", authMiddleware, categoryController.findAll);
categoryRoutes.get("/:id", authMiddleware, categoryController.findById);
categoryRoutes.put("/:id", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), categoryController.update);
categoryRoutes.delete("/:id", authMiddleware, authorize(Role.ADMIN), categoryController.delete);

export default categoryRoutes;