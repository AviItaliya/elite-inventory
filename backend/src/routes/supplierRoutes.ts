import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import { Role } from "../generated/prisma/enums.js";
import supplierController from "../controllers/supplierController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createSupplierSchema, updateSupplierSchema } from "../validators/supplierValidation.js";


const supplierRoutes = Router();
supplierRoutes.post("/create", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), validateRequest("body", createSupplierSchema), supplierController.create);
supplierRoutes.get("/get-all", authMiddleware, supplierController.findAll);
supplierRoutes.get("/:id", authMiddleware, supplierController.findById);
supplierRoutes.put("/:id", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), validateRequest("body", updateSupplierSchema), supplierController.update);
supplierRoutes.delete("/:id", authMiddleware, authorize(Role.ADMIN), supplierController.delete);

export default supplierRoutes;