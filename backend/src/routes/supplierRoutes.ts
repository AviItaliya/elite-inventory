import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import { Role } from "../generated/prisma/enums.js";
import supplierController from "../controllers/supplierController.js";


const supplierRoutes = Router();
supplierRoutes.post("/create", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), supplierController.create);
supplierRoutes.get("/get-all", authMiddleware, supplierController.findAll);
supplierRoutes.get("/:id", authMiddleware, supplierController.findById);
supplierRoutes.put("/:id", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), supplierController.update);
supplierRoutes.delete("/:id", authMiddleware, authorize(Role.ADMIN), supplierController.delete);

export default supplierRoutes;