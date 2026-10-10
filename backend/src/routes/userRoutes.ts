import { Router } from "express";
import { Role } from "../generated/prisma/client.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import userController from "../controllers/userController.js";

const userRoutes = Router();
userRoutes.use(authMiddleware);
userRoutes.use(authorize(Role.ADMIN, Role.MANAGER));
userRoutes.get("/get-all", userController.findAll);
userRoutes.get("/:id", userController.findById);
userRoutes.post("/create", userController.create);
userRoutes.put("/:id", userController.update);
userRoutes.patch("/:id/status", userController.updateStatus);
userRoutes.delete("/:id", userController.delete);
export default userRoutes;
