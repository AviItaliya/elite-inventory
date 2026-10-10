import { Router } from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const authRoutes = Router();
authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/refresh-token", authController.refreshToken);
authRoutes.post("/logout", authController.logout);
authRoutes.post("/forgot-password", authController.forgotPassword);
authRoutes.post("/reset-password", authController.resetPassword);
authRoutes.get("/profile", authMiddleware, authController.profile);

export default authRoutes;
