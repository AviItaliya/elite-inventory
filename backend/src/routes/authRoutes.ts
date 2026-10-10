import { Router } from "express";
import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { loginRateLimit, passwordResetRateLimit, registrationRateLimit } from "../middlewares/rateLimitMiddleware.js";

const authRoutes = Router();
authRoutes.post("/register", registrationRateLimit, authController.register);
authRoutes.post("/login", loginRateLimit, authController.login);
authRoutes.post("/refresh-token", authController.refreshToken);
authRoutes.post("/forgot-password", passwordResetRateLimit, authController.forgotPassword);
authRoutes.post("/reset-password", passwordResetRateLimit, authController.resetPassword);
authRoutes.get("/profile", authMiddleware, authController.profile);
authRoutes.post("/logout", authController.logout);

export default authRoutes;
